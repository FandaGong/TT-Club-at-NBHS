import os
import glob

# First, extract the admin login HTML from absence-report.html
with open('absence-report.html', 'r') as f:
    content = f.read()

# We need to remove the admin section from absence.
# It is located around '<div class="flex items-center justify-between">' to '<!-- Admin Reports Modal (Overlay) -->'
# Let's find it.
