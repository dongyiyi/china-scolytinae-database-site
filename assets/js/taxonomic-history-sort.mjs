/**
 * Chronological display of name-usage events: latest nomenclatural year first.
 *
 * This is presentation-only; it does not alter a usage's taxonomic status,
 * original-description date, references, or canonical data order.
 * Unparseable years (e.g. "Historical" / "Current") follow dated events.
 * ES2019+ Array#sort is stable, retaining source order for tied years.
 */
export function eventYear(event) {
  const value=String(event?.year??'').trim();
  const match=value.match(/(?<!\d)(1[5-9]\d{2}|20\d{2})(?!\d)/);
  return match?Number(match[1]):null;
}
export function sortTaxonomicHistory(history) {
  if(!Array.isArray(history)) return [];
  return history.slice().sort((a,b)=>{
    const ay=eventYear(a),by=eventYear(b);
    if(ay===null) return by===null?0:1;
    if(by===null) return -1;
    return by-ay;
  });
}
