#!/bin/sh
set -eu
root=".output/public"
client=$(basename "$(ls "$root"/assets/index-*.js | head -1)")
css=$(basename "$(ls "$root"/assets/styles-*.css | head -1)")
cat > "$root/index.html" <<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"/>
  <title>Wispwood</title>
  <meta name="description" content="Hold the lantern. Outlast the night."/>
  <meta name="theme-color" content="#0c0d0c"/>
  <link rel="icon" type="image/svg+xml" href="/Wispwood/favicon.svg"/>
  <link rel="stylesheet" href="/Wispwood/assets/${css}"/>
</head>
<body>
  <script type="module" src="/Wispwood/assets/${client}"></script>
</body>
</html>
HTML
cp "$root/index.html" "$root/404.html"
test -s "$root/index.html"
echo "wrote $root/index.html -> $client $css"
