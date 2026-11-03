# Leafy's perks, switches, repo notice, identifier: crop + background removal only.
import numpy as np
from PIL import Image
def fill(dark, seeds):
    bg=np.zeros(dark.shape,bool); st=[s for s in seeds if dark[s]]
    H,W=dark.shape
    while st:
        y,x=st.pop()
        if bg[y,x] or not dark[y,x]: continue
        bg[y,x]=True
        if y: st.append((y-1,x))
        if y<H-1: st.append((y+1,x))
        if x: st.append((y,x-1))
        if x<W-1: st.append((y,x+1))
    return bg
def cut(a,x0,x1,y0,y1,name,holes=()):
    s=a[y0:y1,x0:x1].copy(); dark=s[...,:3].astype(int).max(axis=2)<24; H,W=dark.shape
    seeds=[(0,x) for x in range(W)]+[(H-1,x) for x in range(W)]+[(y,0) for y in range(H)]+[(y,W-1) for y in range(H)]+list(holes)
    s[...,3]=255; s[fill(dark,seeds),3]=0
    ys,xs=np.where(s[...,3]>0); o=s[ys.min():ys.max()+1,xs.min():xs.max()+1]; Image.fromarray(o).save(f'art/ui/{name}.png'); print(name,o.shape)
L=lambda n:np.array(Image.open(f'art/raw/{n}.png').convert('RGBA'))
a=L('perks')
for n,x,y in [('pk_lucky',(40,480),(80,520)),('pk_coins',(510,940),(80,520)),('pk_door',(975,1405),(80,520)),('pk_human',(40,480),(565,1005)),('pk_lease',(510,940),(565,1005)),('pk_badge',(975,1405),(565,1005))]: cut(a,x[0],x[1],y[0],y[1],n)
a=L('set_switches')
for n,x,y in [('sw_off',(30,460),(130,750)),('sw_on',(470,900),(130,750)),('mute_off',(920,1335),(280,735)),('mute_on',(1340,1760),(280,735))]: cut(a,x[0],x[1],y[0],y[1],n)
a=L('repo_notice'); cut(a,0,a.shape[1],0,a.shape[0],'repo_sheet')
a=L('identifier'); cut(a,0,a.shape[1],0,a.shape[0],'identifier',holes=[(440,480)])
