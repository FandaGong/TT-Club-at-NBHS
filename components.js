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
        const densityScale = density === 'compact' ? 0.75 : density === 'spacious' ? 1.35 : 1;
        const accentValues = accentMap[accent] || accentMap.red;

        document.body.dataset.theme = theme;
        document.body.dataset.accent = accent;
        document.body.dataset.font = font;
        document.body.dataset.density = density;
        document.body.dataset.reducedMotion = reducedMotion ? 'true' : 'false';

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
<header class="bg-red-800 text-white fade-in relative z-50 border-b border-red-900/10">
    <nav class="mx-auto flex max-w-7xl flex-col md:flex-row md:items-center md:justify-between gap-1.5 px-3 py-2.5 md:px-6 lg:px-8">
        <!-- Top row: Logo and toggle button -->
        <div class="flex items-center justify-between w-full md:w-auto gap-1.5">
            <a href="index.html" class="site-brand-link inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold transition-all duration-200 hover:opacity-90 md:text-base">
                <img src="favicon.png" alt="NBHS TT" class="header-favicon h-5 w-5 shrink-0" />
                <span class="leading-none relative after:absolute after:left-0 after:bottom-[-2px] after:h-[1px] after:w-full after:scale-x-0 after:origin-left after:bg-white after:transition-transform after:duration-200 hover:after:scale-x-100">NBHS TT Hub</span>
            </a>
            
            <button id="rankingNavToggle" type="button" class="md:hidden inline-flex h-10 w-10 items-center justify-center border border-red-600 bg-red-700 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200 overflow-hidden transform-gpu shrink-0 ml-auto" aria-expanded="false" aria-label="Toggle navigation menu">
                <svg id="menu-icon" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                <svg id="close-icon" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hidden transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <!-- Menu items -->
        <div id="rankingNavLinks" class="hidden w-full md:flex md:w-auto md:flex-row md:items-center md:justify-end md:gap-0.5 flex-col gap-0 transition-all">
            <!-- Matches Dropdown -->
            <div class="relative group w-full md:w-auto">
                <button class="inline-flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 md:w-auto md:px-2.5 md:py-1.5 md:justify-start">
                    <span class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h9" /><path d="M9 12h9" /><path d="M9 18h9" /><path d="M4 6h.01" /><path d="M4 12h.01" /><path d="M4 18h.01" /></svg>Matches
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4 shrink-0 transition-transform group-hover:md:rotate-180 md:h-3 md:w-3 md:ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div class="max-h-0 md:max-h-none md:absolute md:left-0 md:mt-0 w-full md:w-48 bg-red-900 md:shadow-lg opacity-0 md:opacity-0 invisible md:invisible md:group-hover:opacity-100 md:group-hover:visible transition-all duration-200 z-50 md:top-full overflow-hidden md:overflow-visible">
                    <a href="player-ranking.html" class="block px-3 md:px-4 py-3 md:py-2 text-sm font-medium text-white/90 hover:bg-white/10 border-l-4 border-red-800 md:border-l-0 pl-5 md:pl-4"><svg xmlns="http://www.w3.org/2000/svg" class="inline mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v18" /><path d="M17 3v18" /><path d="M7 7h10" /><path d="M7 11h10" /><path d="M7 15h10" /></svg>Rankings</a>
                    <a href="player-matchup-ladder.html" class="block px-3 md:px-4 py-3 md:py-2 text-sm font-medium text-white/90 hover:bg-white/10 border-l-4 border-red-800 md:border-l-0 pl-5 md:pl-4"><svg xmlns="http://www.w3.org/2000/svg" class="inline mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Matchups</a>
                    <a href="matches.html" class="block px-3 md:px-4 py-3 md:py-2 text-sm font-medium text-white/90 hover:bg-white/10 border-l-4 border-red-800 md:border-l-0 pl-5 md:pl-4"><svg xmlns="http://www.w3.org/2000/svg" class="inline mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v8m0 0l-3-3m3 3l3-3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Match History</a>
                </div>
            </div>

            <!-- Club Info Dropdown -->
            <div class="relative group w-full md:w-auto">
                <button class="inline-flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 md:w-auto md:px-2.5 md:py-1.5 md:justify-start">
                    <span class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 18 0A9 9 0 0 0 3 12z" /><path d="M12 6v6l4 2" /></svg>Club Info
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4 shrink-0 transition-transform group-hover:md:rotate-180 md:h-3 md:w-3 md:ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div class="max-h-0 md:max-h-none md:absolute md:left-0 md:mt-0 w-full md:w-48 bg-red-900 md:shadow-lg opacity-0 md:opacity-0 invisible md:invisible md:group-hover:opacity-100 md:group-hover:visible transition-all duration-200 z-50 md:top-full overflow-hidden md:overflow-visible">
                    <a href="club-analytics.html" class="block px-3 md:px-4 py-3 md:py-2 text-sm font-medium text-white/90 hover:bg-white/10 border-l-4 border-red-800 md:border-l-0 pl-5 md:pl-4"><svg xmlns="http://www.w3.org/2000/svg" class="inline mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M8 7v10M12 11v6M16 5v12" /></svg>Analytics</a>
                    <a href="past-records.html" class="block px-3 md:px-4 py-3 md:py-2 text-sm font-medium text-white/90 hover:bg-white/10 border-l-4 border-red-800 md:border-l-0 pl-5 md:pl-4"><svg xmlns="http://www.w3.org/2000/svg" class="inline mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 8v4" /><path d="M12 12l3 2" /></svg>Past Records</a>
                    <a href="rules.html" class="block px-3 md:px-4 py-3 md:py-2 text-sm font-medium text-white/90 hover:bg-white/10 border-l-4 border-red-800 md:border-l-0 pl-5 md:pl-4"><svg xmlns="http://www.w3.org/2000/svg" class="inline mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>Rules</a>
                </div>
            </div>

            <div class="relative group w-full md:w-auto">
                <button id="navProfileLink" type="button" class="inline-flex items-center justify-between w-full md:inline-flex md:w-auto px-3 py-3 md:px-2.5 md:py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/20 overflow-hidden transform-gpu" style="backface-visibility: hidden; transform: translateZ(0);" aria-expanded="false" aria-haspopup="menu">
                    <span class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="inline mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0" /></svg>
                        <span id="navProfileLinkText">Profile</span>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4 shrink-0 transition-transform group-hover:md:rotate-180 md:h-3 md:w-3 md:ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div class="profile-dropdown-menu max-h-0 md:max-h-none md:absolute md:left-0 md:mt-0 w-full md:w-56 bg-red-950 md:shadow-lg opacity-0 md:opacity-0 invisible md:invisible transition-all duration-200 z-50 md:top-full overflow-hidden md:overflow-visible rounded-none border border-white/10">
                    <a href="profile.html" class="block px-3 md:px-4 py-3 md:py-2 text-sm font-medium text-white/90 hover:bg-white/10 border-l-4 border-red-700 md:border-l-0 pl-5 md:pl-4"><svg xmlns="http://www.w3.org/2000/svg" class="inline mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0" /></svg>Your Profile</a>
                    <a href="absence-report.html" class="block px-3 md:px-4 py-3 md:py-2 text-sm font-medium text-white/90 hover:bg-white/10 border-l-4 border-red-700 md:border-l-0 pl-5 md:pl-4"><svg xmlns="http://www.w3.org/2000/svg" class="inline mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7h8M8 11h8M8 15h5" /><rect x="4" y="3" width="16" height="18" rx="2" ry="2" /></svg>Absence</a>
                    <a href="settings.html" class="block px-3 md:px-4 py-3 md:py-2 text-sm font-medium text-white/90 hover:bg-white/10 border-l-4 border-red-700 md:border-l-0 pl-5 md:pl-4"><svg xmlns="http://www.w3.org/2000/svg" class="inline mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v2" /><path d="M12 19v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" /><path d="M3 12h2" /><path d="M19 12h2" /><path d="M4.93 19.07l1.41-1.41" /><path d="M17.66 6.34l1.41-1.41" /><circle cx="12" cy="12" r="3.5" /></svg>Settings</a>
                </div>
            </div>

            <a id="navAdminLink" href="admin.html" class="hidden w-full px-3 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 bg-white/10 md:inline-flex md:w-auto md:px-2.5 md:py-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="inline mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <span id="navAdminLinkText">Admin Portal</span>
            </a>
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

    if (profileText) {
        profileText.textContent = 'Profile';
        profileText.style.opacity = '1';
    }

    if (adminText) {
        adminText.textContent = 'Admin Portal';
        adminText.style.opacity = '1';
    }

    if (adminLink) {
        let shouldShowAdminLink = false;
        if (session && session.user && session.user.email) {
            const email = (session.user.email || '').toLowerCase();
            try {
                if (window._resolveAccountRole) {
                    const role = await window._resolveAccountRole(email);
                    shouldShowAdminLink = role === 'admin';
                } else {
                    const adminEmails = (window._adminEmails || []).slice();
                    shouldShowAdminLink = adminEmails.includes(email);
                }
            } catch (err) {
                shouldShowAdminLink = false;
            }
        }
        adminLink.classList.toggle('hidden', !shouldShowAdminLink);
    }
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

    // Profile dropdown support on mobile and desktop
    const profileButton = document.getElementById('navProfileLink');
    const profileDropdown = document.querySelector('header .profile-dropdown-menu');
    if (profileButton && profileDropdown) {
        profileButton.addEventListener('click', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            const isVisible = profileDropdown.classList.contains('show');
            document.querySelectorAll('header .relative.group > div').forEach(d => {
                d.classList.remove('show');
            });
            if (!isVisible) {
                profileDropdown.classList.add('show');
                profileButton.setAttribute('aria-expanded', 'true');
            } else {
                profileButton.setAttribute('aria-expanded', 'false');
            }
        });

        profileDropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                profileDropdown.classList.remove('show');
                profileButton.setAttribute('aria-expanded', 'false');
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
}

document.addEventListener('DOMContentLoaded', async () => {
    const hp = document.getElementById('header-placeholder');
    if (hp) hp.outerHTML = headerHTML;
    const fp = document.getElementById('footer-placeholder');
    if (fp) fp.outerHTML = footerHTML;
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    initMenu();
    
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