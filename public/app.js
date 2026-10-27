/* Curated patient app — clickable prototype. Demo data only. No backend. */
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const P=id=>document.querySelector('.pg[data-id="'+id+'"]');
const ICONS=window.ICONS||{};
const DEMO_LOG=[]; const warn=(...a)=>{DEMO_LOG.push(a.join(' '));};
window.__protoLog=DEMO_LOG;

/* ---------- router ---------- */
let cur=null, depth=0; const onShow={}, onHide={};
const signed=()=>sessionStorage.getItem('curated.in')==='1';
function show(id,keep){
  const n=P(id)||P('home'); if(cur===n) return;
  if(cur){cur.classList.remove('on'); onHide[cur.dataset.id]&&onHide[cur.dataset.id](cur);}
  n.classList.add('on'); cur=n;
  if(!keep) $$('.content',n).forEach(c=>c.scrollTop=0);
  onShow[n.dataset.id]&&onShow[n.dataset.id](n);
}
function go(id,o={}){ if(cur&&cur.dataset.id===id&&!o.replace) return;
  if(o.replace) history.replaceState({id,depth},'','#'+id); else {depth++; history.pushState({id,depth},'','#'+id);}
  show(id);
}
function back(){ if(depth>0) history.back(); else go(signed()?'home':'welcome',{replace:true}); }
window.addEventListener('popstate',e=>{const s=e.state; if(s&&s.id){depth=s.depth||0; show(s.id,true);} else {depth=0; show(signed()?'home':'welcome');}});
window.__go=go;
window.__audioState=()=>({playing,paused:media?media.paused:null,src:media?media.src:null,time:media?media.currentTime:0,ctx:ctx?ctx.state:null});

/* ---------- toast ---------- */
let tt; function toast(h,ms=2600){const t=$('#toast'); t.innerHTML=h; t.classList.add('show'); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove('show'),ms);}
const soon=name=>()=>toast('<b>Coming soon</b> · '+name+' isn’t connected in this prototype.');

