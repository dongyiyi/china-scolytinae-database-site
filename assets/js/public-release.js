const PUBLIC_FEEDBACK_REPO='https://github.com/dongyiyi/china-scolytinae-database-feedback';

function applyPublicReleaseUI(){
  const app=document.querySelector('#app');
  if(!app) return;

  const homeEyebrow=app.querySelector('.hero > .eyebrow');
  if(homeEyebrow && /private development preview/i.test(homeEyebrow.textContent||'')) homeEyebrow.textContent='China checklist';

  app.querySelectorAll('p, .notice').forEach(el=>{
    const text=(el.textContent||'').trim();
    if(text==='Taxon profiles currently exposed in the development dataset.') el.textContent='Taxon profiles currently available in the database.';
    if(text==='Profiles exposed in this private development build.') el.textContent='Taxon profiles currently available in the database.';
    if(text==='No matching taxon in the current development dataset.') el.textContent='No matching taxon in the current database.';
    if(text==='The project title reflects the intended long-term database scope. Users should not interpret the current development build as a complete Platypodinae resource.') el.textContent='The project title reflects the intended long-term database scope. Platypodinae has not yet been integrated and should not be interpreted as part of the current taxonomic coverage.';
  });

  app.querySelectorAll('dt').forEach(dt=>{
    if((dt.textContent||'').trim()==='Development version'){
      const dd=dt.nextElementSibling;
      dt.remove();
      if(dd?.tagName==='DD') dd.remove();
    }
  });

  app.querySelectorAll('.sidebar-issue').forEach(link=>{
    if(link.dataset.publicFeedback==='1') return;
    const current=new URL(link.href,location.href);
    const title=current.searchParams.get('title')||'Database feedback';
    const body=current.searchParams.get('body')||'';
    link.href=`${PUBLIC_FEEDBACK_REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    link.dataset.publicFeedback='1';
  });
}

const observer=new MutationObserver(applyPublicReleaseUI);
const app=document.querySelector('#app');
if(app) observer.observe(app,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>queueMicrotask(applyPublicReleaseUI));
applyPublicReleaseUI();
