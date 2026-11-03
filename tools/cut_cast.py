#!/usr/bin/env python3
"""Cut the user's cast sheet into one PNG per character. No new art: crop + drop stray fringe islands."""
from PIL import Image; import numpy as np; from collections import deque
im=Image.open('art/raw/cast_sheet.png').convert('RGBA'); A=np.array(im); H,W=A.shape[:2]
solid=A[...,3]>110
lab=np.zeros((H,W),int); comps={}; n=0
for y,x in zip(*np.nonzero(solid)):
    if lab[y,x]: continue
    n+=1; q=deque([(y,x)]); lab[y,x]=n; c=0; x0=x1=x; y0=y1=y
    while q:
        b,a=q.popleft(); c+=1; x0=min(x0,a);x1=max(x1,a);y0=min(y0,b);y1=max(y1,b)
        for d,e in ((b+1,a),(b-1,a),(b,a+1),(b,a-1)):
            if 0<=d<H and 0<=e<W and solid[d,e] and not lab[d,e]: lab[d,e]=n;q.append((d,e))
    comps[n]=(c,x0,y0,x1,y1)
big=sorted(comps.items(),key=lambda k:-k[1][0])[:14]
for k,v in big: print(k,v)
np.save('/tmp/claude-1000/-home-leafy--config-eww/dfd7027c-c232-4a2b-a5d8-e266466f6652/scratchpad/lab.npy',lab)
