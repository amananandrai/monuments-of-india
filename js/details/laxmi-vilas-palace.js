import * as THREE from 'three';
import { M, box, at, onFace, FACES, lathe } from '../helpers.js';
import { petalRing, jharokha, windowFrame, mergeByMaterial } from './components.js';
import { STONE, DARK, PINK, TOWER, DURBAR, EAST, CENTRE } from '../monuments/laxmi-vilas-palace.js';
import { trees, shrubs, lampPosts, fountains, scatter, along } from './realism.js';
import { detail } from '../detail.js';

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

// The grounds: before the palace a broad lawn with the urn held up by swans on its tall pedestal in
// the middle, the drive round it to the porch with lamps along it, stone paths across the lawn to
// two fountains, smaller urns at the porch, and flower beds along the front; palms along the lawn's
// sides; behind, the court between the back wings, paved, with a
// fountain in a garden of beds and paths; and the great trees of the 700-acre grounds beyond.
function urn(s) {
  const u = new THREE.Group();
  u.add(box(1.6 * s, 0.4 * s, 1.6 * s, DARK), box(1.1 * s, 2.6 * s, 1.1 * s, STONE, 0, 0.4 * s), box(1.5 * s, 0.3 * s, 1.5 * s, DARK, 0, 3 * s));
  u.add(at(lathe([[0.2, 0], [0.5, 0.2], [0.85, 0.9], [0.7, 1.5], [0.45, 1.8], [0.55, 2.1], [0, 2.1]].map(([r, y]) => [r * s, y * s]), M.marble, 16), 0, 3.3 * s, 0));
  for (const k of [-1, 1]) u.add(box(0.25 * s, 1.6 * s, 0.6 * s, M.marble, k * 0.75 * s, 3.6 * s, 0));
  return u;
}
export function addDetails(f, g) {
  architecture(f);
  g.add(at(urn(1), 0, 0, 40), at(urn(0.55), -9, 0, 13), at(urn(0.55), 9, 0, 13));
  g.add(lampPosts([...along(6, [-7, 30], [-7, 140]), ...along(6, [7, 30], [7, 140])]));
  // Stone paths across the lawn to the fountains, and round them.
  g.add(box(70, 0.22, 3, M.path, 0, 0, 45), box(10, 0.23, 10, M.path, -35, 0, 45), box(10, 0.23, 10, M.path, 35, 0, 45));
  g.add(fountains([[-35, 45], [35, 45]], { h: 3 }), fountains([[0, -44]], { h: 3.5 }));
  g.add(shrubs([...scatter(12, [-60, -14, 9, 13], { seed: 4, gap: 4 }), ...scatter(12, [14, 60, 9, 13], { seed: 5, gap: 4 })].map(([x, z]) => [x, z, 1.4]), { flowers: '#d0306f', seed: 4 }));
  // Palms along the lawn's two sides, clear of the view of the front.
  g.add(trees([...along(7, [-110, 30], [-110, 150]), ...along(7, [110, 30], [110, 150])], { kind: 'palm', seed: 3 }));
  // The court behind the front, between the back wings: paved, with lawns and beds round its fountain.
  g.add(box(156, 0.2, 54, M.path, 1, 0, -44), box(60, 0.24, 30, M.grass, 1, 0, -44), box(60, 0.25, 3, M.path, 1, 0, -44), box(3, 0.25, 30, M.path, 1, 0, -44));
  if (!detail.low) g.add(shrubs([...scatter(20, [-28, 30, -58, -30], { seed: 8, gap: 4, avoid: [[-6, 8, -50, -38]] })].map(([x, z]) => [x, z, 1.2]), { flowers: '#e0a020', seed: 8 }));
  g.add(trees(scatter(40, [-205, 205, -110, 195], { seed: 6, gap: 18, avoid: [[-130, 130, -90, 30], [-130, 130, 30, 160]] }), { kind: 'banyan', seed: 6 }));
}
