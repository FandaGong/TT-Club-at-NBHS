// components.js
const CONFIG = {
    SUPABASE_URL: "https://ngnkbfazhdedaqvxcphw.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbmtiZmF6aGRlZGFxdnhjcGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTE5NDksImV4cCI6MjA5MzI4Nzk0OX0.F_S6ORkFe-SuJPybs7FEFH94E6U2hZ5ern4vrg4kMOk"
};

// Hardcoded admin allowlist (lowercase)
window._adminEmails = (window._adminEmails || [
    'nbhsttclub@gmail.com',
    'jonathanzhao111@gmail.com',
    'damon.yuan@education.nsw.gov.au'
]).map(e => (e || '').toLowerCase());

(function () {
    const accentMap = {
        red: { color: '#b91c1c', bg: '#fef2f2', text: '#991b1b' },
        blue: { color: '#2563eb', bg: '#eff6ff', text: '#1d4ed8' },
        green: { color: '#16a34a', bg: '#f0fdf4', text: '#15803d' },
        orange: { color: '#ea580c', bg: '#fff7ed', text: '#c2410c' }
    };

    function readSetting(key, fallback) {
        try {
            return localStorage.getItem(key) ?? fallback;
        } catch (err) {
            return fallback;
        }
    }

    function applySiteSettings() {
        const theme = readSetting('nbhs-theme', 'light');
        const contrast = parseFloat(readSetting('nbhs-contrast', '1')) || 1;
        const scale = parseFloat(readSetting('nbhs-scale', '1')) || 1;
        const accent = readSetting('nbhs-accent', 'red');
        const font = readSetting('nbhs-font', 'sans');
        const density = readSetting('nbhs-density', 'comfortable');
        const reducedMotion = readSetting('nbhs-reduced-motion', 'false') === 'true';
        const navLayout = readSetting('nbhs-nav-layout', 'top');
        const sidebarCollapsed = readSetting('nbhs-sidebar-collapsed', 'false') === 'true';
        const ipadCursor = readSetting('nbhs-ipad-cursor', 'false') === 'true';
        const densityScale = density === 'compact' ? 0.75 : density === 'spacious' ? 1.35 : 1;
        const accentValues = accentMap[accent] || accentMap.red;

        document.body.dataset.theme = theme;
        document.body.dataset.accent = accent;
        document.body.dataset.font = font;
        document.body.dataset.density = density;
        document.body.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
        document.body.dataset.navLayout = navLayout;
        document.body.dataset.sidebarCollapsed = sidebarCollapsed ? 'true' : 'false';

        document.documentElement.style.setProperty('--contrast-adjust', contrast.toFixed(2));
        document.documentElement.style.setProperty('--scale-factor', scale.toFixed(2));
        document.documentElement.style.setProperty('--density-scale', densityScale.toFixed(2));
        document.documentElement.style.setProperty('--accent-color', accentValues.color);
        document.documentElement.style.setProperty('--accent-bg', accentValues.bg);
        document.documentElement.style.setProperty('--accent-text', accentValues.text);
        document.documentElement.style.setProperty('--font-sans', font === 'serif' ? '"Plus Jakarta Sans", Georgia, serif' : font === 'mono' ? '"JetBrains Mono", monospace' : '"Inter", system-ui, -apple-system, sans-serif');
        document.documentElement.style.setProperty('--font-heading', font === 'serif' ? 'Georgia, serif' : font === 'mono' ? '"JetBrains Mono", monospace' : '"Exo 2", Georgia, serif');

        document.documentElement.classList.toggle('reduced-motion', reducedMotion);

        // iPad-style cursor: load/unload the effect based on the setting.
        // Disabled automatically on touch devices (no hover) and when reduced motion is on.
        document.body.dataset.ipadCursor = ipadCursor ? 'true' : 'false';
        if (typeof window.applyIpadCursor === 'function') {
            window.applyIpadCursor(ipadCursor && !reducedMotion);
        }
    }

    window.applySiteSettings = applySiteSettings;
    window.saveSiteSetting = function (key, value) {
        localStorage.setItem(key, String(value));
        applySiteSettings();
    };

    // ── iPad-style cursor (CatsJuice/ipad-cursor via ESM CDN) ──────────────
    // Loaded lazily only when the user enables it. Skipped on touch/coarse
    // pointers where a custom cursor makes no sense.
    let _ipadCursorMod = null;      // the imported module
    let _ipadCursorActive = false;  // whether it is currently running
    const _hasFinePointer = () => window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function tagCursorTargets() {
        // Block cursor for buttons/links/controls; text cursor for headings & prose.
        const blockSel = 'a, button, [role="button"], .site-nav-item, .site-nav-cta, .site-nav-subitem, .alm-tool, .alm-btn, .alm-standings-row, .alm-index-row, .alm-match-toggle, .alm-dropdown-trigger, .alm-dropdown-option, input[type="checkbox"], select';
        document.querySelectorAll(blockSel).forEach(el => {
            if (!el.hasAttribute('data-cursor')) el.setAttribute('data-cursor', 'block');
        });
    }

    // Re-tag + re-scan when the DOM changes (e.g. leaderboard rows load in later).
    let _cursorObserver = null;
    let _cursorRescanTimer = null;
    function startCursorObserver() {
        if (_cursorObserver || !window.MutationObserver) return;
        _cursorObserver = new MutationObserver(() => {
            clearTimeout(_cursorRescanTimer);
            _cursorRescanTimer = setTimeout(() => {
                if (!_ipadCursorActive || !_ipadCursorMod) return;
                tagCursorTargets();
                try {
                    const api = _ipadCursorMod.default || _ipadCursorMod;
                    api.updateCursor();
                } catch (err) { /* ignore */ }
            }, 120);
        });
        _cursorObserver.observe(document.body, { childList: true, subtree: true });
    }
    function stopCursorObserver() {
        if (_cursorObserver) { _cursorObserver.disconnect(); _cursorObserver = null; }
        clearTimeout(_cursorRescanTimer);
    }

    window.applyIpadCursor = async function (enabled) {
        const on = !!enabled && _hasFinePointer();
        if (on && !_ipadCursorActive) {
            try {
                if (!_ipadCursorMod) {
                    _ipadCursorMod = await import('https://unpkg.com/ipad-cursor@latest');
                }
                tagCursorTargets();
                const api = _ipadCursorMod.default || _ipadCursorMod;
                api.initCursor({
                    enableAutoTextCursor: true,
                    enableAutoUpdateCursor: true,
                    adsorptionStrength: 3,
                    blockPadding: 6,
                    normalStyle: { background: 'rgba(30, 30, 35, 0.4)' },
                    blockStyle: { background: 'rgba(30, 30, 35, 0.16)', radius: 'auto' },
                    textStyle: { background: 'rgba(30, 30, 35, 0.4)' },
                });
                _ipadCursorActive = true;
                startCursorObserver();
            } catch (err) {
                // CDN blocked or offline — silently keep the native cursor.
                _ipadCursorActive = false;
            }
        } else if (!on && _ipadCursorActive && _ipadCursorMod) {
            stopCursorObserver();
            try {
                const api = _ipadCursorMod.default || _ipadCursorMod;
                api.disposeCursor();
            } catch (err) { /* ignore */ }
            _ipadCursorActive = false;
        } else if (on && _ipadCursorActive && _ipadCursorMod) {
            // Already running — re-scan for newly injected DOM (header/footer).
            try {
                tagCursorTargets();
                const api = _ipadCursorMod.default || _ipadCursorMod;
                api.updateCursor();
            } catch (err) { /* ignore */ }
        }
    };

    document.addEventListener('DOMContentLoaded', applySiteSettings);
})();

