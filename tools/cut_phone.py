# Phone frame + app icons + rail occluder. Crop and alpha only.
import numpy as np
from PIL import Image
a=np.array(Image.open('art/raw/phone.png').convert('RGBA'))
a[a[...,3]<150,3]=0
ys,xs=np.where(a[...,3]>0); print('phone bbox',xs.min(),ys.min(),xs.max()+1,ys.max()+1)
Image.fromarray(a).save('art/ui/phone.png')
u=np.array(Image.open('art/raw/phoneui.png').convert('RGBA')); cols=(u[...,3]>200).sum(axis=0)>20
runs=[];s=None
for x,c in enumerate(cols):
    if c and s is None:s=x
    if not c and s is not None:
        if x-s>100:runs.append((s,x))
        s=None
print(runs)
for (x0,x1),n in zip(runs,['app_mail','app_rep','app_sheet']):
    c=u[:,x0:x1]; ys=np.where((c[...,3]>200).sum(axis=1)>20)[0]
    im=Image.fromarray(c[ys.min():ys.max()+1]); im.save(f'art/ui/{n}.png'); print(n,im.size)
# railing over the far walkers: dark rail pixels + the top bar, from the empty-mall plate, at game scale
p=Image.open('art/raw/plate.png').convert('RGBA').crop((114,0,1557,790)).resize((1672,round(790*1672/1443)),Image.BICUBIC)
p=np.array(p); x0,x1,y0,y1=637,1245,358,445; r=p[y0:y1,x0:x1].copy(); lum=r[...,:3].mean(axis=2)
m=lum<58; m[:int(370-y0)]|=False
m[364-y0:372-y0,:]=True
r[...,3]=np.where(m,255,0); Image.fromarray(r).save('art/layers/rail.png'); print('rail',m.mean())
