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
    'Scolytinae':'小蠹亚科',
    'Platypodinae':'长小蠹亚科',
    'China Platypodinae Database':'中国长小蠹亚科数据库',
    'Home':'首页', 'All subfamilies':'联合主页', 'Browse taxa':'浏览物种',
    'Data & coverage':'数据与覆盖范围','Methods':'研究方法','Contribute':'提交数据','Cite':'引用','About':'关于',
    'China checklist':'中国物种名录',
    'China checklist · Evidence-qualified profiles':'中国物种名录 · 基于文献证据的物种档案',
    'An evidence-based resource linking accepted taxa, historical name usages, Chinese occurrence records, hosts, sources and provenance through stable VSN identifiers.':'基于文献证据，利用稳定的 VSN 标识符关联接受种、历史名称用法、中国分布记录、寄主、参考文献及数据来源。',
    'Two distinct subfamilies of Curculionidae, each maintained as an independent checklist with stable taxon identifiers and literature-based evidence.':'象甲科的两个独立亚科分别维护各自的物种名录，采用稳定的分类单元标识符，并提供可追溯的文献证据。',
    'Explore published Chinese Platypodinae taxon profiles, nomenclatural histories, provincial distribution records, host associations and linked literature. Taxonomic and occurrence reviews remain ongoing.':'浏览中国长小蠹亚科的已公开物种档案、命名历史、省级分布、寄主及相关文献。分类与分布记录仍在持续审核中。',
    'Associated manuscript':'相关论文',
    'Submitted to':'已投稿至',
    '(October 2026). Not yet peer-reviewed or published.':'（2026年10月）。尚未经过同行评审或正式发表。',
    'Database version':'数据库版本',
    'Release archive':'版本发布归档',
    'v1.0.0 · 577 accepted species':'v1.0.0 · 577 个接受种',
    'Dong, Y., Lin, W. & Li, Y.':'Dong, Y., Lin, W. & Li, Y.',
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
    'Profiles are evidence-qualified and remain subject to ongoing taxonomic review.':'物种档案均依据已有证据整理，分类学审核仍在进行中。',
    'Website designed and developed by Yiyi Dong. Separate subfamily datasets and permanent IDs are maintained independently.':'网站由董乙乂设计与开发。两个亚科的数据集与永久标识符独立维护。',
    'Website designed and developed by Yiyi Dong.':'网站由董乙乂设计与开发。',
    'Website designed and developed by Yiyi Dong. Platypodinae remains provisionally scoped pending scientific QA.':'网站由董乙乂设计与开发。长小蠹亚科数据库仍为暂定版本，尚待进一步科学审核。',
    'Platypodinae remains provisionally scoped pending scientific QA.':'长小蠹亚科数据库仍为暂定版本，尚待进一步科学审核。',
    'Feedback and corrections welcome. · Last updated: 28 October 2026':'欢迎反馈与勘误 · 最后更新：2026年10月28日',
    'Feedback and corrections welcome. · Last updated: 18 October 2026':'欢迎反馈与勘误 · 最后更新：2026年10月18日',
    'Taxonomic content maintained by Yiyi Dong.':'分类学内容由董乙乂维护。',
    'Taxonomic content maintained by Yiyi Dong and Wei Lin.':'分类学内容由董乙乂和林伟维护。',
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
    'Search published taxa':'搜索已公开物种',
    'Search scientific or Chinese names, genus, tribe, author or ID':'搜索学名、中文名、属名、族名、命名人或 ID',
  };

  // Preserve each source-language DOM text node so toggling is reversible.
  const originalText = new WeakMap();
  const originalInput = new WeakMap();
  const homepage = () => site === 'portal' || ['', '#', '#/'].includes(location.hash) || location.hash.startsWith('#/?');
  let lang;
  try { lang = localStorage.getItem(KEY) === 'zh' ? 'zh' : 'en'; } catch { lang='en'; }
  let observer=null;
  let scheduled=false;
  let applying=false;
  function replaceNode(node, chinese) {
    if (!originalText.has(node)) originalText.set(node,node.nodeValue);
    const english=originalText.get(node);
    const word=english.trim();
    if (!word) return;
    let translated=terms[word];
    if (translated===undefined && /^\\d+ matching species$/.test(word)) {
      translated=word.replace(' matching species',' 个匹配物种');
    }
    if (translated===undefined) return;
    const start=english.indexOf(word);
    const prefix=english.slice(0,start), suffix=english.slice(start+word.length);
    const expected=chinese ? prefix + translated + suffix : english;
    if(node.nodeValue!==expected) node.nodeValue=expected;
  }
  function translateRegion(root,chinese){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes) replaceNode(node,chinese);
    root.querySelectorAll('input[placeholder], input[aria-label]').forEach(input=>{
      if(!originalInput.has(input)) originalInput.set(input,{placeholder:input.getAttribute('placeholder'),label:input.getAttribute('aria-label')});
      const prior=originalInput.get(input);
      for(const [attr,english] of [['placeholder',prior.placeholder],['aria-label',prior.label]]){
        if(english===null)continue;
        const expected=chinese ? (terms[english] ?? english) : english;
        if(input.getAttribute(attr)!==expected)input.setAttribute(attr,expected);
      }
    });
  }
  function update(){
    if(applying)return;
    applying=true;
    if(observer)observer.disconnect();
    try{
      const onHome=homepage();
      const chinese=onHome && lang==='zh';
      document.documentElement.lang=chinese?'zh-CN':'en';
      const control=document.querySelector('#home-language-control');
      if(control){
        control.hidden=!onHome;
        for(const btn of control.querySelectorAll('button')){
          const selected=btn.dataset.lang===lang;
          btn.setAttribute('aria-pressed',String(selected));
          btn.style.fontWeight=selected?'700':'400';
          btn.style.textDecoration=selected?'underline':'none';
        }
      }
      for(const root of document.querySelectorAll('.site-header, .site-footer, main > .hero, main > .grid, main > .notice, main > .muted')){
        if(root.id==='home-language-control')continue;
        translateRegion(root,chinese);
      }
    }finally{
      applying=false;
      if(observer)observer.observe(document.body,{subtree:true,childList:true});
    }
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      update();
    });
  }
  function init(){
    const nav=document.querySelector('.site-header nav');
    if(nav && !document.querySelector('#home-language-control')){
      const control=document.createElement('span');
      control.id='home-language-control';
      control.setAttribute('role','group');
      control.setAttribute('aria-label','Homepage language / 首页语言');
      control.style.cssText='display:inline-flex;align-items:baseline;gap:12px;margin:0;padding:0;border:0;background:none;font-size:inherit;line-height:inherit;white-space:nowrap';
      for(const [label,value] of [['English','en'],['中文','zh']]){
        const btn=document.createElement('button');
        btn.type='button';
        btn.dataset.lang=value;
        btn.textContent=label;
        btn.style.cssText='cursor:pointer;appearance:none;border:0;border-radius:0;padding:0;margin:0;background:none;box-shadow:none;color:inherit;font:inherit;line-height:inherit;text-decoration:none';
        btn.addEventListener('click',()=>{
          lang=value;
          try { localStorage.setItem(KEY,value); } catch {}
          // Translate on the same click, without waiting for a navigation or reload.
          update();
          // Reapply once after a scheduled home-page render.
          schedule();
        });
        control.append(btn);
      }
      nav.append(control);
    }
    observer=new MutationObserver(schedule);
    window.addEventListener('hashchange',schedule);
    window.addEventListener('pageshow',schedule);
    update();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
