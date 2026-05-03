import glob

html_files = glob.glob('*.html')

old_nav_start = '        <nav class="max-w-4xl mx-auto flex items-center justify-between gap-4 px-4 py-4">'
new_nav_start = '        <nav class="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-4">'

old_nav_links = """            <div id="rankingNavLinks"
                class="hidden w-full flex-col gap-3 pt-4 sm:flex sm:w-auto sm:flex-row sm:items-center sm:pt-0">
                <a href="player-ranking.html" class="block nav-link-hover px-2 py-1"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v18"/><path d="M17 3v18"/><path d="M7 7h10"/><path d="M7 11h10"/><path d="M7 15h10"/></svg>Rankings</a>
                <a href="player-matchup-ladder.html" class="block nav-link-hover px-2 py-1"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>Matchups</a>
                <a href="club-analytics.html" class="block nav-link-hover px-2 py-1"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3v18h18M8 7v10M12 11v6M16 5v12"/></svg>Analytics</a>
                <a href="past-records.html" class="block nav-link-hover px-2 py-1"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4"/><path d="M12 12l3 2"/></svg>Past Records</a>
                <a href="absence-report.html" class="block nav-link-hover px-2 py-1"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8M8 11h8M8 15h5"/><rect x="4" y="3" width="16" height="18" rx="2" ry="2"/></svg>Absence</a>
            </div>"""

new_nav_links = """            <div id="rankingNavLinks"
                class="hidden w-full flex-col gap-3 pt-4 sm:flex sm:w-auto sm:flex-row sm:items-center sm:pt-0">
                <a href="player-ranking.html" class="block nav-link-hover px-2 py-1"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v18"/><path d="M17 3v18"/><path d="M7 7h10"/><path d="M7 11h10"/><path d="M7 15h10"/></svg>Rankings</a>
                <a href="player-matchup-ladder.html" class="block nav-link-hover px-2 py-1"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>Matchups</a>
                <a href="club-analytics.html" class="block nav-link-hover px-2 py-1"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3v18h18M8 7v10M12 11v6M16 5v12"/></svg>Analytics</a>
                <a href="past-records.html" class="block nav-link-hover px-2 py-1"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4"/><path d="M12 12l3 2"/></svg>Past Records</a>
                <a href="absence-report.html" class="block nav-link-hover px-2 py-1"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8M8 11h8M8 15h5"/><rect x="4" y="3" width="16" height="18" rx="2" ry="2"/></svg>Absence</a>
                <a href="rules.html" class="block nav-link-hover px-2 py-1"><svg xmlns="http://www.w3.org/2000/svg" class="inline align-middle h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>Rules</a>
            </div>"""

for file in html_files:
    if file == 'rules.html':
        continue
    with open(file, 'r') as f:
        content = f.read()

    # We also need to change max-w-4xl to max-w-6xl in the main container, to match the navbar if needed.
    # Let's see if there is <main class="max-w-4xl ...> as well.
    # We will just change max-w-4xl to max-w-6xl for the header/nav to make the navbar wider.
    content = content.replace(old_nav_start, new_nav_start)
    content = content.replace(old_nav_links, new_nav_links)
    
    with open(file, 'w') as f:
        f.write(content)

print("Updated navbars.")
