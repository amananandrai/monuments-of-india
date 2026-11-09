import * as THREE from 'three';
import { M, box, at, onFace, FACES, lathe } from '../helpers.js';
import { petalRing, jharokha, windowFrame, mergeByMaterial } from './components.js';
import { STONE, DARK, PINK, TOWER, DURBAR, EAST, CENTRE } from '../monuments/laxmi-vilas-palace.js';
import { trees, shrubs, lampPosts, scatter, along } from './realism.js';

// Laxmi Vilas Palace, finer detail. From photographs: the tower has arched windows in pink panels
// up its shaft and balconies (jharokhas) under curved roofs high on it; the great dome and the
// Durbar Hall's rise from a cup of lotus petals; and the Durbar Hall, the east pavilion and the
// entrance block are hung with jharokhas. Dimensions follow js/monuments/laxmi-vilas-palace.js: the
// tower 8.5 square and 40 high at TOWER; the entrance block's front at z = CENTRE.front, its great
// dome's drum 6.6 in radius and 5.4 high at y = 24.9; the Durbar Hall 18 × 20 × 30 at DURBAR, its
// dome's drum 6 in radius at y 20.8; the east pavilion 22 × 19 × 30 at EAST.
function architecture(f) {
  const d = new THREE.Group(), tw = at(new THREE.Group(), TOWER[0], 0, TOWER[1]);
  for (const a of FACES) {
    for (const y of [7.4, 13]) {
      tw.add(onFace(box(2.8, 4.2, 0.08, PINK, 0, y - 0.6, 0), a, 4.27));
      tw.add(onFace(at(windowFrame(1.6, 3.2, DARK, { frame: 0.22 }), 0, y, 0), a, 4.31));
    }
    tw.add(onFace(at(jharokha(2.4, 2.6, STONE, { d: 1, trim: DARK, roof: 'bangla' }), 0, 19.6, 0), a, 4.27));
    tw.add(onFace(at(jharokha(2.8, 2.8, STONE, { d: 1.1, trim: DARK, roof: 'bangla' }), 0, 25.6, 0), a, 4.27));
    tw.add(onFace(at(jharokha(2.8, 2.8, STONE, { d: 1.1, trim: DARK, roof: 'bangla' }), 0, 31.6, 0), a, 4.27));
  }
  d.add(tw);
  d.add(at(petalRing(6.6 * 0.9, 24, 2.8, 1.9, 0.55, STONE, 0.3), 0, CENTRE.bayH + 0.9 + 5.4, CENTRE.front - 15 + 3));
  d.add(at(petalRing(6 * 0.9, 24, 2.8, 1.9, 0.55, STONE, 0.3), DURBAR[0], 20.8 + 3.4, DURBAR[1]));
  // Jharokhas: on the Durbar Hall's front and the east pavilion's, between the storeys.
  for (const x of [-5, 5]) for (const y of [8, 14]) d.add(at(jharokha(2.4, 2.8, STONE, { d: 1, trim: DARK, roof: x < 0 ? 'bangla' : 'dome' }), DURBAR[0] + x, y, DURBAR[1] + 15.02));
  for (const x of [-7, 0, 7]) d.add(at(jharokha(2.4, 2.8, STONE, { d: 1, trim: DARK, roof: 'bangla' }), EAST[0] + x, 13.6, EAST[1] + 15.02));
  mergeByMaterial(d);
  f.add(d);
}

// The lawn before the palace: a sculpture of an urn held up by swans on a tall pedestal in its
// middle, the drive round it to the porch with lamps along it, flower beds by the front, and the
// great trees of the 700-acre grounds further off.
export function addDetails(f, g) {
  architecture(f);
  const urn = new THREE.Group();
  urn.add(box(1.6, 0.4, 1.6, DARK), box(1.1, 2.6, 1.1, STONE, 0, 0.4), box(1.5, 0.3, 1.5, DARK, 0, 3));
  urn.add(at(lathe([[0.2, 0], [0.5, 0.2], [0.85, 0.9], [0.7, 1.5], [0.45, 1.8], [0.55, 2.1], [0, 2.1]], M.marble, 16), 0, 3.3, 0));
  for (const s of [-1, 1]) urn.add(box(0.25, 1.6, 0.6, M.marble, s * 0.75, 3.6, 0));
  g.add(at(urn, 0, 0, 40));
  g.add(lampPosts([...along(6, [-7, 30], [-7, 140]), ...along(6, [7, 30], [7, 140])]));
  g.add(shrubs([...scatter(12, [-60, -14, 9, 13], { seed: 4, gap: 4 }), ...scatter(12, [14, 60, 9, 13], { seed: 5, gap: 4 })].map(([x, z]) => [x, z, 1.4]), { flowers: '#d0306f', seed: 4 }));
  g.add(trees(scatter(40, [-205, 205, -110, 195], { seed: 6, gap: 18, avoid: [[-130, 130, -90, 30], [-120, 120, 30, 150]] }), { kind: 'banyan', seed: 6 }));
}
