// plays 60 days of story only. pick: 0 first choice, 1 last choice
window.STORYTEST=(pick,lot,only)=>{G.newGame('normal');G.morning();const seen=[];let err=0;
 for(let d=0;d<70&&!G.over;d++){G.cash=Math.max(G.cash,5000);G.evidence=0;for(const k in G.crime)G.crime[k]=0;
  if(lot&&G.story.logRead<STORY.LOGS.filter(l=>l.day<=G.day).length)G.story.logRead++;
  if(lot&&G.story.logRead===STORY.LOGS.length&&STORY.hasGrin(G)&&!G.story.grinEnd)STORY.pressStart(G);
  G.openShutter();
  while(G.queue.length&&!G.over){const c=G.next();if(c.beat)seen.push(G.day+':'+c.beat);
   if(c.carry&&c.carry.some(i=>i.grin)&&!pick){G.matTheirs().forEach(i=>{i.owned=true;G.stockPlace(i)})}
   if(c.talk&&!c.isLandlord&&!c.isOfficer&&!c.inspect)for(const st of c.talk){if(st.run)st.run(G);if(st.choices){const o=st.choices.filter(x=>!x.ok||x.ok());const ch=only?(c.beat===only?o[0]:o[o.length-1]):o[pick?o.length-1:0];ch.fn(G);}}
   if(c.isLandlord)G.payRent();G.endClient();}
  if(G.over)break;G.closeDay();G.endNight();}
 console.error('RUN pick='+pick+' lot='+lot+' day='+G.day+' over='+G.over+' grinEnd='+G.story.grinEnd+' rent='+G.rent+' scuff='+G.story.scuff+' custody='+G.story.custody+' relay='+G.story.relay+' notes='+G.story.notes.length);
 console.error(seen.join(' '));console.error(JSON.stringify(STORY.epilogue(G)));console.error('NEWS '+Object.keys(G.story.news).join(' '));};
