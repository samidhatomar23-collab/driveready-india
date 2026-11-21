// Sanity-checks all content JSON. Run: npm run validate:content
import { readFileSync, readdirSync, existsSync } from 'node:fs';
const D = new URL('../src/data/', import.meta.url).pathname;
const read = f => JSON.parse(readFileSync(D + f, 'utf8'));
const signs = read('signs.json'), units = read('units.json'), states = read('states.json');
const signIds = new Set(signs.map(s => s.id));
for (const s of signs) if (s.image && !existsSync(new URL('../public/signs/' + s.image, import.meta.url).pathname)) console.error('missing sign picture', s.image);
const lessonIds = new Set(units.flatMap(u => u.lessons.map(l => l.id)));
const LANGS = ['en','hi'];  // new questions are English + Hindi; Marathi/Telugu/Tamil fall back to English where missing
const errors = [];
const enUi = read('i18n/en.json');
for (const lg of ['en','hi','mr','te','ta']) { const d = read(`i18n/${lg}.json`); for (const k of Object.keys(enUi)) if (!d[k]) errors.push(`ui ${lg}: missing ${k}`); }
for (const lg of LANGS.slice(1)) {
  for (const s of signs) if (!s['name_' + lg] || !s['meaning_' + lg]) errors.push(`sign ${s.id}: missing ${lg}`);
  for (const u of units) { if (!u['title_' + lg]) errors.push(`unit ${u.id}: missing ${lg}`); for (const l of u.lessons) if (!l['title_' + lg]) errors.push(`lesson ${l.id}: missing ${lg}`); }
} const seen = new Set(); let total = 0, verified = 0;
const REQUIRED = ['id','topic','unit','lessonId','type','difficulty','question','options','correctAnswer','explanation','languages','applicableVehicleClasses','statesApplicable','sourceUrl','sourceDoc','retrievedOn','verified'];
for (const f of readdirSync(D + 'questions')) {
  for (const q of read('questions/' + f)) {
    total++; if (q.verified) verified++;
    const e = m => errors.push(`${q.id ?? '?'}: ${m}`);
    for (const k of REQUIRED) if (!(k in q)) e(`missing ${k}`);
    if (seen.has(q.id)) e('duplicate id'); seen.add(q.id);
    if (!lessonIds.has(q.lessonId)) e(`unknown lessonId ${q.lessonId}`);
    if (q.imageRef && q.imageRef.startsWith('img:')) { if (!existsSync(new URL('../public/signs/' + q.imageRef.slice(4), import.meta.url).pathname)) e(`missing picture ${q.imageRef}`); } else if (q.imageRef && !signIds.has(q.imageRef)) e(`unknown imageRef ${q.imageRef}`);
    if (['mcq','sign-id','true-false'].includes(q.type)) {
      if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) e('correctAnswer out of range');
      if (new Set(q.options).size !== q.options.length) e('duplicate options');
    }
    for (const lg of LANGS) {
      const t = q.languages?.[lg]; if (!t) { e(`missing ${lg} text`); continue; }
      if (!t.question || !t.explanation) e(`${lg}: empty question/explanation`);
      if (q.type !== 'match') {
        if (!t.options || t.options.length !== q.options.length) e(`${lg}: options length`);
        else if (new Set(t.options).size !== t.options.length) e(`${lg}: duplicate options`);
      }
    }
    if (q.type === 'match' && (!q.pairs || q.pairs.length < 2)) e('match needs pairs');
    if (q.verified && (!q.retrievedOn || !q.sourceUrl)) e('verified item needs retrievedOn + sourceUrl');
  }
}
for (const s of states) if (s.llTest.passMark > s.llTest.questionCount) errors.push(`state ${s.code}: passMark > questionCount`);
console.log(`${total} questions (${verified} verified), ${signs.length} signs, ${states.length} states`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); } else console.log('content OK');
