#!/usr/bin/env python3
"""Split the user's item sheets on connected alpha. Pixels untouched: crop only, keep original alpha."""
from PIL import Image; import numpy as np; import sys,json; from collections import deque
def comps(f,minc=800):
    im=Image.open(f).convert('RGBA'); A=np.array(im); H,W=A.shape[:2]; s=A[...,3]>100; lab=np.zeros((H,W),int);out=[];n=0
    for y,x in zip(*np.nonzero(s)):
        if lab[y,x]: continue
        n+=1;q=deque([(y,x)]);lab[y,x]=n;c=0;x0=x1=int(x);y0=y1=int(y)
        while q:
            b,a=q.popleft();c+=1;x0=min(x0,a);x1=max(x1,a);y0=min(y0,b);y1=max(y1,b)
            for d,e in ((b+1,a),(b-1,a),(b,a+1),(b,a-1)):
                if 0<=d<H and 0<=e<W and s[d,e] and not lab[d,e]: lab[d,e]=n;q.append((d,e))
        if c>=minc: out.append((n,c,x0,y0,x1,y1))
    return im,lab,out
if __name__=='__main__':
    for f in sys.argv[1:]:
        im,lab,o=comps(f); print(f,im.size); [print(' ',r[1:]) for r in sorted(o,key=lambda r:(r[3]//250,r[2]))]
