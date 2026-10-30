# Firstlight sprite generator (Formara). Re-run to regenerate. Light from top-left, dark-brown outlines.
from PIL import Image, ImageDraw
C=dict(o=(74,52,32),sk=(214,160,110),skl=(235,190,140),skd=(165,112,76),hair=(60,40,30),
 h=(138,106,68),hl=(172,138,92),hd=(98,70,44),g=(107,142,58),gl=(146,180,82),gd=(70,100,48),gdd=(52,74,40),
 st=(140,140,132),stl=(178,176,166),std=(96,98,104),w=(62,124,166),t=(242,163,58),tl=(255,214,128),
 r=(194,65,47),rd=(132,44,40),b=(235,228,210),sh=(30,34,40),shl=(60,58,90),eye=(255,236,150))
def outline(img):
    p=img.load();W,H=img.size;src=[[p[x,y][3] for y in range(H)] for x in range(W)]
    for x in range(W):
        for y in range(H):
            if src[x][y]==0 and any(0<=x+dx<W and 0<=y+dy<H and src[x+dx][y+dy] for dx,dy in((1,0),(-1,0),(0,1),(0,-1))):
                p[x,y]=C['o']+(255,)
def R(d,x0,y0,x1,y1,c): d.rectangle([x0,y0,x1,y1],fill=C[c])
def human(body,bodyd,hair='hair',band=None,frame=0,mode='walk'):
    im=Image.new('RGBA',(16,24),(0,0,0,0));d=ImageDraw.Draw(im)
    bob=1 if (mode=='idle' and frame==1) or (mode=='walk' and frame in(1,3)) else 0
    y=bob
    R(d,5,1+y,10,6+y,'sk');R(d,5,1+y,6,2+y,'skl');R(d,9,5+y,10,6+y,'skd')
    R(d,5,1+y,10,1+y,hair);R(d,5,2+y,5,3+y,hair);R(d,10,2+y,10,4+y,hair)
    if band: R(d,5,2+y,10,2+y,band)
    d.point((6,4+y),C['o']);d.point((9,4+y),C['o'])
    R(d,4,7+y,11,15+y,body);R(d,9,7+y,11,15+y,bodyd);R(d,4,7+y,5,8+y,'hl' if body=='h' else body)
    sw=[0,1,0,-1][frame] if mode=='walk' else 0
    R(d,3,8+y+sw,3,13+y+sw,'sk');R(d,12,8+y-sw,12,13+y-sw,'skd')
    if mode=='walk':
        l=[(0,0),(1,-1),(0,0),(-1,1)][frame]
        R(d,5,16,6,22+l[0],'skd');R(d,9,16,10,22+l[1],'skd')
    else: R(d,5,16+y,6,22,'skd');R(d,9,16+y,10,22,'skd')
    outline(im);return im
def chop(body,bodyd,frame):
    im=human(body,bodyd,frame=0,mode='idle');d=ImageDraw.Draw(im)
    pos=[(12,2),(14,8),(13,14)][frame]
    d.line([(12,10),pos],fill=C['hd'],width=1);R(d,pos[0]-1,pos[1]-1,pos[0]+1,pos[1]+1,'st')
    if frame==1: d.line([(14,4),(15,10)],fill=C['stl'])  # smear
    return im
def sheet(frames,w,h): s=Image.new('RGBA',(w*len(frames),h),(0,0,0,0)); [s.paste(f,(i*w,0)) for i,f in enumerate(frames)]; return s
def chars(name,body,bodyd,band=None):
    fr=[human(body,bodyd,band=band,frame=i) for i in range(4)]+[human(body,bodyd,band=band,frame=i,mode='idle') for i in range(2)]+[chop(body,bodyd,i) for i in range(3)]
    sheet(fr,16,24).save(f'{name}.png')
chars('player','r','rd',band='t')
chars('villager_a','h','hd')
chars('villager_b','g','gd',band='b')
# raptor 32x24, 4 run frames
def raptor(f):
    im=Image.new('RGBA',(32,24),(0,0,0,0));d=ImageDraw.Draw(im);y=[0,1,0,1][f]
    d.polygon([(2,10+y),(10,9+y),(10,13+y)],fill=C['gd'])            # tail
    d.ellipse([8,7+y,22,16+y],fill=C['g']);d.ellipse([10,7+y,18,10+y],fill=C['gl'])
    R(d,19,3+y,22,9+y,'g');R(d,20,2+y,28,6+y,'g');R(d,21,2+y,26,2+y,'gl');R(d,24,6+y,28,7+y,'gd')
    d.point((24,3+y),C['eye']);d.point((27,6+y),C['b'])
    for i in range(10,20,3): d.point((i,12+y),C['gd'])
    a,b=[(0,3),(2,1),(3,0),(1,2)][f]
    d.line([(12,15+y),(11+a,22)],fill=C['gd'],width=2);d.line([(17,15+y),(16+b,22)],fill=C['gd'],width=2)
    R(d,20,10+y,21,12+y,'gd')
    outline(im);return im
