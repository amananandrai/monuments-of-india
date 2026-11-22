import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, sheet, hemi, inst, unitBox, archWall } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { mountainRing } from '../parts/terrain.js';
import { trees, shrubs, scatter, along, lampPosts, townHouses, boats } from '../parts/realism.js';
import { detail } from '../detail.js';
import { LIME, BRICK, BRICK_DARK } from '../monuments/kangla-fort.js';

const THATCH = mat('#7a5a3a', 0.95), TIN = mat('#8d2f2a', 0.6, 0.3), WOOD = mat('#5d3b26', 0.85), RED = mat('#b2392c', 0.75), ROAD = mat('#6b665c', 0.95);

// A Meitei roof w wide, d long and h high over y = 0: a steep gable whose sides sag a little, the
// ridge running along z and sweeping up at both ends into horns, as on the halls and shrines of
// Manipur.
function meiteiRoof(w, d, h, m, horn = m) {
  const g = new THREE.Group(), s = new THREE.Shape(), e = w * 0.08;
  s.moveTo(-w / 2 - e, 0);
  for (let k = 1; k <= 8; k++) { const t = k / 8; s.lineTo(-w / 2 - e + (w / 2 + e) * t, h * (t - 0.18 * t * (1 - t))); }
  for (let k = 7; k >= 0; k--) { const t = k / 8; s.lineTo(w / 2 + e - (w / 2 + e) * t, h * (t - 0.18 * t * (1 - t))); }
  s.lineTo(w / 2 + e, -0.25); s.lineTo(-w / 2 - e, -0.25); s.closePath();
  g.add(mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }).translate(0, 0, -d / 2), m));
  for (const sz of [-1, 1]) {
    const pts = [];
    for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push(new THREE.Vector3(0, h + 0.1 + t * t * h * 0.35, sz * (d / 2 - 0.2 + t * h * 0.32))); }
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, Math.max(0.06, w * 0.02), 6, false), horn));
  }
  return g;
}

// The Uttra's ruins: stumps of brick walls and the bases of its pillars on the plinth (at z = -26).
function uttra(f) {
  const d = new THREE.Group(), y = 1.65, cz = -26, stumps = [];
  for (const [x, z, w, dd, h] of [[-15, -8, 0.9, 6, 1.8], [-15, 4, 0.9, 8, 1.2], [15, -6, 0.9, 9, 2.2], [15, 6, 0.9, 4, 0.9], [-8, -10, 12, 0.9, 1.6], [7, -10, 10, 0.9, 2.4]]) stumps.push([x, y, cz + z, w, h, dd, 0]);
  for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) stumps.push([i * 5, y, cz + j * 5, 1.1, 0.5, 1.1, 0]);
  d.add(inst(unitBox(), stumps, BRICK_DARK));
  f.add(d);
}

// A temple of the Kangla: a square shrine on a plinth under a Meitei roof, a porch in front.
function shrine(w, h, roofM) {
  const g = new THREE.Group();
  g.add(box(w + 4, 1, w + 6, LIME, 0, 0, 1), box(w, h, w, LIME, 0, 1, 0), box(w * 0.4, h * 0.7, 0.1, WOOD, 0, 1, w / 2 + 0.01));
  g.add(at(meiteiRoof(w + 1.6, w + 1.2, w * 0.95, roofM, roofM), 0, 1 + h, 0));
  for (const x of [-w / 2 + 0.3, w / 2 - 0.3]) g.add(cyl(0.18, 0.2, h - 0.6, WOOD, x, 1, w / 2 + 2.2, 8));
  g.add(at(meiteiRoof(w, 3.2, w * 0.45, roofM, roofM), 0, h + 0.4, w / 2 + 1.6).rotateY(0));
  return g;
}

