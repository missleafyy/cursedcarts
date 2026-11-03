#!/bin/bash
# Carl's Cursed Cartridges: ./play.sh   (test hooks: '?auto=60', '?new', '?shot=...')
cd "$(dirname "$0")"
exec brave-browser --allow-file-access-from-files --app="file://$PWD/index.html$1" >/dev/null 2>&1 &
