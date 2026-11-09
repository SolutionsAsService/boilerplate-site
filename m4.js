const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [1280,375]) {
    const p = await (await b.newContext({ viewport: { width: w, height: w==1280?800:812 } })).newPage();
    await p.goto('http://localhost:8140/?cfs=1200'); await p.waitForTimeout(600);
    console.log(w, JSON.stringify(await p.evaluate(()=>{
      const all=[...document.querySelectorAll('main *')];
      const shadow=all.filter(e=>{const s=getComputedStyle(e).boxShadow;return s&&s!=='none'&&/\d+px \d+px 0px/.test(s)}).length;
      const sv=[...document.querySelectorAll('main svg')].sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];
      const r=sv.getBoundingClientRect(); const card=sv.closest('section,div');
      const raft=document.querySelector('.raft rect'); 
      const txt=[...sv.querySelectorAll('text')].map(t=>parseFloat(getComputedStyle(t).fontSize)); 
      const bead=sv.querySelector('circle'); 
      return {H:document.documentElement.scrollHeight, svgTop:Math.round(r.top+scrollY), svgH:Math.round(r.height), svgW:Math.round(r.width), shadowBoxes:shadow, minSvgText:Math.min(...txt), bead: bead&&bead.getBoundingClientRect().width, raftW: raft&&raft.getBoundingClientRect().width}})));
  }
  await b.close();
})();
