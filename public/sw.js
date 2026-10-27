const C='curated-proto-v2';
const CORE=['./','index.html','app.css','proto.css','app.js','manifest.webmanifest','logo-navy.png','logo-white.png','icons/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request; if(r.method!=='GET'||r.headers.has('range')) return;
  e.respondWith(fetch(r).then(res=>{if(res.ok&&new URL(r.url).origin===location.origin&&!r.url.includes('/audio/')){const cp=res.clone(); caches.open(C).then(c=>c.put(r,cp));} return res;}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));});