const headerHTML = `
<header class="site-nav fade-in relative z-50">
    <nav class="site-nav-inner mx-auto flex max-w-7xl flex-col md:flex-row md:items-center md:justify-between gap-1.5 px-4 py-2.5 md:px-6 lg:px-8">
        <!-- Top row: Brand + toggle -->
        <div class="flex items-center justify-between w-full md:w-auto gap-2">
            <a href="index.html" class="site-brand inline-flex items-center gap-2.5 whitespace-nowrap">
                <img src="favicon.svg" alt="NBHS TT" class="site-brand-mark h-7 w-7 shrink-0" />
                <span class="site-brand-text">
                    <span class="site-brand-name">NBHS Table Tennis</span>
                    <span class="site-brand-sub">Club Hub</span>
                </span>
            </a>

            <button id="rankingNavToggle" type="button" class="site-nav-burger md:hidden inline-flex h-10 w-10 items-center justify-center shrink-0 ml-auto" aria-expanded="false" aria-label="Toggle navigation menu">
                <i id="menu-icon" data-lucide="menu" class="h-6 w-6"></i>
                <i id="close-icon" data-lucide="x" class="h-6 w-6 hidden"></i>
            </button>

            <button id="sidebarCollapseToggle" type="button" class="site-sidebar-toggle hidden shrink-0 items-center justify-center h-9 w-9" aria-label="Collapse sidebar" title="Collapse sidebar">
                <i data-lucide="panel-left-close" class="site-sidebar-toggle-open h-5 w-5"></i>
                <i data-lucide="panel-left-open" class="site-sidebar-toggle-closed h-5 w-5 hidden"></i>
            </button>
        </div>

        <!-- Menu items -->
        <div id="rankingNavLinks" class="site-nav-links hidden w-full md:flex md:w-auto md:flex-row md:items-center md:justify-end md:gap-1 flex-col gap-0 transition-all">
            <!-- Matches Dropdown -->
            <div class="relative group w-full md:w-auto">
                <button class="site-nav-item inline-flex items-center justify-between w-full px-3 py-3 md:w-auto md:px-3 md:py-2 md:justify-start">
                    <span class="flex items-center gap-2"><i data-lucide="table-2" class="h-4 w-4 shrink-0"></i><span class="site-nav-label">Matches</span></span>
                    <i data-lucide="chevron-down" class="site-nav-caret ml-2 h-4 w-4 shrink-0 md:h-3.5 md:w-3.5 md:ml-1"></i>
                </button>
                <div class="site-nav-menu max-h-0 md:max-h-none md:absolute md:left-0 md:mt-0 w-full md:w-52 opacity-0 md:opacity-0 invisible md:invisible md:group-hover:opacity-100 md:group-hover:visible transition-all duration-200 z-50 md:top-full overflow-hidden md:overflow-visible">
                    <a href="player-ranking.html" class="site-nav-subitem"><i data-lucide="list-ordered" class="h-4 w-4 shrink-0"></i>Rankings</a>
                    <a href="player-matchup-ladder.html" class="site-nav-subitem"><i data-lucide="swords" class="h-4 w-4 shrink-0"></i>Matchups</a>
                    <a href="matches.html" class="site-nav-subitem"><i data-lucide="history" class="h-4 w-4 shrink-0"></i>Match History</a>
                    <!-- Competition sign-up (comment this line out again to hide it from the nav) -->
                    <a href="competition.html" class="site-nav-subitem"><i data-lucide="clipboard-list" class="h-4 w-4 shrink-0"></i>Competition Sign-up</a>
                </div>
            </div>

            <!-- Club Info Dropdown -->
            <div class="relative group w-full md:w-auto">
                <button class="site-nav-item inline-flex items-center justify-between w-full px-3 py-3 md:w-auto md:px-3 md:py-2 md:justify-start">
                    <span class="flex items-center gap-2"><i data-lucide="info" class="h-4 w-4 shrink-0"></i><span class="site-nav-label">Club Info</span></span>
                    <i data-lucide="chevron-down" class="site-nav-caret ml-2 h-4 w-4 shrink-0 md:h-3.5 md:w-3.5 md:ml-1"></i>
                </button>
                <div class="site-nav-menu max-h-0 md:max-h-none md:absolute md:left-0 md:mt-0 w-full md:w-52 opacity-0 md:opacity-0 invisible md:invisible md:group-hover:opacity-100 md:group-hover:visible transition-all duration-200 z-50 md:top-full overflow-hidden md:overflow-visible">
                    <a href="club-analytics.html" class="site-nav-subitem"><i data-lucide="bar-chart-3" class="h-4 w-4 shrink-0"></i>Analytics</a>
                    <a href="past-records.html" class="site-nav-subitem"><i data-lucide="trophy" class="h-4 w-4 shrink-0"></i>Past Records</a>
                    <a href="rules.html" class="site-nav-subitem"><i data-lucide="book-open" class="h-4 w-4 shrink-0"></i>Rules</a>
                </div>
            </div>

            <!-- Settings (standalone top-level item) -->
            <a href="settings.html" class="site-nav-item inline-flex items-center gap-2 w-full px-3 py-3 md:w-auto md:px-3 md:py-2" style="text-decoration:none;">
                <i data-lucide="settings" class="h-4 w-4 shrink-0"></i><span class="site-nav-label">Settings</span>
            </a>

            <!-- Account: link when signed out, dropdown (Your Profile / Absence) when signed in -->
            <div id="navAccountGroup" class="relative group w-full md:w-auto md:ml-3">
                <a id="navAdminLink" href="admin.html" class="site-nav-cta w-full px-3 py-3 md:inline-flex md:w-auto md:px-3 md:py-2 items-center gap-2">
                    <span id="navAdminLinkBadge" class="site-nav-badge hidden"><img id="navAdminLinkBadgeImg" alt="" /><span id="navAdminLinkBadgeText"></span></span>
                    <span id="navAdminLinkText">Login</span>
                    <i id="navAccountCaret" data-lucide="chevron-down" class="site-nav-caret hidden ml-1 h-4 w-4 shrink-0 md:h-3.5 md:w-3.5"></i>
                </a>
                <div id="navAccountMenu" class="account-dropdown-menu site-nav-menu hidden max-h-0 md:max-h-none md:absolute md:right-0 md:mt-0 w-full md:w-56 opacity-0 md:opacity-0 invisible md:invisible transition-all duration-200 z-50 md:top-full overflow-hidden md:overflow-visible">
                    <a href="profile.html" class="site-nav-subitem"><i data-lucide="user-round" class="h-4 w-4 shrink-0"></i>Your Profile</a>
                    <a href="absence-report.html" class="site-nav-subitem"><i data-lucide="calendar-x" class="h-4 w-4 shrink-0"></i>Absence</a>
                    <a id="navAdminPanelItem" href="admin.html" class="site-nav-subitem hidden"><i data-lucide="layout-dashboard" class="h-4 w-4 shrink-0"></i><span class="panel-item-label">Standard User Panel</span></a>
                </div>
            </div>
        </div>
    </nav>
</header>
`;

