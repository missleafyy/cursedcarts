#!/bin/bash
# tools/shot.sh <page-with-query> <out.png> [W,H] [ms]
# Screenshot a page headlessly and print console errors/warnings.
#   tools/shot.sh 'tools/gallery.html?load=game/art_leafy.js' shots/leafy.png 1400,900
#   tools/shot.sh 'index.html?map=town&skip=60' shots/town.png 1920,1080
cd "$(dirname "$0")/.."
page="$1"; out="$2"; size="${3:-1400,900}"; ms="${4:-1500}"
timeout 90 brave-browser --headless=new --disable-gpu --no-sandbox --hide-scrollbars --mute-audio \
  --enable-logging=stderr --v=0 --allow-file-access-from-files \
  --screenshot="$(realpath -m "$out")" --window-size="$size" --virtual-time-budget="$ms" \
  "file://$PWD/$page" 2>&1 | grep -E "CONSOLE" | sed -E 's/.*CONSOLE:[0-9]+\] //' | grep -v "browser is shutting down\|AudioContext" | head -60
