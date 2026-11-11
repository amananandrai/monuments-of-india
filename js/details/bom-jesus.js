import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, photo } from '../helpers.js';
import { dentils, windowFrame, sunburst, lettering, panel, frieze, mergeByMaterial } from './components.js';
import { pinnacle } from './sculpture.js';
import { trees, shrubs, lampPosts, asiBoard, scatter, along } from './realism.js';

// The Basilica of Bom Jesus, finer detail. From photographs: the basalt pilasters of the facade
// have moulded bases and capitals on every tier; scrolls (volutes) flank the top tier; a dentil
// course runs under the cornice along the nave; pilaster strips divide the nave's side walls between
// its windows; the bell tower opens in round-arched belfry windows on every face.
// Dimensions follow js/monuments/bom-jesus.js: the facade at z = 12.2, its tiers 8 high.
const BASALT = photo(mat('#8a847a', 0.85), 'blocks');
function architecture(f) {
  const d = new THREE.Group(), fz = 12.2;
  for (const x of [-12, -4.3, 4.3, 12]) for (const y of [0, 8, 16]) {
    d.add(box(1.6, 0.5, 1.05, BASALT, x, y + (y ? 0.4 : 0), fz + 1.3), box(1.7, 0.55, 1.1, BASALT, x, y + 7.05, fz + 1.3));
  }
  for (const s of [-1, 1]) {
    const v = mesh(new THREE.TorusGeometry(1.1, 0.3, 8, 20, Math.PI * 1.5), BASALT, s * 6.1, 25.6, fz + 1.15);
    v.rotation.z = s > 0 ? Math.PI : -Math.PI / 2;
    d.add(v);
  }
  for (const s of [-1, 1]) {
    d.add(at(dentils(55.6, 0.25, 0.3, 0.3, BASALT), s * 9.15, 15.4, -16).rotateY(s * Math.PI / 2));
    for (let z = -43.5; z <= 9.5; z += 7) d.add(box(0.7, 15.5, 0.25, BASALT, s * 9.12, 0, z));
  }
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const t = at(new THREE.Group(), -12.5, 0, -40);
    t.add(onFace(at(windowFrame(1.8, 3.4, BASALT, { shape: 'round', frame: 0.28 }), 0, 17.4, 0), a, 3.01));
    d.add(t);
  }
  mergeByMaterial(d);
  f.add(d);
}

// The sculpture and finer parts, after photographs: the IHS emblem of the Jesuits, in gilt letters
// on a sunburst, on the tablet at the top of the facade; carved panels either side of it; obelisk
// pinnacles on the top tier; stepped buttresses along the nave; and pinnacles on the corners of
// the bell tower.
function sculpture(f) {
  const d = new THREE.Group(), fz = 12.2, L = mat('#9b5b3f', 0.95);
  d.add(at(sunburst(1.55, M.gild, { rays: 24 }), 0, 27.1, 13.62), at(lettering('IHS', 0.95, 0.08, M.gild), 0, 26.6, 13.72));
  for (const x of [-3.2, 3.2]) d.add(at(panel(2.2, 3.4, 0.16, BASALT, frieze(L)), x, 25.2, fz + 1.11));
  for (const x of [-11, -5.4, 5.4, 11]) d.add(at(pinnacle(Math.abs(x) > 8 ? 2.6 : 2, BASALT), x, 24.4, fz + 0.6));
  for (const s of [-1, 1]) for (let z = -43.5; z <= 9.5; z += 7) d.add(box(0.8, 10, 0.9, L, s * 9.4, 0, z), box(0.6, 3.5, 0.8, L, s * 9.3, 10, z));
  for (const x of [-15.5, -9.5]) for (const z of [-43, -37]) d.add(at(pinnacle(2, BASALT), x, 22.6, z));
  mergeByMaterial(d);
  f.add(d);
}


// The Basilica of Bom Jesus in Old Goa: coconut palms and bougainvillea round the lawns, the stone
// cross on its pedestal before the church, and lamps along the square.
const LATERITE = photo(mat('#9b5b3f', 0.95), 'laterite'), LIME = mat('#ece6da', 0.85);
export function addDetails(f, g) {
  architecture(f);
  sculpture(f);
  g.add(trees(scatter(24, [-78, 78, -58, 98], { seed: 3, gap: 10, avoid: [[-30, 32, -48, 20], [-16, 16, 18, 82]] }), { kind: 'palm', seed: 3 }));
  g.add(shrubs(scatter(16, [-70, 70, 22, 90], { seed: 4, gap: 6, avoid: [[-17, 17, 18, 82]] }).map(([x, z]) => [x, z, 1.8]), { flowers: '#d0306f', seed: 4 }));
  // The cross in front of the church: a laterite pedestal, a whitewashed shaft and cross
  f.add(box(3, 2, 3, LATERITE, 0, 0, 40), box(2.2, 0.4, 2.2, LIME, 0, 2, 40), cyl(0.18, 0.22, 4.5, LIME, 0, 2.4, 40, 8), box(2, 0.32, 0.32, LIME, 0, 5.6, 40));
  g.add(lampPosts([...along(5, [-15, 24], [-15, 78]), ...along(5, [15, 24], [15, 78])]));
  g.add(asiBoard('Basilica of Bom Jesus', 20, 80, 0, { line2: 'WORLD HERITAGE SITE' }));
}
