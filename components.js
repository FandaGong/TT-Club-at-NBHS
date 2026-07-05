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
    }

    window.applySiteSettings = applySiteSettings;
    window.saveSiteSetting = function (key, value) {
        localStorage.setItem(key, String(value));
        applySiteSettings();
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
                window._resolveAccountRole(email),
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

        // Expose a resolver that checks the `account_requests` tables for approved admin role
        window._ACCOUNT_REQUESTS_TABLES = ['account_requests_v2', 'account_requests'];
        window._resolveAccountRole = async function(email) {
            if (!email) return 'standard';
            const lower = (email || '').toLowerCase();
            if (window._adminEmails && window._adminEmails.includes(lower)) return 'admin';
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
        } catch (error) {
            console.error('Failed to load auth session:', error);
            updateAuthUI(null);
        }
        _supabase.auth.onAuthStateChange((_event, session) => {
            updateAuthUI(session);
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