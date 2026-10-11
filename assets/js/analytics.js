/* GA4: a single manual page_view source for static and hash-routed pages. */
(function () {
  'use strict';
  const ID = 'G-D0LWTB7EKZ';
  const ROOT = '/china-scolytinae-database-site/';
  const BASE = location.origin + ROOT;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', ID, { send_page_view: false });

  function virtualPage() {
    const match = location.pathname.match(/\/taxa\/(VSN_\d{4})\/?$/);
    if (match) return { key: 'taxon:' + match[1], url: BASE + 'taxa/' + match[1] + '/', title: match[1] + ' — China Scolytinae & Platypodinae Database' };
    const hash = (location.hash.slice(1) || '/').split('?')[0];
    const sections = { '/': 'Home', '/browse': 'Browse taxa', '/data': 'Data & coverage', '/methods': 'Methods', '/contribute': 'Contribute', '/cite': 'Cite', '/about': 'About' };
    const params = new URLSearchParams((location.hash.split('?')[1] || ''));
    if (hash === '/taxon' && /^VSN_\d{4}$/.test(params.get('vsn') || '')) {
      const id = params.get('vsn');
      return { key: 'taxon:' + id, url: BASE + 'taxa/' + id + '/', title: id + ' — China Scolytinae & Platypodinae Database' };
    }
    const section = Object.prototype.hasOwnProperty.call(sections, hash) ? hash : '/';
    return { key: 'section:' + section, url: BASE + (section === '/' ? '' : '#' + section), title: sections[section] + ' — China Scolytinae & Platypodinae Database' };
  }

  let lastKey = null;
  function track() {
    const current = virtualPage();
    if (current.key === lastKey) return;
    lastKey = current.key;
    window.gtag('event', 'page_view', {
      page_location: current.url,
      page_title: current.title,
      page_referrer: document.referrer || undefined
    });
  }
  track();
  window.addEventListener('hashchange', track);
  window.addEventListener('popstate', track);
}());
