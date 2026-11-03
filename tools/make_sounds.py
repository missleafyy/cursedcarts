#!/usr/bin/env python3
"""Renders every sound in the game from scratch: foley, voices, room tones and the mall muzak. Output: art/sound/*.wav"""
import numpy as np, wave, os
SR=44100; rng=np.random.default_rng(7); OUT='art/sound'
def t_(d): return np.arange(int(d*SR))/SR
def noise(d): return rng.standard_normal(int(d*SR))
def fil(x,lo=None,hi=None,order=2):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR)+1e-6; g=np.ones_like(f)
    if lo: g*=1/np.sqrt(1+(lo/f)**(2*order))
    if hi: g*=1/np.sqrt(1+(f/hi)**(2*order))
    return np.fft.irfft(X*g,len(x))
def bp(x,c,q=4):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR)+1e-6
    return np.fft.irfft(X/np.sqrt(1+(q*(f/c-c/f))**2),len(x))
def dec(n,tau): return np.exp(-np.arange(n)/SR/tau)
def modal(ps,d=1.,strike=.001):
    """struck object: [(freq, amp, decay)]"""
    t=t_(d); o=np.zeros(len(t))
    for f,a,tau in ps: o+=a*np.sin(2*np.pi*f*t+rng.uniform(0,6))*np.exp(-t/tau)
    return o*(1-np.exp(-t/strike))
def thump(f0,f1,tau,d=.5):
    t=t_(d); return np.sin(2*np.pi*np.cumsum(f1+(f0-f1)*np.exp(-t/.03))/SR)*np.exp(-t/tau)
def burst(d,lo,hi,tau): n=noise(d); return fil(n,lo,hi)*dec(len(n),tau)
def mix(*parts,d=None):
    """(signal, start_seconds, gain)"""
    end=max(int(p[1]*SR)+len(p[0]) for p in parts); o=np.zeros(end if d is None else int(d*SR))
    for s,at,g in parts:
        i=int(at*SR); m=min(len(s),len(o)-i)
        if m>0: o[i:i+m]+=s[:m]*g
    return o
def room(x,size=.35,wet=.25,hi=5000,stereo=False):
    n=int(size*4*SR); out=[]
    for ch in range(2 if stereo else 1):
        ir=fil(rng.standard_normal(n),200,hi)*np.exp(-np.arange(n)/SR/size); ir/=np.sqrt((ir**2).sum())
        L=len(x)+n; w=np.fft.irfft(np.fft.rfft(np.r_[x,np.zeros(n)])*np.fft.rfft(ir,L),L)
        out.append(np.r_[x,np.zeros(n)]*(1-wet*.4)+w*wet)
    return np.array(out).T if stereo else out[0]
def fade(x,ms=4):
    n=min(len(x),int(ms*SR/1000)); x=x.copy(); x[-n:]*=np.linspace(1,0,n); return x
def trim(x,th=.0006):
    a=np.abs(x) if x.ndim==1 else np.abs(x).max(1); i=np.where(a>th)[0]; return x[:i[-1]+1] if len(i) else x
