import * as THREE from 'three';
import { M, at, onFace, FACES, aroundRect, inst, unitBox } from '../helpers.js';
import { mouldings, frieze, petalRing, bracketGeo, placeAll, templeNiche, idol, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, fountains, garland, scatter, along } from './realism.js';

// Akshardham, finer detail. From photographs: the mandir's plinth above the elephant frieze steps in
// through carved mouldings; every pillar of its outer colonnade stands on a moulded base and carries
// a bracket capital; a carved frieze runs along the top of the walls; niches with images are set in
// the walls between the pillars; and each dome rises from a ring of lotus petals.
// Dimensions follow js/monuments/akshardham.js: plinth 88 × 102 from y 5 to 9, the mandir 68 × 82
// from y 9 to 25, its pillars round a 72 × 86 rectangle.
function architecture(f) {
  const d = new THREE.Group(), P = M.pink, Ps = M.pinkShade, R = M.ranak;
  d.add(mouldings(88, 102, [[5, 0.5, 0.35, Ps], [5.5, 0.4, 0.2, frieze(P)], [8.3, 0.7, 0.4, Ps]], P));
  d.add(mouldings(68, 82, [[22.6, 1.2, 0.06, frieze(R)], [9, 0.5, 0.15, Ps]], R));
  const bases = [], caps = [], br = [];
  for (const [x, z, a] of aroundRect(72, 86, 3)) {
    if (z > 40 && Math.abs(x) < 4.5) continue;
    bases.push([x, 9, z, 1.8, 0.7, 1.8]);
    caps.push([x, 23.7, z, 1.8, 0.8, 1.8]);
    const o = a + Math.PI;
    br.push([x + Math.sin(o) * 0.65, 23.7, z + Math.cos(o) * 0.65, o], [x - Math.sin(o) * 0.65, 23.7, z - Math.cos(o) * 0.65, a]);
  }
  d.add(placeAll(bracketGeo(1.4, 1.1, 0.6), br, Ps));
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) > 0.5, len = long ? 82 : 68, dist = long ? 34 : 41;
    for (let k = 0; k < Math.floor(len / 9); k++) {
      const lat = -len / 2 + 4.5 + k * 9;
      if (a === 0 && Math.abs(lat) < 6) continue;
      d.add(onFace(at(templeNiche(1.8, 3.4, R, { figure: idol(3, R) }), 0, 14, 0), a, dist, lat));
    }
  }
  for (const [x, z, r] of [[0, 0, 11], [-22, -26, 5.2], [22, -26, 5.2], [-22, 26, 5.2], [22, 26, 5.2], [0, -32, 5.2], [0, 32, 5.2], [-26, 0, 5.2], [26, 0, 5.2]]) {
    d.add(at(petalRing(r * 1.06, Math.round(r * 2.4), r * 0.4, r * 0.3, 0.75, P, 0.3), x, 27.5 + r * 0.35, z));
  }
  mergeByMaterial(d);
  f.add(d, inst(unitBox(), bases, Ps), inst(unitBox(), caps, Ps));
}

// Akshardham: fountains playing in the Narayan Sarovar round the mandir, the gardens between it and
// the colonnade, lamps at the corners, and marigold garlands over the main door.
export function addDetails(f, g) {
  architecture(f);
  const jets = [...along(9, [-64, -76], [-64, 76]), ...along(9, [64, -76], [64, 76]), ...along(7, [-48, -76], [48, -76])];
  g.add(fountains(jets, { y: 0.3, h: 2.6 }));
  const garden = [];
  for (const [x0, x1, z0, z1] of [[-110, -80, -115, 115], [80, 110, -115, 115], [-75, 75, -118, -88]]) garden.push(...scatter(8, [x0, x1, z0, z1], { seed: Math.abs(x0 + z0), gap: 12 }));
  g.add(trees(garden, { kind: 'neem', seed: 3 }), shrubs(garden.map(([x, z]) => [x + 4, z + 3, 1.6]), { flowers: '#d24d8a', seed: 4 }));
  g.add(trees([...along(6, [-20, 95], [-20, 125]), ...along(6, [20, 95], [20, 125])], { kind: 'ashoka', seed: 5 }));
  g.add(lampPosts([[-80, 90], [80, 90], [-80, -90], [80, -90], ...along(4, [-12, 90], [-12, 125]), ...along(4, [12, 90], [12, 125])]));
  f.add(garland([-1.9, 15.4, 41.7], [1.9, 15.4, 41.7], { sag: 0.45, strands: 2 }));
}
