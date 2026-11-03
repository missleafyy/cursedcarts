# Leafy's stamps sheet: crop + mask only. Alpha under 64 is the red/magenta cut-out fringe, so it goes.
import numpy as np
from PIL import Image
a=np.array(Image.open('art/raw/stamps.png').convert('RGBA')); a[a[...,3]<64,3]=0
for n,(x0,y0,x1,y1) in dict(stamp_circle_d=(29,44,422,442),stamp_rect_d=(446,114,908,364),stamp_circle_p=(933,46,1286,415),stamp_rect_p=(1308,125,1744,340),check_off=(58,543,258,745),check_on=(316,531,529,750),tip_plate=(582,492,1350,791),cursor=(1412,446,1675,838)).items():
    Image.fromarray(a[y0:y1,x0:x1]).save(f'art/ui/{n}.png')
