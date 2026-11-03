# Leafy's 3x3 button sheet: rows tan/green/pink, columns normal/hover/pressed. Crop + background mask only.
import numpy as np
from PIL import Image
from collections import deque
im=np.array(Image.open('art/raw/buttons.png').convert('RGBA'))
print('bg',im[5,5],im[380,260],'outline',im[240,31],im[240,29])
X=[(16,512),(524,1012),(1026,1516)];Y=[(106,368),(396,658),(684,946)]
for j,c in enumerate(['tan','green','pink']):
  for i,st in enumerate(['n','h','p']):
    x0,x1=X[i];y0,y1=Y[j];a=im[y0:y1,x0:x1].copy();lum=a[...,:3].mean(axis=2);h,w=lum.shape
    wall=lum<24;wall2=wall.copy();wall2[1:]|=wall[:-1];wall2[:-1]|=wall[1:];wall2[:,1:]|=wall[:,:-1];wall2[:,:-1]|=wall[:,1:]
    bg=np.zeros((h,w),bool);q=deque()
    for p in [(0,x) for x in range(w)]+[(h-1,x) for x in range(w)]+[(y,0) for y in range(h)]+[(y,w-1) for y in range(h)]:
        if not wall2[p]:bg[p]=True;q.append(p)
    while q:
        y,x=q.popleft()
        for n in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
            if 0<=n[0]<h and 0<=n[1]<w and not bg[n] and not wall2[n]:bg[n]=True;q.append(n)
    a[bg,3]=0;ys,xs=np.where(~bg);t=(xs.min(),ys.min(),xs.max()+1,ys.max()+1)
    Image.fromarray(a).crop(t).save(f'art/ui/btn_{c}_{st}.png');print(c,st,t[2]-t[0],t[3]-t[1],'%.0f'%(100*(~bg).mean()))
