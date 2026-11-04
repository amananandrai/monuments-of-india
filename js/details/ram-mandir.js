import { M, box, at, flag, mat } from '../helpers.js';
import { trees, people, PILGRIMS, lampPosts, garland, scatter, along } from './realism.js';

// The Ram Mandir at Ayodhya: the paved parikrama round the plinth with lawns beyond it, crowds of
// devotees climbing the steps and on the plinth, saffron flags, lamps, and garlands on the
// entrance pavilion.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(g) {
  g.add(box(160, 0.2, 200, M.path, 0, -0.2, 0));
  for (const s of [-1, 1]) g.add(box(40, 0.3, 160, M.grass, s * 64, -0.15, 0));
  const climb = [];
  for (let i = 0; i < 6; i++) for (const x of [-3.5, -1, 1.5, 3.8]) climb.push([x + Math.sin(i * 3 + x) * 0.6, 44 + 1.4 * i + 0.7, 6.5 - i * 1.08]);
  g.add(people(climb, { seed: 3, face: Math.PI, palette: PILGRIMS }));
  g.add(people(scatter(70, [-26, 26, -42, 42], { seed: 4, avoid: [[-12, 12, -38, 40], [-22, -12, -9, 3], [12, 22, -9, 3]] }).map(([x, z]) => [x, z, 6.5]), { seed: 4, palette: PILGRIMS }));
  g.add(people(scatter(60, [-70, 70, 52, 95], { seed: 5 }), { seed: 5, palette: [...PILGRIMS, '#2f5d9a', '#e26a9c', '#f4f1ea'] }));
  for (const [x, z] of [[-29, -46], [29, -46], [-29, 46], [29, 46]]) g.add(at(flag(8, SAFFRON), x, 6.5, z));
  g.add(lampPosts([...along(8, [-34, -60], [-34, 90]), ...along(8, [34, -60], [34, 90])]));
  g.add(trees([...along(8, [-82, -90], [-82, 90]), ...along(8, [82, -90], [82, 90])], { kind: 'ashoka', seed: 6 }));
  g.add(garland([-5, 13, 40.2], [5, 13, 40.2], { sag: 0.7, strands: 3 }));
}
