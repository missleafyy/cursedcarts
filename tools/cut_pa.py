# Leafy's PA speaker and bar: crop + mask only. Both speaker frames share one box so they line up.
import numpy as np
from PIL import Image
a=np.array(Image.open('art/raw/pa.png').convert('RGBA'))
for n,x in [('pa_off',30),('pa_on',775)]:
    s=a[225:835,x:x+740].copy(); s[s[...,3]<128,3]=0; Image.fromarray(s).save(f'art/ui/{n}.png')
b=np.array(Image.open('art/raw/paui.png').convert('RGBA'))[251:473,21:2152].copy(); b[b[...,3]<128,3]=0; Image.fromarray(b).save('art/ui/pa_bar.png')
