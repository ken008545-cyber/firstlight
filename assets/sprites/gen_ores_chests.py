# Firstlight ores, chests, trader (Formara). Light top-left, dark-brown outlines. Re-run to regenerate.
from PIL import Image, ImageDraw
import random
O=(74,52,32)
C=dict(st=(140,140,132),stl=(178,176,166),std=(96,98,104),stdd=(66,64,78),
 cu=(204,120,60),cul=(236,164,96),cud=(140,70,52),cug=(90,160,120),
 tin=(168,170,170),tinl=(206,208,200),tind=(112,116,130),
 fe=(164,76,52),fel=(200,112,74),fed=(110,48,50),
 coal=(40,38,44),coall=(84,82,92),
 ag=(220,222,226),agl=(250,250,244),agd=(150,156,176),
 au=(232,190,60),aul=(255,236,128),aud=(176,120,40),
 gw=(70,200,190),gwl=(190,255,230),gwd=(40,120,140),
 h=(138,106,68),hl=(172,138,92),hd=(98,70,44),hdd=(74,52,32),
 t=(242,163,58),tl=(255,214,128),r=(194,65,47),rd=(132,44,40),
 sk=(214,160,110),skl=(235,190,140),skd=(165,112,76),b=(235,228,210),
 w=(62,124,166),wd=(44,84,120),pu=(110,80,130),pud=(76,56,96))
def outline(img):
    p=img.load();W,H=img.size;a=[[p[x,y][3] for y in range(H)] for x in range(W)]
    for x in range(W):
        for y in range(H):
            if a[x][y]==0 and any(0<=x+dx<W and 0<=y+dy<H and a[x+dx][y+dy] for dx,dy in((1,0),(-1,0),(0,1),(0,-1))):
                p[x,y]=O+(255,)
def R(d,x0,y0,x1,y1,c): d.rectangle([x0,y0,x1,y1],fill=C[c] if isinstance(c,str) else c)
def P(d,x,y,c): d.point((x,y),C[c] if isinstance(c,str) else c)
def sheet(fr,w,h):
    s=Image.new('RGBA',(w*len(fr),h),(0,0,0,0))
    for i,f in enumerate(fr): s.paste(f,(i*w,0))
    return s
def stone():
    im=Image.new('RGBA',(16,16),C['st']+(255,));d=ImageDraw.Draw(im)
    R(d,0,0,15,0,'stl');R(d,0,0,0,15,'stl');R(d,0,15,15,15,'std');R(d,15,0,15,15,'std')
    for x,y in[(3,4),(10,3),(6,10),(12,11),(2,12)]: P(d,x,y,'std');P(d,x-1,y-1,'stl')
    d.line([(8,6),(10,8)],fill=C['std']);d.line([(4,7),(5,8)],fill=C['stdd'])
    return im
def nug(d,x,y,l,m,s):  # 3x3 ore nugget, lit top-left, dark brown rim
    R(d,x-1,y-1,x+2,y+2,O);R(d,x,y,x+1,y+1,m);P(d,x,y,l);P(d,x+1,y+1,s)
SPOTS=[(3,3),(10,4),(5,10),(11,11)]
def ore(l,m,s,extra=None):
    im=stone();d=ImageDraw.Draw(im)
    for x,y in SPOTS: nug(d,x,y,l,m,s)
    if extra: extra(d)
    return im
def glow(f):
    im=stone();d=ImageDraw.Draw(im)
    if f: # pulse halo
        a=[0,60,110][f];halo=Image.new('RGBA',(16,16),(0,0,0,0));hd=ImageDraw.Draw(halo)
        hd.ellipse([2,2,13,13],fill=C['gw']+(a,));im=Image.alpha_composite(im,halo);d=ImageDraw.Draw(im)
    pts=[(5,13),(4,6),(7,2),(9,7),(11,3),(12,9),(11,13)]
    d.polygon(pts,fill=C['gw'],outline=C['gwd'])
    d.line([(5,12),(5,7),(7,3)],fill=C['gwl']);d.line([(9,8),(11,4)],fill=C['gwl'])
    R(d,9,10,10,12,'gwd')
    if f==2: P(d,7,5,(255,255,255));P(d,11,6,(255,255,255))
    return im
ores=[stone(),
 ore('cul','cu','cud',lambda d:[P(d,4,4,'cug'),P(d,11,5,'cug'),P(d,6,11,'cug')]),
 ore('tinl','tin','tind'),ore('fel','fe','fed'),ore('coall','coal','stdd'),
 ore('agl','ag','agd'),ore('aul','au','aud',lambda d:[P(d,3,3,(255,255,255)),P(d,11,11,(255,255,255))]),
 glow(0),glow(1),glow(2)]