const footerHTML = `
<footer id="page-footer" class="bg-slate-900 text-slate-400 mt-auto opacity-0 transition-opacity duration-500 border-t border-slate-700">
    <div class="max-w-6xl mx-auto flex flex-col gap-2 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; <span id="current-year"></span> NBHS Table Tennis Hub. All Rights Reserved.</p>
        <a href="#" class="hover:text-white transition-colors">Back to Top &uarr;</a>
    </div>
</footer>
`;

// ── Site-wide announcement banner (admin-editable) ─────────────────────
// Stored in the `site_config` table under key 'announcement'. Anyone can
// read it; only admins can write (enforced by RLS + the admin editor).
async function loadAnnouncementBanner(client) {
    try {
        if (!client) return;
        const { data, error } = await client.from('site_config')
            .select('value').eq('key', 'announcement').maybeSingle();
        if (error) return; // table may not exist yet — fail quietly
        const msg = (data?.value || '').toString();
        renderAnnouncementBanner(msg);
    } catch (err) { /* fail quietly */ }
}

// The stored value may be prefixed with a chosen emoji, e.g. "🏓␟message".
// The ␟ (unit separator) splits emoji from text; falls back to 📢.
function parseAnnouncement(raw) {
    const value = (raw || '').toString();
    if (value.includes('␟')) {
        const [emoji, ...rest] = value.split('␟');
        return { emoji: emoji.trim() || '📢', text: rest.join('␟').trim() };
    }
    return { emoji: '📢', text: value.trim() };
}
window.parseAnnouncement = parseAnnouncement;

