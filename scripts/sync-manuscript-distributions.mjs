// Rebuild 577 GitHub taxon distributions from the frozen 2026 Notion manuscript snapshot.
// No taxon identifiers, citations, taxonomic history, or URLs are changed.
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const read=async p=>readFile(path.join(process.cwd(),p),'utf8');
const src=JSON.parse(await read('data/manuscript-distributions-2026.json')).distributions;
const ids=Object.keys(src).sort();
const taxa=JSON.parse(await read('data/taxa.json'));
const siteIds=new Set(taxa.map(t=>t.vsn));
if(ids.length!==577||siteIds.size!==577||ids.some(x=>!siteIds.has(x)))throw Error('VSN crosswalk is not a complete set of 577');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const edits=new Map(),species=new Map();
let meta=0,noscript=0,changedData=0,changedPages=0;
for(const id of ids){
  const p='data/species/'+id+'.json';
  const old=await read(p),t=JSON.parse(old),d=src[id];
  if(t.vsn!==id||!t.distribution||typeof d?.en!=='string'||!d.en.trim()||typeof d?.zh!=='string'||!d.zh.trim())throw Error('Invalid profile '+id);
  t.distribution.summary=d.en;
  t.distribution.summary_zh=d.zh;
  species.set(id,t);
  const next=JSON.stringify(t,null,2)+'\n';
  if(next!==old){edits.set(p,next);changedData++}

  const hp='taxa/'+id+'/index.html',original=await read(hp);
  let html=original,count=0,one=0;
  // Some legacy SEO descriptions are truncated; regenerate both from the profile.
  const seo=esc(t.scientific_name+' '+(t.authorship||'')+'. '+t.subfamily+'. '+t.tribe+'. reviewed China distribution: '+d.en+'. Taxon profile in the China Scolytinae Database.');
  html=html.replace(/(<meta (?:name="description"|property="og:description") content=")[^"\n]*(">)/g,(_all,a,b)=>{count++;return a+seo+b});
  html=html.replace(/<noscript>([\s\S]*?)<\/noscript>/,(_all,inside)=>{
    if(inside.includes('<dt>China distribution</dt>')){
      inside=inside.replace(/(<dt>China distribution<\/dt><dd>)([^<]*)(<\/dd>)/,(_m,a,_b,c)=>a+esc(d.en)+c);
      one++;
    }else if(inside.includes('</dl>')){
      inside=inside.replace('</dl>','<dt>China distribution</dt><dd>'+esc(d.en)+'</dd></dl>');
      one++;
    }
    return '<noscript>'+inside+'</noscript>';
  });
  if(count!==2||one!==1)throw Error('Unexpected generated HTML structure '+id+' metadata '+count+' fallback '+one);
  meta+=count;noscript+=one;
  html=html.replace(/assets\/js\/app\.js\?v=[0-9-]+/g,'assets/js/app.js?v=20261117-1');
  html=html.replace(/assets\/js\/taxon-profile-i18n\.js\?v=[0-9-]+/g,'assets/js/taxon-profile-i18n.js?v=20261117-1');
  if(html!==original){edits.set(hp,html);changedPages++}
}
const regionPath='data/region-index.json',previous=JSON.parse(await read(regionPath));
const alias={'Xizang (Tibet)':'Xizang','Neimenggu (Inner Mongolia)':'Inner Mongolia'};
const byName=new Map(previous.regions.map(r=>[r.name,[]]));
for(const id of ids){
  const t=species.get(id);
  const names=src[id].en.split(';').map(v=>v.trim());
  for(const raw of names){
    const name=alias[raw]||raw;
    // Do not treat doubtful, unconfirmed, or broad-region-only phrases as province records.
    if(!byName.has(name))continue;
    const scope=['Taiwan','Hong Kong','Macao'].includes(name)?name:'Mainland China';
    byName.get(name).push({vsn:id,occurrence_assessment:t.china_occurrence?.[scope]||'Not assessed',assessment_scope:scope,review_status:t.review_status||'Not started'});
  }
}
const regions={...previous,profile_count:577,method:'Explicit named provinces and regions in Notion Manuscript Distribution (2026). Doubtful/unconfirmed and broad regional-only expressions are not treated as province-level presence; occurrence assessments remain separate.',regions:previous.regions.map(r=>({...r,count:byName.get(r.name).length,records:byName.get(r.name)}))};
const regionNew=JSON.stringify(regions,null,2)+'\n';
if(regionNew!==await read(regionPath))edits.set(regionPath,regionNew);

const appPath='assets/js/app.js';
let app=await read(appPath);
const before="<p><strong>'+esc(distLabel)+'</strong> '+esc(distSummary)+'</p><p>'";
const after="<p><strong>'+esc(distLabel)+'</strong> <span class=\"distribution-summary\" data-en=\"'+esc(distSummary)+'\" data-zh=\"'+esc(t.distribution?.summary_zh||'')+'\">'+esc(distSummary)+'</span></p><p>'";
if(app.includes(before))app=app.replace(before,after);
else if(!app.includes(after))throw Error('Cannot locate exact app.js distribution renderer');
if(app!==await read(appPath))edits.set(appPath,app);

const scriptPath='assets/js/taxon-profile-i18n.js';
let script=await read(scriptPath);
const newFunction=[
"  function translateManuscriptDistributions() {",
"    for (const el of document.querySelectorAll('#distribution .distribution-summary[data-en][data-zh]')) {",
"      const desired = language === 'zh' ? el.dataset.zh : el.dataset.en;",
"      if (el.textContent !== desired) el.textContent = desired;",
"      if (language === 'zh') el.setAttribute('lang', 'zh-CN');",
"      else el.removeAttribute('lang');",
"    }",
"  }",
""
].join('\n');
if(!script.includes('function translateManuscriptDistributions()')){
  if(!script.includes('  function render() {'))throw Error('Cannot locate i18n renderer');
  script=script.replace('  function render() {',newFunction+'\n  function render() {');
}
if(!script.includes('      translateManuscriptDistributions();')){
  if(!script.includes('      translateReviewedDisplays();'))throw Error('Cannot locate i18n invocation');
  script=script.replace('      translateReviewedDisplays();','      translateManuscriptDistributions();\n      translateReviewedDisplays();');
}
if(script!==await read(scriptPath))edits.set(scriptPath,script);
const homePath='index.html';
let home=await read(homePath);
home=home.replace(/assets\/js\/app\.js\?v=[0-9-]+/g,'assets/js/app.js?v=20261117-1');
if(home!==await read(homePath))edits.set(homePath,home);
if(species.size!==577||meta!==1154||noscript!==577)throw Error('Incomplete synchronization');
for(const [p,value] of edits)await writeFile(p,value,'utf8');
console.log(JSON.stringify({validated:577,json:changedData,pages:changedPages,seo:meta,noscript,regionUpdates:regions.regions.map(r=>({region:r.name,count:r.count})),changedFiles:edits.size,source:'Notion Manuscript Distribution (2026)'}));
