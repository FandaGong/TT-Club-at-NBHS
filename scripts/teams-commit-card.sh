#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Posts an Adaptive Card to the Teams "Website Updates" channel as a REPLY to
# the pinned commit-log message, every time a commit is made. Sent via the
# m365 CLI (Microsoft Graph). Run scripts/install-hooks.sh once to install
# this as .git/hooks/post-commit.
#
# Requires: m365 CLI installed and logged in (`m365 login`).
# ---------------------------------------------------------------------------

REPO_URL="https://github.com/FandaGong/TT-Club-at-NBHS"

# Teams target (from the message permalink).
TEAM_ID="07422e33-7dbe-499f-82e0-2bd933cb6eb0"
CHANNEL_ID="19:9156d32ed0bb457a8a03479e50bdc150@thread.tacv2"
PARENT_MESSAGE_ID="1777810406201"

AUTHOR="$(git log -1 --pretty=%an)"
COMMIT="$(git log -1 --pretty=%h)"
DATE="$(git log -1 --pretty=%ad --date=format:'%d %b %Y, %I:%M %p')"
MESSAGE="$(git log -1 --pretty=%s)"
URL="${REPO_URL}/commit/$(git log -1 --pretty=%H)"

# Escape backslashes and double quotes for safe JSON embedding.
esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

CARD="{\"\$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"type\":\"AdaptiveCard\",\"version\":\"1.5\",\"body\":[{\"type\":\"Container\",\"style\":\"accent\",\"bleed\":true,\"showBorder\":true,\"roundedCorners\":true,\"items\":[{\"type\":\"ColumnSet\",\"columns\":[{\"type\":\"Column\",\"width\":\"stretch\",\"verticalContentAlignment\":\"Center\",\"items\":[{\"type\":\"TextBlock\",\"text\":\"New Commit to TT Club Website\",\"weight\":\"Bolder\",\"size\":\"Large\",\"color\":\"Accent\",\"wrap\":true},{\"type\":\"TextBlock\",\"text\":\"A change has been pushed to the repository.\",\"isSubtle\":true,\"spacing\":\"Small\",\"wrap\":true}]},{\"type\":\"Column\",\"width\":\"auto\",\"verticalContentAlignment\":\"Center\",\"items\":[{\"type\":\"Image\",\"url\":\"https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png\",\"width\":\"40px\",\"height\":\"40px\",\"altText\":\"GitHub\"}]}]}]},{\"type\":\"Container\",\"style\":\"emphasis\",\"spacing\":\"Medium\",\"showBorder\":true,\"roundedCorners\":true,\"items\":[{\"type\":\"FactSet\",\"facts\":[{\"title\":\"Author\",\"value\":\"$(esc "$AUTHOR")\"},{\"title\":\"Commit\",\"value\":\"$(esc "$COMMIT")\"},{\"title\":\"Date\",\"value\":\"$(esc "$DATE")\"},{\"title\":\"Update\",\"value\":\"$(esc "$MESSAGE")\"}]}]}],\"actions\":[{\"type\":\"Action.OpenUrl\",\"title\":\"View on GitHub\",\"url\":\"$(esc "$URL")\"}],\"msteams\":{\"width\":\"Full\"}}"

BODY="{\"body\":{\"contentType\":\"html\",\"content\":\"<attachment id=\\\"commitcard\\\"></attachment>\"},\"attachments\":[{\"id\":\"commitcard\",\"contentType\":\"application/vnd.microsoft.card.adaptive\",\"contentUrl\":null,\"content\":\"$(esc "$CARD")\"}]}"

m365 request \
  --url "https://graph.microsoft.com/v1.0/teams/${TEAM_ID}/channels/${CHANNEL_ID}/messages/${PARENT_MESSAGE_ID}/replies" \
  --method post \
  --content-type "application/json" \
  --body "$BODY" \
  || echo "[commit-card] Teams post failed (is m365 CLI logged in? run: m365 login)"