function renderAnnouncementBanner(raw) {
    let bar = document.getElementById('site-announcement');
    const { emoji, text } = parseAnnouncement(raw);
    if (!text) { if (bar) bar.remove(); return; }

    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'site-announcement';
        bar.className = 'site-announcement';
    }
    bar.innerHTML = `
        <span class="site-announcement-icon" aria-hidden="true"></span>
        <span class="site-announcement-text"></span>
    `;
    bar.querySelector('.site-announcement-icon').textContent = emoji;
    bar.querySelector('.site-announcement-text').textContent = text;

    // Place the banner directly under the navbar (after the injected header).
    const header = document.querySelector('header.site-nav');
    if (header && header.parentNode) {
        header.insertAdjacentElement('afterend', bar);
    } else if (!bar.parentNode) {
        // Header not injected yet — retry shortly.
        setTimeout(() => renderAnnouncementBanner(raw), 150);
    }
}
window.renderAnnouncementBanner = renderAnnouncementBanner;


// ── Custom dropdowns ───────────────────────────────────────────────────
// Replaces the native <select> popup with a site-styled menu. The real
// <select> stays in the DOM (visually hidden) so form values, `required`
// validation and existing change-listeners keep working. Call
// window.enhanceDropdowns() after adding selects dynamically.
function enhanceOneSelect(select) {
    if (!select || select.dataset.enhanced === 'true') return;
    if (select.multiple || select.size > 1) return; // only single selects
    select.dataset.enhanced = 'true';
    select.classList.add('alm-select--enhanced');

    const wrap = document.createElement('div');
    wrap.className = 'alm-dropdown';
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'alm-dropdown-trigger';
    trigger.setAttribute('data-cursor', 'block');
    trigger.innerHTML = '<span class="alm-dropdown-value"></span><span class="alm-dropdown-arrow" aria-hidden="true"></span>';
    wrap.appendChild(trigger);

    const menu = document.createElement('div');
    menu.className = 'alm-dropdown-menu';
    menu.setAttribute('role', 'listbox');
    wrap.appendChild(menu);

    const valueEl = trigger.querySelector('.alm-dropdown-value');

    function buildOptions() {
        menu.innerHTML = '';
        Array.from(select.options).forEach((opt) => {
            const item = document.createElement('div');
            item.className = 'alm-dropdown-option';
            item.setAttribute('role', 'option');
            item.textContent = opt.textContent;
            item.dataset.value = opt.value;
            if (opt.value === '') item.dataset.placeholder = 'true';
            if (opt.value === select.value) item.classList.add('is-selected');
            item.addEventListener('click', () => {
                select.value = opt.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                syncFromSelect();
                close();
            });
            item.setAttribute('data-cursor', 'block');
            menu.appendChild(item);
        });
    }

    function syncFromSelect() {
        const opt = select.options[select.selectedIndex];
        const text = opt ? opt.textContent : '';
        valueEl.textContent = text;
        trigger.classList.toggle('is-placeholder', !select.value);
        menu.querySelectorAll('.alm-dropdown-option').forEach(el => {
            el.classList.toggle('is-selected', el.dataset.value === select.value);
        });
    }

    function open() {
        // Close any other open dropdowns first.
        document.querySelectorAll('.alm-dropdown.is-open').forEach(d => { if (d !== wrap) d.classList.remove('is-open'); });
        wrap.classList.add('is-open');
        const sel = menu.querySelector('.is-selected');
        if (sel) sel.scrollIntoView({ block: 'nearest' });
    }
    function close() { wrap.classList.remove('is-open'); }

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        wrap.classList.contains('is-open') ? close() : open();
    });

    // Keyboard support on the trigger.
    trigger.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!wrap.classList.contains('is-open')) { open(); return; }
        }
        if (e.key === 'Escape') close();
    });

    // Keep the shell in sync if the select is changed programmatically.
    select.addEventListener('change', syncFromSelect);

    buildOptions();
    syncFromSelect();
}

function enhanceDropdowns(root) {
    // Opt-in: only upgrade selects marked data-enhance="true" so existing
    // layouts (admin builder, settings) keep their native selects untouched.
    (root || document).querySelectorAll('select.alm-select[data-enhance="true"]').forEach(enhanceOneSelect);
}
window.enhanceDropdowns = enhanceDropdowns;

// Close open dropdowns when clicking elsewhere.
document.addEventListener('click', (e) => {
    if (!e.target.closest('.alm-dropdown')) {
        document.querySelectorAll('.alm-dropdown.is-open').forEach(d => d.classList.remove('is-open'));
    }
});