sheet([raptor(i) for i in range(4)],32,24).save('raptor.png')
# shadow creature 16x16, 3 float frames
def shade(f):
    im=Image.new('RGBA',(24,24),(0,0,0,0));d=ImageDraw.Draw(im);y=[0,1,2][f]
    d.ellipse([3,1+y,20,16+y],fill=C['shl']);d.ellipse([4,3+y,20,16+y],fill=C['sh']);d.ellipse([6,3+y,11,7+y],fill=(90,86,130))
    for i,x in enumerate(range(4,20,4)): R(d,x,14+y,x+2,18+y+((i+f)%2)*2,'sh')
    R(d,8,8+y,9,9+y,'eye');R(d,14,8+y,15,9+y,'eye')
    return im
sheet([shade(i) for i in range(3)],24,24).save('shadow_creature.png')
# tree 32x48, 2 sway frames
def tree(f):
    im=Image.new('RGBA',(32,48),(0,0,0,0));d=ImageDraw.Draw(im);s=[0,1][f]
    R(d,14,30,18,46,'h');R(d,14,30,14,46,'hl');R(d,18,30,18,46,'hd')
    for (x,y,r,c) in [(16,22,11,'gd'),(15,18,10,'g'),(11,15,6,'g'),(20,14,6,'g'),(13,12,4,'gl'),(10,17,2,'gl'),(22,26,4,'gdd')]:
        d.ellipse([x-r+s,y-r,x+r+s,y+r],fill=C[c])
    outline(im);return im
sheet([tree(i) for i in range(2)],32,48).save('tree.png')
# rocks 16x16 x3: boulder, flint, clay
def rock(kind):
    im=Image.new('RGBA',(16,16),(0,0,0,0));d=ImageDraw.Draw(im)
    if kind==0: d.ellipse([1,4,14,14],fill=C['st']);d.ellipse([3,5,8,8],fill=C['stl']);d.ellipse([9,10,14,14],fill=C['std'])
    if kind==1: d.polygon([(3,13),(7,4),(12,8),(13,13)],fill=C['std']);d.line([(7,5),(5,11)],fill=C['shl']);d.point((9,8),C['stl'])
    if kind==2: d.ellipse([2,7,14,14],fill=C['r']);d.ellipse([4,8,8,10],fill=(214,110,80));d.ellipse([9,11,13,14],fill=C['rd'])
    outline(im);return im
sheet([rock(i) for i in range(3)],16,16).save('rocks.png')
# hut 48x48, 4 stages: blueprint, frame, half, done
def hut(stage):
    im=Image.new('RGBA',(48,48),(0,0,0,0));d=ImageDraw.Draw(im)
    if stage==0:
        for x in range(6,42,3): d.point((x,44),C['b']);d.point((x,24),C['b'])
        d.line([(6,24),(24,6),(42,24)],fill=C['b']);return im
    d.line([(8,44),(8,24)],fill=C['hd'],width=2);d.line([(40,44),(40,24)],fill=C['hd'],width=2)
    d.line([(4,26),(24,6),(44,26)],fill=C['hd'],width=2)
    if stage>=2: R(d,9,34,39,44,'h');R(d,9,34,39,34,'hl')
    if stage==3:
        R(d,9,24,39,44,'h');R(d,9,24,12,44,'hl');R(d,36,24,39,44,'hd')
        d.polygon([(2,27),(24,4),(46,27)],fill=C['t']);d.polygon([(24,4),(46,27),(30,27)],fill=(196,128,46))
        for x in range(6,44,4): d.line([(x,27),(x+2,24)],fill=(214,150,60))
        R(d,20,32,28,44,'o');R(d,21,33,27,44,'sh')
    outline(im) if stage>0 else None;return im
sheet([hut(i) for i in range(4)],48,48).save('hut.png')
# preview at 4x on dark bg
files=['player','villager_a','villager_b','raptor','shadow_creature','tree','rocks','hut']
ims=[Image.open(f+'.png') for f in files];S=4
W=max(i.width for i in ims)*S+20;H=sum(i.height*S+12 for i in ims)+10
pv=Image.new('RGB',(W,H),(30,34,40));y=10
for i in ims: big=i.resize((i.width*S,i.height*S),Image.NEAREST);pv.paste(big,(10,y),big);y+=big.height+12
pv.save('preview.png')
