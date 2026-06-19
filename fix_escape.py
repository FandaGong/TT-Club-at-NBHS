with open('rules.html', 'r') as f:
    content = f.read()

# Fix the broken escapeHtml function
content = content.replace("'&': '&'", "'&': '&'")
content = content.replace("'<': '<'", "'<': '<'")
content = content.replace("'>': '>'", "'>': '>'")
content = content.replace("'\"': '\"'", "'\"': '"'")

with open('rules.html', 'w') as f:
    f.write(content)

print('Fixed escapeHtml function')