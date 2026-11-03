#!/usr/bin/env python3
"""art/sound/*.wav -> ogg -> game/sounds_data.js (base64), so it runs from file:// with no fetch."""
import glob,base64,subprocess,os,json
out={};tot=0
for f in sorted(glob.glob('art/sound/*.wav')):
    n=os.path.basename(f)[:-4]; loop=n.startswith('amb_') or n=='muzak'; g=f[:-4]+'.ogg'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f,'-c:a','libvorbis','-q:a','4' if loop else '5',g],check=True)
    b=open(g,'rb').read(); tot+=len(b); out[n]=base64.b64encode(b).decode(); os.remove(g)
open('game/sounds_data.js','w').write('window.SOUND_DATA='+json.dumps(out)+';\n'); print(len(out),'sounds',tot//1024,'KB')
