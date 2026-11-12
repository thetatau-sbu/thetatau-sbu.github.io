// Moves graduated brothers from "active" or "inactive" to "alumni" in src/data/brothers.json.
// A brother counts as graduated when their gradYear is before the current graduating
// class (same rule as check-data.mjs: from June on, the graduating class is next year).
//
//   npm run graduate              -> updates brothers.json and lists who changed
//   npm run graduate -- --dry-run -> only lists who would change, writes nothing
import fs from 'node:fs';

const file = new URL('../src/data/brothers.json', import.meta.url);
const dryRun = process.argv.includes('--dry-run');

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const now = new Date();
const classYear = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();

const changed = [];
for (const b of data) {
  if ((b.status === 'active' || b.status === 'inactive') && typeof b.gradYear === 'number' && b.gradYear < classYear) {
    b.was = b.status;
    b.status = 'alumni';
    changed.push(b);
  }
}

console.log(`Graduating class this academic year: ${classYear}`);
if (!changed.length) {
  console.log('Nobody to move. Every active and inactive brother graduates in or after ' + classYear + '.');
  process.exit(0);
}

console.log(dryRun ? '\nWould move to alumni:' : '\nMoved to alumni:');
for (const b of changed) console.log(`  ${b.name} (${b.pledgeClass}, ${b.gradYear}, was ${b.was})`);

if (dryRun) {
  console.log(`\n${changed.length} brother${changed.length === 1 ? '' : 's'} would change. Dry run: nothing was written.`);
} else {
  for (const b of changed) delete b.was;
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(`\n${changed.length} brother${changed.length === 1 ? '' : 's'} moved to alumni. Saved src/data/brothers.json.`);
}
