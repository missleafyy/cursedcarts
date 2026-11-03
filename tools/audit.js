// Text audit. ?eval=AUDIT() prints every string that leaves its box and every shrunk button.
window.AUDIT=()=>{window.__manual=1;const out=window.__audit=[];const run=(set,n=18)=>{set();for(let i=0;i<n;i++)UI.step();};
 const longlog=['{red}BURGLED:{/} LINDA\'S PERFUME is gone.','Terminal sold 3 pills overnight for $105.','{green}Spooky Ghost paid you back. $600 in old bills. They are damp.{/}','Scuff: $8 for flyers.','Somebody tagged your shutter in the night and it will cost attractiveness.','{yellow}Informant:{/} inspection in 2 days.','Janitor emptied the can.','Burglars took a thing.','Another long line about the night that keeps going for a while longer than usual.'];
 G.upgrades={shelf:1,ram:1,press:1,inform:1,flyer:1,permit:1,neon:1};G.day=88;G.rent=2400;G.arrears=1200;G.cash=123456;G.evidence=90;
 G.story.notes=STORY.BEATS.filter(b=>b.note).map((b,i)=>({day:i*3+1,t:typeof b.note==='function'?'x':b.note}));G.story.logRead=6;STORY.giveGrin(G);
 for(const f in G.rep)G.rep[f]=150;
 G.log=longlog;run(()=>UI.set({modal:'report',shutter:1}));G.news={title:'SPOOKY ALIMONY CASE ENTERS FINAL WEEK',body:'Court asks defendant to stop vanishing during testimony, and the body runs on for a while.'};run(()=>UI.set({modal:'report',shutter:1}));
 for(const m of ['close','help'])run(()=>UI.set({modal:m,data:{},shutter:1}));
 const it=G.items.find(i=>i.owned);for(const m of ['label','accuse'])run(()=>UI.set({modal:m,data:{it,clue:'A long clue about how the label looks wrong and the plastic has been chewed by somebody with opinions.'},shutter:1}));
 for(const t of ['buy','sell','inv','disp','press'])run(()=>UI.set({modal:'terminal',data:{tab:t,grade:2,claim:2},shutter:0}));
 for(const t of [0,1,2])run(()=>UI.set({modal:'offers',data:{tab:t},shutter:0}));
 for(const t of [null,0,1,2])run(()=>UI.set({modal:'phone',data:{tab:t},shutter:0}));
 run(()=>UI.set({modal:'notes',data:{},shutter:1}));run(()=>UI.set({modal:'dennis',data:{},shutter:1}));
 G.goOut();run(()=>UI.set({modal:null,ass:{log:longlog,found:G.items.slice(0,8),out:true},shutter:1}));UI.set({ass:null});
 // every story line in the speech box
 const tall=[];G.queue=[];G.phase='day';const combos=[{scuff:'hired',custody:'helped',relay:'sent'},{scuff:'no',custody:'no',relay:'moved'}];
 for(const cb of combos){Object.assign(G.story,cb);for(const b of STORY.BEATS){let c;try{c=b.make(G,G.story)}catch(e){out.push('beat '+b.id+' '+e);continue}
   const n=c.talk?c.talk.length:1;for(let i=0;i<n;i++){if(c.talk&&c.talk[i].run)continue;UI.set({shutter:0});UI.speech(c,i);UI.step();}}
  G.cash=99999;const l=STORY.landlord(G);UI.speech(l,0);UI.step();}
 for(const k in window.DATA.CLIENTS){const c=G.genClient(k);UI.speech(c,0);UI.step();}
 G.client=null;
 for(const e in ENDINGS){G.gameOver(e);run(()=>{},16);G.over=null;G.phase='day';}
 UI.go('title');run(()=>{});
 const uniq=[...new Set(out)];console.error('AUDIT '+uniq.length);uniq.slice(0,28).forEach(l=>console.error(l));};
