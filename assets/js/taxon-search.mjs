// Pure, data-driven multilingual search for the China Scolytinae website.
// All inputs are existing public website records; no external network or search index.
export function normalizeTaxonSearch(value) {
  return String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function buildTaxonSearchIndex(taxa, higherTaxa) {
  if (!Array.isArray(taxa) || !higherTaxa?.genera || !higherTaxa?.tribes) {
    throw new Error('Taxon search requires the public species index and higher-taxon mapping.');
  }
  return taxa.map(taxon => {
    const fields = [];
    const add = (kind, value) => {
      const display = String(value ?? '').trim();
      const normal = normalizeTaxonSearch(display);
      if (normal) fields.push({ kind, value: display, normal });
    };
    const approvedRankChinese = (rank, latin) => {
      const record = higherTaxa[rank]?.[latin];
      return record?.web_display_authorized === true ? record.chinese : '';
    };

    add('scientific', taxon.scientific_name);
    add('chinese_species', taxon.recommended_chinese_name);
    add('chinese_species', taxon.chinese_name);
    for (const former of (Array.isArray(taxon.former_chinese_names) ? taxon.former_chinese_names : [])) {
      add('former_chinese', former);
    }
    add('genus', taxon.genus);
    add('tribe', taxon.tribe);
    add('chinese_genus', approvedRankChinese('genera', taxon.genus));
    add('chinese_tribe', approvedRankChinese('tribes', taxon.tribe));
    add('vsn', taxon.vsn);
    add('authorship', taxon.authorship);
    add('subfamily', taxon.subfamily);
    return { taxon, fields };
  });
}

export function searchTaxonIndex(index, query) {
  const needle = normalizeTaxonSearch(query);
  if (!needle) return [];
  const hits = [];
  for (const entry of index) {
    const field = entry.fields.find(item => item.normal.includes(needle));
    if (field) hits.push({ taxon: entry.taxon, matchedKind: field.kind, matchedValue: field.value });
  }
  return hits;
}
