import * as THREE from 'three';
import { M, at } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { steps } from './doorways.js';
import { trees, shrubs, lampPosts } from './realism.js';

// The Lotus Temple, finer detail. Its two-tier podium is climbed by a flight of marble steps at the
// head of each of the nine paths that radiate to the gardens, and each path is edged with a marble
// kerb. Dimensions follow js/monuments/lotus-temple.js: the plaster tier r 40 to 42 from 0.2 to
// 2.2, the marble tier r 34 to 36 from 2.2 to 4.2, the paths at 40° apart.
function architecture(f, g) {
  const d = new THREE.Group(), e = new THREE.Group(), deg = Math.PI / 180;
  for (let k = 0; k < 9; k++) {
    const t = k * 40 * deg, s = new THREE.Group();
    s.add(at(steps(6, 2, 5, M.marble, 0.45), 0, 2.2, 33.6), at(steps(7, 2, 5, M.marble, 0.45), 0, 0.2, 39.6));
    s.rotation.y = t;
    d.add(s);
    const p = new THREE.Group();
    for (const x of [-2.6, 2.6]) p.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 38), M.marble), x, 0.35, 61));
    p.rotation.y = t;
    e.add(p);
  }
  f.add(mergeByMaterial(d));
  g.add(mergeByMaterial(e));
}

// The Bahá'í House of Worship (the Lotus Temple) in Delhi: clipped hedges and flower beds between
// the nine paths to the doors, trees round the edge of the grounds, and lamps.
export function addDetails(f, g) {
  architecture(f, g);
  const deg = Math.PI / 180, lamps = [], hedges = [];
  for (let k = 0; k < 9; k++) {
    const t = k * 40 * deg, s = Math.sin(t), c = Math.cos(t);
    for (const d of [48, 62, 76]) for (const o of [-3.6, 3.6]) lamps.push([s * d + c * o, c * d - s * o]);
    const t2 = t + 20 * deg;
    for (let d = 64; d < 82; d += 3) hedges.push([Math.sin(t2) * d, Math.cos(t2) * d, 1.6]);
  }
  g.add(lampPosts(lamps), shrubs(hedges, { flowers: '#d0306f', seed: 4 }));
  const ring = [];
  for (let k = 0; k < 36; k++) { const a = (k / 36) * Math.PI * 2 + 0.05; ring.push([Math.sin(a) * 82, Math.cos(a) * 82]); }
  g.add(trees(ring, { kind: 'ashoka', seed: 5 }));
}
