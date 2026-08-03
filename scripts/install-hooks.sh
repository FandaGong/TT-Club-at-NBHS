#!/usr/bin/env bash
#   Install m365 CLI using npm install -g @pnp/cli-microsoft365
#   use m365 setup to login.
#   Choose the following options:
# Welcome to the CLI for Microsoft 365 setup!
# This command will guide you through the process of configuring the CLI for your needs.
# Please, answer the following questions and we'll define a set of settings to best match how you intend to use the CLI.
#
# ✔ CLI for Microsoft 365 requires a Microsoft Entra app. Do you want to create a
# new app registration or use an existing one? Create a new app registration
#
# ✔ What scopes should the new app registration have? All (easy way to use all CLI
#  commands)
#
# ✔ How do you plan to use the CLI? Interactively
#
# ✔ How experienced are you in using the CLI? Proficient
#
# ? Based on your preferences, we'll configure the following settings:
# - Entra app: Create a new app registration with all scopes
# - autoOpenLinksInBrowser: true
# - copyDeviceCodeToClipboard: true
# - output: text
# - printErrorsAsPlainText: true
# - prompt: true
# - showHelpOnFailure: true
# - helpMode: options
# - authType: browser
#
# You can change any of these settings later using the `m365 cli config set`
# command or reset them to default using `m365 cli config reset`.
#
# Do you want to apply these settings now? (Y/n) y
#
# Then install the git hook once:
#   bash scripts/install-hooks.sh
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
echo "  Make sure the m365 CLI is installed and logged in (see comments at top)."
