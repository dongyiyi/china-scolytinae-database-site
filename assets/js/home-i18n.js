/* Homepage-only bilingual interface. Taxon routes, data and URLs are unchanged. */
(() => {
  'use strict';
  const KEY = 'china-beetle-home-language';
  const site = location.pathname.includes('china-scolytinae-database-site') ? 'scol' :
    location.pathname.includes('china-platypodinae-database-site') ? 'plat' : 'portal';
  const home = () => site === 'portal' || !location.hash || location.hash === '#' || location.hash === '#/' || location.hash.startsWith('#/?');
  const terms = {
    'China Scolytinae & Platypodinae Database':'中国小蠹亚科与长小蠹亚科数据库',
    'China Scolytinae Database':'中国小蠹亚科数据库',
    'China Platypodinae Database':'中国长小蠹亚科数据库',
    'Home':'首页', 'All subfamilies':'联合主页', 'Browse taxa':'浏览物种',
    'Data & coverage':'数据与覆盖范围','Methods':'研究方法','Contribute':'提交数据','Cite':'引用','About':'关于',
    'China checklist':'中国物种名录',
    'China checklist · Evidence-qualified profiles':'中国物种名录 · 基于文献证据的物种档案',
    'An evidence-based resource linking accepted taxa, historical name usages, Chinese occurrence records, hosts, sources and provenance through stable VSN identifiers.':'基于文献证据，利用稳定的 VSN 标识符关联接受种、历史名称用法、中国分布记录、寄主、参考文献及数据来源。',
    'Two distinct subfamilies of Curculionidae, each maintained as an independent checklist with stable taxon identifiers and literature-based evidence.':'象甲科的两个独立亚科分别维护各自的物种名录，采用稳定的分类单元标识符，并提供可追溯的文献证据。',
    'Explore published Chinese Platypodinae taxon profiles, nomenclatural histories, provincial distribution records, host associations and linked literature. Taxonomic and occurrence reviews remain ongoing.':'浏览中国长小蠹亚科的已公开物种档案、命名历史、省级分布、寄主及相关文献。分类与分布记录仍在持续审核中。',
    'Search':'搜索',
    'Explore Platypodinae:':'浏览长小蠹亚科：',
    'You can access the separate Platypodinae database directly using the card below. Species profiles are currently under review.':'可通过下方入口访问独立的长小蠹亚科数据库。物种档案仍在审核中。',
    'Current profiles':'当前物种档案',
    'Genera represented':'收录属数',
    'Tribes represented':'收录族数',
    'Species of interest':'关注物种',
    'Pest lists & invasiveness':'有害生物名录与入侵性',
    'Geographic records':'地理分布记录',
    'Geographic evidence':'地理分布证据',
    'Browse by region':'按地区浏览',
    'Related subfamily':'相关亚科',
    'Explore Platypodinae':'浏览长小蠹亚科',
    'Explore Scolytinae':'浏览小蠹亚科',
    'Browse all taxon profiles.':'浏览全部物种档案。',
    'Expand genera to view species lists.':'按属展开查看物种列表。',
    'Explore tribes, genera, and species.':'按族、属及物种浏览。',
    'Species non-native to China and flagged as invasive in this database, together with taxa included in national forestry pest and plant quarantine lists.':'展示数据库中标记为入侵的中国非本地物种，以及列入国家林业有害生物和植物检疫名单的类群。',
    'Explore species reported from China’s provinces and regions.':'浏览中国各省级地区的物种分布记录。',
    'Visit the independent Platypodinae checklist. Species profiles are under review.':'访问独立的长小蠹亚科名录。物种档案仍在审核中。',
    'Published checklist':'已发布的物种名录',
    'Published provisional profiles':'已公开的暂定物种档案',
    'Browse reviewed and source-traceable bark and ambrosia beetle profiles.':'浏览经过审核、来源可追溯的小蠹和菌蠹物种档案。',
    'Browse 70 source-linked species profiles. Taxonomic and occurrence review remains ongoing.':'浏览附有文献来源的物种档案。分类及分布证据审核仍在进行中。',
    'Provisional':'暂定',
    'Evidence-qualified profiles':'基于证据的物种档案',
    'Browse all published species profiles.':'浏览所有已公开的物种档案。',
    'Browse by genus and expand species lists.':'按属浏览并展开物种列表。',
    'Browse by tribe, genus, and species.':'按族、属与物种浏览。',
    'Provisional placeholder featuring':'暂定展示物种',
    '. Comprehensive assessments and lists are not yet published.':'。完整的评估和名录尚未发布。',
    'Explore published region-level reports and their cited species profiles.':'浏览有文献依据的地区记录及其对应的物种档案。',
    'Visit the independent Scolytinae database.':'访问独立的小蠹亚科数据库。',
    'Profiles are evidence-qualified and remain subject to ongoing taxonomic review. An absent regional record does not indicate species absence.':'物种档案均依据已有证据整理，分类学审核仍在进行中。某地区缺少记录并不代表该物种在那里不存在。',
    'Website designed and developed by Yiyi Dong. Separate subfamily datasets and permanent IDs are maintained independently.':'网站由董一一设计与开发。两个亚科的数据集与永久标识符独立维护。',
    'Website designed and developed by Yiyi Dong.':'网站由董一一设计与开发。',
    'Platypodinae remains provisionally scoped pending scientific QA.':'长小蠹亚科数据库仍为暂定版本，尚待进一步科学审核。',
    'Feedback and corrections welcome. · Last updated: 28 October 2026':'欢迎反馈与勘误 · 最后更新：2026年10月28日',
    'Feedback and corrections welcome. · Last updated: 18 October 2026':'欢迎反馈与勘误 · 最后更新：2026年10月18日',
    'Taxonomic content maintained by Yiyi Dong.':'分类学内容由董一一维护。',
    'Taxonomic content maintained by Yiyi Dong and Wei Lin.':'分类学内容由董一一和林伟维护。',
    'No matching taxon in the current database.':'当前数据库中没有匹配的物种。',
    'No matching published species profile.':'没有匹配的已发布物种档案。',
    'Search indexes are unavailable.':'搜索索引暂不可用。',
    'Search indexes could not be loaded.':'搜索索引加载失败。',
    'One subfamily index could not be loaded; search may be incomplete.':'其中一个亚科的搜索索引加载失败，搜索结果可能不完整。',
    'Loading published count…':'正在加载物种数量…',
    'species':'种',
    'species profiles':'物种档案',
    'Search scientific or Chinese names, genus, tribe, author or ID':'搜索学名、中文名、属名、族名、命名人或 ID',
    'Search scientific or Chinese name, alternative name, genus, tribe, or PLT ID':'搜索学名、中文名、曾用名、属名、族名或 PLT ID',
    'Search scientific/Chinese names, former names, genus, tribe, or VSN':'搜索学名、中文名、曾用名、属名、族名或 VSN',
    'Search Platypodinae':'搜索长小蠹亚科',
  };
  const original = new WeakMap();
  const originalsAttr = new WeakMap();
  const translatedRoots = () => {
    const roots = [
      ...document.querySelectorAll('.site-header, .site-footer'),
      ...document.querySelectorAll('#app > .hero, #app > .grid, #app > .notice, main.shell > .hero, main.shell > .grid, main.shell > .muted')
    ];
    return roots;
  };
  function swapText(node, isZH) {
    if (!original.has(node)) original.set(node, node.nodeValue);
    const en = original.get(node);
    if (!en.trim()) return;
    const trimmed = en.trim();
    let zh = terms[trimmed];
    if (zh === undefined && /^\s*species\s*$/.test(en)) zh = '种';
    if (zh === undefined && /^\s*species profiles\s*$/.test(en)) zh = '物种档案';
    if (zh === undefined && /^\d+ matching species$/.test(trimmed)) zh = trimmed.replace(' matching species',' 个匹配物种');
    if (zh === undefined) return;
    const leading = en.match(/^\s*/)[0], trailing = en.match(/\s*$/)[0];
    const next = isZH ? leading + zh + trailing : en;
    if (node.nodeValue !== next) node.nodeValue = next;
  }
  function walk(root, isZH) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => swapText(n,isZH));
    root.querySelectorAll('input[placeholder], input[aria-label]').forEach(input => {
      if (!originalsAttr.has(input)) originalsAttr.set(input,{placeholder:input.getAttribute('placeholder'),label:input.getAttribute('aria-label')});
      const old=originalsAttr.get(input);
      for(const [attr,val] of [['placeholder',old.placeholder],['aria-label',old.label]]){
        if(val!==null) {const next=isZH ? (terms[val]||val) : val;if(input.getAttribute(attr)!==next)input.setAttribute(attr,next);}
      }
    });
  }
  let preferred;
  try { preferred = localStorage.getItem(KEY) || 'en'; } catch { preferred='en'; }
  if (!['zh','en'].includes(preferred)) preferred='en';
  let running=false;
  let observer;
  function apply() {
    if(running) return;
    running=true;
    if(observer)observer.disconnect();
    try {
      const isHome=home(),isZH=isHome&&preferred==='zh';
      document.documentElement.lang=isZH?'zh-CN':'en';
      const control=document.querySelector('#home-language-control');
      if(control){
        control.hidden=!isHome;
        control.querySelectorAll('button').forEach(btn=>{
          const active=btn.dataset.lang===preferred;
          btn.setAttribute('aria-pressed',String(active));
          btn.style.fontWeight=active?'700':'400';
          btn.style.background=active?'var(--panel, #e5ebf3)':'transparent';
        });
      }
      for(const root of translatedRoots())walk(root,isZH);
    } finally {
      running=false;
      if(observer)observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    }
  }
  function init(){
    const nav=document.querySelector('.site-header nav');
    if(nav){
      const wrap=document.createElement('span');
      wrap.id='home-language-control';
      wrap.setAttribute('role','group');
      wrap.setAttribute('aria-label','Homepage language / 首页语言');
      wrap.style.cssText='display:inline-flex;align-items:center;gap:3px;margin-left:8px;padding:3px;border:1px solid currentColor;border-radius:7px;font-size:.85rem;white-space:nowrap';
      for(const [label,lang] of [['English','en'],['中文','zh']]){
        const button=document.createElement('button');
        button.type='button';button.dataset.lang=lang;button.textContent=label;
        button.style.cssText='cursor:pointer;border:0;border-radius:4px;padding:5px 7px;color:inherit;font:inherit';
        button.addEventListener('click',()=>{preferred=lang;try{localStorage.setItem(KEY,lang)}catch{}apply()});
        wrap.append(button);
      }
      nav.append(wrap);
    }
    observer=new MutationObserver(()=>apply());
    window.addEventListener('hashchange',()=>queueMicrotask(apply));
    apply();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();