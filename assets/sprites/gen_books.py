from PIL import Image, ImageDraw
from gen_sprites import C, outline, R, sheet
def book(f):  # 16x16, 0 closed, 1 open, 2 open glow
    im=Image.new('RGBA',(16,16),(0,0,0,0));d=ImageDraw.Draw(im)
    if f==0:
        R(d,3,4,12,12,'rd');R(d,3,4,12,4,'r');R(d,4,5,11,11,'r');R(d,7,6,8,10,'t');R(d,6,7,9,7,'t');R(d,12,5,12,12,'b')
    else:
        R(d,1,6,7,12,'b');R(d,8,6,14,12,'b');R(d,7,5,8,12,'hd');R(d,1,12,14,12,'std')
        for y in (8,10): d.line([(2,y),(6,y)],fill=C['std']);d.line([(9,y),(13,y)],fill=C['std'])
        d.point((3,7),C['r'])
    outline(im)
    if f==2:
        g=Image.new('RGBA',(16,16),(0,0,0,0));gd=ImageDraw.Draw(g);gd.ellipse([0,0,15,15],fill=C['tl']+(70,));g.alpha_composite(im);im=g
    return im
sheet([book(i) for i in range(3)],16,16).save('book.png')
def lectern(f):  # 16x32, 0 empty, 1 with open book, 2 with glow
    im=Image.new('RGBA',(16,32),(0,0,0,0));d=ImageDraw.Draw(im)
    R(d,6,14,9,28,'st');R(d,6,14,6,28,'stl');R(d,9,14,9,28,'std');R(d,3,28,12,30,'std');R(d,3,28,12,28,'st')
    d.polygon([(1,14),(14,10),(14,13),(1,17)],fill=C['st']);d.line([(1,14),(14,10)],fill=C['stl'])
    if f>=1:
        d.polygon([(2,12),(8,10),(8,13),(2,15)],fill=C['b']);d.polygon([(8,10),(13,8),(13,11),(8,13)],fill=C['b'])
    outline(im)
    if f==2:
        g=Image.new('RGBA',(16,32),(0,0,0,0));gd=ImageDraw.Draw(g);gd.ellipse([0,2,15,20],fill=C['tl']+(80,));g.alpha_composite(im);im=g
    return im
sheet([lectern(i) for i in range(3)],16,32).save('lectern.png')
# reader frame 9-slice, 48x48 (16px corners): parchment with bark border and corner knots
im=Image.new('RGBA',(48,48),(0,0,0,0));d=ImageDraw.Draw(im)
R(d,0,0,47,47,'o');R(d,2,2,45,45,'hd');R(d,4,4,43,43,(239,227,200) if False else 'b')
d.rectangle([4,4,43,43],fill=(239,227,200));d.line([(5,5),(42,5)],fill=(250,243,226));d.line([(5,42),(42,42)],fill=(214,198,164))
for x,y in((1,1),(44,1),(1,44),(44,44)): R(d,x,y,x+2,y+2,'t')
im.save('reader_frame.png')
# tab sprite 24x12 for chapter tabs: normal, selected
t=[]
for sel in (0,1):
    i2=Image.new('RGBA',(24,12),(0,0,0,0));d2=ImageDraw.Draw(i2);R(d2,1,1,22,11,'hd' if not sel else 'r');R(d2,2,2,21,3,'h' if not sel else 'tl');outline(i2);t.append(i2)
sheet(t,24,12).save('reader_tab.png')
S=4;ims=[Image.open(f) for f in('book.png','lectern.png','reader_frame.png','reader_tab.png')]
W=sum(i.width*S+16 for i in ims)+16;H=max(i.height*S for i in ims)+32
pv=Image.new('RGB',(W,H),(30,34,40));x=16
for i in ims: b=i.resize((i.width*S,i.height*S),Image.NEAREST);pv.paste(b,(x,16),b);x+=b.width+16
pv.save('preview_books.png')