/* ---------- binding helpers ---------- */
const norm=s=>s.replace(/\s+/g,' ').trim();
function textEls(root,txt,mode='exact',inTab=false){
  const out=[], w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); let n;
  while((n=w.nextNode())){const v=norm(n.nodeValue); if(!v) continue;
    const ok=mode==='has'?v.includes(txt):mode==='starts'?v.startsWith(txt):v===txt;
    if(ok){const el=n.parentElement; if(inTab||!el.closest('.tabbar')) out.push(el);}}
  return out;
}
const CL='[id],.btn,.li,.chip,.t,.icon-btn,.glass,.card,.slot,.svc,[style*="background"],[style*="border"]';
const box=el=>{const b=el.closest(CL),pg=el.closest('.pg');return b&&pg&&pg.contains(b)&&b!==pg?b:el;};
function bindEl(b,fn){ if(!b) return; b.classList.add('tap'); b.addEventListener('click',e=>{e.stopPropagation(); fn(e,b);}); }
function on(id,q,fn,o={}){
  const pg=P(id); if(!pg){warn('nopg',id);return [];}
  const isSel=/^[#.\[]/.test(q);
  let els=isSel?$$(q,pg):textEls(pg,q,o.mode||'exact');
  if(!o.all) els=[els[o.i||0]].filter(Boolean);
  if(!els.length){warn('nobind',id,q);return [];}
  const bs=els.map(el=>o.up?(typeof o.up==='function'?o.up(el):el.closest(o.up)):(isSel?el:(b=>pg.contains(b)&&b!==pg?b:el)(box(el))));
  bs.forEach(b=>bindEl(b,fn)); return bs;
}
function setText(pg,old,nw,mode='exact'){const el=textEls(pg,old,mode)[0]; if(!el){warn('notext',pg.dataset.id,old);return null;}
  for(const c of el.childNodes) if(c.nodeType===3&&norm(c.nodeValue)){c.nodeValue=nw; return el;} return el;}
const svgOf=(name,size,color)=>{const s=ICONS[name]; if(!s) return ''; return s.replace(/width="\d+"/,'width="'+size+'"').replace(/height="\d+"/,'height="'+size+'"').replace(/currentColor/g,color);};
function setIcon(btn,name){const old=$('svg',btn); if(!old) return; const sz=old.getAttribute('width'); const col=old.getAttribute('stroke')!=='none'&&old.getAttribute('stroke')||old.getAttribute('fill')||'#0B1240';
  const t=document.createElement('div'); t.innerHTML=svgOf(name,sz,col); const nw=t.firstElementChild; if(nw) old.replaceWith(nw);}
function swapStyle(a,b){const s=a.getAttribute('style'); a.setAttribute('style',b.getAttribute('style')); b.setAttribute('style',s);}
function pickGroup(items,isSel,o={}){ // style-swap single selection
  items.forEach(it=>{ if(o.disabled&&o.disabled(it)) return; bindEl(it,()=>{
    const s=items.find(isSel); if(s===it) {o.after&&o.after(it); return;}
    if(s){swapStyle(s,it); if(o.sub){const a=$(o.sub,s),b=$(o.sub,it); a&&b&&swapStyle(a,b);} if(o.badge){const bd=o.badge(s); if(bd) it.appendChild(bd);} }
    o.after&&o.after(it);
  });});
}
const tel=n=>{location.href='tel:'+n;};

/* ---------- global wiring ---------- */
const TABS=['home','visits','jhome','messages','profile'];
$$('.pg').forEach(pg=>{
  $$('.tabbar .t',pg).forEach((t,i)=>bindEl(t,()=>{ if(cur&&cur.dataset.id===TABS[i]){$$('.content',cur).forEach(c=>c.scrollTo({top:0,behavior:'smooth'}));return;} go(TABS[i]); }));
  const nb=$('.navbar > .icon-btn:first-child',pg); if(nb&&!['home','home-asked'].includes(pg.dataset.id)) bindEl(nb,back);
  $$('.toggle',pg).forEach(t=>bindEl(t,()=>{t.classList.toggle('off'); t.classList.toggle('on');}));
  $$('.seg',pg).forEach(sg=>{ if(['spravato','tms'].includes(pg.dataset.id)) return; [...sg.children].forEach(c=>bindEl(c,()=>{const o=$('.on',sg)||[...sg.children].find(x=>x!==c&&x.style.background); if(o===c) return; if(o){swapStyle(o,c); o.classList.remove('on');} c.classList.add('on'); sg.dispatchEvent(new CustomEvent('segchange',{detail:c}));}));});
});
// fallback for anything that looks tappable but isn't wired
document.addEventListener('click',e=>{const b=e.target.closest('.btn,.li,.icon-btn'); if(b&&!b.classList.contains('tap')&&cur&&cur.contains(b)) toast('Demo placeholder · this control isn’t wired in the prototype.');});

/* ---------- welcome / sign-in ---------- */
function signIn(){ sessionStorage.setItem('curated.in','1'); depth=0; history.replaceState({id:'home',depth:0},'','#home'); show('home'); }
function faceId(){
  const pg=P('welcome'); let ov=$('.fid',pg);
  if(!ov){ov=document.createElement('div'); ov.className='fid'; ov.style.cssText='position:absolute;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(5,14,44,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)';
    ov.innerHTML='<div style="width:150px;height:150px;border-radius:32px;background:rgba(255,255,255,.95);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#091F58;font-weight:600;font-size:14px"><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#014CB2" stroke-width="1.6" stroke-linecap="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 9v1M15 9v1M12 9v4h-1M9 16c1.6 1.3 4.4 1.3 6 0"/></svg><span class="fidt">Face ID</span></div>'; pg.appendChild(ov);}
  ov.style.display='flex'; $('.fidt',ov).textContent='Face ID';
  setTimeout(()=>{$('.fidt',ov).textContent='✓ Welcome, Jordan';},700);
  setTimeout(()=>{ov.style.display='none'; signIn();},1300);
}
on('welcome','Sign in with Face ID',faceId,{mode:'has'});
on('welcome','Patient Portal',faceId,{mode:'has'});
on('welcome','Request your first visit',()=>go('disc'),{mode:'has'});
on('welcome','Sign in',faceId,{mode:'has',i:0});

/* ---------- home ---------- */
const MAPS='https://maps.google.com/?q=253+W+28th+St+6th+Fl+New+York+NY';
const MOODS=['Low','Down','Okay','Good','Great'], MCOL=['#E86B6B','#F0A35E','#F2CF5B','#7FCB8F','#4FB6D8'];
let presetMood=-1;
['home','home-asked'].forEach(h=>{
  const qa=(l,fn)=>on(h,l,fn,{up:el=>el.parentElement});
  qa('Book',()=>go('book')); qa('Messages',()=>go('messages')); qa('Session',()=>go('session')); qa('Journal',()=>go('jhome')); qa('Forms',()=>go('forms'));
  on(h,'Prep checklist',()=>go('checkin'));
  on(h,'Directions',()=>window.open(MAPS,'_blank','noopener'));
  on(h,'Spravato Treatment Session',()=>go('visits'));
  on(h,'#cta-learn',()=>go('explore')); on(h,'#cta-call',()=>go('disc'));
  if(h==='home') on(h,'#cta-ask',()=>go('home-asked',{replace:true}));
  on(h,'Book',()=>go('billing'),{i:1});
  on(h,'Write more in your private journal',()=>{presetMood=-1; go('entry');},{mode:'has'});
  MOODS.forEach((m,i)=>on(h,m,()=>{presetMood=i; go('entry');},{up:el=>el.parentElement}));
  on(h,'What to expect at session 6',()=>go('reader'),{mode:'has'});
  on(h,'Evening body scan',()=>go('breathe'),{mode:'has'});
  const av=$('.navbar .av, .navbar [class*="av"]',P(h)); if(av) bindEl(av,()=>go('profile'));
  on(h,'.navbar .icon-btn',()=>go('messages'));
  if(h==='home-asked') on(h,'Undo',()=>{go('home',{replace:true}); toast('Removed from your next visit');});
});

/* ---------- visits ---------- */
on('visits','Reschedule',()=>go('book'),{mode:'has',all:true});
on('visits','Join',()=>go('tele'),{mode:'starts',all:true});
on('visits','Cancel',()=>toast('To cancel within 24 h, please call <b>(917) 451-7018</b> (demo).'),{mode:'starts',all:true});
on('visits','Calendar',soon('Calendar export'),{all:true});
on('visits','Directions',(e,b)=>window.open(/Williamsburg/.test(b.closest('.card')?.textContent||'')?'https://maps.google.com/?q=402+Metropolitan+Ave+Brooklyn+NY':MAPS,'_blank','noopener'),{all:true});
on('visits','Completed',()=>toast('Visit summary · available in Records (demo)'),{all:true,up:el=>el.closest('.li')||el.parentElement});

/* ---------- booking ---------- */
const DOW={26:'Mon',27:'Tue',28:'Wed',29:'Thu',30:'Fri',31:'Sat',1:'Sun',2:'Mon'};
const DOWL={Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday',Sun:'Sunday'};
const bk={svc:'Medication Management',prov:'Dr. Elena Marsh',loc:'Chelsea',day:'29',slot:'11:30 AM'};
const LOCS={Chelsea:'Chelsea · 253 W 28th St, 6th Fl',Williamsburg:'Williamsburg · 402 Metropolitan Ave',Telehealth:'Telehealth · video visit','Video visit':'Telehealth · video visit'};
(function(){
  const pg=P('book'); if(!pg) return;
  const isBlue=it=>/#EAF1FF/i.test(it.getAttribute('style')||'');
  const s1=textEls(pg,'Medication management')[0]||textEls(pg,'Medication Management')[0];
  if(s1){const items=[...s1.parentElement.children]; pickGroup(items,isBlue,{after:it=>{bk.svc=norm(it.textContent);updBtn();}});} else warn('book svc');
  const l1=textEls(pg,'Chelsea')[0];
  if(l1){let card=l1; while(card.parentElement&&card.parentElement.children.length<2) card=card.parentElement; card=l1.closest('[style*="border"]')||card; const items=[...card.parentElement.children];
    pickGroup(items,isBlue,{badge:s=>[...s.children].find(c=>/position:absolute/.test(c.getAttribute('style')||'')),after:it=>{bk.loc=norm((it.querySelector('[style*="font-weight:6"],[style*="font-weight:7"]')||it).textContent).split(' ')[0]; updBtn();}});} else warn('book loc');
  const p1=textEls(pg,'Dr. E. Marsh')[0];
  if(p1){const it0=p1.closest('[style*="width:76px"]')||p1.parentElement; const items=[...it0.parentElement.children];
    pickGroup(items,it=>/box-shadow/.test(it.firstElementChild.getAttribute('style')||''),{sub:':scope > div:first-child',after:it=>{const t=norm(it.textContent); bk.prov=/Marsh/.test(t)?'Dr. Elena Marsh':/Okafor/.test(t)?'Dr. Samuel Okafor':/Lindqvist/.test(t)?'Maya Lindqvist, PMHNP':'the first available provider';}});} else warn('book prov');
  const d1=textEls(pg,'29')[0];
  if(d1){const it0=d1.parentElement; const items=[...it0.parentElement.children];
    pickGroup(items,it=>/background:#014CB2/i.test(it.getAttribute('style')||''),{disabled:it=>/transparent/.test(it.getAttribute('style')||''),after:it=>{bk.day=norm(it.lastElementChild.textContent); updBtn();}});} else warn('book day');
  const slots=$$('[id^="slot"]',pg);
  pickGroup(slots,it=>/background:#014CB2/i.test(it.getAttribute('style')||''),{disabled:it=>/line-through/.test(it.getAttribute('style')||''),after:it=>{bk.slot=norm(it.textContent); updBtn();}});
  function updBtn(){const b=textEls(pg,'Confirm','starts')[0]; if(b){for(const c of b.childNodes) if(c.nodeType===3&&norm(c.nodeValue)){c.nodeValue='Confirm · '+DOW[bk.day]+', '+(bk.day<20?'Nov':'Oct')+' '+bk.day+' · '+bk.slot;}}}
  on('book','Confirm',()=>{ const d=P('book-done'); const day=DOWL[DOW[bk.day]]+', '+(bk.day<20?'November':'October')+' '+bk.day+' · '+bk.slot;
    const t=textEls(d,'· 11:30 AM','has').filter(e=>/^[A-Z][a-z]+day, /.test(norm(e.textContent))).pop(); if(t) for(const c of t.childNodes) if(c.nodeType===3&&/11:30/.test(c.nodeValue)) c.nodeValue=day;
    const p=textEls(d,'with Dr.','has').pop(); if(p) for(const c of p.childNodes) if(c.nodeType===3&&/with Dr\./.test(c.nodeValue)){c.nodeValue=bk.svc.replace(/^./,m=>m.toUpperCase())+' with '+bk.prov;}
    const l=textEls(d,'253 W 28th','has')[0]; if(l) for(const c of l.childNodes) if(c.nodeType===3&&/253/.test(c.nodeValue)) c.nodeValue=LOCS[bk.loc]||c.nodeValue;
    go('book-done');},{mode:'starts'});
})();
on('book-done','Done',()=>go('visits',{replace:true}),{mode:'has'});
on('book-done','Add to Calendar',soon('Calendar export'),{mode:'has'});
$$('.pg[data-id="book-done"] [style*="rgba(5,14,44"],.pg[data-id="book-done"] [style*="rgba(9,31,88"]').forEach(o=>bindEl(o,()=>go('home',{replace:true})));

/* ---------- session mode + timer ---------- */
const TOTAL=7200;
if(!sessionStorage.getItem('curated.sess')) sessionStorage.setItem('curated.sess',String(Date.now()-2728*1000));
const fmt=s=>{s=Math.max(0,Math.floor(s)); const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60; return h+':'+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0');};
const elapsed=()=>Math.min(TOTAL,(Date.now()-Number(sessionStorage.getItem('curated.sess')))/1000);
const ring=(()=>{const pg=P('session'); return pg&&$$('circle[stroke-dasharray]',pg)[0];})();
const bSub=(()=>{const pg=P('breathe'); return pg&&textEls(pg,'left','has').find(e=>/Session 6/.test(e.textContent));})();
function tick(){
  const e=elapsed(), r=TOTAL-e;
  const t=$('.pg[data-id="session"] #timer'); if(t) t.textContent=fmt(r);
  if(ring){const C=2*Math.PI*Number(ring.getAttribute('r')); ring.setAttribute('stroke-dasharray',(C*e/TOTAL).toFixed(1)+' '+C.toFixed(1));}
  if(bSub) bSub.textContent='Session 6 · '+fmt(r)+' left';
  const el=$('.pg[data-id="nowplaying"] #el'); if(el) el.textContent=fmt(e)+' of 2:00:00';
  const cu=$('.pg[data-id="nowplaying"] #cur'); if(cu) cu.style.left=(e/TOTAL*100).toFixed(2)+'%';
  sleepTick(); progTick();
}
setInterval(tick,1000);
on('session','#tmusic',()=>go('playlists'));
on('session','Breathe',()=>go('breathe'));
on('session','Intention',()=>toast('Your intention: <b>“I am open &amp; calm.”</b>'));
/* relax & disconnect */
const rcState={hp:false,mask:false,music:false,air:false};
function relaxUI(){
  $$('.rpl').forEach(x=>x.textContent=playing?'Pause music':'Start session playlist');
  ['#relaxplay','#relaxplay2'].forEach(q=>{const b=$(q); if(b) setIcon(b,playing?'pause':'play');});
  const ms=$('#tmusicsub'); if(ms) ms.textContent=playing?'Playing · '+TRACKS[cT].pl:'Tap to choose';
  if(playing) rcState.music=true;
  $$('#relaxcheck .rc').forEach(r=>{const on=rcState[r.dataset.k], c=$('.rcb',r); c.style.background=on?'#55E3FF':'transparent'; c.style.borderColor=on?'#55E3FF':'rgba(255,255,255,.35)'; c.innerHTML=on?svgOf('check',15,'#091F58'):''; r.lastElementChild.style.color=on?'#fff':'rgba(255,255,255,.8)';});
}
const relaxPlay=()=>{ if(playing){pauseAll();} else {playTrack(0); toast('Music started · you can switch to <b>airplane mode</b> now. It keeps playing offline.',3600);} };
on('session','#relaxplay',relaxPlay); on('session','#relaxmore',()=>go('relax'));
on('relax','#relaxplay2',relaxPlay); on('relax','#relaxnp',()=>go('nowplaying'));
$$('#relaxcheck .rc').forEach(r=>bindEl(r,()=>{const k=r.dataset.k; if(k==='music'){ if(!playing) playTrack(0); rcState.music=true; } else rcState[k]=!rcState[k]; relaxUI();}));
on('session','Need help? Alert staff',()=>toast('<b>Nurse station notified</b> (demo). Someone will be with you shortly.',3500),{mode:'has'});

/* ---------- audio ---------- */
const TRACKS=[
 {name:'Gymnopédie No. 1',pl:'Arrive & Settle',sub:'Erik Satie · piano · CC0',chip:'Public-domain piano',src:'audio/g1.mp3'},
 {name:'Warm Drift',pl:'Drift',sub:'Curated Sound · generated live',chip:'Ambient pads',synth:'drift'},
 {name:'Low Tide Drone',pl:'Deep Field',sub:'Curated Sound · generated live',chip:'432 Hz · no lyrics',synth:'deep'},
 {name:'Tidewater',pl:'Tidewater',sub:'Curated Sound · generated live',chip:'Pads & soft waves',synth:'tide'},
 {name:'Gymnopédie No. 3',pl:'Homecoming',sub:'Erik Satie · piano · CC0',chip:'Public-domain piano',src:'audio/g3.mp3'}];
let ctx=null, master=null, media=null, synth=null, playing=false, cT=2, vol=.48, fade=1, synthStart=0;
function ensure(){
  if(!ctx){const AC=window.AudioContext||window.webkitAudioContext; ctx=new AC(); master=ctx.createGain(); master.gain.value=vol; master.connect(ctx.destination);
    media=new Audio(); media.loop=true; media.preload='auto'; media.setAttribute('playsinline',''); ctx.createMediaElementSource(media).connect(master);}
  if(ctx.state==='suspended') ctx.resume();
}
function noiseBuf(){const b=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate), d=b.getChannelData(0); let last=0; for(let i=0;i<d.length;i++){last=(last+0.02*(Math.random()*2-1))/1.02; d[i]=last*3.5;} return b;}
function startSynth(kind){
  const g=ctx.createGain(); g.gain.value=0; g.connect(master); const nodes=[];
  const F={drift:[216,270,324,432],deep:[108,162,216,432],tide:[144,180,216,288]}[kind];
  const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=kind==='drift'?1800:1100; lp.connect(g);
  F.forEach((f,i)=>{const o=ctx.createOscillator(); o.type=i%2?'triangle':'sine'; o.frequency.value=f; o.detune.value=(i-1.5)*5;
    const og=ctx.createGain(); og.gain.value=.12/(i+1); const l=ctx.createOscillator(); l.frequency.value=.05+i*.037; const lg=ctx.createGain(); lg.gain.value=.08/(i+1);
    l.connect(lg); lg.connect(og.gain); o.connect(og); og.connect(lp); o.start(); l.start(); nodes.push(o,l);});
  if(kind!=='drift'){const n=ctx.createBufferSource(); n.buffer=noiseBuf(); n.loop=true; const nf=ctx.createBiquadFilter(); nf.type='lowpass'; nf.frequency.value=kind==='tide'?700:400;
    const ng=ctx.createGain(); ng.gain.value=kind==='tide'?.18:.07; const w=ctx.createOscillator(); w.frequency.value=.09; const wg=ctx.createGain(); wg.gain.value=ng.gain.value*.8; w.connect(wg); wg.connect(ng.gain);
    n.connect(nf); nf.connect(ng); ng.connect(g); n.start(); w.start(); nodes.push(n,w);}
  g.gain.setValueAtTime(0,ctx.currentTime); g.gain.linearRampToValueAtTime(1,ctx.currentTime+2.5); synthStart=ctx.currentTime;
  return {g,nodes};
}
function stopSynth(){if(!synth) return; const s=synth; synth=null; s.g.gain.cancelScheduledValues(ctx.currentTime); s.g.gain.setTargetAtTime(0,ctx.currentTime,.25); setTimeout(()=>s.nodes.forEach(n=>{try{n.stop();}catch(e){}}),1500);}
function playTrack(i){ensure(); cT=(i+TRACKS.length)%TRACKS.length; const t=TRACKS[cT]; stopSynth(); media.pause();
  if(t.src){ if(!media.src.endsWith(t.src)){media.src=t.src;} media.play().catch(e=>warn('audio',e.message)); } else synth=startSynth(t.synth);
  playing=true; audioUI();}
function pauseAll(){ if(media) media.pause(); stopSynth(); playing=false; audioUI(); }
function toggle(){ playing?pauseAll():playTrack(cT); }
function applyGain(){ if(master) master.gain.setTargetAtTime(vol*fade,ctx.currentTime,.05); }
function audioUI(){
  const np=P('nowplaying'), pl=P('playlists'), t=TRACKS[cT];
  if(np){ if(npTitle) npTitle.textContent=t.name; if(npSub) npSub.textContent=t.pl+' · '+t.sub; if(npChip) npChip.textContent=t.chip; if(npBtn) setIcon(npBtn,playing?'pause':'play'); }
  if(pl){ if(miniTitle) miniTitle.textContent=t.name; if(miniSub) miniSub.textContent=t.pl+' · Offline · '+(cT+1)+' of 5'; if(miniBtn) setIcon(miniBtn,playing?'pause':'play'); const jp=$('#jplay',pl); if(jp) setIcon(jp,playing?'pause':'play');
    $$('[data-row]',pl).forEach(r=>{const s=$('span',r); if(s) s.style.color=Number(r.dataset.row)===cT&&playing?'#55E3FF':'#fff';}); }
  if(typeof relaxUI==='function') try{relaxUI();}catch(e){}
  const o1=np&&$('#o1',np); if(o1) o1.style.animation=playing?'cpulse 6s ease-in-out infinite':'none';
}
let npTitle,npSub,npChip,npBtn,miniTitle,miniSub,miniBtn,miniBar,miniL,miniR;
(function(){
  const st=document.createElement('style'); st.textContent='@keyframes cpulse{0%,100%{transform:scale(.94)}50%{transform:scale(1.06)}}'; document.head.appendChild(st);
  const np=P('nowplaying');
  if(np){ npTitle=textEls(np,'Low Tide Drone')[0]; npSub=textEls(np,'Deep Field · Curated Sound')[0]; npChip=textEls(np,'432 Hz · no lyrics')[0];
    const pz=$$('svg',np).find(s=>s.getAttribute('width')==='28'); npBtn=pz&&pz.parentElement; if(npBtn) bindEl(npBtn,toggle);
    const nx=$$('svg',np).filter(s=>s.getAttribute('width')==='26'); if(nx[0]) bindEl(nx[0].parentElement,()=>playTrack(cT-1)); if(nx[1]) bindEl(nx[1].parentElement,()=>playTrack(cT+1));
    on('nowplaying','.navbar .icon-btn:last-child',()=>toast('Track info · '+TRACKS[cT].name+' — '+TRACKS[cT].sub));
    $$('#openin > span.row',np).forEach(s=>bindEl(s,soon(norm(s.textContent))));
    // volume
    const knob=$('#knob',np), vb=$('#vol',np), vp=$('#vp',np), track=knob&&knob.parentElement; let warned=false;
    const setV=v=>{ if(v>.6){v=.6; if(!warned){warned=true; toast('Volume is <b>capped at 60%</b> by your care team for comfort.');}} vol=Math.max(0,v); knob.style.left=vb.style.width=(vol*100)+'%'; vp.textContent=Math.round(vol*100)+'%'; applyGain(); };
    if(track){ track.style.touchAction='none'; track.parentElement.style.padding='10px 0'; track.classList.add('tap');
      const mv=e=>{const r=track.getBoundingClientRect(); setV((e.clientX-r.left)/r.width);};
      track.addEventListener('pointerdown',e=>{track.setPointerCapture(e.pointerId); mv(e); track.onpointermove=mv;});
      track.addEventListener('pointerup',()=>{track.onpointermove=null; warned=false;}); }
    // sleep timer
    const st=textEls(np,'End of session')[0]; if(st){const items=[...st.parentElement.children];
      pickGroup(items,it=>/background:#fff/.test(it.getAttribute('style')||''),{after:it=>{const l=norm(it.textContent); const sec=l==='Off'?0:l==='30m'?1800:l==='1h'?3600:TOTAL-elapsed(); sleepAt=sec?Date.now()+sec*1000:null; fade=1; applyGain(); toast(sec?'Sleep timer: music fades out over 3 min in <b>'+fmt(sec)+'</b>':'Sleep timer off');}});}
    on('nowplaying','Alert staff',()=>toast('<b>Nurse station notified</b> (demo).',3200),{mode:'has'});
  }
  const pl=P('playlists');
  if(pl){ TRACKS.forEach((t,i)=>{const el=textEls(pl,t.pl).find(e=>e.tagName==='SPAN'); const row=el&&el.closest('[style*="padding:9px 0"]'); if(row){row.dataset.row=i; bindEl(row,()=>{playTrack(i); go('nowplaying');});} else warn('plrow',t.pl);});
    on('playlists','#jplay',()=>{ if(playing) pauseAll(); else playTrack(0); });
    on('playlists','Full Session Journey',()=>{ if(!playing) playTrack(0); go('nowplaying'); });
    $$('#alsoon .svc',pl).forEach(s=>bindEl(s,soon(norm(s.textContent))));
    miniTitle=textEls(pl,'Low Tide Drone')[0]; miniSub=textEls(pl,'Deep Field · Offline · 3 of 9')[0];
    const mp=miniTitle&&miniTitle.closest('[style*="bottom:40px"]');
    if(mp){ mp.style.bottom='calc(14px + var(--sb))'; const pz=$$('svg',mp).find(s=>s.getAttribute('width')==='18'&&s.parentElement.style.borderRadius==='50%'); miniBtn=pz&&pz.parentElement; if(miniBtn) bindEl(miniBtn,toggle);
      const nx=$$('svg',mp).find(s=>s.getAttribute('width')==='22'); if(nx) bindEl(nx.parentElement,()=>playTrack(cT+1));
      bindEl(miniTitle.parentElement,()=>go('nowplaying'));
      miniBar=$('[style*="width:42%"]',mp); const sp=textEls(mp,'3:12')[0]; miniL=sp; miniR=textEls(mp,'-4:28')[0]; const mid=textEls(mp,'Volume capped','has')[0]; if(mid) mid.textContent='Volume capped 60%';
      mid&&(window.__mini=mid); }
    // category chips (visual only)
    const all=textEls(pl,'All')[0]; if(all){const items=[...all.parentElement.children]; pickGroup(items,it=>/background:#fff/.test(it.getAttribute('style')||''));}
  }
  audioUI();
})();
let sleepAt=null;
function sleepTick(){ if(!sleepAt) { if(window.__mini) window.__mini.textContent='Volume capped 60%'; return; }
  const left=(sleepAt-Date.now())/1000; if(window.__mini) window.__mini.textContent='Sleep timer '+fmt(left);
  if(left<=180&&playing){fade=Math.max(0,left/180); applyGain();} if(left<=0){sleepAt=null; pauseAll(); fade=1; applyGain(); toast('Sleep timer ended · music paused');}}
function progTick(){ if(!miniBar) return; let p=0,a=0,d=0;
  if(TRACKS[cT].src&&media&&media.duration){a=media.currentTime; d=media.duration;} else if(synth&&ctx){d=TRACKS[cT].synth==='deep'?45*60:35*60; a=(ctx.currentTime-synthStart)%d;}
  if(d){p=a/d; miniBar.style.width=(p*100).toFixed(1)+'%'; const m=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'); if(miniL) miniL.textContent=m(a); if(miniR) miniR.textContent='-'+m(d-a);} }

/* ---------- pre-visit guide (education only; no reading during Session Mode) ---------- */
on('reader','Try breathing',()=>go('breathe'),{mode:'has'});
on('reader','Next guide',()=>{toast('Next guide · <b>Setting your intention</b> (pre-visit · demo uses the same text)'); P('reader').querySelector('.content').scrollTop=0;},{mode:'has'});
on('reader','Aa',()=>{const c=$('.content',P('reader')); c.dataset.big=c.dataset.big==='1'?'0':'1'; $$('p',c).forEach(p=>p.style.fontSize=c.dataset.big==='1'?'19.5px':'17px');});
(function(){const pg=P('reader'); if(!pg) return; const c=$('.content',pg), bar=$('[style*="top:54px"] > div',pg); if(bar){const par=bar.parentElement; par.style.top='var(--st)';} const nb=$('.navbar',pg); if(nb) nb.style.top='calc(var(--st) + 4px)'; c.style.top='calc(var(--st) + 58px)';
  c.addEventListener('scroll',()=>{if(bar) bar.style.width=Math.min(100,(c.scrollTop/(c.scrollHeight-c.clientHeight))*100||0)+'%';});})();

/* ---------- breathing ---------- */
const MODES={box:[['Breathe in',4,'in'],['Hold',4,'hold'],['Breathe out',4,'out'],['Hold',4,'hold2']],relax:[['Breathe in',4,'in'],['Hold',7,'hold'],['Breathe out',8,'out']],coh:[['Breathe in',5,'in'],['Breathe out',5,'out']]};
let bMode='box', bRun=true, bT0=performance.now(), bRaf=0, bPausedAt=0;
(function(){
  const pg=P('breathe'); if(!pg) return; const stage=$('#stage',pg), lab=$('#lab',pg), cnt=$('#cnt',pg), chips=$$('.ph',pg), cyc=textEls(pg,'Cycle 3 of 8','has')[0];
  if(stage){stage.style.width='100%';}
  const seg=$('.seg',pg); const keys=['box','relax','coh'];
  if(seg) seg.addEventListener('segchange',e=>{bMode=keys[[...seg.children].indexOf(e.detail)]; bT0=performance.now(); renderChips();});
  function renderChips(){const m=MODES[bMode]; chips.forEach((c,i)=>{c.style.display=i<m.length?'':'none'; if(i<m.length) c.textContent=(m[i][2]==='in'?'Inhale ':m[i][2]==='out'?'Exhale ':'Hold ')+m[i][1];});}
  function frame(now){
    const m=MODES[bMode], tot=m.reduce((a,p)=>a+p[1],0); const t=((now-bT0)/1000); let x=t%tot, i=0; while(x>=m[i][1]){x-=m[i][1]; i++;}
    const ph=m[i], f=x/ph[1]; const s=ph[2]==='in'?f:ph[2]==='out'?1-f:ph[2]==='hold'?1:0;
    const e=s<.5?2*s*s:1-Math.pow(-2*s+2,2)/2; stage.style.setProperty('--s',e.toFixed(3));
    if(lab.textContent!==ph[0]) lab.textContent=ph[0]; const c=String(Math.ceil(ph[1]-x)); if(cnt.textContent!==c) cnt.textContent=c;
    chips.forEach((ch,j)=>{const a=j===i; ch.style.background=a?'rgba(85,227,255,.2)':'rgba(255,255,255,.06)'; ch.style.color=a?'#9FEFFF':'rgba(255,255,255,.55)';});
    if(cyc){const n=Math.min(8,Math.floor(t/tot)+1); cyc.textContent='Cycle '+n+' of 8 · about '+Math.max(1,Math.round((8-n+1)*tot/60))+' min left';}
    bRaf=requestAnimationFrame(frame);
  }
  const pz=$$('svg',pg).find(s=>s.getAttribute('width')==='28'); const pb=pz&&pz.parentElement;
  if(pb) bindEl(pb,()=>{ if(bRun){cancelAnimationFrame(bRaf); bPausedAt=performance.now(); bRun=false; setIcon(pb,'play'); lab.textContent='Paused';} else {bT0+=performance.now()-bPausedAt; bRun=true; setIcon(pb,'pause'); bRaf=requestAnimationFrame(frame);} });
  on('breathe','Soft chime',()=>toast('Soft chime cue · on'),{up:el=>el.parentElement});
  on('breathe','Haptics on',()=>toast('Haptics are a native-app feature (demo)'),{up:el=>el.parentElement});
  on('breathe','.navbar .icon-btn:last-child',()=>toast('Breathing settings · coming soon'));
  onShow.breathe=()=>{renderChips(); if(bRun){bT0=performance.now(); cancelAnimationFrame(bRaf); bRaf=requestAnimationFrame(frame);}};
  onHide.breathe=()=>cancelAnimationFrame(bRaf);
})();

/* ---------- explore / treatments / discovery ---------- */
on('explore','#t-sprav',()=>go('spravato')); on('explore','#t-tms',()=>go('tms'));
on('explore','#t-ket',()=>toast('Ketamine-assisted therapy guide · coming soon'));
on('explore','#ex-call',()=>go('disc')); on('explore','#ex-ask',()=>go('asked'));
['spravato','tms'].forEach(id=>{
  on(id,'#b-learn-call',()=>go('disc')); on(id,'#b-ask',()=>go('asked'));
  const sg=$('.seg',P(id)); if(sg) [...sg.children].forEach(c=>bindEl(c,()=>{const t=norm(c.textContent); if(/Spravato/.test(t)&&id!=='spravato') go('spravato',{replace:true}); else if(/TMS/.test(t)&&id!=='tms') go('tms',{replace:true}); else if(/Ketamine/.test(t)){go('explore',{replace:true}); const k=$('#t-ket',P('explore')); if(k){k.scrollIntoView({block:'center'}); k.style.outline='2px solid #55E3FF'; setTimeout(()=>k.style.outline='',1600);}}}));
});
const dk={day:'27',dow:'Tue',slot:'2:15 PM',mode:'Video'};
(function(){
  const pg=P('disc'); if(!pg) return;
  const d1=textEls(pg,'27')[0]; if(d1){const items=[...d1.parentElement.parentElement.children]; pickGroup(items,it=>/background:#014CB2/i.test(it.getAttribute('style')||''),{after:it=>{dk.day=norm(it.lastElementChild.textContent); dk.dow=norm(it.firstElementChild.textContent); upd();}});}
  const slots=$$('.slot',pg); pickGroup(slots,it=>/#EAF1FF/i.test(it.getAttribute('style')||''),{disabled:it=>/line-through/.test(it.getAttribute('style')||''),after:it=>{dk.slot=norm(it.textContent); upd();}});
  $$('.chip',pg).filter(c=>!c.closest('.seg')).forEach(c=>{ if(c.closest('#d-confirm')) return; bindEl(c,()=>{const onS=/#EAF1FF|#014CB2/i.test(c.getAttribute('style')||''); if(onS){c.style.background='#F5F7FB'; c.style.color='#4A5168'; c.style.borderColor='#E6EAF2';} else {c.style.background='#EAF1FF'; c.style.color='#014CB2'; c.style.borderColor='#014CB2';}});});
  const sg=$('.seg',pg); if(sg) sg.addEventListener('segchange',e=>{dk.mode=/Phone/.test(e.detail.textContent)?'Phone':'Video';});
  function upd(){const b=$('#d-confirm',pg); if(b) for(const c of b.childNodes) if(c.nodeType===3&&norm(c.nodeValue)) c.nodeValue='Book '+dk.dow+', Oct '+dk.day+' · '+dk.slot;}
  on('disc','#d-confirm',()=>{const d=P('disc-done'); const t=textEls(d,'Oct 27','has'); t.forEach(el=>{for(const c of el.childNodes) if(c.nodeType===3&&/Oct 27/.test(c.nodeValue)) c.nodeValue=c.nodeValue.replace(/Tue, Oct 27 · 2:15 PM|Tue, Oct 27/,dk.dow+', Oct '+dk.day+(/2:15/.test(c.nodeValue)?' · '+dk.slot:'')).replace('2:15 PM',dk.slot);});
    if(dk.mode==='Phone') textEls(d,'Video','has').forEach(el=>{for(const c of el.childNodes) if(c.nodeType===3) c.nodeValue=c.nodeValue.replace(/video call/gi,'phone call').replace(/Video/g,'Phone');});
    go('disc-done',{replace:true});});
})();
['disc','disc-done','asked'].forEach(id=>{const pg=P(id); if(!pg) return;
  $$('[style*="rgba(5,14,44,.45)"]',pg).forEach(o=>bindEl(o,back));
  const x=$$('.icon-btn',pg).filter(b=>!b.closest('.navbar'))[0]; if(x) bindEl(x,back);});
on('disc-done','Done',()=>back(),{mode:'has'}); on('disc-done','Add to calendar',soon('Calendar export'),{mode:'has'});
on('asked','Done',()=>back(),{mode:'has'}); on('asked','Book',()=>go('disc'),{all:true}); on('asked','Edit note',()=>toast('Note editing · coming soon'));

/* ---------- forms / messages / billing / profile / care plan / telehealth ---------- */
on('forms','.li',()=>toast('Form opens here (demo) · answers would sync to your AdvancedMD chart'),{all:true});
['Refill request','Reschedule','Billing question','Side effects'].forEach(t=>on('messages',t,()=>toast('Demo only · messages aren’t sent from this prototype.')));
on('messages','Secure message…',()=>toast('Demo only · secure messaging isn’t connected.'),{mode:'has'});
on('messages','Pre-session checklist.pdf',()=>go('checkin'),{mode:'has'});
on('billing','Book a ride',soon('Uber / Lyft ride booking')); on('billing','Notify a friend',soon('Ride-share with a friend'));
on('billing','Pay',()=>toast('Payments are disabled in this prototype.'));
on('profile','Insurance',()=>go('billing'));
on('profile','Preferred pharmacy',()=>go('careplan'));
on('profile','Help',()=>tel('9174517018'),{mode:'starts'});
on('profile','Privacy & security',()=>{if(confirm('Sign out of the prototype?')){sessionStorage.removeItem('curated.in'); depth=0; history.replaceState({id:'welcome',depth:0},'','#welcome'); show('welcome');}});
on('checkin','Start Session Mode',()=>go('session'));
on('careplan','Refill',()=>toast('Refill request sent to Neighborhood Pharmacy (demo · nothing was sent)'));
on('billing','Card / HSA',()=>toast('Payments are disabled in this prototype.'));
on('tele','Join visit',()=>toast('Demo · video visits would open AdvancedMD Telemedicine.'));

/* ---------- journal ---------- */
const FEEL={Happy:['#F2CF5B','#8A6A00',['Grateful','Hopeful','Proud','Content']],Calm:['#7FCB8F','#1F7A55',['Peaceful','Relieved','Safe']],Sad:['#5B8DEF','#1D4FB8',['Lonely','Discouraged','Empty','Hurt']],Anxious:['#9C8CFF','#5A49C9',['Worried','Overwhelmed','Restless','Nervous','Insecure','On edge']],Angry:['#E86B6B','#A33A4E',['Frustrated','Irritated','Resentful']],Tired:['#A7AFC2','#4A5168',['Drained','Numb','Foggy']]};
const JKEY='curated.journal';
const loadJ=()=>{try{return JSON.parse(localStorage.getItem(JKEY)||'[]');}catch(e){return [];}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let ent={mood:-1,core:null,subs:[],en:28,sl:35,text:''};
function setMood(pg,i){ const labs=MOODS.map(m=>textEls(pg,m)[0]).filter(Boolean);
  labs.forEach((l,j)=>{const box=l.previousElementSibling, sv=$('svg',box), on=j===i; box.style.background=on?MCOL[j]:'#F2F4F9'; box.style.transform=on?'scale(1.06)':''; sv.setAttribute('stroke',on?'#fff':MCOL[j]); l.style.fontWeight=on?600:500; l.style.color=on?'#091F58':'#8A90A3';}); }
(function(){
  const pg=P('entry'); if(!pg) return;
  MOODS.forEach((m,i)=>on('entry',m,()=>{ent.mood=i; setMood(pg,i);},{up:el=>el.parentElement}));
  const sw=$('#subwrap',pg);
  function renderSubs(){ if(!ent.core){sw.style.display='none'; return;} const [c,dk,subs]=FEEL[ent.core]; sw.style.display='';
    sw.innerHTML='<div class="xs" style="color:'+dk+';font-weight:700">'+ent.core+' can feel like…</div><div class="row" style="gap:7px;margin-top:8px;flex-wrap:wrap">'+subs.map(w=>{const on=ent.subs.includes(w); return '<span class="chip sub tap" data-w="'+w+'" style="padding:7px 12px;font-size:13px;background:'+(on?'#F0EDFF':'#fff')+';color:'+(on?'#5A49C9':'#4A5168')+';border:1px solid '+(on?'#9C8CFF':'#ECE6DD')+'">'+(on?svgOf('check',13,'#5A49C9'):'')+w+'</span>';}).join('')+'</div>'+(ent.subs.length?'<div class="xs muted" style="margin-top:9px">Picked: <b style="color:#1D4FB8">'+ent.subs.join(', ')+'</b></div>':'');
    $$('.chip.sub',sw).forEach(s=>s.addEventListener('click',e=>{e.stopPropagation(); const w=s.dataset.w; ent.subs=ent.subs.includes(w)?ent.subs.filter(x=>x!==w):[...ent.subs,w]; renderSubs();}));}
  $$('.core[data-c]',pg).forEach(ch=>bindEl(ch,()=>{const k=ch.dataset.c; ent.core=ent.core===k?null:k;
    $$('.core[data-c]',pg).forEach(c=>{const on=c.dataset.c===ent.core, col=FEEL[c.dataset.c][0]; c.style.background=on?col:'#fff'; c.style.color=on?'#fff':'#4A5168'; c.style.borderColor=on?col:'#ECE6DD'; const d=c.firstElementChild; if(d) d.style.background=on?'#fff':col;}); renderSubs();}));
  // sliders
  const SL={en:['Running on empty','Low','Okay','Good','Full of energy'],sl:['Poor','Restless','Okay','Good','Restful']};
  Object.keys(SL).forEach(k=>{const kn=$('#'+k+'k',pg), fl=$('#'+k+'f',pg), v=$('#'+k+'v',pg); if(!kn) return; const tr=kn.parentElement; tr.style.touchAction='none'; tr.classList.add('tap');
    const set=p=>{p=Math.max(0,Math.min(100,p)); ent[k]=p; kn.style.left=fl.style.width=p+'%'; v.textContent=SL[k][Math.min(4,Math.floor(p/20))];};
    const mv=e=>{const r=tr.getBoundingClientRect(); set((e.clientX-r.left)/r.width*100);};
    tr.addEventListener('pointerdown',e=>{tr.setPointerCapture(e.pointerId); mv(e); tr.onpointermove=mv;}); tr.addEventListener('pointerup',()=>tr.onpointermove=null);});
  // free write
  const ft=$('#ftxt',pg); const ta=document.createElement('textarea'); ta.className='ftxt'; ta.id='ftxt'; ta.placeholder='Write whatever is on your mind…'; ft.replaceWith(ta);
  const prompts={'Brain dump':'Write whatever is on your mind…','3 good things':'1. \n2. \n3. '};
  ['Brain dump','3 good things'].forEach(p=>on('entry',p,(e,b)=>{ if(p==='3 good things'&&!ta.value) ta.value=prompts[p]; ta.placeholder=prompts['Brain dump']; ta.focus();}));
  on('entry','Thought record',()=>go('thought'));
  on('entry','Speak',soon('Voice dictation'),{mode:'has'});
  on('entry','#j-crisis',()=>go('safety'));
  const save=()=>{ const text=ta.value.trim(); if(ent.mood<0&&!ent.core&&!text){toast('Pick a mood, a feeling, or write a few words first.');return;}
    const tg=$('.toggle',pg); const shared=tg&&!tg.classList.contains('off');
    const list=loadJ(); list.unshift({ts:Date.now(),mood:ent.mood,core:ent.core,subs:ent.subs,energy:Math.round(ent.en),sleep:Math.round(ent.sl),text,shared}); localStorage.setItem(JKEY,JSON.stringify(list.slice(0,50)));
    resetEntry(); go('jhome',{replace:true}); toast(shared?'Entry saved · <b>shared with your care team</b> (demo)':'Entry saved <b>privately</b> on this device');};
  on('entry','Save entry',save); on('entry','Save',save,{i:0});
  function resetEntry(){ent={mood:-1,core:null,subs:[],en:28,sl:35,text:''}; ta.value=''; setMood(pg,-1); $$('.core[data-c]',pg).forEach(c=>{const col=FEEL[c.dataset.c][0]; c.style.background='#fff'; c.style.color='#4A5168'; c.style.borderColor='#ECE6DD'; if(c.firstElementChild) c.firstElementChild.style.background=col;}); renderSubs();}
  onShow.entry=()=>{ if(presetMood>=0){ent.mood=presetMood; setMood(pg,presetMood); presetMood=-1;} const d=new Date(); const sub=$('.navbar',pg)&&textEls($('.navbar',pg),'Oct 26','has')[0]; if(sub) sub.textContent=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+' · '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}); };
  resetEntry();
})();
(function(){
  const pg=P('jhome'); if(!pg) return;
  on('jhome','#j-start',()=>go('entry')); on('jhome','#j-ins',()=>go('insights')); on('jhome','#j-help',()=>go('safety'));
  on('jhome','Start an entry',()=>go('entry'),{mode:'has'}); on('jhome','My safety plan',()=>go('safety'),{mode:'has'});
  on('jhome','Thought record',()=>go('thought'),{mode:'has'});
  on('jhome','.li',()=>toast('Entries are private and stay on this device (demo).'),{all:true});
  const se=textEls(pg,'Short on energy?')[0]; const fr=se&&se.closest('.row')&&se.closest('.row').nextElementSibling;
  if(fr) [...fr.children].forEach((f,i)=>bindEl(f,()=>{const l=loadJ(); l.unshift({ts:Date.now(),mood:i,core:null,subs:[],energy:28,sleep:35,text:'',shared:false}); localStorage.setItem(JKEY,JSON.stringify(l.slice(0,50))); f.style.background=MCOL[i]; setTimeout(()=>f.style.background='#fff',900); onShow.jhome&&onShow.jhome(); toast('Logged <b>'+MOODS[i]+'</b> · saved privately on this device');})); else warn('jhome faces');
  const h=textEls(pg,'Recent entries')[0]; const list=h&&$('.list',h.parentElement);
  onShow.jhome=()=>{ if(!list) return; $$('.li[data-saved]',list).forEach(x=>x.remove());
    loadJ().slice(0,5).reverse().forEach(e=>{const d=new Date(e.ts); const li=document.createElement('div'); li.className='li tap'; li.dataset.saved='1';
      const feel=[e.core,...(e.subs||[])].filter(Boolean).map(s=>s.toLowerCase()).join(', ');
      const title=e.text?esc(e.text.split('\n')[0].slice(0,34))+(e.text.length>34?'…':''):(e.core?e.core+' check-in':'Mood check-in');
      li.innerHTML='<div class="ibox" style="background:#F0EDFF;color:#6B5BD6">'+svgOf('pen',18,'#6B5BD6')+'</div><div class="tx"><div class="t1" style="font-size:14.5px">'+title+'</div><div class="t2">'+d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+' · '+(e.mood>=0?MOODS[e.mood]:'—')+(feel?' · '+esc(feel):'')+'</div></div>'+(e.shared?'<span class="chip" style="background:#E9FBF4;color:#1F7A55;font-size:11px">Shared</span>':svgOf('lock',15,'#9AA1B4'));
      li.addEventListener('click',ev=>{ev.stopPropagation(); toast(esc(e.text||'No text — mood & feelings only.'),3500);}); list.prepend(li);});};
})();
on('thought','#tr-next',()=>toast('Saved to your thought record (demo)'));
on('thought','Save for later',()=>{go('jhome',{replace:true}); toast('Thought record saved for later (demo)');});
on('insights','Share a summary with Dr. Marsh',()=>toast('Nothing was shared · sharing is disabled in the prototype.'));
on('jhome','Speak instead',soon('Voice journaling'));
on('forms','Start',()=>toast('Form opens here (demo) · answers would sync to your AdvancedMD chart'),{all:true});
// safety plan + crisis links (real)
$$('.pg').forEach(pg=>{
  textEls(pg,'988','has').forEach(el=>{const b=box(el); if(b.classList.contains('tap')||b.closest('a')||el.closest('a')) return; const t=norm(b.textContent);
    if(/text/i.test(t)&&!/call/i.test(t)) bindEl(b,()=>{location.href='sms:988';}); else bindEl(b,()=>tel('988'));});
  textEls(pg,'911','has').forEach(el=>{const b=box(el); if(b.classList.contains('tap')||b.closest('a')||el.closest('a')) return; bindEl(b,()=>tel('911'));});
});

$$('a[href^="tel:"],a[href^="sms:"]').forEach(a=>a.classList.add('tap'));

/* ---------- boot ---------- */
const h0=location.hash.slice(1);
if(!signed()){ history.replaceState({id:'welcome',depth:0},'','#welcome'); show('welcome'); }
else { const id=P(h0)?h0:'home'; history.replaceState({id:'home',depth:0},'','#home'); show('home'); if(id!=='home') go(id); }
tick();
if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
