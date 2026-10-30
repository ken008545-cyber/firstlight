import numpy as np, wave
R=22050; rng=np.random.default_rng(7)
def t(d): return np.arange(int(R*d))/R
def env(n,a=0.005,d=0.2):
    x=np.arange(n)/R; return np.minimum(x/a,1)*np.exp(-x/d)
def noise(d): return rng.uniform(-1,1,int(R*d))
def lp(x,k): 
    y=np.zeros_like(x); s=0
    for i,v in enumerate(x): s+=k*(v-s); y[i]=s
    return y
def hit(d,f,k,dec): n=noise(d); return lp(n,k)*env(len(n),0.002,dec)+0.5*np.sin(2*np.pi*f*t(d))*env(len(n),0.002,dec*0.6)
def cat(*a,gap=0.0):
    out=[]
    for x in a: out+= [x, np.zeros(int(R*gap))]
    return np.concatenate(out)
def sweep(d,f0,f1): tt=t(d); return np.sin(2*np.pi*np.cumsum(np.linspace(f0,f1,len(tt)))/R)
S={}
S['chop_wood']=cat(hit(.25,140,.25,.06),hit(.25,130,.25,.06),gap=.15)
S['mine_stone']=cat(hit(.2,900,.6,.04)+.3*np.sin(2*np.pi*1800*t(.2))*env(int(R*.2),.001,.05),hit(.2,850,.6,.04),gap=.18)
b=lambda: lp(noise(.08),.3)*env(int(R*.08),.003,.03)
S['pick_berries']=cat(b(),b(),b(),gap=.06)+0
S['craft']=cat(hit(.15,300,.4,.04),hit(.15,420,.4,.04),hit(.2,600,.4,.06),gap=.08)
S['place_building']=hit(.5,70,.15,.15)
x=t(.9); S['building_finished']=sum(np.sin(2*np.pi*f*x)*np.clip((x-i*.15)*50,0,1)*np.exp(-np.maximum(x-i*.15,0)/.3) for i,f in enumerate([392,494,587,784]))*.3
x=noise(.7); S['torch_light']=lp(x,.15)*np.minimum(t(.7)/.15,1)*np.exp(-t(.7)/.5)
c=lp(noise(2.0),.08)*.4
for p in rng.integers(0,len(c)-400,40): c[p:p+300]+=rng.uniform(-1,1,300)*np.exp(-np.arange(300)/40)*.8
fade=np.ones(len(c)); m=int(R*.05); fade[:m]=np.linspace(0,1,m); fade[-m:]=np.linspace(1,0,m)
S['fire_crackle_loop']=c*fade
w=lp(noise(.3),.2)*np.sin(np.pi*t(.3)/.3)**2
S['spear_swing_hit']=cat(w,hit(.2,180,.3,.05))
x=t(.8); S['raptor_screech']=(np.sign(sweep(.8,1800,900))*.3+lp(noise(.8),.5)*.4)*np.minimum(x/.05,1)*np.exp(-x/.4)*(1+.5*np.sin(2*np.pi*30*x))
x=t(1.0); S['shadow_hiss']=(noise(1.0)-lp(noise(1.0),.2))*np.minimum(x/.2,1)*np.exp(-x/.6)*(1+.4*np.sin(2*np.pi*6*x))
x=t(.35); S['villager_hurt']=(sweep(.35,420,220)+.3*np.sign(sweep(.35,420,220)))*.5*np.minimum(x/.01,1)*np.exp(-x/.15)
x=t(2.0); S['day_to_night']=sweep(2.0,660,220)*.3*np.sin(np.pi*x/2.0)+.2*sweep(2.0,440,147)*np.sin(np.pi*x/2.0)
S['ui_click']=np.sin(2*np.pi*1500*t(.04))*env(int(R*.04),.001,.01)
x=t(.25); S['item_pickup']=np.sin(2*np.pi*np.where(x<.08,880,1320)*x)*np.exp(-x/.12)*.5
for k,v in S.items():
    v=v/np.max(np.abs(v)+1e-9)*.8
    with wave.open(f'/tmp/{k}.wav','w') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(R);f.writeframes((v*32767).astype('<i2').tobytes())
print(' '.join(S))