sheet(ores,16,16).save('ore_tiles.png')
# chests: frame 0 closed, 1 opening (lid ajar), 2 open
def chest(kind,f):
    im=Image.new('RGBA',(16,16),(0,0,0,0));d=ImageDraw.Draw(im)
    l,m,s,band,lock={0:('hl','h','hd','hd','st'),1:('stl','st','std','stdd','std'),2:('pu','pud','stdd','au','aul')}[kind]
    if kind==2: l,m,s=(150,60,52),'r','rd'
    R(d,2,8,13,14,m);R(d,2,8,13,8,l);R(d,2,8,2,14,l);R(d,13,9,13,14,s);R(d,3,14,13,14,s)
    R(d,2,11,13,11,band)
    if f>0: R(d,3,8,12,9,(40,26,18))  # dark inside
    if f==2: R(d,4,8,11,9,'tl');P(d,6,8,'aul' if kind==2 else 'tl')
    ly={0:4,1:2,2:0}[f]; lh={0:4,1:3,2:2}[f]  # lid rises/foreshortens
    R(d,2,ly,13,ly+lh-1,m);R(d,2,ly,13,ly,l);R(d,13,ly,13,ly+lh-1,s)
    R(d,7,ly+lh-1,8,ly+lh+ (1 if f==0 else 0),lock)
    if kind==0: P(d,4,10,s);P(d,11,13,'hdd');P(d,13,8,(0,0,0,0))  # beat-up dents/chip
    if kind==1: P(d,5,12,'stl');P(d,10,9,'std')
    if kind==2: P(d,2,8,'aul');P(d,13,8,'au');P(d,2,14,'au');P(d,13,14,'au')
    outline(im);return im
chests=[chest(k,f) for k in range(3) for f in range(3)]
def sparkle(f):
    im=Image.new('RGBA',(16,16),(0,0,0,0));d=ImageDraw.Draw(im);c=8
    n=[1,3,5][f];col=[C['tl'],C['t'],C['tl']][f]
    d.line([(c,c-n),(c,c+n)],fill=col);d.line([(c-n,c),(c+n,c)],fill=col);P(d,c,c,(255,255,255))
    if f==2:
        for x,y in[(3,3),(12,3),(3,12),(12,12)]: P(d,x,y,'tl')
    return im
sheet(chests,16,16).save('chests.png');sheet([sparkle(i) for i in range(3)],16,16).save('chest_sparkle.png')
# trader 16x24: long teal-blue robe, wide hat, big pack (distinct from villagers)
def trader(f,mode):
    im=Image.new('RGBA',(16,24),(0,0,0,0));d=ImageDraw.Draw(im)
    y=1 if (mode=='idle' and f==1) or (mode=='walk' and f in(1,3)) else 0
    R(d,0,6+y,4,15+y,'h');R(d,0,6+y,4,6+y,'hl');R(d,0,6+y,0,15+y,'hl');R(d,1,10+y,4,10+y,'hd')  # pack (back, left: faces right)
    R(d,1,4+y,3,5+y,'r')  # bedroll on pack
    R(d,6,2+y,11,7+y,'sk');R(d,6,2+y,7,3+y,'skl');R(d,10,6+y,11,7+y,'skd')
    R(d,4,1+y,13,1+y,'hd');R(d,6,0+y,11,1+y,'h');R(d,6,0+y,8,0+y,'hl')  # wide hat
    P(d,10,4+y,O);R(d,8,6+y,10,7+y,'b')  # eye + beard
    R(d,5,8+y,12,17+y,'w');R(d,10,8+y,12,17+y,'wd');R(d,5,8+y,6,9+y,(100,160,196))
    R(d,5,12+y,12,12+y,'t')  # sash
    sw=[0,1,0,-1][f] if mode=='walk' else 0
    R(d,13,9+y-sw,13,14+y-sw,'skd'); d.line([(14,6+y),(14,22)],fill=C['hd'])  # arm + walking staff
    if mode=='walk':
        a,b=[(0,0),(1,-1),(0,0),(-1,1)][f];R(d,6,18,7,22+a,'skd');R(d,10,18,11,22+b,'skd')
    else: R(d,6,18,7,22,'skd');R(d,10,18,11,22,'skd')
    outline(im);return im
sheet([trader(i,'walk') for i in range(4)]+[trader(i,'idle') for i in range(2)],16,24).save('trader.png')
# preview 4x
rows=[Image.open(n) for n in('ore_tiles.png','chests.png','chest_sparkle.png','trader.png')]
W=max(r.width for r in rows)+8;H=sum(r.height+4 for r in rows)+4
pv=Image.new('RGBA',(W,H),(30,34,40,255));yy=4
for r in rows: pv.alpha_composite(r,(4,yy));yy+=r.height+4
pv.resize((W*4,H*4),Image.NEAREST).save('preview_ores_chests.png')
