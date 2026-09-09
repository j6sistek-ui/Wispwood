#!/usr/bin/env bash
set -euo pipefail
cd /workspace

LOCK=/tmp/wispwood-github.lock
exec 9>"$LOCK"
if ! flock -n 9; then
  echo "github push already running"
  exit 0
fi

git rev-parse --is-inside-work-tree >/dev/null

npm run build:pages

NEW_JS=$(ls docs/assets/index-*.js 2>/dev/null | grep -v CmrSzhEm | head -1 || true)
NEW_CSS=$(ls docs/assets/index-*.css 2>/dev/null | grep -v BOVmQV1H | head -1 || true)
if [ -n "${NEW_JS:-}" ]; then cp "$NEW_JS" docs/assets/index-CmrSzhEm.js; fi
if [ -n "${NEW_CSS:-}" ]; then cp "$NEW_CSS" docs/assets/index-BOVmQV1H.css; fi

for f in src public docs README.md package.json vite.pages.config.ts \
  scripts/push-github.sh scripts/watch-github.sh AGENTS.project.md startup.sh; do
  if [ -e "$f" ]; then git add "$f"; fi
done

if git diff --cached --quiet; then
  echo "github already up to date"
  exit 0
fi

MSG=${1:-Update Wispwood}
if [ "$MSG" = "auto" ]; then
  MSG="Update Wispwood"
fi

git commit -m "$MSG

Pushed so GitHub Pages matches the latest clearing."
git push origin HEAD:main
echo "github pushed"
