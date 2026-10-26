# Builds public/index.html from the Curated mockup generators in /workspace/curated-app/src
import sys, re, json
SRC='/workspace/curated-app/src'
sys.path.insert(0,SRC)
import os; os.chdir(SRC)
import screens1 as A, screens2 as B, screens3 as C, screens4 as D
from icons import ic
S=[('welcome',A.s01),('home',A.s02),('home-asked',lambda:A.s02('asked')),('visits',A.s03),('book',lambda:A.s04('b')),('book-done',lambda:A.s04('c')),
('session',A.s05),('playlists',B.s06),('nowplaying',B.s06b),('reading',B.s07),('reader',B.s08),('breathe',B.s09),('forms',B.s10),
('messages',C.s11),('billing',C.s12),('profile',C.s13),('checkin',C.s14),('careplan',C.s15),('tele',C.s16),
('explore',D.s17),('spravato',D.s18),('tms',D.s18b),('disc',lambda:D.s19('b')),('disc-done',lambda:D.s19('c')),('asked',D.s19b),
('jhome',D.s20),('entry',lambda:D.s21('a')),('thought',D.s22),('insights',D.s23),('safety',D.s24)]
status_re=re.compile(r'<div class="status ?(light)?">.*?</span></div>',re.S)
out=[]
for k,f in S:
    h=f()
    body=re.search(r'<body>(.*)</body>',h,re.S).group(1)
    m=re.match(r'<div class="screen ?([^"]*)"( style="[^"]*")?>',body)
    cls=m.group(1); sty=m.group(2) or ''
    inner=body[m.end():-len('</div>')]
    def st(mm):
        light=' light' if mm.group(1) else ''
        return f'<div class="status{light}"><span class="pbanner">Prototype · demo data only. Not for real patient use.</span></div>'
    inner=status_re.sub(st,inner,count=1)
    inner=inner.replace('../src/','').replace(' id="sc"','')
    out.append(f'<section class="pg screen {cls}" data-id="{k}"{sty}>{inner}</section>')
tpl=open('/workspace/curated-proto/tools/shell.html').read()
html=tpl.replace('<!--SCREENS-->','\n'.join(out))
html=html.replace('/*ICONS*/',json.dumps({n:ic(n,24,'currentColor') for n in ['play','pause','check','lock','sun','spark','pen','moon','cloud','heart']}))
open('/workspace/curated-proto/public/index.html','w').write(html)
print(len(out),'screens',len(html)//1024,'KB')

import shutil
shutil.copy(SRC+'/app.css','/workspace/curated-proto/public/app.css')
