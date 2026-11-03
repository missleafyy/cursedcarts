#!/usr/bin/env python3
"""Leafy's customer PNGs: copy to art/raw, crop to the figure and drop the faint glow and stray islands. Colours untouched."""
from PIL import Image; import numpy as np, shutil, os
from collections import deque
for src,key in (('stinger','stringer'),('foodworker','pat'),('upperdeck collector','vane'),('cartdealer','dealer')):
    raw=f'art/raw/{key}.png'
    if not os.path.exists(raw): shutil.copy(os.path.expanduser(f'~/{src}.png'),raw)
    A=np.array(Image.open(raw).convert('RGBA')); H,W=A.shape[:2]; solid=A[...,3]>110
    lab=np.zeros((H,W),int); sizes={}; n=0
    for y,x in zip(*np.nonzero(solid)):
        if lab[y,x]: continue
        n+=1; q=deque([(y,x)]); lab[y,x]=n; c=0
        while q:
            b,a=q.popleft(); c+=1
            for d,e in ((b+1,a),(b-1,a),(b,a+1),(b,a-1)):
                if 0<=d<H and 0<=e<W and solid[d,e] and not lab[d,e]: lab[d,e]=n; q.append((d,e))
        sizes[n]=c
    keep=np.isin(lab,[k for k,v in sizes.items() if v>=max(sizes.values())*.002])
    A[~keep,3]=0; ys,xs=np.nonzero(keep); box=(xs.min(),ys.min(),xs.max()+1,ys.max()+1)
    Image.fromarray(A).crop(box).save(f'art/cast/{key}.png'); print(key,box,len(sizes),'alpha<255 inside',int(((A[...,3]>0)&(A[...,3]<255)).sum()))

