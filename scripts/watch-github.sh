#!/usr/bin/env bash
set -eu
cd /workspace
fingerprint() {
  find src/game src/components public/game package.json vite.pages.config.ts \
    -type f -printf '%T@ %p\n' 2>/dev/null | sort | md5sum | awk '{print $1}'
}
last=$(fingerprint)
while true; do
  sleep 12
  now=$(fingerprint)
  if [ "$now" = "$last" ]; then
    continue
  fi
  sleep 25
  now2=$(fingerprint)
  if [ "$now2" != "$now" ]; then
    last=$now2
    continue
  fi
  last=$now2
  bash /workspace/scripts/push-github.sh auto || true
done
