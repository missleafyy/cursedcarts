# Leafy's six shutter ads: crop + background removal only (flood from the sheet edge up to each poster's dark outline).
import numpy as np
from PIL import Image
a=np.array(Image.open('art/raw/ads.png').convert('RGB')).astype(int)
def cut(x0,x1,y0,y1,name):
    s=a[y0:y1,x0:x1]; H,W=s.shape[:2]; lum=s.sum(axis=2)/3
    # the blurred backing is mid brown and low in saturation; outline is dark, posters vary
    sat=s.max(axis=2)-s.min(axis=2); bgm=(lum>62)&(lum<135)&(sat<48)
    seen=np.zeros((H,W),bool); st=[(y,x) for x in range(W) for y in (0,H-1)]+[(y,x) for y in range(H) for x in (0,W-1)]
    while st:
        y,x=st.pop()
        if seen[y,x] or not bgm[y,x]: continue
        seen[y,x]=True
        if y: st.append((y-1,x))
        if y<H-1: st.append((y+1,x))
        if x: st.append((y,x-1))
        if x<W-1: st.append((y,x+1))
    # keep only the poster itself: drop specks and anything from a neighbouring cell
    lab=np.zeros((H,W),int); best=(0,0); n=0
    for y0_ in range(H):
        for x0_ in range(W):
            if seen[y0_,x0_] or lab[y0_,x0_]: continue
            n+=1; c=0; st=[(y0_,x0_)]; lab[y0_,x0_]=n
            while st:
                y,x=st.pop(); c+=1
                for v,u in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
                    if 0<=v<H and 0<=u<W and not seen[v,u] and not lab[v,u]: lab[v,u]=n; st.append((v,u))
            if c>best[0]: best=(c,n)
    seen=lab!=best[1]
    o=np.dstack([s.astype('uint8'),np.where(seen,0,255).astype('uint8')])
    ys,xs=np.where(~seen); o=o[ys.min():ys.max()+1,xs.min():xs.max()+1]; Image.fromarray(o).save(f'art/ui/{name}.png'); print(name,o.shape,'bg%',round(seen.mean()*100))
for n,b in [('ad_pretzel',(5,490,8,520)),('ad_escal',(490,1010,8,520)),('ad_handheld',(1010,1530,8,520)),('ad_point',(5,490,520,1020)),('ad_suits',(490,1010,520,1020)),('ad_burst',(1010,1530,520,1020))]: cut(*b,n)
