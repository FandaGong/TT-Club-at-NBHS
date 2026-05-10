#!/usr/bin/env python3
"""Import Google Sheets CSVs into Supabase tables.

This script deletes existing rows from the target tables and re-inserts the
current published CSV contents.

Environment variables:
  SUPABASE_URL   Base Supabase REST URL, e.g. https://<project>.supabase.co/rest/v1
  SUPABASE_KEY   Service role key
"""

from __future__ import annotations

import csv
import io
import json
import os
import ssl
import sys
import urllib.error
import urllib.request
import urllib.parse
from dataclasses import dataclass
from typing import Any


CSV_URLS = {
    "seasons": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_UHoHNgToKV4yCuB_M56029JuMrOYWN-VkyxDiWkwXHJI1hhRnon_GMnvgvmQeHmL4F0gxkVz7IMP/pub?gid=662509425&output=csv",
    "schedule": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_UHoHNgToKV4yCuB_M56029JuMrOYWN-VkyxDiWkwXHJI1hhRnon_GMnvgvmQeHmL4F0gxkVz7IMP/pub?output=csv&gid=1897930093",
    "player_details": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_UHoHNgToKV4yCuB_M56029JuMrOYWN-VkyxDiWkwXHJI1hhRnon_GMnvgvmQeHmL4F0gxkVz7IMP/pub?output=csv&gid=2082256240",
    "matches": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_UHoHNgToKV4yCuB_M56029JuMrOYWN-VkyxDiWkwXHJI1hhRnon_GMnvgvmQeHmL4F0gxkVz7IMP/pub?output=csv&gid=160991986",
}

SCHEDULE_COLUMN_CANDIDATES = ["date", "Date", "schedule_date", "session_date", "day"]


@dataclass
class ImportResult:
    table: str
    deleted: int
    inserted: int


def fetch_csv(url: str) -> list[list[str]]:
    ctx = ssl._create_unverified_context()
    with urllib.request.urlopen(url, context=ctx, timeout=45) as response:
        text = response.read().decode("utf-8-sig")
    return list(csv.reader(io.StringIO(text)))


def rest_context() -> ssl.SSLContext:
    return ssl._create_unverified_context()


def clean(value: Any) -> str:
    return str(value or "").replace("\ufeff", "").strip()


def non_empty(row: list[str]) -> bool:
    return any(clean(cell) for cell in row)


def parse_int(value: Any) -> int:
    text = clean(value).replace(",", "")
    if not text:
        return 0
    try:
        return int(text)
    except ValueError:
        return 0


def delete_all_rows(rest_base: str, table: str, headers: dict[str, str]) -> None:
    ctx = rest_context()
    url = f"{rest_base.rstrip('/')}/{table}?select=id"
    req = urllib.request.Request(url, headers={**headers, "Accept": "application/json"}, method="GET")
    with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
        body = response.read().decode("utf-8")
    rows = json.loads(body)
    ids = [row.get("id") for row in rows if row.get("id")]
    for start in range(0, len(ids), 100):
        chunk = ids[start:start + 100]
        delete_url = f"{rest_base.rstrip('/')}/{table}?id=in.({','.join(chunk)})"
        delete_req = urllib.request.Request(
            delete_url,
            headers={**headers, "Prefer": "return=minimal"},
            method="DELETE",
        )
        with urllib.request.urlopen(delete_req, context=ctx, timeout=60):
            pass


def delete_schedule_rows(rest_base: str, table: str, column_name: str, headers: dict[str, str]) -> None:
    safe_column = urllib.parse.quote(column_name, safe="")
    url = f"{rest_base.rstrip('/')}/{table}?{safe_column}=not.is.null"
    ctx = rest_context()
    req = urllib.request.Request(
        url,
        headers={**headers, "Prefer": "return=minimal"},
        method="DELETE",
    )
    with urllib.request.urlopen(req, context=ctx, timeout=60):
        pass


def insert_rows(rest_base: str, table: str, rows: list[dict[str, Any]], headers: dict[str, str]) -> None:
    if not rows:
        return
    url = f"{rest_base.rstrip('/')}/{table}"
    ctx = rest_context()
    payload = json.dumps(rows).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            **headers,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, context=ctx, timeout=60):
        pass


def insert_schedule(rest_base: str, table: str, dates: list[str], headers: dict[str, str], preferred_column: str | None = None) -> tuple[str, int]:
    last_error: str | None = None
    candidates = [preferred_column] if preferred_column else []
    candidates.extend(SCHEDULE_COLUMN_CANDIDATES)
    for column_name in candidates:
        if not column_name:
            continue
        rows = [{column_name: date} for date in dates]
        try:
            insert_rows(rest_base, table, rows, headers)
            return column_name, len(rows)
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            last_error = body or str(exc)
            lowered = last_error.lower()
            if "column" not in lowered and "does not exist" not in lowered:
                raise
    raise RuntimeError(f"Unable to insert schedule rows using any known column name: {last_error}")


def fetch_first_row(rest_base: str, table: str, headers: dict[str, str]) -> dict[str, Any] | None:
    url = f"{rest_base.rstrip('/')}/{table}?select=*&limit=1"
    ctx = rest_context()
    req = urllib.request.Request(url, headers={**headers, "Accept": "application/json"}, method="GET")
    with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
        body = response.read().decode("utf-8")
    data = json.loads(body)
    if not data:
        return None
    return data[0]


