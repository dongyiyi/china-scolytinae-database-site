import {buildTaxonSearchIndex, searchTaxonIndex} from './taxon-search.mjs';
const app=document.querySelector('#app');
const SITE_ROOT='/china-scolytinae-database-site/';
const taxonUrl=vsn=>SITE_ROOT+'taxa/'+encodeURIComponent(vsn)+'/';
async function getJSON(path){const r=await fetch(SITE_ROOT+path.replace(/^\//,''), {cache:'no-store'});if(!r.ok)throw new Error('Could not load '+path);return r.json();}
function esc(s){return String(s||'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));}
function publicSourceText(text){
  return String(text||'')
    .replace(/\bCO2015\b/g,'黄复生等 (2015)')
    .replace(/\bEF1984\b/g,'殷蕙芬等 (1984)')
    .replace(/\bJ2026_\d+\b/g,'')
    .replace(/\bBackbone Taxon ID\s*\d+\b/gi,'')
    .replace(/\b(?:Imported|Current accepted) name usage\s*;?/gi,'')
    .replace(/\s+([,.;:])/g,'$1')
    .replace(/\s{2,}/g,' ')
    .trim();
}
function isHigherTaxonName(value){return /^[A-Z][A-Za-z-]*(?:aceae|idae|inae|ini)$/i.test(String(value||'').trim());}
function sci(name){
  const value=String(name||'').trim();
  if(isHigherTaxonName(value)) return esc(value);
  const lower=value.toLowerCase();
  if(lower.endsWith(' spp.')) return '<span class="scientific">'+esc(value.slice(0,-5))+'</span> spp.';
  if(lower.endsWith(' sp.')) return '<span class="scientific">'+esc(value.slice(0,-4))+'</span> sp.';
  return '<span class="scientific">'+esc(value)+'</span>';
}
function knownScientificNames(t){
  const names=new Set();
  const add=v=>{v=String(v||'').trim();if(v)names.add(v);};
  add(t.scientific_name);add(t.genus);
  (t.hosts||[]).forEach(h=>{add(h.scientific_name);add(String(h.scientific_name||'').split(' ')[0]);});
  (t.taxonomic_history||[]).forEach(x=>{add(x.name);add(String(x.name||'').split(' ')[0]);});
  return [...names].filter(Boolean).sort((a,b)=>b.length-a.length);
}
function scientificText(text,t){
  let chunks=[{text:publicSourceText(text),html:false}];
  for(const name of knownScientificNames(t)){
    const next=[];
    for(const chunk of chunks){
      if(chunk.html){next.push(chunk);continue;}
      const parts=chunk.text.split(name);
      parts.forEach((part,i)=>{if(part)next.push({text:part,html:false});if(i<parts.length-1)next.push({text:sci(name),html:true});});
    }
    chunks=next;
  }
  const genera=[...new Set([t.genus,...(t.hosts||[]).map(h=>String(h.scientific_name||'').split(' ')[0]),...(t.taxonomic_history||[]).map(x=>String(x.name||'').split(' ')[0])].filter(Boolean))];
  for(const genus of genera){
    const next=[];
    const pattern=new RegExp('\\b'+genus+'\\s+[a-z][a-z-]+\\b','g');
    for(const chunk of chunks){
      if(chunk.html){next.push(chunk);continue;}
      let last=0,m;
      while((m=pattern.exec(chunk.text))!==null){if(m.index>last)next.push({text:chunk.text.slice(last,m.index),html:false});next.push({text:sci(m[0]),html:true});last=m.index+m[0].length;}
      if(last<chunk.text.length)next.push({text:chunk.text.slice(last),html:false});
    }
    chunks=next;
  }
  return chunks.map(x=>x.html?x.text:esc(x.text)).join('');
}
function currentRoute(){const raw=location.hash.slice(1)||'/';const parts=raw.split('?');return {path:parts[0],params:new URLSearchParams(parts[1]||'')};}
let higherRanks=null;async function rankData(){if(!higherRanks)higherRanks=getJSON('data/higher-taxon-chinese-names.json');return higherRanks;}
function rankCN(data,type,latin){let r=data?.[type]?.[latin];return r?.web_display_authorized===true?String(r.chinese||''):'';}
function rankHTML(latin,cn,italic=false){return (italic?sci(latin):esc(latin))+(cn?' <span class="higher-taxon-cn" lang="zh-Hans">'+esc(cn)+'</span>':'');}
async function home(){const [taxa,meta,ranks]=await Promise.all([getJSON('data/taxa.json'),getJSON('data/site-meta.json'),rankData()]);const searchIndex=buildTaxonSearchIndex(taxa,ranks);const genera=new Set(taxa.map(t=>t.genus).filter(Boolean));const tribes=new Set(taxa.map(t=>t.tribe).filter(Boolean));const invasive=taxa.filter(t=>t.invasive_status==='Invasive');app.innerHTML='<section class="hero"><div class="eyebrow">China checklist</div><h1>China Scolytinae & Platypodinae Database</h1><p class="subtitle">An evidence-based resource linking accepted taxa, historical name usages, Chinese occurrence records, hosts, sources and provenance through stable VSN identifiers.</p><div class="scope-banner"><strong>Current coverage:</strong> Scolytinae only. Platypodinae is part of the long-term project scope but has not yet been integrated.</div><form id="search" class="searchbar"><input id="q" autocomplete="off" placeholder="Search scientific/Chinese names, former names, genus, tribe, or VSN"><button>Search</button></form><div id="results"></div></section><section class="grid"><a class="card third dashboard-link" href="#/browse"><div class="eyebrow">Current profiles</div><h2>'+taxa.length+'</h2><p>Browse all taxon profiles.</p></a><a class="card third dashboard-link" href="#/genera"><div class="eyebrow">Genera represented</div><h2>'+genera.size+'</h2><p>Expand genera to view species lists.</p></a><a class="card third dashboard-link" href="#/tribes"><div class="eyebrow">Tribes represented</div><h2>'+tribes.size+'</h2><p>Explore tribes, genera, and species.</p></a><a class="card third dashboard-link" href="#/invasive"><div class="eyebrow">Non-native invasive species</div><h2>'+invasive.length+'</h2><p>Species not native to China and flagged as invasive in this checklist.</p></a><a class="card third dashboard-link" href="#/regions"><div class="eyebrow">Geographic records</div><h2>Browse by region</h2><p>Explore species reported from China’s provinces and regions.</p></a><article class="card third"><div class="eyebrow">Source model</div><h2>Literature-based synthesis</h2><p>Taxonomic and distributional records are compiled from monographs, checklists, original species descriptions, and published new records.</p></article></section>';const input=document.querySelector('#q');const out=document.querySelector('#results');function render(){const q=input.value.trim().toLowerCase();if(!q){out.innerHTML='';return;}const hits=searchTaxonIndex(searchIndex,q);out.innerHTML=hits.length?hits.map(hit=>{const t=hit.taxon;return '<a class="result" href="'+SITE_ROOT+'taxa/'+encodeURIComponent(t.vsn)+'/"><strong>'+sci(t.scientific_name)+' '+esc(t.authorship)+'</strong><br><small>'+esc(t.chinese_name)+' · '+esc(t.vsn)+' · '+esc(t.tribe)+'</small>'+(hit.matchedKind==='former_chinese'||hit.matchedKind==='chinese_genus'||hit.matchedKind==='chinese_tribe'?'<br><small>Matched '+esc(({former_chinese:'former Chinese name',chinese_genus:'Chinese genus',chinese_tribe:'Chinese tribe'})[hit.matchedKind])+': '+esc(hit.matchedValue)+'</small>':'')+'</a>';}).join(''):'<p class="notice">No matching taxon in the current database.</p>';}document.querySelector('#search').addEventListener('submit',e=>{e.preventDefault();render();});input.addEventListener('input',render);}

function speciesResult(t){
  return '<a class="result" href="'+taxonUrl(t.vsn)+'"><strong>'+sci(t.scientific_name)+' '+esc(t.authorship)+'</strong><br><small>'+esc(t.chinese_name||'')+' · '+esc(t.genus||'')+' · '+esc(t.tribe||'')+' · '+esc(t.vsn)+'</small></a>';
}
// Shared Back to top control for all supported browse and species routes.
let backToTopScrollBound=false;
function updateBackToTop(){
  const button=document.querySelector('.back-to-top');
  if(button)button.classList.toggle('visible',window.scrollY>300);
}
function showBackToTop(targetId){
  const previous=document.querySelector('.back-to-top');
  if(previous)previous.remove();
  const button=document.createElement('button');
  button.type='button';
  button.className='back-to-top';
  button.setAttribute('aria-label','Back to top');
  button.innerHTML='<span aria-hidden="true">↑</span> Back to top';
  button.addEventListener('click',()=>{
    const top=targetId?document.getElementById(targetId):null;
    if(top)top.scrollIntoView({behavior:'smooth',block:'start'});
    else window.scrollTo({top:0,behavior:'smooth'});
  });
  document.body.appendChild(button);
  if(!backToTopScrollBound){
    window.addEventListener('scroll',updateBackToTop,{passive:true});
    backToTopScrollBound=true;
  }
  updateBackToTop();
}

function browseViewTabs(active){
  const views=[['browse','Species'],['genera','Genera'],['tribes','Tribes']];
  return '<nav class="browse-view-tabs" aria-label="Taxonomic browsing mode">'+views.map(([route,label])=>'<a href="#/'+route+'"'+(active===route?' aria-current="page"':'')+'>'+label+'</a>').join('')+'</nav>';
}
function browseFilters(taxa,names){
  const options=(key,label)=>'<select id="'+key+'-filter" aria-label="Filter by '+label+'"><option value="">All '+label+'</option>'+[...new Set(taxa.map(t=>t[key]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'en')).map(name=>'<option value="'+esc(name)+'">'+esc(name)+(rankCN(names,key==='genus'?'genera':'tribes',name)?' · '+esc(rankCN(names,key==='genus'?'genera':'tribes',name)):'')+'</option>').join('')+'</select>';
  return '<section class="browse-tools" aria-label="Search and filter taxa"><input id="browse-q" type="search" aria-label="Search taxa" placeholder="Filter by scientific name, Chinese name, genus, tribe, or VSN">'+options('subfamily','subfamilies')+options('genus','genera')+options('tribe','tribes')+'<span id="browse-count" class="browse-count" role="status" aria-live="polite"></span></section>';
}
function bindBrowseFilters(taxa,params,onDraw,names){
  const q=document.querySelector('#browse-q'),sf=document.querySelector('#subfamily-filter'),gf=document.querySelector('#genus-filter'),tf=document.querySelector('#tribe-filter');
  q.value=params.get('q')||'';
  sf.value=params.get('subfamily')||'';
  gf.value=params.get('genus')||'';
  tf.value=params.get('tribe')||'';
  function update(){
    const needle=q.value.trim().toLowerCase(),subfamily=sf.value,genus=gf.value,tribe=tf.value;
    const filtered=taxa.filter(t=>{
      const searchable=[t.vsn,t.scientific_name,t.authorship,t.chinese_name,t.genus,t.tribe,t.subfamily,rankCN(names,'genera',t.genus),rankCN(names,'tribes',t.tribe),...(t.former_chinese_names||[])].join(' ').toLowerCase();
      return (!needle||searchable.includes(needle))&&(!subfamily||t.subfamily===subfamily)&&(!genus||t.genus===genus)&&(!tribe||t.tribe===tribe);
    });
    onDraw(filtered,Boolean(needle||subfamily||genus||tribe));
  }
  [q,sf,gf,tf].forEach(el=>el.addEventListener('input',update));
  update();
}
function groupByKey(taxa,key){
  const groups=new Map();
  for(const t of taxa){
    const name=String(t[key]||'').trim();
    if(!name)throw new Error('Taxon '+t.vsn+' lacks '+key);
    if(!groups.has(name))groups.set(name,[]);
    groups.get(name).push(t);
  }
  return [...groups].sort(([a],[b])=>a.localeCompare(b,'en'));
}
function genusDisclosure(name,rows,expanded=false,totalSpecies=rows.length,names=null){
  const species=rows.slice().sort((a,b)=>a.scientific_name.localeCompare(b.scientific_name,'en'));
  return '<details class="taxonomy-group genus-group"'+(expanded?' open':'')+'><summary><span class="group-label"><span class="scientific">'+esc(name)+'</span>'+(rankCN(names,'genera',name)?' <span class="higher-taxon-cn" lang="zh-Hans">'+esc(rankCN(names,'genera',name))+'</span>':'')+' · <span class="group-count">'+totalSpecies+' species</span></span></summary><div class="taxonomy-group-body">'+species.map(speciesResult).join('')+'</div></details>';
}
async function groupedBrowse(mode,params=new URLSearchParams()){
  const [taxa,names]=await Promise.all([getJSON('data/taxa.json'),rankData()]);
  const byTribe=mode==='tribes',groups=groupByKey(taxa,byTribe?'tribe':'genus');
  const title=byTribe?'Browse by tribe':'Browse by genus';
  const total=groups.length,kind=byTribe?'tribes':'genera';
  const fullGenusCounts=new Map(groupByKey(taxa,'genus').map(([name,rows])=>[name,rows.length]));
  const fullTribeGroups=new Map(groupByKey(taxa,'tribe'));
  app.innerHTML='<section class="taxonomy-banner"><div class="eyebrow">Browse taxa</div><h1>'+title+'</h1><p class="subtitle">'+total+' '+kind+' and '+taxa.length+' published taxon profiles. Select a '+(byTribe?'tribe, then a genus':'genus')+' to view its species. Current coverage: Scolytinae only.</p></section>'+browseViewTabs(mode)+browseFilters(taxa,names)+'<section class="grouped-browser" aria-label="'+title+'"><p class="grouped-intro">Alphabetical '+(byTribe?'tribe and genus':'genus')+' listing. Each species links to its full taxon profile. Group counts always show totals in the database, not filtered matches.</p><div id="browse-results"></div></section>';
  showBackToTop();
  const count=document.querySelector('#browse-count'),out=document.querySelector('#browse-results');
  bindBrowseFilters(taxa,params,(rows,active)=>{
    if(!rows.length){
      count.textContent='No matches';
      out.innerHTML='<p class="notice">No taxa match the current filters.</p>';
      return;
    }
    if(byTribe){
      const selected=groupByKey(rows,'tribe');
      count.textContent=active?'Filtered results':total+' tribes · '+fullGenusCounts.size+' genera · '+taxa.length+' taxa';
      out.innerHTML=selected.map(([tribe,species])=>{
        const genera=groupByKey(species,'genus');
        const allTribeRows=fullTribeGroups.get(tribe);
        const allTribeGenera=new Set(allTribeRows.map(t=>t.genus)).size;
        return '<details class="taxonomy-group tribe-group"'+(active?' open':'')+'><summary><span class="group-label">'+rankHTML(tribe,rankCN(names,'tribes',tribe))+' · <span class="group-count">'+allTribeGenera+' '+(allTribeGenera===1?'genus':'genera')+' · '+allTribeRows.length+' species</span></span></summary><div class="taxonomy-group-body">'+genera.map(([name,group])=>genusDisclosure(name,group,active,fullGenusCounts.get(name),names)).join('')+'</div></details>';
      }).join('');
    }else{
      const selected=groupByKey(rows,'genus');
      count.textContent=active?'Filtered results':total+' genera · '+taxa.length+' taxa';
      out.innerHTML=selected.map(([name,species])=>genusDisclosure(name,species,active,fullGenusCounts.get(name),names)).join('');
    }
  },names);
}
async function browseRegions(params=new URLSearchParams()){
  const [taxa,index]=await Promise.all([getJSON('data/taxa.json'),getJSON('data/region-index.json')]);
  const byVSN=new Map(taxa.map(t=>[t.vsn,t]));
  const regions=index.regions.filter(r=>r.count>0);
  app.innerHTML='<section class="taxonomy-banner"><div class="eyebrow">Browse taxa</div><h1>Browse by region</h1><p class="subtitle">Literature-reported occurrences based on named regions in published distribution summaries. Records may be incomplete or pending review. Species without a named regional record remain in the checklist; not appearing in a regional list does not imply absence. Check the original evidence in each species profile.</p></section><section class="browse-tools"><input type="search" id="region-q" placeholder="Search region (e.g. Sichuan or 四川)" aria-label="Search province or region"><select id="region-select" aria-label="Select region"><option value="">All regions</option>'+regions.map(r=>'<option value="'+esc(r.name)+'">'+esc(r.name)+' · '+esc(r.chinese)+'</option>').join('')+'</select><span id="region-count" role="status" aria-live="polite"></span></section><div id="region-results"></div>';
  showBackToTop();
  const q=document.querySelector('#region-q'),select=document.querySelector('#region-select'),out=document.querySelector('#region-results'),count=document.querySelector('#region-count');
  const initial=params.get('q')||params.get('region')||'';
  q.value=initial;
  function draw(){
    const query=q.value.trim().normalize('NFKC').toLowerCase();
    const selected=select.value;
    const matches=regions.filter(r=>(!selected||r.name===selected)&&(!query||[r.name,r.chinese,...r.aliases].some(x=>x.normalize('NFKC').toLowerCase().includes(query))));
    count.textContent=matches.length+' regions';
    out.innerHTML=matches.length?matches.map(r=>{
      const entries=r.records.map(item=>{
        const t=byVSN.get(item.vsn);
        if(!t)return '';
        const state=item.occurrence_assessment;
        return '<a class="result" href="'+taxonUrl(t.vsn)+'"><strong>'+sci(t.scientific_name)+' '+esc(t.authorship)+'</strong><br><small>'+esc(t.chinese_name||'')+' · '+esc(t.vsn)+' · '+esc(t.tribe)+' · '+esc(item.assessment_scope)+': '+esc(state)+' · '+esc(item.review_status)+'</small></a>';
      }).join('');
      return '<details class="taxonomy-group"'+(query||selected?' open':'')+'><summary><span class="group-label">'+esc(r.name)+' <span class="higher-taxon-cn" lang="zh-Hans">'+esc(r.chinese)+'</span> · <span class="group-count">'+r.count+' reported species</span></span></summary><div class="taxonomy-group-body">'+(entries||'<p class="notice">No explicitly indexed records for this region.</p>')+'</div></details>';
    }).join(''):'<p class="notice">No matching region. Try the English or Chinese province name.</p>';
  }
  q.addEventListener('input',draw);select.addEventListener('change',draw);draw();
}

async function invasiveSpecies(){
  const taxa=await getJSON('data/taxa.json');
  const rows=taxa.filter(t=>t.invasive_status==='Invasive').sort((a,b)=>a.scientific_name.localeCompare(b.scientific_name,'en'));
  app.innerHTML='<section class="taxonomy-banner" id="invasive-top"><div class="eyebrow">Species of interest</div><h1>Non-native invasive species</h1><p class="subtitle">'+rows.length+' taxa not native to China and currently flagged as invasive in this checklist. Select a species to view its profile. Invasive designation is independent of profile review status.</p></section><section class="invasive-list" aria-label="Invasive species list">'+(rows.length?rows.map(speciesResult).join(''):'<p class="notice">No invasive species are currently flagged.</p>')+'</section>';
  showBackToTop('invasive-top');
}

async function browse(params=new URLSearchParams()){
  const [taxa,meta,names]=await Promise.all([getJSON('data/taxa.json'),getJSON('data/site-meta.json'),rankData()]);
  app.innerHTML='<section class="taxonomy-banner"><div class="eyebrow">Browse taxa</div><h1>Checklist taxa</h1><p class="subtitle">Current taxonomic coverage: <strong>'+esc(meta.current_taxonomic_coverage.join(', '))+'</strong>. Platypodinae is not yet integrated.</p></section>'+browseViewTabs('browse')+browseFilters(taxa,names)+'<div id="browse-results"></div>';
  showBackToTop();
  const out=document.querySelector('#browse-results'),count=document.querySelector('#browse-count');
  bindBrowseFilters(taxa,params,rows=>{
    count.textContent=rows.length+' taxa';
    out.innerHTML=rows.length?rows.map(speciesResult).join(''):'<p class="notice">No taxa match the current filters.</p>';
  },names);
}

async function taxon(vsn){if(!vsn){app.innerHTML='<p class="notice">Missing VSN.</p>';return;}try{const [t,taxa,names]=await Promise.all([getJSON('data/species/'+encodeURIComponent(vsn)+'.json'),getJSON('data/taxa.json'),rankData()]);const siteEntry=taxa.find(x=>x.vsn===vsn);if(siteEntry?.recommended_chinese_name){t.chinese_name=siteEntry.chinese_name;t.recommended_chinese_name=siteEntry.recommended_chinese_name;t.former_chinese_names=siteEntry.former_chinese_names||[];}const idx=taxa.findIndex(x=>x.vsn===vsn);const prev=idx>0?taxa[idx-1]:null;const next=idx>=0&&idx<taxa.length-1?taxa[idx+1]:null;const isReviewed=String(t.review_status||'').toLowerCase()==='reviewed';const distLabel=isReviewed?'Current reviewed distribution:':'Distribution evidence (not yet reviewed):';const distSummary=(t.distribution?.summary||'').trim()||(isReviewed?'No reviewed distribution summary available.':'No reviewed distribution summary is available yet.');const occ=Object.entries(t.china_occurrence||{}).map(([k,v])=>'<li class="'+(v==='Present'?'present':'')+'">'+esc(k)+' — '+esc(v)+'</li>').join('');const hosts=(t.hosts||[]).map(h=>'<li>'+sci(h.scientific_name)+(h.currently_accepted_as?' (currently accepted as '+sci(h.currently_accepted_as)+')':'')+(h.family?' ('+esc(h.family)+')':'')+'</li>').join('');const refMap=Object.fromEntries((t.references||[]).filter(r=>r.id).map(r=>[r.id,r]));const refLinks=ids=>(ids||[]).map(id=>refMap[id]).filter(Boolean).map(r=>'<button type="button" class="inline-ref ref-jump" data-ref-jump="'+esc(r.id)+'">'+esc(r.label||r.citation)+'</button>').join('; ');const hist=(t.taxonomic_history||[]).map(x=>'<div class="evidence"><strong>'+esc(x.year)+' — '+esc(x.event)+'</strong><br>'+sci(x.name)+' '+esc(x.authorship||'')+'<p>'+scientificText(x.note||'',t)+'</p>'+(x.reference_ids?.length?'<p class="event-sources"><span>Source'+(x.reference_ids.length>1?'s':'')+':</span> '+refLinks(x.reference_ids)+'</p>':'')+'</div>').join('');const formerNames=Array.isArray(t.former_chinese_names)?t.former_chinese_names.filter(Boolean):[];
const statusBadges='<span class="pill">'+esc(t.checklist_status)+'</span>'+(t.review_status?'<span class="pill">'+esc(t.review_status)+'</span>':'')+(t.invasive_status==='Invasive'?'<span class="pill pill-invasive" title="Invasive species">Invasive</span>':'');
const commonNameHeader=t.recommended_chinese_name
  ?'<div class="primary-line"><span class="name-label">中文名</span><strong class="rec-name">'+esc(t.recommended_chinese_name)+'</strong>'+statusBadges+'</div>'+(formerNames.length?'<div class="former-line"><span class="former-label">曾用／其他中文名</span><span class="former-names">'+formerNames.map(esc).join('<span class="separator">·</span>')+'</span></div>':'')
  :'<div class="meta"><span>'+(t.chinese_name?esc(t.chinese_name):'Chinese name not assigned')+'</span>'+statusBadges+'</div>';
const commonNameOverview=t.recommended_chinese_name
  ?'<dt>Chinese name</dt><dd><strong>'+esc(t.recommended_chinese_name)+'</strong></dd>'+(formerNames.length?'<dt>Former / alternative names</dt><dd>'+formerNames.map(esc).join('；')+'</dd>':'')
  :'<dt>Chinese name</dt><dd>'+(t.chinese_name?esc(t.chinese_name):'Not assigned')+'</dd>';
const higherTaxonCN=(t.higher_taxon_chinese_names?.approved_for_display===true||(t.vsn==='VSN_3401'&&t.higher_taxon_chinese_names?.pilot_preview_authorized===true))?t.higher_taxon_chinese_names:null;const genusCN=rankCN(names,'genera',t.genus)||String(higherTaxonCN?.genus||'').trim();const tribeCN=rankCN(names,'tribes',t.tribe)||String(higherTaxonCN?.tribe||'').trim();
const refs=(t.references||[]).map(r=>'<div class="ref"'+(r.id?' id="ref-'+esc(r.id)+'"':'')+'><strong>'+scientificText(r.citation,t)+'</strong>'+(r.role?.length?'<br><small class="ref-role">Used for: '+esc(r.role.join(', '))+'</small>':'')+(r.doi?'<br><a href="https://doi.org/'+esc(r.doi)+'" target="_blank" rel="noopener">DOI: '+esc(r.doi)+'</a>':'')+'</div>').join('');app.innerHTML='<section class="taxonomy-banner" id="profile-top"><div class="eyebrow taxon-breadcrumb"><a href="'+SITE_ROOT+'#/browse?subfamily='+encodeURIComponent(t.subfamily)+'">'+esc(t.subfamily)+'</a><span>·</span><a href="'+SITE_ROOT+'#/browse?tribe='+encodeURIComponent(t.tribe)+'">'+esc(t.tribe)+'</a><span>·</span><span>'+esc(t.vsn)+'</span></div><h1>'+sci(t.scientific_name)+' '+esc(t.authorship)+'</h1>'+commonNameHeader+'</section><div class="profile-layout"><aside class="profile-sidebar"><div class="sidebar-title">On this page</div><button data-jump="overview">Overview</button><button data-jump="distribution">Distribution</button><button data-jump="hosts">Hosts</button><button data-jump="taxonomy">Taxonomy & nomenclature</button><button data-jump="resources">Data resources</button><button data-jump="review">Review</button><button data-jump="references">References</button><a class="sidebar-issue" target="_blank" rel="noopener" href="https://github.com/dongyiyi/china-scolytinae-database-feedback/issues/new?title='+encodeURIComponent('Record issue: '+t.vsn+' — '+t.scientific_name)+'&body='+encodeURIComponent('Taxon: '+t.vsn+' — '+t.scientific_name+'\n\nPlease describe the issue, missing source, or suggested correction:\n')+'">Report an issue with this record</a></aside><section class="grid profile-content"><article class="card" id="overview"><h2>At a glance</h2><dl class="kv"><dt>Accepted name</dt><dd>'+sci(t.scientific_name)+' '+esc(t.authorship)+'</dd>'+commonNameOverview+'<dt>Subfamily</dt><dd>'+esc(t.subfamily)+'</dd>'+'<dt>Genus</dt><dd>'+rankHTML(t.genus,genusCN,true)+'</dd>'+'<dt>Tribe</dt><dd>'+esc(t.tribe)+(tribeCN?' <span class="higher-taxon-cn" lang="zh-Hans">'+esc(tribeCN)+'</span>':'')+'</dd></dl></article><article class="card"><h2>China occurrence</h2><ul class="status-list">'+occ+'</ul></article><article class="card full" id="distribution"><h2>Distribution</h2><p><strong>'+esc(distLabel)+'</strong> '+esc(distSummary)+'</p><p>'+scientificText(t.distribution.narrative,t)+'</p>'+(t.distribution?.reference_ids?.length?'<p class="event-sources"><span>Source:</span> '+refLinks(t.distribution.reference_ids)+'</p>':'')+'</article><article class="card full" id="hosts"><h2>Hosts</h2><ul>'+hosts+'</ul><p>'+scientificText(t.host_note,t)+'</p>'+(Array.isArray(t.hosts)&&t.hosts.some(h=>h.reference_ids?.length)?'<p class="event-sources"><span>Sources:</span> '+refLinks([...new Set(t.hosts.flatMap(h=>h.reference_ids||[]))])+'</p>':'')+(Array.isArray(t.hosts)&&t.hosts.some(h=>h.name_reference_ids?.length)?'<p class="event-sources"><span>Host-name source:</span> '+refLinks([...new Set(t.hosts.flatMap(h=>h.name_reference_ids||[]))])+'</p>':'')+'</article><article class="card full" id="taxonomy"><h2>Taxonomy and nomenclature</h2><p>'+scientificText(t.taxonomy_summary,t)+'</p>'+(t.taxonomy_reference_ids?.length?'<p class="taxonomy-sources"><strong>Taxonomic sources:</strong> '+refLinks(t.taxonomy_reference_ids)+'</p>':'')+hist+'<p class="notice">'+scientificText(t.nomenclature_note,t)+(t.nomenclature_note_reference_ids?.length?'<br><span class="note-sources">Source: '+refLinks(t.nomenclature_note_reference_ids)+'</span>':'')+'</p></article><article class="card full" id="resources"><details class="resource-disclosure"><summary><span><strong>Data resources</strong><small>Images, specimens, molecular data, and symbionts</small></span></summary><div class="resource-body"><p class="resource-note">These resource categories are being integrated progressively. Select a category to view the records currently linked to this taxon.</p><div class="resource-tabs" role="tablist" aria-label="Data resource categories"><button type="button" class="resource-tab" data-resource="images" role="tab" aria-selected="false">Images</button><button type="button" class="resource-tab" data-resource="specimens" role="tab" aria-selected="false">Specimens</button><button type="button" class="resource-tab" data-resource="molecular" role="tab" aria-selected="false">Molecular data</button><button type="button" class="resource-tab" data-resource="symbionts" role="tab" aria-selected="false">Symbionts</button></div><div class="resource-panel" aria-live="polite"><span class="resource-placeholder">Select a resource category.</span></div></div></details></article><article class="card full" id="review"><h2>Review status</h2><dl class="kv"><dt>Last reviewed</dt><dd>'+esc(t.provenance?.last_reviewed||'Not yet reviewed')+'</dd></dl><p class="review-note">This date records the most recent content review for this taxon. It is not a page-view timestamp.</p></article><article class="card full" id="references"><h2>References</h2>'+refs+'</article><nav class="profile-pager" aria-label="Taxon navigation"><a class="pager-button'+(!prev?' disabled':'')+'" '+(prev?'href="'+SITE_ROOT+'taxa/'+encodeURIComponent(prev.vsn)+'/"':'aria-disabled="true"')+'>&larr; Previous taxon</a><a class="pager-button" href="'+SITE_ROOT+'#/browse">Back to browse</a><a class="pager-button'+(!next?' disabled':'')+'" '+(next?'href="'+SITE_ROOT+'taxa/'+encodeURIComponent(next.vsn)+'/"':'aria-disabled="true"')+'>Next taxon &rarr;</a></nav></section></div>';document.querySelectorAll('.profile-sidebar [data-jump]').forEach(btn=>btn.addEventListener('click',()=>{const el=document.getElementById(btn.dataset.jump);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}));showBackToTop('profile-top');document.querySelectorAll('.ref-jump').forEach(btn=>btn.addEventListener('click',()=>{const el=document.getElementById('ref-'+btn.dataset.refJump);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});}));const resourceValues={images:t.resources?.images||'No image records are linked yet.',specimens:t.resources?.specimens||'No specimen records are linked yet.',molecular:t.resources?.molecular||'No molecular records are linked yet.',symbionts:t.resources?.symbionts||'No symbiont-association records are linked yet.'};const resourcePanel=document.querySelector('.resource-panel');document.querySelectorAll('.resource-tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.resource-tab').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false');});btn.classList.add('active');btn.setAttribute('aria-selected','true');resourcePanel.innerHTML='<p>'+scientificText(resourceValues[btn.dataset.resource],t)+'</p>';}));}catch(e){app.innerHTML='<p class="notice">Profile not found for <code>'+esc(vsn)+'</code>.</p>';}}
async function dataPage(){const [taxa,meta]=await Promise.all([getJSON('data/taxa.json'),getJSON('data/site-meta.json')]);const genera=new Set(taxa.map(t=>t.genus).filter(Boolean));const tribes=new Set(taxa.map(t=>t.tribe).filter(Boolean));app.innerHTML='<section class="taxonomy-banner"><div class="eyebrow">Data & coverage</div><h1>Database coverage</h1><p class="subtitle">'+esc(meta.coverage_note)+'</p></section><section class="grid"><article class="card third"><div class="eyebrow">Current profiles</div><h2>'+taxa.length+'</h2><p>Taxon profiles currently available in the database.</p></article><article class="card third"><div class="eyebrow">Genera represented</div><h2>'+genera.size+'</h2><p>Based on the current web index.</p></article><article class="card third"><div class="eyebrow">Tribes represented</div><h2>'+tribes.size+'</h2><p>Based on the current web index.</p></article><article class="card full"><h2>Taxonomic scope</h2><dl class="kv"><dt>Current coverage</dt><dd>'+esc(meta.current_taxonomic_coverage.join(', '))+'</dd><dt>Long-term scope</dt><dd>Scolytinae + Platypodinae</dd><dt>Platypodinae status</dt><dd>Not yet integrated</dd><dt>Stable identity key</dt><dd><code>'+esc(meta.identity_key)+'</code></dd></dl></article><article class="card full"><h2>Interpretation</h2><p>The project title reflects the intended long-term database scope. Platypodinae has not yet been integrated and should not be interpreted as part of the current taxonomic coverage.</p></article></section>';}
function methodsPage(){app.innerHTML='<section class="taxonomy-banner"><div class="eyebrow">Methods</div><h1>How the checklist is assembled</h1><p class="subtitle">The database combines historical Chinese checklist literature, a modern global taxonomic backbone, and recently published records from China.</p></section><section class="grid"><article class="card full"><h2>Checklist assembly</h2><p>An initial checklist of Chinese Scolytinae was assembled primarily from two major Chinese references: 殷蕙芬等 (1984) and 黄复生等 (2015). These works provided the historical baseline for names and records used in the project.</p></article><article class="card"><h2>Taxonomic update</h2><p>Accepted names and historical name usages were reconciled against the 2026 global Scolytinae checklist of Johnson et al., while the project retains stable VSN identifiers so that later name changes do not break taxon identity.</p></article><article class="card"><h2>Recent literature</h2><p>The checklist is updated with recently published literature reporting new species, new records, distribution evidence, host associations, and relevant taxonomic changes from China.</p></article><article class="card full"><h2>Data workflow</h2><p>Curation and review are carried out in a relational Notion database that links taxa, name usages, sources, source records, occurrence evidence, and species profiles. Reviewed records are then transformed into structured web data and presented through GitHub Pages. The GitHub site is therefore a presentation layer derived from the curated database rather than a separate taxonomy database.</p></article><article class="card full"><h2>Current scope</h2><p>The current implementation contains Scolytinae records only. Platypodinae remains a planned extension of the long-term project.</p></article></section>';}
function contributePage(){const form='https://app.notion.com/p/ydcn/0ca21aa2d32840b29a2cb93cffa03870?pvs=106';const template='assets/templates/china_scolytinae_platypodinae_public_submission_template.csv';const email='dongyiyi09@hotmail.com';app.innerHTML='<section class="taxonomy-banner"><div class="eyebrow">Contribute</div><h1>Contribute data</h1><p class="subtitle">Submit published taxonomic, distribution, host, occurrence, or correction evidence relevant to Chinese Scolytinae and Platypodinae. All submissions are reviewed before integration.</p></section><section class="grid"><article class="card full"><h2>Submit a single record</h2><p>Use the public submission form for one taxonomic or evidence record. If you do not know the project VSN, leave that field blank.</p><div class="contribute-actions"><a class="action-button" href="'+form+'" target="_blank" rel="noopener">Open submission form</a></div><div class="form-embed"><iframe src="'+form+'" title="Submit new taxonomic or occurrence evidence" loading="lazy"></iframe></div></article><article class="card full"><h2>Batch submissions</h2><p>For a publication or project containing many records, download the standard CSV template, enter one record per row, and email the completed file to us. You do not need to import anything into Notion.</p><div class="contribute-actions"><a class="action-button" href="'+template+'" download>Download batch CSV template</a><a class="action-button secondary" href="mailto:'+email+'?subject='+encodeURIComponent('China Scolytinae & Platypodinae batch submission')+'">Email completed CSV</a></div><p class="notice"><strong>Submission label:</strong> use <code>year–scientific name</code>. If you would like to be acknowledged as a contributor, you may optionally append your name after a vertical bar, for example <code>2026-Webbia yinae | Yiyi Dong</code>.</p></article><article class="card full"><h2>What happens next</h2><p>Submitted records enter a staging and review workflow before any update is made to the checklist, taxonomic backbone, or public profile.</p><p><code>Submitted → review → Validated → Approved → reconciliation → checklist/profile update → Integrated</code></p></article><article class="card full"><h2>Questions and small corrections</h2><p>For a small correction to an existing profile, you can use the profile&#39;s <strong>Report an issue with this record</strong> link. If you do not have a GitHub account, email <a href="mailto:'+email+'">'+email+'</a>.</p></article></section>';}
function citePage(){app.innerHTML='<section class="taxonomy-banner"><div class="eyebrow">Cite</div><h1>Citation and versioning</h1><p class="subtitle">Formal release citation information will be assigned when the reviewed public version is published.</p></section><section class="grid"><article class="card full"><h2>Development build</h2><p>This private prototype is not yet a citable database release.</p></article><article class="card"><h2>Planned release model</h2><p>Public releases will use explicit version numbers and archived snapshots. The current site architecture is designed to support a stable current website plus frozen citable releases.</p></article><article class="card"><h2>Taxonomic backbone citation</h2><p>Johnson et al. (2026), <em>ZooKeys</em> 1271: 1–285, DOI 10.3897/zookeys.1271.168928.</p></article></section>';}
async function about(){const a=await getJSON('data/about.json');const sections=(a.sections||[]).map(s=>'<article class="card full"><h2>'+esc(s.heading)+'</h2>'+s.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</article>').join('');const refs=(a.foundational_sources||[]).map(r=>'<div class="ref"><strong>'+esc(r.label)+'</strong><br>'+esc(r.citation)+(r.doi?'<br><a href="https://doi.org/'+esc(r.doi)+'" target="_blank" rel="noopener">DOI: '+esc(r.doi)+'</a>':'')+'</div>').join('');app.innerHTML='<section class="taxonomy-banner"><div class="eyebrow">About</div><h1>'+esc(a.title)+'</h1><p class="subtitle">'+esc(a.subtitle)+'</p></section><section class="grid">'+sections+'<article class="card full"><h2>Selected foundational sources</h2>'+refs+'</article></section>';}
async function render(){if(location.pathname===SITE_ROOT && location.hash==='#/')history.replaceState(history.state,'',location.pathname+location.search);const oldBackTop=document.querySelector('.back-to-top');if(oldBackTop)oldBackTop.remove();const m=location.pathname.match(/\/taxa\/(VSN_\d{4})\/?$/);if(m)return await taxon(m[1]);const r=currentRoute();try{if(r.path==='/')return await home();if(r.path==='/browse')return await browse(r.params);if(r.path==='/invasive')return await invasiveSpecies();if(r.path==='/regions')return await browseRegions(r.params);if(r.path==='/genera')return await groupedBrowse('genera',r.params);if(r.path==='/tribes')return await groupedBrowse('tribes',r.params);if(r.path==='/taxon')return await taxon(r.params.get('vsn'));if(r.path==='/data')return await dataPage();if(r.path==='/methods')return methodsPage();if(r.path==='/contribute')return contributePage();if(r.path==='/cite')return citePage();if(r.path==='/about')return about();app.innerHTML='<p class="notice">Page not found.</p>';}catch(e){app.innerHTML='<p class="notice">Page error: '+esc(e.message)+'</p>';}}
window.addEventListener('hashchange',render);render();