def save(name,x,peak=.8,tail=True):
    if tail: x=fade(trim(x/(np.abs(x).max()+1e-9)),8)
    x=x/(np.abs(x).max()+1e-9)*peak
    pcm=(np.clip(x,-1,1)*32767).astype('<i2')
    with wave.open(f'{OUT}/{name}.wav','wb') as w:
        w.setnchannels(1 if x.ndim==1 else 2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(f'{name:14s} {len(x)/SR:6.2f}s')
def var(name,fn,n=3,peak=.8):
    for i in range(n): save(f'{name}{i}',fn(i),peak)
# ------------------------------------------------ hands and objects
var('select',lambda i:room(mix((burst(.03,1500,7000,.004),0,.8),(thump(240+i*25,120,.018,.1),0,1),(modal([(2900+i*170,.3,.012),(4700,.15,.008)],.08),.002,1),(burst(.02,900,4000,.004),.045,.35)),.08,.1))
var('pickup',lambda i:room(mix((burst(.02,700,5000,.004),0,.6),(modal([(780+i*50,.7,.018),(1530+i*70,.5,.012),(2750,.25,.008)],.12),.001,1)),.07,.1))
var('drop',lambda i:room(mix((thump(210+i*20,110,.03,.2),0,1),(modal([(560+i*40,.7,.025),(1180+i*60,.45,.016),(2250,.2,.009)],.15),0,.9),(burst(.02,500,3000,.005),0,.5),(modal([(690+i*40,.3,.014)],.08),.05,.5)),.09,.14))
def coins(n=5,span=.28,base=4300):
    o=[]
    for k in range(n):
        f=base*rng.uniform(.8,1.25); at=span*(k/n)**.7+rng.uniform(0,.012)
        o.append((modal([(f,.6,.05),(f*1.47,.4,.035),(f*2.13,.25,.02)],.2),at,1-.1*k))
    return mix(*o)
var('coin',lambda i:room(mix((coins(6),0,.75),(thump(150,90,.03,.15),.0,.4)),.11,.16))
def till():
    bell=modal([(2093,.7,.55),(3345,.45,.4),(5240,.3,.25),(7640,.14,.12),(2100,.3,.55)],1.5)
    return room(mix((thump(150,70,.05,.25),0,1),(burst(.03,600,4500,.007),0,.75),(burst(.03,600,4500,.008),.09,.6),(thump(120,60,.06,.3),.09,.7),(bell,.11,.6),(coins(9,.45),.14,.45)),.2,.2)
save('till0',till())
def stamp(i=0):
    return room(mix((thump(95,48,.09,.5),0,1),(burst(.05,250,2400,.012),0,.95),(burst(.015,1800,8000,.003),0,.35),(modal([(148+i*8,.6,.08),(236,.4,.05),(410,.2,.025)],.4),0,.75),(modal([(1250,.09,.03),(1720,.06,.02)],.15),.03,1)),.14,.2)
var('stamp',stamp)
def door():
    cr=[]; at=.09
    for k in range(26):
        f=rng.uniform(380,980)*(1+k/40); s=bp(noise(.05),f,12)*dec(int(.05*SR),.012); cr.append((s,at,.5+.4*np.sin(k/4))); at+=rng.uniform(.012,.042)
    return room(mix((modal([(1900,.5,.012),(3100,.3,.008)],.06),0,.8),(burst(.02,800,5000,.004),0,.5),*cr,(thump(85,44,.16,.7),at,1),(modal([(190,.55,.14),(310,.4,.1),(720,.2,.05),(1340,.08,.03)],.6),at,.8),(modal([(2200,.4,.012)],.05),at+.05,.5)),.45,.3)
save('door0',door())
def shutter(opening):
    d=1.9; o=np.zeros(int((d+.8)*SR)); at=.05; k=0
    while at<d:
        v=rng.uniform(.45,1); f=rng.uniform(520,1250); s=modal([(f,.5,.02),(f*1.8,.3,.012),(f*3.1,.1,.006)],.07)+burst(.07,1500,8000,.004)*.3
        i=int(at*SR); o[i:i+len(s)]+=s*v*.5; k+=1; at+=max(.022,.052+.016*np.sin(k/3)+rng.uniform(-.008,.008))
    rumble=fil(noise(len(o)/SR),30,240); rumble*=np.minimum(1,np.arange(len(o))/SR/.1)*np.clip((d+.05-np.arange(len(o))/SR)/.15,0,1)
    o+=rumble*.8
    end=mix((thump(70,38,.2,.8),0,1),(modal([(150,.7,.2),(233,.5,.16),(517,.3,.1),(1100,.15,.05),(2300,.06,.03)],.8),0,1))
    i=int(d*SR); o[i:i+len(end)]+=end*(1.3 if not opening else .7)
    return room(o,.5,.3)
save('shutteropen0',shutter(True)); save('shutterclose0',shutter(False))
def bell():
    ps=[(2349,.8,1.0),(2361,.5,.9),(3760,.5,.6),(5610,.35,.35),(8320,.2,.18),(1175,.14,1.1)]
    return room(mix((burst(.008,2000,9000,.002),0,.5),(modal(ps,2.2),0,1),(modal([(2349,.4,.5),(3760,.25,.3)],1),.11,.25)),.3,.14)
var('bell',lambda i:bell(),2)
var('step',lambda i:room(mix((thump(100,55,.04,.2),0,1),(burst(.05,200,1400,.012),0,.6),(burst(.03,1500,6000,.01),.02,.1),(thump(90,55,.04,.2),.22,.7),(burst(.05,200,1400,.012),.22,.4)),.3,.3,3000),2)
save('bump0',room(mix((thump(140,70,.04,.25),0,1),(modal([(320,.5,.03),(510,.35,.02)],.12),0,.8),(burst(.02,300,1800,.008),0,.5)),.06,.1))
save('cancel0',room(mix((thump(120,62,.08,.3),0,1),(modal([(233,.5,.1),(277,.4,.09)],.35),0,.5),(thump(95,50,.11,.4),.15,1),(modal([(185,.5,.12),(220,.4,.1)],.4),.15,.5)),.14,.2))
def ep(f,d,v=1.,bright=1.):
    """electric piano: FM tine plus body"""
    t=t_(d); m=np.exp(-t/.5); tine=np.exp(-t/.09)
    s=np.sin(2*np.pi*f*t+bright*(1.1*m*np.sin(2*np.pi*f*t))+bright*.5*tine*np.sin(2*np.pi*f*14*t))
    return s*np.exp(-t/(1.1+200/f))*(1-np.exp(-t/.003))*v*(1-np.clip((t-d+.05)/.05,0,1))
def exclaim():
    return room(mix(*[(ep(f,1.4,1,.9),i*.012,.5) for i,f in enumerate([174.6,415.3,493.9,659.3])],(thump(90,50,.15,.5),0,.7)),.7,.5)
save('exclaim0',exclaim())
def curse():
    t=t_(1.1); f=70+24*t+11*np.sin(2*np.pi*7*t)
    s=np.tanh(5*np.sin(2*np.pi*np.cumsum(f)/SR)+2.2*np.sin(2*np.pi*np.cumsum(f*2.97)/SR))*np.minimum(1,t/.03)*np.exp(-t/.6)
    return room(mix((fil(s,80,3200),0,.8),(burst(.9,900,6000,.35),.0,.16),(modal([(1320,.3,.2),(1397,.3,.2)],.7),.02,.45)),.5,.35)
save('curse0',curse())
save('save0',room(mix((thump(120,62,.06,.3),0,1),(burst(.03,700,4000,.008),0,.8),(modal([(523,.5,.25),(659,.4,.22)],.5),.1,.45),(modal([(784,.5,.3),(1047,.3,.25)],.6),.2,.45)),.25,.25))
var('paper',lambda i:room(mix(*[(bp(noise(.09),rng.uniform(2000,6500),1.2)*dec(int(.09*SR),.03)*np.minimum(1,np.arange(int(.09*SR))/441),rng.uniform(0,.16),rng.uniform(.4,1)) for _ in range(8)],(thump(130,80,.03,.1),.15,.2)),.06,.08))
def crt():
    t=t_(.75); whine=np.sin(2*np.pi*(7000+5200*np.minimum(1,t/.2))*t)*np.minimum(1,t/.02)*np.exp(-t/.4)
    return room(mix((thump(95,50,.09,.4),0,1),(burst(.02,300,3000,.006),0,.7),(whine,.03,.05),(burst(.45,1200,9000,.12),.03,.28)),.1,.14)
save('crt0',crt())
def phone():
    t=t_(.2); s=np.tanh(5*np.sin(2*np.pi*165*t))*np.minimum(1,t/.01)*np.clip((.2-t)/.02,0,1); s=fil(s+.2*bp(noise(.2),2400,4),60,3500)
    return room(mix((s,0,1),(s,.3,1),(modal([(1200,.5,.015)],.05),.0,.3)),.1,.15)
save('phone0',phone())
var('glass',lambda i:room(mix((modal([(2650+i*240,.7,.09),(4180+i*170,.5,.06),(6600,.25,.03)],.35),0,1),(thump(190,110,.03,.15),0,.6),(burst(.012,1000,6000,.003),0,.3)),.12,.15))
def pour():
    o=[]; 
    for k in range(34):
        d=rng.uniform(.02,.06); t=t_(d); f0=rng.uniform(320,900); s=np.sin(2*np.pi*np.cumsum(f0*(1+2.2*t/d))/SR)*np.hanning(len(t))
        o.append((s,rng.uniform(0,.95),rng.uniform(.25,.8)))
    return room(mix(*o,(fil(noise(1.05),500,4500)*np.hanning(int(1.05*SR)),0,.12)),.18,.2)
save('pour0',pour())
save('clunk0',room(mix((thump(110,52,.08,.4),0,1),(modal([(210,.6,.08),(440,.4,.05),(980,.2,.025)],.3),0,.9),(burst(.02,600,4000,.006),0,.5),(burst(.3,150,900,.1),.05,.3)),.2,.22))
def sq(f,d): t=t_(d); return np.sign(np.sin(2*np.pi*f*t))*.5*np.minimum(1,t/.002)*np.clip((d-t)/.005,0,1)
def scan():
    t=t_(.5); sw=np.sin(2*np.pi*np.cumsum(420+1900*t/.5)/SR)*np.sin(np.pi*t/.5)
    return room(mix((fil(sw+.5*bp(noise(.5),2500,3),200,5000),0,.45),(fil(sq(1568,.07),0,4500),.53,.6),(fil(sq(2093,.13),0,4500),.62,.6)),.08,.12)
save('scan0',scan())
def crate():
    cr=[]; at=.03
    for k in range(18): cr.append((bp(noise(.05),rng.uniform(240,620),10)*dec(int(.05*SR),.014),at,.8)); at+=rng.uniform(.018,.05)
    st=[(bp(noise(.1),rng.uniform(1800,6000),1)*dec(int(.1*SR),.03),at+rng.uniform(0,.3),rng.uniform(.15,.5)) for _ in range(12)]
    return room(mix(*cr,*st,(thump(115,58,.09,.4),at,1),(modal([(190,.6,.06),(340,.4,.04),(620,.2,.02)],.25),at,.8)),.2,.22)
save('crate0',crate())
var('dial',lambda i:mix((modal([(3300+i*200,.6,.004),(1800,.5,.006)],.03),0,1),(burst(.008,1500,8000,.002),0,.4)),3,.6)
def rummage(i):
    o=[(bp(noise(.13),rng.uniform(900,6000),.8)*dec(int(.13*SR),rng.uniform(.02,.06)),rng.uniform(0,.5),rng.uniform(.25,1)) for _ in range(20)]
    o+=[(modal([(rng.uniform(600,1400),.6,.05),(rng.uniform(1900,3000),.4,.03)],.2),rng.uniform(.05,.45),.55) for _ in range(3)]
    o+=[(thump(90,50,.08,.3),rng.uniform(0,.3),.7)]
    return room(mix(*o),.4,.25,3500)
var('rummage',rummage)
def grin():
    t=t_(3.4); d=fil(np.tanh(2*(np.sin(2*np.pi*49*t)+np.sin(2*np.pi*51.6*t)+.5*np.sin(2*np.pi*98.7*t))),0,900)*np.minimum(1,t/.8)*np.clip((3.4-t)/1,0,1)
    rev=fil(noise(1.3),300,5000)*(np.arange(int(1.3*SR))/(1.3*SR))**3
    box=[(ep(f*2,1.5,1,.3),.55+i*.22,.4) for i,f in enumerate([523.3,622.3,587.3,466.2,523.3])]
    return room(mix((d,0,.6),(rev,0,.35),(thump(60,30,.3,1),1.3,1),*box),.9,.5)
save('grin0',grin())
def jar():
    return room(mix(*[(modal([(rng.uniform(2200,5200),.6,.012),(rng.uniform(5000,8000),.3,.006)],.05),.03+rng.uniform(0,.4)**1.3,rng.uniform(.3,1)) for _ in range(28)],(modal([(1900,.5,.05),(3100,.3,.03)],.2),.0,.7)),.08,.14)
save('jar0',jar())
def night():
    return room(mix((thump(70,44,.12,.5),0,.6),*[(ep(f,1.8,1,.25),.05+i*.14,.35) for i,f in enumerate([220,261.6,329.6,392])]),.7,.5)
save('night0',night())
# ------------------------------------------------ talking: small formant grains, pitched per character at runtime
FORM=[(730,1090,2440),(530,1840,2480),(300,2200,2900),(450,800,2400),(350,1000,2300)]
def grain(i,radio=False):
    d=.085; t=t_(d); f=150*(1+.1*np.sin(2*np.pi*22*t)); p=np.cumsum(f)/SR; src=2*(p%1)-1
    o=sum(bp(src,c,q)*g for c,q,g in zip(FORM[i],(5,7,8),(1,.7,.32)))*np.sin(np.pi*np.minimum(1,t/d))**.6
    if radio: o=fil(np.tanh(o*5),700,2600)
    return fade(o,6)
for i in range(5): save(f'v{i}',grain(i),.75,False); save(f'r{i}',grain(i,True),.7,False)
# ------------------------------------------------ loops: wrap-around so nothing clicks at the seam
def wrap_room(x,size,wet,hi=4000):
    n=len(x); out=[]
    for ch in range(2):
        ir=fil(rng.standard_normal(min(n,int(size*5*SR))),150,hi); ir*=np.exp(-np.arange(len(ir))/SR/size); ir/=np.sqrt((ir**2).sum())
        src=x[:,ch] if x.ndim==2 else x
        out.append(src*(1-wet*.4)+wet*np.fft.irfft(np.fft.rfft(src)*np.fft.rfft(ir,n),n))
    return np.array(out).T
def slow(n,per,lo=.3,hi=1.):
    """periodic random curve, so loops meet"""
    X=np.zeros(n//2+1,complex); k=np.arange(1,int(n/SR/per)+2); X[k]=rng.standard_normal(len(k))+1j*rng.standard_normal(len(k)); y=np.fft.irfft(X,n); y=(y-y.min())/(y.max()-y.min()); return lo+(hi-lo)*y
def put(o,s,at,g=1.):
    i=int(at*SR)%len(o); idx=(i+np.arange(len(s)))%len(o); np.add.at(o,idx,s*g)
def tone(d,fs): t=t_(d); return sum(a*np.sin(2*np.pi*f*t) for f,a in fs)
def amb_mall(d=38):
    n=int(d*SR); c=np.zeros(n)
    for b in [(320,1.5),(620,1.3),(1050,1.5),(1700,1.6)]: c+=bp(rng.standard_normal(n),b[0],b[1])*slow(n,.9,.02,1)**2
    hv=fil(rng.standard_normal(n),30,420)*.35*slow(n,6,.8,1)
    hum=np.zeros(n); tt=np.arange(n)/SR; fq=round(120*d)/d
    for m,a in [(1,.3),(2,.12),(3,.08),(5,.03)]: hum+=a*np.sin(2*np.pi*fq*m*tt)
    ev=np.zeros(n)   # steady on purpose: nothing pops out at random
    wet=wrap_room(c*.8+ev,1.3,.8,3000); dry=np.stack([hv+hum*.35]*2,1)
    return wet*.55+dry*.32
def amb_lab(d=30):
    n=int(d*SR); tt=np.arange(n)/SR; fq=round(100*d)/d
    hum=sum(a*np.sin(2*np.pi*fq*m*tt) for m,a in [(1,.35),(2,.25),(3,.1),(5,.05)])*slow(n,5,.75,1)
    air=fil(rng.standard_normal(n),40,350)*.3; ev=np.zeros(n)
    dd=.05; tq=t_(dd); drip=np.sin(2*np.pi*np.cumsum(1000*(1+1.4*tq/dd))/SR)*np.hanning(len(tq))
    for k in range(int(d//3)): put(ev,drip,k*3.,.5)   # one pipe, dripping on time
    return wrap_room(ev,1.0,.6,3500)*.8+np.stack([hum+air]*2,1)*.3
def amb_lot(d=34):
    n=int(d*SR); w=[]
    for ch in range(2):
        a=bp(rng.standard_normal(n),420,.7)*slow(n,3.5,.1,1)**2; b=bp(rng.standard_normal(n),1300,2.5)*slow(n,2.2,0,1)**3*.35; c=fil(rng.standard_normal(n),20,130)*.7
        w.append(a+b+c)
    ev=np.zeros(n)
    return np.array(w).T*.5+wrap_room(ev,.9,.7,3000)*.4
# ------------------------------------------------ mall muzak: slow bossa on a tired electric piano, down a long concourse
def muzak():
    bpm=72; beat=60/bpm; bars=24; n=int(bars*4*beat*SR); fq=lambda m:440*2**((m-69)/12)
    prog=[('A',[57,60,64,67,71]),('F',[53,57,60,64,67]),('D',[50,53,57,60,64]),('E',[52,56,59,62,67]),('A',[57,60,64,67,71]),('C',[48,55,59,64,67]),('F',[53,57,60,64,69]),('E',[52,56,62,65,67])]
    roots={'A':45,'F':41,'D':38,'E':40,'C':36}
    ep_=np.zeros(n); bass=np.zeros(n); vib=np.zeros(n); dr=np.zeros(n)
    comp=[(0,1,.8),(1.5,.5,.6),(2.5,1,.7),(3.5,.5,.45)]
    for b in range(bars):
        name,ch=prog[b%8]; t0=b*4*beat; r=roots[name]
        for at,l,v in comp:
            if b%8==7 and at>2.4: continue
            for i,m in enumerate(ch[1:]): put(ep_,ep(fq(m),l*beat*1.5+.35,v*(.9-.1*i),.5),t0+at*beat+i*.006+rng.uniform(-.004,.004),.3)
        for at,m,v in [(0,r,1),(1.5,r+7,.7),(2,r+7,.85),(3.5,r,.65)]:
            d=beat*1.3; tq=t_(d); put(bass,(np.sin(2*np.pi*fq(m)*tq)+.3*np.sin(4*np.pi*fq(m)*tq))*np.exp(-tq/.6)*np.minimum(1,tq/.006)*np.clip((d-tq)/.03,0,1),t0+at*beat,v)
        for s in range(8):
            sw=.09 if s%2 else 0; v=(.55 if s%2 else .9)*rng.uniform(.8,1); nn=noise(.09); put(dr,fil(nn,4500,11000)*dec(len(nn),.022),t0+(s/2+sw)*beat,v*.14)
        put(dr,thump(82,48,.1,.35),t0,.55); put(dr,thump(82,48,.1,.35),t0+2.5*beat,.4)
        for at in (1.5,3): put(dr,mix((bp(noise(.04),1700,2)*dec(int(.04*SR),.008),0,1),(modal([(620,.4,.015)],.04),0,.5)),t0+at*beat,.22)
    mel=[(0,0,76,1.5),(0,1.5,74,.5),(0,2,72,2),(1,0,69,3),(2,0,77,1),(2,1,76,.5),(2,1.5,74,2.5),(3,0,71,2),(3,2.5,68,1.5),
         (5,0,76,1),(5,1,79,1.5),(5,2.5,76,1.5),(6,0,72,3),(7,0,74,1.5),(7,1.5,71,.5),(7,2,68,2),
         (9,1,81,1),(9,2,79,1),(9,3,76,1),(10,0,77,3),(11,0,74,2),(11,2,71,2),(13,0,72,1.5),(13,1.5,71,.5),(13,2,69,2),(14,0,67,3),(15,0,68,3)]
    for b0 in (0,16):
        for bar,at,m,l in mel:
            if b0==16 and bar>7: continue
            put(vib,ep(fq(m),l*beat+.8,.8,.15)*(1+.2*np.sin(2*np.pi*5.2*t_(l*beat+.8))),(b0+bar)*4*beat+at*beat,.42)
    mono=ep_*.42+bass*.34+dr*.5
    st=wrap_room(mono+vib*.35,.9,.4,6000)
    # worn tape: slow pitch wander, periodic so the loop closes; lost highs; dust
    wow=slow(n,1.4,-1,1)*.0026*SR/ (2*np.pi*.7); pos=(np.arange(n)+wow)%n
    st=np.stack([np.interp(pos,np.arange(n),st[:,c],period=n) for c in (0,1)],1)
    st=np.stack([fil(st[:,c],70,5200) for c in (0,1)],1)
    dust=np.zeros(n)
    for _ in range(170): put(dust,burst(.004,2000,9000,.001),rng.uniform(0,n/SR),rng.uniform(.1,.7))
    return st+np.stack([dust,dust],1)*.06
os.makedirs(OUT,exist_ok=True)
for nm,fn,pk in [('amb_mall',amb_mall,.6),('amb_lab',amb_lab,.55),('amb_lot',amb_lot,.6),('muzak',muzak,.75)]: save(nm,fn(),pk,False)
