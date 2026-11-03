# Cuts Leafy's UI sheet. Crop + background mask only: every kept pixel is untouched.
import numpy as np
from PIL import Image
from collections import deque
im=np.array(Image.open('art/raw/ui.png').convert('RGBA'))
P={ 'window':(8,8,818,338),'crt':(835,18,1232,336),'clip':(1250,5,1518,338),
 'win_x':(8,350,446,532),'win_x2':(456,350,748,538),
 'tab_pink':(778,365,946,424),'tab_off':(942,376,1082,424),'tab_tan':(1128,376,1262,424),
 'tray':(758,420,1098,522),
 'b_tan':(26,546,216,636),'b_pink':(216,546,392,636),'b_green':(392,546,574,636),
 'p_tan':(26,638,214,722),'p_pink':(216,638,390,722),'p_green':(392,638,574,722),
 'x_tan':(598,552,684,632),'x_pink':(688,552,772,632),'x_green':(778,552,862,632),
 'c_empty':(598,638,684,716),'c_pink':(688,638,772,716),'c_green':(778,638,862,716),
 'meter':(886,646,1440,714),'grid':(10,732,380,1014),'paper':(386,728,640,1012),'note':(648,742,842,992),
 'crt_s':(858,720,1068,908),'plate':(1102,732,1344,896),'clip_note':(1378,738,1490,862),
 'i_cart':(850,910,950,1012),'i_box':(950,910,1046,1012),'i_recycle':(1046,910,1140,1012),'i_gear':(1140,910,1236,1012),'i_star':(1236,910,1332,1012),'i_heart':(1332,910,1428,1012),'i_trash':(1428,910,1524,1012)}
for n,(x0,y0,x1,y1) in P.items():
    c=im[y0:y1,x0:x1].copy(); h,w=c.shape[:2]
    lum=c[...,:3].mean(axis=2)
    def grow(m):
        o=m.copy(); o[1:]|=m[:-1]; o[:-1]|=m[1:]; o[:,1:]|=m[:,:-1]; o[:,:-1]|=m[:,1:]; return o
    # gaps in a thin outline would let the flood in, so thicken the outline while flooding
    wall=grow(lum<(62 if n in ('paper','note','crt_s','tab_off','clip') else 50))
    if n in ('paper','note'): wall=grow(lum>=150)|wall
    bg=np.zeros((h,w),bool); q=deque()
    for x in range(w):
        for y in (0,h-1):
            if not wall[y,x]: bg[y,x]=True;q.append((y,x))
    for y in range(h):
        for x in (0,w-1):
            if not wall[y,x]: bg[y,x]=True;q.append((y,x))
    while q:
        y,x=q.popleft()
        for a,b in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
            if 0<=a<h and 0<=b<w and not bg[a,b] and not wall[a,b]: bg[a,b]=True;q.append((a,b))
    bg=bg|(grow(bg)&(lum>=50))      # take back the halo, stop at the true outline
    c[bg,3]=0
    ys,xs=np.where(~bg); t=(xs.min(),ys.min(),xs.max()+1,ys.max()+1)
    Image.fromarray(c).crop(t).save(f'art/ui/{n}.png')
    print(n,t[2]-t[0],t[3]-t[1],'kept%.0f'%(100*(~bg).mean()))
