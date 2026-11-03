#!/usr/bin/env python3
"""Cut items out of the user's storefront PNG (no new art), and make a clean plate of the display case."""
from PIL import Image, ImageDraw; import numpy as np
bg=Image.open('art/raw/storefront.png').convert('RGBA')
def poly(name,pts,out='art/items'):
    m=Image.new('L',bg.size,0); ImageDraw.Draw(m).polygon(pts,fill=255)
    c=bg.copy(); c.putalpha(m); c.crop(m.getbbox()).save(f'{out}/{name}.png')
# nine cartridges: same sheared outline stepped across the shelves (coords = storefront pixels)
base=[(305,333),(358,333),(361,343),(359,385),(297,386),(295,381)]
stepx=[0,63.5,127]; stepy=[0,85,170]
names=['moon','eye','static','pod','spiral','ruins','cross','volt','smile']
for r in range(3):
    for c in range(3):
        poly('cart_'+names[r*3+c],[(x+stepx[c],y+stepy[r]) for x,y in base])
bg.crop((1322,100,1625,545)).save('art/layers/shutter.png')
