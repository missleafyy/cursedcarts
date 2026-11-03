#!/usr/bin/env python3
"""Crop every item out of the user's sheets. Pixels and alpha are kept exactly; other shapes on the sheet are just masked off."""
import sys; sys.path.insert(0,'tools')
from cut_sheets import comps
from PIL import Image; import numpy as np
NAMES={
 'art/raw/att4.png':['cart_evil','pill_jar','tama','crt','mp3'],
 'art/raw/food.png':['noodles','energy','bun','choc','juice'],
 'art/raw/food2.png':['fries','burger','pizza','ramen','energy2','donut','chips','bar','popsicle','sushi'],
 'art/raw/garbage.png':['bag','ds_clean','cup','goggles_new','ringbox'],
 'art/raw/items.png':['poster_scrap','ds_cracked','vhs','cd','walkie','crushed_can','clamshell','plush','torn_bag','glowstick','mall_id','headphones','chips_empty','pill_bottle','battery','goggles','circuit','coupon'],
}
for f,names in NAMES.items():
    im,lab,o=comps(f); A=np.array(im)
    h=A.shape[0]//2
    multi=len(o)>5
    o=sorted(o,key=lambda r:((r[3]+r[5])//2>h if multi else 0,r[2]))
    assert len(o)==len(names),(f,len(o))
    for r,n in zip(o,names):
        B=A.copy(); B[...,3]=np.where(lab==r[0],A[...,3],0)
        # keep the soft edge pixels next to the shape
        from PIL import ImageFilter
        m=np.array(Image.fromarray(((lab==r[0])*255).astype('uint8')).filter(ImageFilter.MaxFilter(3)))
        B[...,3]=np.minimum(A[...,3],m)
        Image.fromarray(B).crop((r[2],r[3],r[4]+1,r[5]+1)).save(f'art/items/{n}.png')