// ── Division-change detection & one-time notification ──────────────────
// Divisions are derived live from Elo rank (same logic as the Matchup
// Ladder): all players sorted by Elo desc; top 16 play Monday, 17–32 play
// Tuesday; within each 16, ranks 1–4 = Div 1, 5–12 = Div 2, 13–16 = Div 3.
// We compute each player's current label, compare it to the value stored in
// account.last_seen_division, and if it changed we show a one-time modal and
// persist the new label — so it fires once per change, on any device.
function computeDivisionLabels(rows) {
    const sorted = (rows || [])
        .map(r => ({ name: r.name, elo: r.elo }))
        .filter(p => p.name)
        .sort((a, b) => {
            const eloDiff = (b.elo || 0) - (a.elo || 0);
            if (eloDiff !== 0) return eloDiff;
            const aOscar = (a.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '') === 'oscarpan';
            const bOscar = (b.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '') === 'oscarpan';
            if (aOscar !== bOscar) return aOscar ? -1 : 1;
            return (a.name || '').localeCompare(b.name || '');
        });

    const labelForIndex = (i) => {
        if (i < 0 || i >= 32) return null; // outside the ranked field
        const day = i < 16 ? 'Monday' : 'Tuesday';
        const within = i % 16; // position inside this day's group of 16
        let div;
        if (within < 4) div = 'Division 1';
        else if (within < 12) div = 'Division 2';
        else div = 'Division 3';
        return `${day} ${div}`;
    };

    const labels = {};
    sorted.forEach((p, i) => { labels[(p.name || '').toLowerCase().trim()] = labelForIndex(i); });
    return labels;
}

function renderDivisionModal(newLabel) {
    if (document.getElementById('division-change-modal')) return;
    const overlay = document.createElement('div');
    overlay.id = 'division-change-modal';
    overlay.className = 'division-modal-overlay';
    overlay.innerHTML = `
        <div class="division-modal" role="dialog" aria-modal="true" aria-labelledby="division-modal-title">
            <div class="division-modal-icon" aria-hidden="true">🏓</div>
            <h2 id="division-modal-title" class="division-modal-title">Your division changed</h2>
            <p class="division-modal-body">You've moved to <strong class="division-modal-label"></strong>. Check the Matchup Ladder for your new table and opponents.</p>
            <button type="button" class="division-modal-btn">Got it</button>
        </div>
    `;
    overlay.querySelector('.division-modal-label').textContent = newLabel;
    const close = () => overlay.remove();
    overlay.querySelector('.division-modal-btn').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);
}

async function checkDivisionChange(client, session) {
    try {
        if (!client || !session?.user) { console.log('[div-check] no client/session'); return; }
        const accountId = session.user.id;

        const [rankRes, acctRes] = await Promise.all([
            client.from('player_rankings').select('name,elo,account_id'),
            client.from('account').select('display_name, last_seen_division').eq('account_id', accountId).maybeSingle(),
        ]);
        if (rankRes.error) { console.log('[div-check] rankings error:', rankRes.error.message); return; }
        if (acctRes.error) { console.log('[div-check] account error:', acctRes.error.message); return; }
        const rankRows = rankRes.data, acct = acctRes.data;
        if (!rankRows || !acct) { console.log('[div-check] no data', { rankRows: !!rankRows, acct: !!acct }); return; }

        // Resolve this user's player name so we can find their ranking row.
        const myRow = rankRows.find(r => r.account_id === accountId);
        const nameKey = (myRow?.name || acct?.display_name || '').toLowerCase().trim();
        if (!nameKey) { console.log('[div-check] could not resolve player name'); return; }

        const labels = computeDivisionLabels(rankRows);
        const currentLabel = labels[nameKey] || null;
        console.log('[div-check]', { nameKey, currentLabel, lastSeen: acct.last_seen_division });
        if (!currentLabel) { console.log('[div-check] not in ranked field'); return; }

        const lastSeen = (acct.last_seen_division || '').trim();

        // First ever load: record silently, no notification.
        if (!lastSeen) {
            console.log('[div-check] first load — recording', currentLabel, 'silently');
            await client.from('account').update({ last_seen_division: currentLabel }).eq('account_id', accountId);
            return;
        }

        if (lastSeen !== currentLabel) {
            console.log('[div-check] CHANGED', lastSeen, '->', currentLabel, '— showing modal');
            renderDivisionModal(currentLabel);
            // Persist immediately so it only ever fires once, on any device.
            await client.from('account').update({ last_seen_division: currentLabel }).eq('account_id', accountId);
        } else {
            console.log('[div-check] no change');
        }
    } catch (err) { console.log('[div-check] exception:', err); }
}


