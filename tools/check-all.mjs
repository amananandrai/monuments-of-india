// Runs the checks one after another, over the ids given or over every monument, and stops at the
// first that fails: the registry and the filter groups (whole lists, no browser), then heights,
// triangle budgets and flickering faces.
//   node check-all.mjs [id ...]
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url)), ids = process.argv.slice(2);
for (const [script, takesIds] of [['check-registry.mjs', false], ['check-filters.mjs', false], ['check-heights.mjs', true], ['check-budgets.mjs', true], ['check-flicker.mjs', true]]) {
  console.log(`\n== ${script}`);
  const r = spawnSync(process.execPath, [path.join(here, script), ...(takesIds ? ids : [])], { stdio: 'inherit' });
  if (r.status !== 0) { console.error(`\n${script} failed.`); process.exit(r.status || 1); }
}
console.log('\nAll checks passed.');