def import_seasons(rows: list[list[str]]) -> list[dict[str, str]]:
    data_rows: list[dict[str, str]] = []
    for row in rows[1:]:
        if not non_empty(row):
            continue
        season_name = clean(row[0]) if len(row) > 0 else ""
        champion = clean(row[1]) if len(row) > 1 else ""
        peak_elo = clean(row[2]) if len(row) > 2 else ""
        total_matches = clean(row[3]) if len(row) > 3 else ""
        top_3 = clean(row[4]) if len(row) > 4 else ""
        status = clean(row[5]) if len(row) > 5 else ""
        most_wins = clean(row[6]) if len(row) > 6 else ""
        biggest_upset = clean(row[7]) if len(row) > 7 else ""
        if not any([season_name, champion, peak_elo, total_matches, top_3, status, most_wins, biggest_upset]):
            continue
        data_rows.append(
            {
                "season_name": season_name,
                "champion": champion,
                "peak_elo": parse_int(peak_elo),
                "total_matches": parse_int(total_matches),
                "top_3_players": top_3,
                "status": status,
                "most_wins": most_wins,
                "biggest_upset": biggest_upset,
            }
        )
    return data_rows


def import_schedule(rows: list[list[str]]) -> list[str]:
    return [clean(row[0]) for row in rows if row and clean(row[0])]


def import_player_details(rows: list[list[str]]) -> list[dict[str, str]]:
    normalized: list[dict[str, str]] = []
    for row in rows[1:]:
        if not non_empty(row):
            continue
        name = clean(row[0]) if len(row) > 0 else ""
        elo = clean(row[1]) if len(row) > 1 else ""
        wins = clean(row[2]) if len(row) > 2 else ""
        losses = clean(row[3]) if len(row) > 3 else ""
        division = clean(row[4]) if len(row) > 4 else ""
        half = clean(row[5]) if len(row) > 5 else ""
        if not name:
            continue
        normalized.append(
            {
                "name": name,
                "elo": parse_int(elo),
                "wins": parse_int(wins),
                "losses": parse_int(losses),
                "division": division,
                "half": half,
            }
        )
    return normalized


def import_matches(rows: list[list[str]]) -> list[dict[str, str]]:
    matches: list[dict[str, str]] = []
    for row in rows[1:]:
        if not non_empty(row):
            continue
        player1 = clean(row[0]) if len(row) > 0 else ""
        player2 = clean(row[1]) if len(row) > 1 else ""
        winner = clean(row[2]) if len(row) > 2 else ""
        score = clean(row[3]) if len(row) > 3 else ""
        division = clean(row[4]) if len(row) > 4 else ""
        table = clean(row[5]) if len(row) > 5 else ""
        half = clean(row[6]) if len(row) > 6 else ""
        p1_change = clean(row[7]) if len(row) > 7 else ""
        p2_change = clean(row[8]) if len(row) > 8 else ""
        p1_new = clean(row[9]) if len(row) > 9 else ""
        p2_new = clean(row[10]) if len(row) > 10 else ""
        term_week = clean(row[11]) if len(row) > 11 else ""
        if not any([player1, player2, winner, score, division, table, half, p1_change, p2_change, p1_new, p2_new, term_week]):
            continue
        matches.append(
            {
                "player_1": player1,
                "player_2": player2,
                "winner": winner,
                "score": score,
                "division": division,
                "table_label": table,
                "half": half,
                "p1_elo_change": parse_int(p1_change),
                "p2_elo_change": parse_int(p2_change),
                "p1_new_elo": parse_int(p1_new),
                "p2_new_elo": parse_int(p2_new),
                "term_and_week": term_week,
            }
        )
    return matches


def main() -> int:
    rest_base = os.environ.get("SUPABASE_URL", "").strip()
    supabase_key = os.environ.get("SUPABASE_KEY", "").strip()

    if not rest_base or not supabase_key:
        print("Missing SUPABASE_URL or SUPABASE_KEY.", file=sys.stderr)
        return 1

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
    }

    imported: list[ImportResult] = []

    for table_name in ["season_records", "schedule_dates", "player_rankings", "match_history"]:
        source_name = {
            "season_records": "seasons",
            "schedule_dates": "schedule",
            "player_rankings": "player_details",
            "match_history": "matches",
        }[table_name]
        csv_rows = fetch_csv(CSV_URLS[source_name])
        if table_name == "season_records":
            data_rows = import_seasons(csv_rows)
            if not data_rows:
                imported.append(ImportResult(table_name, 0, 0))
                continue
            delete_all_rows(rest_base, table_name, headers)
            insert_rows(rest_base, table_name, data_rows, headers)
            imported.append(ImportResult(table_name, 0, len(data_rows)))
        elif table_name == "schedule_dates":
            dates = import_schedule(csv_rows)
            if not dates:
                imported.append(ImportResult(table_name, 0, 0))
                continue
            delete_all_rows(rest_base, table_name, headers)
            insert_rows(rest_base, table_name, [{"session_date": date} for date in dates], headers)
            imported.append(ImportResult(table_name, 0, len(dates)))
        elif table_name == "player_rankings":
            data_rows = import_player_details(csv_rows)
            if not data_rows:
                imported.append(ImportResult(table_name, 0, 0))
                continue
            delete_all_rows(rest_base, table_name, headers)
            insert_rows(rest_base, table_name, data_rows, headers)
            imported.append(ImportResult(table_name, 0, len(data_rows)))
        elif table_name == "match_history":
            data_rows = import_matches(csv_rows)
            if not data_rows:
                imported.append(ImportResult(table_name, 0, 0))
                continue
            delete_all_rows(rest_base, table_name, headers)
            insert_rows(rest_base, table_name, data_rows, headers)
            imported.append(ImportResult(table_name, 0, len(data_rows)))

    print("Import complete:")
    for result in imported:
        print(f"- {result.table}: deleted {result.deleted}, inserted {result.inserted}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())