async function updateAuthUI(session) {
    const profileText = document.getElementById('navProfileLinkText');
    const adminLink = document.getElementById('navAdminLink');
    const adminText = document.getElementById('navAdminLinkText');
    const badge = document.getElementById('navAdminLinkBadge');
    const badgeImg = document.getElementById('navAdminLinkBadgeImg');
    const badgeText = document.getElementById('navAdminLinkBadgeText');
    const accountCaret = document.getElementById('navAccountCaret');
    const accountMenu = document.getElementById('navAccountMenu');
    const adminPanelItem = document.getElementById('navAdminPanelItem');

    const navInitials = (name) => {
        const raw = (name || '').toString().trim();
        if (!raw) return '?';
        const words = raw.replace(/[._-]+/g, ' ').split(/\s+/).filter(Boolean);
        const first = words[0]?.[0] || '';
        const last = words.length > 1 ? words[words.length - 1][0] : '';
        return (first + last).toUpperCase() || '?';
    };

    // One universal circle: show a picture if present, otherwise initials.
    const showBadge = (name, avatarUrl) => {
        if (!badge) return;
        const url = (avatarUrl || '').toString().trim();
        if (url && badgeImg) {
            badgeImg.src = url;
            badgeImg.style.display = 'block';
            if (badgeText) badgeText.style.display = 'none';
        } else {
            if (badgeImg) { badgeImg.removeAttribute('src'); badgeImg.style.display = 'none'; }
            if (badgeText) { badgeText.textContent = navInitials(name); badgeText.style.display = 'flex'; }
        }
        badge.classList.remove('hidden');
    };

    if (profileText) {
        profileText.textContent = 'Profile';
        profileText.style.opacity = '1';
    }

    if (!adminLink) return;

    const signedIn = !!(session && session.user && session.user.email);

    // Signed out: a plain "Login" button, no badge, no dropdown.
    if (!signedIn) {
        adminLink.setAttribute('href', 'admin.html');
        if (badge) badge.classList.add('hidden');
        if (accountCaret) accountCaret.classList.add('hidden');
        if (accountMenu) accountMenu.classList.add('hidden');
        if (adminPanelItem) adminPanelItem.classList.add('hidden');
        if (adminText) { adminText.textContent = 'Login'; adminText.style.opacity = '1'; }
        return;
    }

    // Signed in: the name is a dropdown toggle only — never a link to the panel.
    adminLink.removeAttribute('href');
    adminLink.style.cursor = 'pointer';
    if (accountCaret) accountCaret.classList.remove('hidden');
    if (accountMenu) accountMenu.classList.remove('hidden');
    // Panel item shows for everyone signed in; label depends on role.
    if (adminPanelItem) {
        adminPanelItem.classList.remove('hidden');
        const lbl = adminPanelItem.querySelector('.panel-item-label');
        if (lbl) lbl.textContent = 'Standard User Panel';
    }

    const email = (session.user.email || '').toLowerCase();
    let displayName = session.user.user_metadata?.full_name
        || session.user.user_metadata?.name
        || email.split('@')[0];

    if (adminText) { adminText.textContent = displayName; adminText.style.opacity = '1'; }
    showBadge(displayName, '');

    // Upgrade the panel label to "Admin Panel" for admins. Allowlist is
    // available synchronously; also confirm via the async resolver below.
    const setPanelLabel = (text) => {
        const lbl = adminPanelItem && adminPanelItem.querySelector('.panel-item-label');
        if (lbl) lbl.textContent = text;
    };
    const adminEmails = (window._adminEmails || []);
    if (adminEmails.includes(email)) setPanelLabel('Admin Panel');

    // Enrich with the stored display name / avatar (non-blocking; never call getSession here).
    try {
        const client = window._supabaseClient;
        if (client) {
            const { data } = await client.from('account')
                .select('display_name, avatar_url')
                .eq('account_id', session.user.id)
                .maybeSingle();
            if (data?.display_name) {
                displayName = data.display_name;
                if (adminText) adminText.textContent = displayName;
            }
            showBadge(displayName, data?.avatar_url);
        }
        // Role check via resolver (with a timeout so it can never hang the UI).
        if (window._resolveAccountRole) {
            const role = await Promise.race([
                window._resolveAccountRole(email, session.user.id),
                new Promise(resolve => setTimeout(() => resolve(null), 2500))
            ]);
            if (role === 'admin') setPanelLabel('Admin Panel');
            else if (role === 'standard') setPanelLabel('Standard User Panel');
        }
    } catch (err) { /* keep the initials + email-prefix fallback */ }
}

