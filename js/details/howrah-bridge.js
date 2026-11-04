import * as THREE from 'three';
import { M, box, cyl, at } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { rng } from '../helpers.js';
import { lampPosts, boats } from './realism.js';

// Howrah Bridge, finer detail. The cantilever trusses are riveted together at every joint through
// gusset plates, here a plate on the outer face of each truss at each node of its top and bottom
// chords; each main tower ends in a capped finial post above its top cross-girder; and a steel
// railing runs along both edges of the deck. Dimensions follow js/monuments/howrah-bridge.js: the
// trusses at z = ±11, the deck at y = 10, the towers at x = ±228.5.
function architecture(t, g) {
  const d = new THREE.Group(), S = M.steel, W = 11, deck = 10, xs = [];
  const seg = (a, b, n) => { for (let i = 0; i < n; i++) xs.push(a + ((b - a) * i) / n); };
  seg(-330, -228.5, 5); seg(-228.5, -80, 7); seg(-80, 80, 8); seg(80, 228.5, 7); seg(228.5, 330, 5); xs.push(330);
  const topY = (x) => { const a = Math.abs(x); return a <= 80 ? 38 : a <= 228.5 ? 38 + ((a - 80) / 148.5) * 44 : 82 - ((a - 228.5) / 101.5) * 58; };
  for (const z of [-W, W]) for (const x of xs) {
    const out = Math.sign(z) * 1.08;
    d.add(box(3.2, 3.0, 0.16, S, x, deck - 1.5, z + out), box(2.8, 2.6, 0.16, S, x, topY(x) - 1.3, z + out));
  }
  for (const x of [-228.5, 228.5]) for (const z of [-W, W]) d.add(box(4.2, 0.8, 4.2, S, x, 86.8, z), cyl(0.3, 1.2, 4, S, x, 87.6, z, 8));
  t.add(mergeByMaterial(d));
  const r = new THREE.Group();
  for (const z of [-13.1, 13.1]) r.add(box(1100, 0.12, 0.12, S, 0, deck + 1.05, z), box(1100, 0.1, 0.1, S, 0, deck + 0.55, z));
  for (let x = -548; x <= 548; x += 4) for (const z of [-13.1, 13.1]) r.add(box(0.12, 1.15, 0.12, S, x, deck, z));
  g.add(mergeByMaterial(r));
}

// Howrah Bridge over the Hooghly: lamps on the deck, and country boats with their curved hoods on
// the river.
export function addDetails(t, g) {
  architecture(t, g);
  const R = rng(11);
  const lamps = [];
  for (let x = -520; x <= 520; x += 30) lamps.push([x, -12.9], [x, 12.9]);
  g.add(lampPosts(lamps, { y: 10, h: 6 }));
  const fleet = [];
  for (let i = 0; i < 16; i++) fleet.push([-700 + R() * 1400, (R() < 0.5 ? -1 : 1) * (40 + R() * 200), R() * 6.28]);
  g.add(boats(fleet, { y: 0.15, size: 2.4, canopy: true, colours: ['#5a3d2a', '#3d2f24', '#7a4e2d'] }));
}
