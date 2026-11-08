/* Mirror-only published taxon interface translations.
 * Original scientific data, literature evidence, statuses and Latin names are never translated.
 * Works with either source SPA; the source #app may be replaced asynchronously.
 */
(() => {
  'use strict';

  const ID = (location.pathname.match(/\/taxa\/((?:VSN_\d+)|(?:PLT_\d{6}))\/?$/) || [])[1];
  if (!ID) return;

  const KEY = 'china-beetle-home-language';
  const TERMS = {}; Object.assign(TERMS, {"China Scolytinae Database":"中国小蠹亚科数据库","China Platypodinae Database":"中国长小蠹亚科数据库","Home":"首页","All subfamilies":"联合主页","Scolytinae":"小蠹亚科","Platypodinae":"长小蠹亚科","Browse taxa":"浏览物种","Data & coverage":"数据与覆盖范围","Methods":"研究方法","Contribute":"提交数据","Cite":"引用","About":"关于","On this page":"本页导航","Overview":"概览","Distribution":"地理分布","Hosts":"寄主","Taxonomy & nomenclature":"分类与命名历史","Data resources":"数据资源","Review":"审核信息","References":"参考文献","Report an issue with this record":"报告问题","At a glance":"基本信息","Accepted name":"有效学名","Chinese name":"中文名","Former / alternative names":"曾用／其他中文名","Subfamily":"亚科","Genus":"属","Tribe":"族","China occurrence":"中国分布记录","Taxonomy and nomenclature":"分类与命名历史","Review status":"审核状态","Last reviewed":"最近审核","Sources:":"来源：","Source:":"来源：","Host-name source:":"寄主名称来源：","Taxonomic sources:":"分类学来源：","Images, specimens, molecular data, and symbionts":"图像、标本、分子数据与共生菌","Images":"图像","Specimens":"标本","Molecular data":"分子数据","Symbionts":"共生菌","Data resource categories":"数据资源类别","Select a resource category.":"请选择数据资源类别。","These resource categories are being integrated progressively. Select a category to view the records currently linked to this taxon.":"数据资源正在逐步整合。请选择类别查看目前与本物种关联的记录。","This date records the most recent content review for this taxon. It is not a page-view timestamp.":"此日期表示该物种资料最近一次内容审核时间，并非网页访问时间。","Previous taxon":"上一个物种","← Previous taxon":"← 上一个物种","Next taxon":"下一个物种","Next taxon →":"下一个物种 →","Back to browse":"返回浏览","Taxon navigation":"物种导航","Back to top":"返回顶部","↑ Back to top":"↑ 返回顶部","Current reviewed distribution:":"当前已审核分布：","Distribution evidence (not yet reviewed):":"分布证据：","Distribution:":"分布：","Website designed and developed by Yiyi Dong.":"网站由董乙乂设计与开发。","Website designed and developed by Yiyi Dong. Platypodinae remains provisionally scoped pending scientific QA.":"网站由董乙乂设计与开发。长小蠹亚科的收录范围仍为暂定，尚待进一步科学审核。","Taxonomic content maintained by Yiyi Dong and Wei Lin.":"分类学资料由董乙乂和林伟维护。","Taxonomic content maintained by Yiyi Dong.":"分类学资料由董乙乂维护。"});

  const SELECTORS = [
    '.site-header .brand',
    '.site-header nav a',
    '.profile-sidebar .sidebar-title',
    '.profile-sidebar [data-jump]',
    '.profile-sidebar .sidebar-issue',
    '.profile-content h2',
    '.profile-content dl.kv dt',
    '.profile-content .event-sources span',
    '.profile-content .taxonomy-sources strong',
    '.profile-content .note-sources',
    '.profile-content .resource-disclosure summary strong',
    '.profile-content .resource-disclosure summary small',
    '.profile-content .resource-note',
    '.profile-content .resource-tab',
    '.profile-content .resource-placeholder',
    '.profile-content .review-note',
    '.profile-content .profile-pager a',
    '.profile-content .profile-pager',
    '.profile-content #distribution > p > strong',
    '.back-to-top',
    'footer.site-footer',
    'footer.site-footer strong',
    'footer.site-footer span',
    'footer.site-footer .footer-left',
    'footer.site-footer .footer-meta div'
  ];

  // Footer dates come from the original source; translate their presentation
  // without changing the published review date or maintaining a duplicate value.
  const FOOTER_MONTHS = {
    January: 1, February: 2, March: 3, April: 4,
    May: 5, June: 6, July: 7, August: 8,
    September: 9, October: 10, November: 11, December: 12
  };

  function interfaceTranslation(text, el) {
    if (Object.hasOwn(TERMS, text)) return TERMS[text];
    // Leave all non-interface content unchanged, including scientific narratives.
    if (!el.closest('footer.site-footer')) return null;

    const updated = text.match(
      /^Feedback and corrections welcome\.\s*·\s*Last updated:\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/
    );
    if (updated && Object.hasOwn(FOOTER_MONTHS, updated[2])) {
      return '欢迎反馈与更正意见 · 最近更新：'
        + updated[3] + '年' + FOOTER_MONTHS[updated[2]] + '月'
        + Number(updated[1]) + '日';
    }
    // The Platypodinae source can briefly show its static ID footer before
    // its module replaces it. Keep the actual PLT identifier unchanged.
    if (/^China Platypodinae Database · PLT_\d{6}$/.test(text)) {
      return text.replace('China Platypodinae Database', TERMS['China Platypodinae Database']);
    }
    return null;
  }

  let language = 'en';
  try { language = localStorage.getItem(KEY) === 'zh' ? 'zh' : 'en'; } catch {}
  // Mirror-only, human-reviewed display translations embedded at build time.
  // The English data and references remain exactly as published upstream.
  const reviewedEl=document.getElementById('zh-reviewed-display-data');
  let REVIEWED={};
  if(reviewedEl){
    try {
      const payload=JSON.parse(reviewedEl.textContent||'{}');
      if(payload.taxon_id===ID && payload.fields && typeof payload.fields==='object')
        REVIEWED=payload.fields;
    }catch {}
  }
  const SCIENTIFIC_DISPLAY_SELECTORS={
    'distribution.summary':'#distribution > p:first-of-type',
    'distribution.narrative':'#distribution > p:nth-of-type(2)',
    'host_note':'#hosts > p:first-of-type',
    'taxonomy_summary':'#taxonomy > p:first-of-type',
    'nomenclature_note':'#taxonomy p.notice'
  };
  const displayOriginals=new WeakMap();
  function translateReviewedDisplays(){
    // Restrict to text nodes of fixed profile sections, never page-wide
    // replacement and never a source citation or a Latin name.
    for(const [field,selector] of Object.entries(SCIENTIFIC_DISPLAY_SELECTORS)){
      const record=REVIEWED[field];
      if(!record || typeof record.source!=='string'||typeof record.zh!=='string')
        continue;
      const element=document.querySelector(selector);
      if(!element)continue;
      const source=record.source;
      const current=element.textContent||'';
      if(!current.includes(source) && !current.includes(record.zh))continue;
      if(field==='distribution.summary'){
        // Preserve the bold reviewed-status label and replace only its
        // following plain text node. Do not alter an evidence citation.
        const strong=element.querySelector('strong');
        if(!strong)continue;
        for(const node of element.childNodes){
          if(node.nodeType!==Node.TEXT_NODE)continue;
          if(!displayOriginals.has(node))displayOriginals.set(node,node.nodeValue);
          const original=displayOriginals.get(node);
          if(!original.includes(source))continue;
          const next=language==='zh'?original.replace(source,record.zh):original;
          if(node.nodeValue!==next)node.nodeValue=next;
        }
      }else{
        // All other supported fields are plain, single-paragraph source
        // narratives. For safety, leave rich HTML or references untouched.
        const nodes=[...element.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE);
        if(nodes.length!==1 || element.children.length)continue;
        const node=nodes[0];
        if(!displayOriginals.has(node))displayOriginals.set(node,node.nodeValue);
        const original=displayOriginals.get(node);
        if(original.trim()!==source)continue;
        const next=language==='zh'?original.replace(source,record.zh):original;
        if(node.nodeValue!==next)node.nodeValue=next;
      }
    }
  }
  // VSN_1168: render the two port-of-entry book citations as genuine source
  // buttons linked to their existing bibliography entries, not gray plain text.
  // Source IDs and the click handlers remain those of the published English SPA.
  const PORT_CITATIONS={
    src_ef1984:"殷蕙芬等，1984",
    src_co2015:"黄复生、陆军，2015"
  };
  const portCitationOriginals=new WeakMap();
  function translatePortCitationButtons(){
    if(ID!=="VSN_1168")return;
    for(const [refId,label] of Object.entries(PORT_CITATIONS)){
      for(const btn of document.querySelectorAll('#distribution .ref-jump[data-ref-jump="'+refId+'"]')){
        if(!portCitationOriginals.has(btn))portCitationOriginals.set(btn,btn.textContent);
        const target=language==="zh"?label:portCitationOriginals.get(btn);
        if(btn.textContent!==target)btn.textContent=target;
      }
    }
  }
  const originals = new WeakMap();
  const originalLabels = new WeakMap();
  const initialTitle = document.title;
  // Only the reviewed pilot profiles have an approved Chinese page title.
  // Keep other scientific names and English title strings as published.
  const PILOT_TITLES = {
    VSN_1168: '枣核椰小蠹（Coccotrypes dactyliperda）｜中国小蠹亚科数据库',
    PLT_000062: 'Platypus afzeliae｜中国长小蠹亚科数据库'
  };
  const chineseTitle = PILOT_TITLES[ID] || initialTitle;

  let observer = null;
  let pending = false;
  let applying = false;

  function translateExactText(el) {
    // Only alter direct text nodes of known interface elements; never touch
    // scientific data fields, author names, historical event notes, or citations.
    for (const node of el.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      if (!originals.has(node)) originals.set(node, node.nodeValue);
      const raw = originals.get(node);
      const text = raw.trim();
      const replacement = interfaceTranslation(text, el);
      if (replacement === null) continue;
      const start = raw.indexOf(text);
      const updated = language === 'zh'
        ? raw.slice(0, start) + replacement + raw.slice(start + text.length)
        : raw;
      if (node.nodeValue !== updated) node.nodeValue = updated;
      if (language === 'zh') {
        el.setAttribute('lang', 'zh-CN');
      } else if (el.getAttribute('lang') === 'zh-CN') {
        el.removeAttribute('lang');
      }
    }
  }

  function translateAttrs(el) {
    if (!originalLabels.has(el)) {
      originalLabels.set(el, {
        'aria-label': el.getAttribute('aria-label'),
        'title': el.getAttribute('title')
      });
    }
    const originals = originalLabels.get(el);
    for (const attr of ['aria-label', 'title']) {
      const original = originals[attr];
      if (!original || !Object.hasOwn(TERMS, original)) continue;
      const updated = language === 'zh' ? TERMS[original] : original;
      if (el.getAttribute(attr) !== updated) el.setAttribute(attr, updated);
    }
  }

  function render() {
    if (applying) return;
    applying = true;
    if (observer) observer.disconnect();
    try {
      const note = document.getElementById('zh-editorial-note');
      if (note) note.hidden = language !== 'zh';
      document.title = language === 'zh' ? chineseTitle : initialTitle;
      const control = document.getElementById('profile-language-control');
      if (control) {
        for (const button of control.querySelectorAll('button')) {
          const selected = button.dataset.lang === language;
          button.setAttribute('aria-pressed', String(selected));
          button.style.fontWeight = selected ? '700' : '400';
          button.style.textDecoration = selected ? 'underline' : 'none';
        }
      }
      for (const selector of SELECTORS) {
        for (const el of document.querySelectorAll(selector)) {
          translateExactText(el);
          translateAttrs(el);
        }
      }
      for (const el of document.querySelectorAll(
        '.profile-content .resource-tabs, .profile-pager, .profile-sidebar'
      )) translateAttrs(el);
      translateReviewedDisplays();
      translatePortCitationButtons();
    } finally {
      applying = false;
      if (observer && document.body) {
        observer.observe(document.body, {childList:true,subtree:true});
      }
    }
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      render();
    });
  }

  function init() {
    const nav = document.querySelector('.site-header nav');
    if (!nav || !document.getElementById('app')) return;
    const control = document.createElement('span');
    control.id = 'profile-language-control';
    control.setAttribute('role', 'group');
    control.setAttribute('aria-label', 'Profile language / 物种页面语言');
    control.style.cssText = 'display:inline-flex;align-items:baseline;gap:12px;margin:0;padding:0;border:0;background:none;font-size:inherit;line-height:inherit;white-space:nowrap';
    for (const [label, value] of [['English','en'],['中文','zh']]) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.lang = value;
      btn.textContent = label;
      btn.style.cssText = 'cursor:pointer;appearance:none;border:0;border-radius:0;padding:0;margin:0;background:none;box-shadow:none;color:inherit;font:inherit;line-height:inherit;text-decoration:none';
      btn.addEventListener('click', () => {
        language = value;
        try { localStorage.setItem(KEY, value); } catch {}
        render();
        schedule();
      });
      control.append(btn);
    }
    nav.append(control);
    observer = new MutationObserver(schedule);
    window.addEventListener('pageshow', schedule);
    render();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }
})();
