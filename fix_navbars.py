import glob

html_files = glob.glob('*.html')

# We know that in index.html, the navbar was updated to max-w-6xl and includes rules.html.
# Let's extract the exact nav block from index.html to use as the source of truth.

with open('index.html', 'r') as f:
    content = f.read()

start_tag = '<nav class="max-w-6xl'
end_tag = '</nav>'

start_idx = content.find(start_tag)
if start_idx == -1:
    start_tag = '<nav class="' # fallback
    start_idx = content.find(start_tag)

end_idx = content.find(end_tag, start_idx) + len(end_tag)
new_nav = content[start_idx:end_idx]

print("Found new nav, replacing in other files...")

for file in html_files:
    if file == 'index.html' or file == 'rules.html':
        continue
        
    with open(file, 'r') as f:
        file_content = f.read()
        
    # Find the existing nav in this file
    nav_start = file_content.find('<nav class="')
    if nav_start != -1:
        nav_end = file_content.find('</nav>', nav_start) + len('</nav>')
        old_nav = file_content[nav_start:nav_end]
        
        # Replace old nav with the new nav
        file_content = file_content.replace(old_nav, new_nav)
        
        with open(file, 'w') as f:
            f.write(file_content)
        print(f"Updated {file}")

