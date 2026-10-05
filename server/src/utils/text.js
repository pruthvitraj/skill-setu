function escapeRegex(value) {
  const special = new Set('. * + ? ^ $ { } ( ) | [ ]'.split(' ').concat(String.fromCharCode(92)));
  return [...String(value)].map(c => special.has(c) ? String.fromCharCode(92) + c : c).join('');
}
function hasTerm(text, term) { return new RegExp('(^|[^a-z0-9])' + escapeRegex(term) + '(?=$|[^a-z0-9])', 'i').test(text); }
module.exports = { escapeRegex, hasTerm };
