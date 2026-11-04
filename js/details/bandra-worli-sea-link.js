import * as THREE from 'three';
import { mesh, cyl, at, M, box, mat, rng } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { lampPosts, boats } from './realism.js';

// The Bandra–Worli Sea Link, finer detail. The pylon's legs are tied by a cross-beam under the
// deck and its mast is crowned by a cap and a red aviation light; each stay cable ends in an
// anchor block on the deck's central median, and a median barrier runs between the carriageways.
// Dimensions follow js/monuments/bandra-worli-sea-link.js: the deck at y = 20, the mast 128 high,
// 14 cables a side over a 250 m span.
const CONCRETE = mat('#c9c6bf', 0.85), RED = mat('#d0302a', 0.4, 0, { emissive: '#7a1410' });
function architecture(f) {
  const d = new THREE.Group(), deckY = 20, H = 128, span = 250;
  d.add(box(5.6, 3, 21, CONCRETE, 0, deckY - 6, 0));
  d.add(box(5.2, 1.2, 6.0, CONCRETE, 0, H, 0), cyl(0.5, 0.5, 2, CONCRETE, 0, H + 1.2, 0, 10), at(mesh(new THREE.SphereGeometry(0.55, 12, 8), RED), 0, H + 3.4, 0));
  for (const side of [-1, 1]) for (let k = 1; k <= 14; k++) d.add(box(1.6, 0.9, 3.4, CONCRETE, side * (k / 14) * span, deckY + 0.3, 0));
  d.add(box(520, 0.9, 0.6, CONCRETE, 0, deckY + 0.3, 0));
  mergeByMaterial(d);
  f.add(d);
}

// The Bandra–Worli Sea Link: crash barriers and lamp posts along both edges of the deck, and the
// Koli fishing boats of Worli and Mahim out in the bay.
export function addDetails(f, g) {
  architecture(f);
  const deckY = 20.3, R = rng(21);
  for (const s of [-1, 1]) g.add(box(1600, 1.1, 0.4, mat('#d8d5ce', 0.8), 0, deckY, s * 11.6), box(1600, 0.2, 0.6, M.steel, 0, deckY + 1.1, s * 11.6));
  const lamps = [];
  for (let x = -780; x <= 780; x += 40) if (Math.abs(x) > 12) lamps.push([x, -11.9], [x, 11.9]);
  g.add(lampPosts(lamps, { h: 10, y: deckY }));
  const fleet = [];
  for (let i = 0; i < 18; i++) fleet.push([-500 + R() * 1000, (R() < 0.5 ? -1 : 1) * (90 + R() * 300), R() * 6.28]);
  g.add(boats(fleet, { y: 0.25, size: 2.2, colours: ['#2f5d9a', '#c2512a', '#f2d23a', '#3c8a5a'] }));
}

