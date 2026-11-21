import { M, mat, at, inst, unitBox, unitCyl } from '../helpers.js';
import { manastambha } from '../parts/temples.js';
import { trees, scatter } from '../parts/realism.js';
import { ridgeY, PEAKS } from '../monuments/shikharji.js';

// Shikharji, finer architecture. Dimensions follow js/monuments/shikharji.js, which lists the
// tonks it builds (f.userData.tonks: each body [x, y, z, w, h, w] and its dome [x, y, z, w, rise, w],
// a hemisphere of diameter w). Each tonk stands on a moulded base under a cornice, its doorway dark
// in the face towards the pilgrims' path (south, +z), and its dome is crowned by a lotus cap and a
// gilt finial. Before the Jal Mandir in the saddle stands a manastambha.
const WHITE = mat('#f2eee6', 0.7);
const SHADE = mat('#d8d1c2', 0.85);

function tonks(f) {
  const { bodies = [], domes = [] } = f.userData.tonks || {}, base = [], cornice = [], doors = [], caps = [], spikes = [];
  for (const [x, y, z, b, h] of bodies) {
    base.push([x, y, z, b * 1.1, 0.35, b * 1.1]);
    cornice.push([x, y + h - 0.32, z, b * 1.12, 0.24, b * 1.12]);
    doors.push([x, y + 0.35, z + b / 2 + 0.015, b * 0.28, Math.min(h * 0.6, b * 0.6), 0.03]);
  }
  for (const [x, y, z, , r] of domes) {
    const top = y + r * 0.5;
    caps.push([x, top - 0.06, z, 0.5, 0.22, 0.5]);
    spikes.push([x, top + 0.16, z, 0.12, 0.9, 0.12]);
  }
  f.add(inst(unitBox(), base, SHADE), inst(unitBox(), cornice, SHADE), inst(unitBox(), doors, M.recess), inst(unitCyl(10), caps, WHITE), inst(unitCyl(6), spikes, M.gold));
}

// Shikharji in the Parasnath hills: the forest that covers the ridge up to just below the summits.
export function addDetails(f, g) {
  tonks(f);
  const jx = -40, jy = ridgeY(jx, 0);
  f.add(at(manastambha(8, WHITE, { images: true }), jx + 7, jy + 0.4, 9));
  const spots = scatter(150, [-200, 200, -110, 110], { seed: 5, gap: 9 })
    .filter(([x, z]) => { const y = ridgeY(x, z); return y > 4 && !PEAKS.some(([px, pz]) => Math.hypot(x - px, z - pz) < 9); })
    .filter((_, i) => i % 2 === 0) // every other one: a sal forest, not an orchard
    .map(([x, z]) => [x, z, null, ridgeY(x, z) - 0.4]);
  g.add(trees(spots, { kind: 'sal', seed: 5, h: 12 }));
}
