# Leafy's Prop Pills sheets: crop + cut-out-fringe mask only, nothing repainted. Sources stay in art/raw.
import numpy as np
from PIL import Image
def load(n):
    a=np.array(Image.open(f'art/raw/lab_{n}.png').convert('RGBA')); a[a[...,3]<64,3]=0; return a
def save(a,x0,x1,name,y0=None,y1=None,pad=2):
    s=a[...,3]>=128; s=s[:,x0:x1+1]
    ys=np.where(s.sum(1)>0)[0]; y0=ys[0]-pad if y0 is None else y0; y1=ys[-1]+pad+1 if y1 is None else y1
    y0=max(0,y0); x0=max(0,x0-pad); x1=min(a.shape[1]-1,x1+pad)
    Image.fromarray(a[y0:y1,x0:x1+1]).save(f'art/lab/{name}.png'); print(name,x1-x0+1,y1-y0,'origin',x0,y0)
Image.open('art/raw/lab_lab.png').convert('RGB').save('art/lab/room.png')
for n,sp,names in [('evaprtato',[(107,842),(994,1729)],['evap_off','evap_on']),('heatplate',[(50,873),(938,1760)],['plate_off','plate_on']),('pillpress',[(35,686),(759,1410),(1483,2134)],['press_idle','press_run','press_jam']),('storage',[(47,883),(943,1405)],['storage','rack']),('purity',[(15,870),(887,1743)],['scan_off','scan_on']),('reagents',[(38,544),(569,928),(964,1224),(1246,1748)],['r_base','r_solv','r_stab','r_fill']),('pills',[(109,509),(632,1029),(1156,1557),(1680,2078)],['jar_pharma','jar_street','jar_cut','jar_junk']),('heatdial',[(288,1130),(1308,1433)],['dial','needle']),('termicon',[(78,713),(769,1402),(1459,2093)],['ti_chem','ti_reag','ti_press']),('crate',[(109,869),(992,2054)],['crate_shut','crate_open']),('powder_tray',[(106,1666)],['tray'])]:
    a=load(n)
    for s,nm in zip(sp,names): save(a,s[0],s[1],nm)
a=load('flask')   # same height for every state so the flask doesn't jump
for s,nm in zip([(84,512),(610,1038),(1129,1558),(1655,2086)],['flask_empty','flask_mix','flask_boil','flask_burnt']): save(a,s[0],s[1],nm,0,724)
a=load('smoke'); W=a.shape[1]//6
for r,c in enumerate('ld'):
    for i in range(6):
        Image.fromarray(a[r*362:(r+1)*362,i*W:(i+1)*W]).save(f'art/lab/smoke_{c}{i}.png')
