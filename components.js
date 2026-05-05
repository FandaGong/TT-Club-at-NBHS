// components.js
const CONFIG = {
    SUPABASE_URL: "https://ngnkbfazhdedaqvxcphw.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbmtiZmF6aGRlZGFxdnhjcGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTE5NDksImV4cCI6MjA5MzI4Nzk0OX0.F_S6ORkFe-SuJPybs7FEFH94E6U2hZ5ern4vrg4kMOk",
    ADMIN_EMAILS: ['nbhsttclub@gmail.com']
};

const headerHTML = `
<header class="bg-red-800 text-white shadow-md fade-in relative z-50">
    <nav class="max-w-6xl mx-auto flex flex-wrap items-center justify-between px-4 py-4">
        <a href="index.html" class="text-xl font-bold transition-opacity duration-200 hover:opacity-80 shrink-0">NBHS TT Hub</a>
        
        <button id="rankingNavToggle" type="button" class="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-600 bg-red-700 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200 overflow-hidden transform-gpu shrink-0">
            <svg id="menu-icon" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            <svg id="close-icon" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hidden transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div id="rankingNavLinks" class="hidden w-full flex-col gap-1 mt-4 pt-4 border-t border-red-700/50 sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-2 sm:mt-0 sm:pt-0 sm:border-0 transition-all">
            <a href="player-ranking.html" class="block rounded-lg px-3 py-3 sm:py-2 bg-transparent hover:bg-white/10 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-5 w-5 sm:h-4 sm:w-4 mr-3 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v18" /><path d="M17 3v18" /><path d="M7 7h10" /><path d="M7 11h10" /><path d="M7 15h10" /></svg>Rankings</a>
            <a href="player-matchup-ladder.html" class="block rounded-lg px-3 py-3 sm:py-2 bg-transparent hover:bg-white/10 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-5 w-5 sm:h-4 sm:w-4 mr-3 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Matchups</a>
            <a href="club-analytics.html" class="block rounded-lg px-3 py-3 sm:py-2 bg-transparent hover:bg-white/10 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-5 w-5 sm:h-4 sm:w-4 mr-3 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M8 7v10M12 11v6M16 5v12" /></svg>Analytics</a>
            <a href="past-records.html" class="block rounded-lg px-3 py-3 sm:py-2 bg-transparent hover:bg-white/10 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-5 w-5 sm:h-4 sm:w-4 mr-3 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 8v4" /><path d="M12 12l3 2" /></svg>Past Records</a>
            <a href="absence-report.html" class="block rounded-lg px-3 py-3 sm:py-2 bg-transparent hover:bg-white/10 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-5 w-5 sm:h-4 sm:w-4 mr-3 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7h8M8 11h8M8 15h5" /><rect x="4" y="3" width="16" height="18" rx="2" ry="2" /></svg>Absence</a>
            <a href="rules.html" class="block rounded-lg px-3 py-3 sm:py-2 bg-transparent hover:bg-white/10 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-5 w-5 sm:h-4 sm:w-4 mr-3 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>Rules</a>
            
            <a id="navLoginLink" href="admin.html" class="block rounded-lg px-3 py-3 sm:py-2 bg-white/10 hover:bg-white/20 transition-colors overflow-hidden transform-gpu" style="backface-visibility: hidden; transform: translateZ(0);">
                <svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-5 w-5 sm:h-4 sm:w-4 mr-3 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <span id="navLoginLinkText">Login</span>
            </a>
        </div>
    </nav>
</header>
`;

const footerHTML = `
<footer id="page-footer" class="bg-slate-800 text-slate-400 mt-auto opacity-0 transition-opacity duration-500">
    <div class="max-w-6xl mx-auto flex items-center justify-between p-4 text-sm">
        <p>&copy; <span id="current-year"></span> NBHS Table Tennis Hub. All Rights Reserved.</p>
        <a href="#" class="hover:text-white transition-colors">Back to Top &uarr;</a>
    </div>
</footer>
`;

function updateAuthUI(session) {
    const loginText = document.getElementById('navLoginLinkText');
    if (!loginText) return;
    if (session) {
        const email = session.user.email.toLowerCase();
        loginText.textContent = CONFIG.ADMIN_EMAILS.includes(email) ? "Admin Portal" : "Profile";
    } else {
        loginText.textContent = "Login";
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
                e.classList.add("flex", "animate-[fadeIn_0.2s_ease-in-out]");
                n.classList.add("hidden");
                o.classList.remove("hidden");
            } else {
                e.classList.add("hidden");
                n.classList.remove("hidden");
                o.classList.add("hidden");
            }
        });
    }
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
        const _supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        // Export the client globally so other pages can use it
        window._supabaseClient = _supabase;
        const { data } = await _supabase.auth.getSession();
        updateAuthUI(data.session);
        _supabase.auth.onAuthStateChange((_event, session) => updateAuthUI(session));
        
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
});
