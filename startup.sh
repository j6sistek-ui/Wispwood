#!/bin/sh
set -eu
cd /workspace
if ! pgrep -f "scripts/watch-github.sh" >/dev/null 2>&1; then
  nohup bash scripts/watch-github.sh >>/tmp/wispwood-github.log 2>&1 &
fi
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
