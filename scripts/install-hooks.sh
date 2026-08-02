#!/usr/bin/env bash
# Installs the Teams commit-card notifier as a git post-commit hook.
# Run this ONCE after cloning the repo (or after the .git folder is recreated):
#
#   bash scripts/install-hooks.sh
#
# The hook itself just calls the committed script, so updates to the card only
# need a change to scripts/teams-commit-card.sh — no re-install required.
#
# To manually send a test card without committing, run:
#   bash scripts/teams-commit-card.sh

set -e
REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK_PATH="$REPO_ROOT/.git/hooks/post-commit"

cat > "$HOOK_PATH" <<'HOOK'
#!/usr/bin/env bash
# Auto-installed by scripts/install-hooks.sh — posts a Teams card on every commit.
REPO_ROOT="$(git rev-parse --show-toplevel)"
bash "$REPO_ROOT/scripts/teams-commit-card.sh"
HOOK

chmod +x "$HOOK_PATH"
echo "✓ Installed post-commit hook at $HOOK_PATH"
echo "  It runs scripts/teams-commit-card.sh on every commit."
echo "  Make sure the m365 CLI is logged in:  m365 login"
