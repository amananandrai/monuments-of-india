import * as THREE from 'three';
import { M, mat, box, at, aroundRect } from '../helpers.js';
import { nagaraTemple } from '../details/temples.js';
import { figureRow } from '../details/sculpture.js';
import { addDetails } from '../details/grishneshwar-temple.js';

const RED = mat('#8c4a3a', 0.85);
const SHADE = mat('#6e392d', 0.9);

export function buildGrishneshwar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(140, 0.2, 140, M.path));
  // The Ellora scarp a little way off to the north: the Deccan basalt in level terraces, its foot
  // cut with the dark mouths of the caves, a skirt of scrub below.
  const TRAP = mat('#6f655a', 0.95, 0, { flatShading: true }), TRAP2 = mat('#857a6c', 0.95, 0, { flatShading: true });
  const cz = -300;
  for (let k = 0; k < 9; k++) {
    const x = -400 + k * 100, j = Math.sin(k * 2.3), h0 = 20 + 4 * j, h1 = 12 + 3 * Math.cos(k * 1.7), dz = 6 * Math.sin(k * 1.3);
    const seg = new THREE.Group();
    seg.add(box(104, h0, 60, TRAP, 0, 0, -30), box(98, h1, 50, TRAP2, 0, h0, -45 + 4 * j), box(92, 10 + 3 * j, 60, TRAP, 0, h0 + h1, -72 - 5 * j));
    seg.position.set(x, 0, cz + dz);
    g.add(seg);
  }
  g.add(box(900, 4, 20, mat('#7d7a52', 0.95), 0, 0, cz + 14));
  for (let i = 0; i < 18; i++) { const x = -260 + i * 30 + (i % 3) * 4, w = 8 + (i % 4) * 3; g.add(box(w, 7 + (i % 3) * 2, 1, M.recess, x, 4, cz + 6.6 * Math.sin(Math.round((x + 400) / 100) * 1.3) + 0.1)); }
  for (const s of [-1, 1]) f.add(box(70, 4, 2, mat('#a39079', 0.9), 0, 0, s * 40), box(2, 4, 80, mat('#a39079', 0.9), s * 35, 0, 0));
  // Red basalt temple with a five-tiered spire
  const t = nagaraTemple({ w: 11, h: 17, m: RED, shade: SHADE, plinth: 2, urus: 4, uruScale: 0.45, halls: [[16, 8, 4]], prof: (k) => 1 - 0.55 * Math.floor(k * 5) / 5 - 0.08 * k });
  f.add(at(t, 0, 0, -12));
  // Carved friezes of the ten avatars round the walls of the hall
  const figs = [];
  aroundRect(16.3, 16.3, 1.4).forEach(([x, z, ry]) => figs.push([x, 4, z - 12 + 6.3 + 8, 0.7, 2.6, 0.3, ry]));
  f.add(figureRow(figs, SHADE, { poses: ['standing', 'dancer'] }));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.85, 0.36, 1.15] };
}
