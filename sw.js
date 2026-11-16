const V='gg-v2';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  const page=r.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/');
  e.respondWith((async()=>{
    const c=await caches.open(V);
    if(page){
      try{
        const res=await Promise.race([fetch(r),new Promise((_,no)=>setTimeout(no,4000))]);
        if(res&&res.ok)c.put(r.mode==='navigate'?'./':r,res.clone());
        return res;
      }catch{return(await c.match(r,{ignoreSearch:true}))||(await c.match('./'))||new Response('Oflayn',{status:503})}
    }
    return(await c.match(r))||fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res});
  })());
});