// The Kangla: the lawns and avenue round the Kangla Sha and the Uttra; the Pakhangba temple and the
// old Govindajee temple's brick ruins; the moat and the western gate with its Meitei roof; trees
// throughout; the Imphal river and the city to the east, and the hills round the valley.
export function addDetails(f, g) {
  uttra(f);
  const A = 330;
  g.add(sheet(2400, 2400, M.grass, 0, -0.2, 0));
  // The avenue east from the Kangla Sha, paved, with lamps.
  const p = new THREE.Group();
  p.add(box(8, 0.06, 120, M.path, 0, 0, 58), box(30, 0.06, 14, M.path, 0, 0, 0), box(46, 0.06, 6, M.path, 0, 0, -12));
  g.add(mergeByMaterial(p));
  g.add(lampPosts([...along(8, [-5.5, 14], [-5.5, 112]), ...along(8, [5.5, 14], [5.5, 112])]));
  g.add(shrubs(along(30, [-14, 8], [-14, 110]).concat(along(30, [14, 8], [14, 110])).map(([x, z]) => [x, z, 1.1]), { seed: 3, flowers: '#e8a22b' }));
  // The Pakhangba temple north-east of the Uttra, and the old Govindajee temple's brick shrines.
  f.add(at(shrine(8, 6, TIN), 50, 0, -10).rotateY(Math.PI / 2));
  const gov = new THREE.Group();
  for (const x of [-7, 7]) {
    gov.add(box(9, 1.2, 9, BRICK_DARK, x, 0, 0), box(7, 6.5, 7, BRICK, x, 1.2, 0), at(hemi(3.4, BRICK, 20), x, 7.7, 0), cyl(0.3, 0.6, 1.2, BRICK_DARK, x, 11, 0, 8));
    gov.add(at(archWall(7.02, 4.5, 0.4, 2.2, 3.6, false, BRICK), x, 1.2, 3.4));
  }
  g.add(at(gov, -60, 0, 10).rotateY(Math.PI / 2));
  // The moat round the Kangla's square, and the western gate across it.
  const moat = new THREE.Group(), mw = 18;
  for (const [x, z, w, d] of [[0, -A, 2 * A + mw, mw], [0, A, 2 * A + mw, mw], [-A, 0, mw, 2 * A], [A, 0, mw, 2 * A]]) moat.add(sheet(w, d, M.water, x, -0.1, z));
  g.add(moat);
  const bank = [];
  for (const s of [-1, 1]) { bank.push([0, -0.6, s * (A - mw / 2 - 0.4), 2 * A - mw, 0.8, 0.8, 0], [s * (A - mw / 2 - 0.4), -0.6, 0, 0.8, 0.8, 2 * A - mw, 0]); }
  g.add(inst(unitBox(), bank, BRICK_DARK));
  // The gate on the west side: a white gatehouse with a passage, under a Meitei roof, and a
  // bridge over the moat; another on the east, where the avenue leaves.
  for (const [x, ry] of [[-A + 14, -Math.PI / 2], [A - 14, Math.PI / 2]]) {
    const gate = new THREE.Group();
    gate.add(archWall(16, 7, 6, 4.4, 5.4, false, LIME), box(17, 0.6, 7, RED, 0, 7, 0), at(meiteiRoof(14, 8, 5.5, TIN, TIN), 0, 7.6, 0).rotateY(Math.PI / 2));
    gate.add(box(6, 0.4, 24, ROAD, 0, -0.1, 15));
    g.add(at(gate, x, 0, 0).rotateY(ry));
  }
  g.add(box(6, 0.06, A - 125, M.path, 0, 0, 118 + (A - 125) / 2 - 3).rotateY(0));
  // Trees: the old trees of the Kangla's lawns and groves.
  const avoid = [[-30, 30, -45, 125], [36, 64, -24, 4], [-74, -46, -10, 30], [-A - 30, -A + 30, -30, 30], [A - 30, A + 30, -30, 30]];
  const spots = scatter(detail.low ? 90 : 220, [-A + 14, A - 14, -A + 14, A - 14], { seed: 5, gap: 12, avoid });
  const kinds = ['peepal', 'banyan', 'mango', 'jamun', 'teak'];
  kinds.forEach((k, i) => g.add(trees(spots.filter((_, j) => j % kinds.length === i), { kind: k, seed: 3 + i })));
  g.add(trees(along(12, [-22, -50], [22, -50]), { kind: 'ashoka', seed: 9 }));
  // The Imphal river east of the moat, with boats, and the city beyond; the hills of the valley.
  g.add(sheet(90, 2400, M.river, A + 120, -0.25, 0));
  g.add(boats([[A + 110, 60, 1.5], [A + 130, -140, 1.4]], { y: -0.25, size: 1.4 }));
  const R = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(5), town = [];
  for (let x = A + 190; x < 1100; x += 16) for (let z = -900; z < 900; z += 15) if (R() < (detail.low ? 0.25 : 0.55)) town.push([x, z, 9 + R() * 4, 10 + R() * 3, 1 + Math.floor(R() * 3), Math.PI / 2 * Math.floor(R() * 4)]);
  for (let z = A + 60; z < 1100; z += 16) for (let x = -900; x < A + 60; x += 16) if (R() < (detail.low ? 0.15 : 0.4)) town.push([x, z, 9 + R() * 4, 10 + R() * 3, 1 + Math.floor(R() * 2), Math.PI / 2 * Math.floor(R() * 4)]);
  g.add(townHouses(town, { seed: 4, roof: 'pitched', roofs: ['#8d2f2a', '#2f5d9a', '#3c7a4f', '#7a7f84'], tanks: 0.4, fine: false }));
  g.add(mountainRing({ inner: 1500, outer: 2600, h: 420, size: 6400, cover: '#4a6838' }));
}
