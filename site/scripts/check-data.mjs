// Sanity-checks src/data before a build. Errors stop the build; warnings flag stale info.
import fs from 'node:fs';
const read = (f) => JSON.parse(fs.readFileSync(new URL(`../src/data/${f}`, import.meta.url)));
const brothers = read('brothers.json'), eboard = read('eboard.json'), rush = read('rush.json');
const events = read('events.json'), careers = read('careers.json'), companies = read('companies.json');
const errors = [], warnings = [];
const now = new Date();
const classYear = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();

// Pledge class names come from the CLASSES list in src/lib/data.ts (the one place to add a new class).
const dataTs = fs.readFileSync(new URL('../src/lib/data.ts', import.meta.url), 'utf8');
const classBlock = dataTs.match(/export const CLASSES = \[([\s\S]*?)\] as const;/);
const CLASSES = classBlock ? [...classBlock[1].matchAll(/\[\s*'([^']+)'\s*,/g)].map((m) => m[1]) : [];
if (!CLASSES.length) errors.push('could not read the CLASSES list from src/lib/data.ts');

const STATUSES = ['active', 'inactive', 'alumni'];
const EVENT_TYPES = ['professional', 'social', 'service'];
const CAREER_TYPES = ['internship', 'full-time'];

const ids = new Set();
for (const b of brothers) {
  if (!b.id || !b.name || !b.pledgeClass) errors.push(`brother missing id/name/pledgeClass: ${JSON.stringify(b)}`);
  if (ids.has(b.id)) errors.push(`duplicate brother id: ${b.id}`);
  ids.add(b.id);
  if (!STATUSES.includes(b.status)) errors.push(`${b.id}: status "${b.status}" is not one of ${STATUSES.join(', ')}`);
  if (b.pledgeClass && CLASSES.length && !CLASSES.includes(b.pledgeClass)) errors.push(`${b.id}: pledge class "${b.pledgeClass}" is not in CLASSES in src/lib/data.ts`);
  if (b.photo && !fs.existsSync(new URL(`../src/assets/brothers/${b.photo}`, import.meta.url))) errors.push(`missing photo for ${b.id}: ${b.photo}`);
  if ((b.status === 'active' || b.status === 'inactive') && b.gradYear && b.gradYear < classYear) warnings.push(`${b.name} is marked ${b.status} but graduated (${b.gradYear})`);
}
for (const r of eboard.roles) if (!ids.has(r.brother)) errors.push(`eboard role "${r.role}" points to unknown brother "${r.brother}"`);
for (const r of eboard.roles) if (r.photo && !fs.existsSync(new URL(`../src/assets/brothers/${r.photo}`, import.meta.url))) errors.push(`eboard role "${r.role}": missing photo ${r.photo}`);
for (const e of [...events, ...rush.events]) if (!EVENT_TYPES.includes(e.type)) errors.push(`event "${e.name}" (${e.date}): type "${e.type}" is not one of ${EVENT_TYPES.join(', ')}`);
for (const c of careers) if (!CAREER_TYPES.includes(c.type)) errors.push(`career "${c.name}, ${c.company}" (${c.year}): type "${c.type}" is not one of ${CAREER_TYPES.join(', ')}`);
// The headline list in companies.json: each name must be a careers.json company, spelled exactly the same, once.
const careerCompanies = new Set(careers.map((c) => c.company));
const headline = Array.isArray(companies.headline) ? companies.headline : [];
if (!headline.length) errors.push('companies.json needs a "headline" list of company names');
headline.forEach((name, i) => {
  if (!careerCompanies.has(name)) errors.push(`companies.json headline "${name}" is not a company in careers.json`);
  if (headline.indexOf(name) !== i) errors.push(`companies.json headline "${name}" appears twice`);
});
const sem = rush.semester.match(/(Spring|Fall) (\d{4})/);
if (sem && +sem[2] < now.getFullYear()) warnings.push(`rush.json semester "${rush.semester}" is in the past`);

warnings.forEach((w) => console.warn(`⚠ ${w}`));
if (errors.length) { errors.forEach((e) => console.error(`✗ ${e}`)); process.exit(1); }
console.log(`✓ data ok (${brothers.length} brothers, ${warnings.length} warnings)`);