function initMenu() {
    const t = document.getElementById("rankingNavToggle"),
          e = document.getElementById("rankingNavLinks"),
          n = document.getElementById("menu-icon"),
          o = document.getElementById("close-icon");
    if (t && e) {
        t.addEventListener("click", () => {
            const s = e.classList.contains("hidden");
            if (s) {
                e.classList.remove("hidden");
                e.classList.add("flex");
                n.classList.add("hidden");
                o.classList.remove("hidden");
                t.setAttribute("aria-expanded", "true");
            } else {
                e.classList.add("hidden");
                e.classList.remove("flex");
                n.classList.remove("hidden");
                o.classList.add("hidden");
                t.setAttribute("aria-expanded", "false");
                // Close all dropdowns when menu closes
                document.querySelectorAll('header .relative.group > div').forEach(d => {
                    d.classList.remove('show');
                });
            }
        });
    }

    // Account dropdown: when signed in, clicking the account button toggles the
    // menu (Your Profile / Absence) instead of navigating. When signed out the
    // menu is hidden and the button navigates to the login page normally.
    const accountButton = document.getElementById('navAdminLink');
    const accountMenu = document.getElementById('navAccountMenu');
    if (accountButton && accountMenu) {
        accountButton.addEventListener('click', (evt) => {
            // If the menu is hidden (signed out), let the link navigate.
            if (accountMenu.classList.contains('hidden')) return;
            evt.preventDefault();
            evt.stopPropagation();
            const isVisible = accountMenu.classList.contains('show');
            document.querySelectorAll('header .relative.group > div').forEach(d => d.classList.remove('show'));
            if (!isVisible) {
                accountMenu.classList.add('show');
                accountButton.setAttribute('aria-expanded', 'true');
            } else {
                accountButton.setAttribute('aria-expanded', 'false');
            }
        });

        accountMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                accountMenu.classList.remove('show');
                accountButton.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Mobile dropdown menu support
    const dropdownGroups = document.querySelectorAll('header .relative.group');
    dropdownGroups.forEach((group) => {
        const button = group.querySelector('button');
        const dropdown = group.querySelector('div');
        if (button && dropdown && !dropdown.classList.contains('profile-dropdown-menu')) {
            button.addEventListener('click', (evt) => {
                if (window.innerWidth < 768) { // md breakpoint
                    evt.preventDefault();
                    evt.stopPropagation();
                    const isVisible = dropdown.classList.contains('show');
                    // Hide all other dropdowns
                    document.querySelectorAll('header .relative.group > div').forEach(d => {
                        d.classList.remove('show');
                    });
                    // Toggle this one
                    if (!isVisible) {
                        dropdown.classList.add('show');
                    }
                    button.setAttribute('aria-expanded', String(!isVisible));
                }
            });

            // Close dropdown when a link is clicked
            const links = dropdown.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    dropdown.classList.remove('show');
                });
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (evt) => {
        if (window.innerWidth < 768 && !evt.target.closest('header .relative.group')) {
            document.querySelectorAll('header .relative.group > div').forEach(d => {
                d.classList.remove('show');
            });
        }
    });

    // Sidebar collapse toggle (desktop, sidebar layout only)
    const collapseToggle = document.getElementById('sidebarCollapseToggle');
    if (collapseToggle) {
        const syncCollapseToggle = () => {
            const collapsed = document.body.dataset.sidebarCollapsed === 'true';
            const openIcon = collapseToggle.querySelector('.site-sidebar-toggle-open');
            const closedIcon = collapseToggle.querySelector('.site-sidebar-toggle-closed');
            if (openIcon) openIcon.classList.toggle('hidden', collapsed);
            if (closedIcon) closedIcon.classList.toggle('hidden', !collapsed);
            collapseToggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
            collapseToggle.setAttribute('title', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
        };
        collapseToggle.addEventListener('click', () => {
            const collapsed = document.body.dataset.sidebarCollapsed === 'true';
            const next = collapsed ? 'false' : 'true';
            document.body.dataset.sidebarCollapsed = next;
            try { localStorage.setItem('nbhs-sidebar-collapsed', next); } catch (err) {}
            syncCollapseToggle();
        });
        syncCollapseToggle();
    }

    // Collapsible section headings in sidebar mode.
    // In sidebar layout each nav group toggles its own submenu open/closed
    // and remembers the state; expanding the collapsed rail auto-closes them.
    document.querySelectorAll('header .relative.group').forEach((group) => {
        const button = group.querySelector('button');
        if (!button) return;
        button.addEventListener('click', (evt) => {
            if (window.innerWidth < 768) return; // handled by mobile logic above
            if (document.body.dataset.navLayout !== 'sidebar') return; // top-bar uses hover
            evt.preventDefault();
            evt.stopPropagation();
            if (document.body.dataset.sidebarCollapsed === 'true') {
                // Expand the rail first so the opened section is visible
                document.body.dataset.sidebarCollapsed = 'false';
                try { localStorage.setItem('nbhs-sidebar-collapsed', 'false'); } catch (err) {}
                const ct = document.getElementById('sidebarCollapseToggle');
                if (ct) {
                    const oi = ct.querySelector('.site-sidebar-toggle-open');
                    const ci = ct.querySelector('.site-sidebar-toggle-closed');
                    if (oi) oi.classList.remove('hidden');
                    if (ci) ci.classList.add('hidden');
                }
            }
            group.classList.toggle('section-open');
            button.setAttribute('aria-expanded', String(group.classList.contains('section-open')));
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const hp = document.getElementById('header-placeholder');
    if (hp) hp.outerHTML = headerHTML;
    const fp = document.getElementById('footer-placeholder');
    if (fp) fp.outerHTML = footerHTML;
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    initMenu();

    // Upgrade any native <select class="alm-select"> to the custom dropdown.
    if (typeof window.enhanceDropdowns === 'function') window.enhanceDropdowns();

    // Re-apply the iPad cursor now that the header/footer exist, so nav
    // elements get tagged and the effect covers them.
    if (typeof window.applyIpadCursor === 'function') {
        const wantCursor = (function () {
            try { return localStorage.getItem('nbhs-ipad-cursor') === 'true' && localStorage.getItem('nbhs-reduced-motion') !== 'true'; }
            catch (e) { return false; }
        })();
        if (wantCursor) window.applyIpadCursor(true);
    }

    // Render Lucide icons in the freshly injected header/footer.
    // The CDN script may still be loading, so retry briefly until ready.
    (function renderIcons(attempt) {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        } else if ((attempt || 0) < 20) {
            setTimeout(() => renderIcons((attempt || 0) + 1), 100);
        }
    })(0);

    if (window.supabase) {
        const _supabase = window._supabaseClient || window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        // Export the client globally so other pages can use it
        window._supabaseClient = _supabase;

        // Resolve a user's role. Source of truth is the `account` table's
        // `role` column (set in Supabase); the hardcoded allowlist is only a
        // fallback, and account_requests a last resort for legacy signups.
        window._ACCOUNT_REQUESTS_TABLES = ['account_requests_v2', 'account_requests'];
        window._resolveAccountRole = async function(email, accountId) {
            const lower = (email || '').toLowerCase();
            if (window._adminEmails && window._adminEmails.includes(lower)) return 'admin';

            // Primary: the account row for this signed-in user (by account_id).
            if (accountId) {
                try {
                    const { data, error } = await _supabase.from('account')
                        .select('role, status')
                        .eq('account_id', accountId)
                        .maybeSingle();
                    if (!error && data && (data.status || 'active').toLowerCase() === 'active') {
                        return (data.role || 'standard').toLowerCase();
                    }
                } catch (err) { /* fall through */ }
            }

            // Secondary: match the account row by email.
            if (email) {
                try {
                    const { data, error } = await _supabase.from('account')
                        .select('role, status')
                        .ilike('email', email)
                        .maybeSingle();
                    if (!error && data && (data.status || 'active').toLowerCase() === 'active') {
                        return (data.role || 'standard').toLowerCase();
                    }
                } catch (err) { /* fall through */ }
            }

            // Last resort: legacy approved account_requests.
            if (!email) return 'standard';
            for (const tableName of window._ACCOUNT_REQUESTS_TABLES) {
                try {
                    const { data, error } = await _supabase.from(tableName)
                        .select('role, status')
                        .ilike('email', email)
                        .order('created_at', { ascending: false })
                        .limit(1);
                    if (error) continue;
                    const request = data && data[0];
                    if (!request) return 'standard';
                    if ((request.status || '').toLowerCase() === 'approved') return (request.role || 'standard').toLowerCase();
                    return 'standard';
                } catch (err) {
                    continue;
                }
            }
            return 'standard';
        };
        try {
            const { data } = await _supabase.auth.getSession();
            await updateAuthUI(data?.session);
            // One-time division-change notification (cross-device, DB-backed).
            checkDivisionChange(_supabase, data?.session);
        } catch (error) {
            console.error('Failed to load auth session:', error);
            updateAuthUI(null);
        }

        // Load the site-wide announcement banner (any visitor can read it).
        loadAnnouncementBanner(_supabase);
        _supabase.auth.onAuthStateChange((_event, session) => {
            updateAuthUI(session);
            // Fire the division check when a user signs in (e.g. first time on a
            // new computer), not on token refresh or sign-out.
            if (_event === 'SIGNED_IN') {
                checkDivisionChange(_supabase, session);
            }
            if (_event === 'PASSWORD_RECOVERY') {
                const newPassword = prompt('Enter your new password');
                if (newPassword) {
                    _supabase.auth.updateUser({ password: newPassword })
                        .then(() => alert('Password updated successfully!'))
                        .catch((err) => alert('Error updating password: ' + err.message));
                }
            }
        });

        // Check URL hash for recovery token on page load
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
            _supabase.auth.getSession().then(({ data }) => {
                const session = data?.session;
                if (session) {
                    const newPassword = prompt('Enter your new password');
                    if (newPassword) {
                        _supabase.auth.updateUser({ password: newPassword })
                            .then(() => {
                                alert('Password updated successfully!');
                                window.location.hash = '';
                            })
                            .catch((err) => alert('Error updating password: ' + err.message));
                    }
                }
            });
        }
        
        // If this is the admin page, initialize its auth handlers now that shared client is ready
        if (window._adminInitAuth) {
            window._adminInitAuth();
        }
    }

    // Default reveal for non-data pages
    if (!window.manualPageReveal) {
        document.getElementById('main-content')?.classList.remove('opacity-0');
        document.getElementById('page-footer')?.classList.remove('opacity-0');
    }

    // Page transition helpers: enter animation and intercept internal links for exit animation
    (function setupPageTransitions() {
        try {
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const bodyEl = document.body || document.documentElement;

            // Enter animation
            bodyEl.classList.add('page-transition-enter');
            requestAnimationFrame(() => {
                bodyEl.classList.add('page-transition-enter-active');
                bodyEl.classList.remove('page-transition-exit', 'page-transition-exit-active');
            });
            setTimeout(() => {
                bodyEl.classList.remove('page-transition-enter', 'page-transition-enter-active');
            }, 520);

            // Intercept internal link clicks for exit animation
            document.addEventListener('click', (evt) => {
                const a = evt.target.closest && evt.target.closest('a');
                if (!a) return;
                const href = a.getAttribute('href');
                if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || a.target === '_blank' || a.hasAttribute('download')) return;
                // Allow hash-only navigation on same page
                try {
                    const url = new URL(a.href, window.location.href);
                    if (url.origin !== window.location.origin) return; // external
                    if (url.pathname === window.location.pathname && url.hash && url.hash !== '') return; // same-page anchor
                } catch (e) {
                    return; // malformed URL - don't intercept
                }

                // Intercept navigation and play exit animation
                evt.preventDefault();
                bodyEl.classList.add('page-transition-exit');
                requestAnimationFrame(() => bodyEl.classList.add('page-transition-exit-active'));
                const navigateTo = a.href;
                const delay = 420; // matches CSS timing
                setTimeout(() => { window.location.href = navigateTo; }, delay);
            }, { capture: true });
        } catch (e) { /* non-fatal */ }
    })();
});