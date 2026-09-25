const citeApp=document.querySelector('#app');
const DATABASE_URL='https://dongyiyi.github.io/china-scolytinae-database-site/';

function renderCitePage(){
  const route=(location.hash.slice(1)||'/').split('?')[0];
  if(route!=='/cite') return;
  citeApp.innerHTML=`
<section class="taxonomy-banner">
  <div class="eyebrow">Citation</div>
  <h1>Cite this resource</h1>
  <p class="subtitle">Guidance for citing the database, individual taxon profiles, and the underlying published evidence.</p>
</section>
<section class="grid cite-page">
  <article class="card full">
    <h2>How to cite this database</h2>
    <div class="citation-box"><strong>Dong, Y. 2026.</strong> <em>China Scolytinae &amp; Platypodinae Database.</em> <a href="${DATABASE_URL}" target="_blank" rel="noopener">${DATABASE_URL}</a>. Accessed [date].</div>
  </article>

  <article class="card full">
    <h2>What should I cite?</h2>
    <div class="citation-guide">
      <div><h3>Database or checklist use</h3><p>If you use the database as a compiled checklist, structured dataset, or general taxonomic resource, cite the database.</p></div>
      <div><h3>Individual taxon profile</h3><p>If you refer to a specific taxon profile, cite the database and identify the profile by its stable VSN and profile URL.</p></div>
      <div><h3>Specific evidence</h3><p>If you use a particular taxonomic, nomenclatural, distribution, host, or occurrence statement, cite the database together with the underlying original source or sources listed in that profile.</p></div>
    </div>
  </article>

  <article class="card full">
    <h2>Citing an individual taxon profile</h2>
    <p>Each taxon profile is anchored to a stable <strong>VSN identifier</strong>. The VSN should be retained when referring to a specific profile because it provides a persistent project identity even if the accepted scientific name changes through later taxonomic revision.</p>
    <p>A profile citation should therefore include the database citation, the VSN, the profile URL, and the access date.</p>
    <div class="citation-example"><strong>Example format</strong><br>Dong, Y. 2026. <em>China Scolytinae &amp; Platypodinae Database.</em> Taxon profile: VSN_XXXX. [profile URL]. Accessed [date].</div>
  </article>

  <article class="card full">
    <h2>Source attribution</h2>
    <p>This database is a curated synthesis of published evidence and does not replace the original literature. Taxon profiles retain references for taxonomic acts, nomenclatural history, distribution records, host records, and other source-backed statements.</p>
    <p>When a scientific conclusion or factual statement depends on a particular publication, cite that original publication in addition to the database. This preserves attribution to the authors who generated or published the underlying evidence and allows readers to verify the source directly.</p>
  </article>
</section>`;
}

window.addEventListener('hashchange',renderCitePage);
renderCitePage();
