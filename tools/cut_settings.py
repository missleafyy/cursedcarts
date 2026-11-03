# Leafy's settings sheets: crop + mask only.
import numpy as np
from PIL import Image
def L(n): a=np.array(Image.open(f'art/raw/set_{n}.png').convert('RGBA')); return a
def cut(a,x0,x1,y0,y1,name):
    s=a[y0:y1,x0:x1].copy(); s[s[...,3]<128,3]=0; ys,xs=np.where(s[...,3]>0); o=s[ys.min():ys.max()+1,xs.min():xs.max()+1]; Image.fromarray(o).save(f'art/ui/{name}.png'); print(name,o.shape[1],o.shape[0],'origin',x0+xs.min(),y0+ys.min())
a=L('control_box'); print('box alpha<128 %',(a[...,3]<128).mean()*100); cut(a,0,a.shape[1],0,a.shape[0],'set_panel')
a=L('sliders'); cut(a,40,1730,30,235,'sl_empty'); cut(a,40,1730,240,440,'sl_green'); cut(a,40,1730,445,640,'sl_pink')
cut(a,190,560,645,870,'knob_n'); cut(a,700,1075,645,870,'knob_h'); cut(a,1215,1590,645,870,'knob_p')
a=L('audioicons')
for i,x in enumerate([(20,440),(460,880),(895,1315),(1335,1755)]):
    n=['master','music','sfx','mute'][i]; cut(a,x[0],x[1],20,440,f'ai_{n}_on'); cut(a,x[0],x[1],450,870,f'ai_{n}_off')
