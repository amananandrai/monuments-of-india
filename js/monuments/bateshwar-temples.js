import * as THREE from 'three';
import { mat, mesh, box, at, inst, rng, photo, nagaraProfile, shikhara, flag, M } from '../helpers.js';
import { carvedPillar } from '../parts/temples.js';
import { steps } from '../parts/doorways.js';
import { carved, mergeByMaterial, mouldings } from '../parts/components.js';
import { addDetails } from '../details/bateshwar-temples.js';

// The Bateshwar temples, in the ravines of the Chambal near Morena: some two hundred small
// sandstone temples to Shiva, Vishnu and the goddess of the Gurjara-Pratiharas (8th to 10th
// centuries), on a slope above a tank cut in the rock. All but a few had fallen when the
// Archaeological Survey began to set them up again in 2005. From photographs and Cunningham's
// account of 1882: little shrines 2 to 4 m across crowded shoulder to shoulder on terraces that
// climb the hill. Most are a square cell on a moulded base under a short curved spire with a great
// ribbed amalaka, the door in a shallow projection under a pediment with a medallion; many are
// 'mandapika' shrines, their walls single slabs set upright between pilasters under a broad flat
// awning and a low stepped top; the rebuilt ones pale and sharp, with the old weathered stones grey
// among them. By the tank at the foot stands the largest, the Bhuteshwar temple (its sanctum only
// 2.06 m square inside, its tower 4.67 m square at the foot) behind a low pillared hall, and next
// to it a Vishnu temple of the same size, its tower gone, with an open hall on a high plinth; a
// street between two rows of small shrines leads to the tank. Front (+z) is the tank.
export const NEW = photo(mat('#c4a682', 0.9), 'sandstone');
export const OLD = photo(mat('#8e7b64', 0.93), 'sandstone');
// The spires are carved all over with a mesh of small horseshoe arches (gavakshas).
export const NEW_CARVED = carved(mat('#c0a17c', 0.9), 'frieze');
export const OLD_CARVED = carved(mat('#8a7760', 0.93), 'frieze');
const DARK = mat('#2f2822', 0.95);

const geoOf = (g) => mergeByMaterial(g).children[0].geometry;
const amalaka = (r, y, m) => { const a = mesh(new THREE.SphereGeometry(r, 12, 4), m, 0, y, 0); a.scale.y = 0.45; return a; };
// One small spired shrine, 1 m across its walls (scaled up 2.5 to 5 times when placed), as two
// geometries. body: the moulded base, the walls on the cross plan, the cornice and the door's
// projection. spire: the curved spire in courses, the pediment over the door with its medallion,
// the neck, the ribbed amalaka and the finial. Foot at y = 0, facing +z. Built once.
let shrine_ = null;
export function shrineGeo() {
  if (shrine_) return shrine_;
  const b = new THREE.Group(), s = new THREE.Group(), m = NEW, n = 8;
  b.add(box(1.34, 0.1, 1.34, m), box(1.22, 0.12, 1.22, m, 0, 0.1, 0), box(1, 0.85, 1, m, 0, 0.22, 0), box(1.1, 0.85, 0.46, m, 0, 0.22, 0), box(0.46, 0.85, 1.1, m, 0, 0.22, 0), box(1.16, 0.07, 1.16, m, 0, 1.07, 0));
  b.add(box(0.66, 0.92, 0.2, m, 0, 0.22, 0.62), box(0.74, 0.06, 0.26, m, 0, 1.08, 0.62), box(0.8, 0.1, 0.3, m, 0, 0.1, 0.66));
  for (let i = 0; i < n; i++) { const w = nagaraProfile(i / n), y = 1.14 + i * (1.5 / n); s.add(box(w * 0.86, 1.5 / n, w * 0.86, m, 0, y, 0), box(w, 1.2 / n, w * 0.5, m, 0, y, 0), box(w * 0.5, 1.2 / n, w, m, 0, y, 0)); }
  s.add(box(0.62, 0.3, 0.2, m, 0, 1.14, 0.56), box(0.44, 0.24, 0.16, m, 0, 1.44, 0.52), box(0.2, 0.12, 0.12, m, 0, 1.68, 0.48));
  s.add(at(mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 10).rotateX(Math.PI / 2), m), 0, 1.5, 0.62));
  s.add(box(0.28, 0.08, 0.28, m, 0, 2.64, 0), amalaka(0.33, 2.86, m), box(0.1, 0.16, 0.1, m, 0, 2.98, 0));
  return (shrine_ = { body: geoOf(b), spire: geoOf(s) });
}
// One mandapika shrine, 1 m across its walls: a moulded base, slab walls between corner pilasters
// with a carved panel on each, the broad flat awning (chadya), and over it two low steps and a
// small amalaka. One geometry.
let mandapika_ = null;
export function mandapikaGeo() {
  if (mandapika_) return mandapika_;
  const g = new THREE.Group(), m = NEW;
  g.add(box(1.36, 0.12, 1.36, m), box(1.22, 0.12, 1.22, m, 0, 0.12, 0), box(1, 0.96, 1, m, 0, 0.24, 0), box(1.1, 0.08, 1.1, m, 0, 1.2, 0));
  for (const x of [-0.46, 0.46]) for (const z of [-0.46, 0.46]) g.add(box(0.14, 0.96, 0.14, m, x, 0.24, z));
  for (const a of [1, 2, 3]) { const p = box(0.34, 0.56, 0.05, m, 0, 0.44, 0.51); const h = new THREE.Group(); h.add(p); h.rotation.y = (a * Math.PI) / 2; g.add(h); }
  g.add(box(1.72, 0.07, 1.72, m, 0, 1.28, 0), box(1.16, 0.12, 1.16, m, 0, 1.35, 0), box(0.84, 0.12, 0.84, m, 0, 1.47, 0), box(0.5, 0.08, 0.5, m, 0, 1.59, 0), amalaka(0.2, 1.74, m));
  return (mandapika_ = geoOf(g));
}
// The doors: dark slots, in the spired shrine's projection and in the mandapika's front wall.
let doors_ = null;
export function doorGeos() {
  return doors_ || (doors_ = [new THREE.BoxGeometry(0.34, 0.62, 0.04).translate(0, 0.59, 0.71), new THREE.BoxGeometry(0.44, 0.7, 0.04).translate(0, 0.63, 0.49)]);
}

// The terraces: [z of the front, y of the top]. Each climbs 2.2 m behind the one before.
export const ROWS = [[6, 0], [-8, 2.2], [-22, 4.4], [-36, 6.6], [-50, 8.8]];
// The tank's centre and size, the street that leads to it from the east, and where the two large
// temples stand: [x, z] of each sanctum.
// The tank is sunk 2.5 m below the paving: the whole site is modelled from the level of that
// paving (y = 0 here) and lifted by LIFT, so that the tank's floor is not under the open land.
export const LIFT = 3;
export const TANK = { z: 33, w: 30, d: 22 }, STREET = { x0: 19, x1: 64, z: 33 }, BHUTESHWAR = [-4, 3], VISHNU = [10.5, 3];
// The larger spired shrines that are dressed with carving in the detail file: [x, y, z, size, turn].
export const CARVED_SHRINES = [[-21, 0, 17, 3.2, 0], [-16.5, 0, 17.6, 2.7, 0], [20.5, 0, 20, 3, 0], [-26, 2.2, -11, 3.2, 0], [24, 2.2, -11, 3, 0]];

export function buildBateshwarTemples() {
  const g = new THREE.Group(), site = at(new THREE.Group(), 0, LIFT, 0), f = new THREE.Group();
  g.add(site);
  site.add(f);
  const R = rng(23), spired = [[], []], flat = [[], []], doors = [[], []];
  const put = (x, y, z, s, turn, kind = R() < 0.32 ? 1 : 0, age = R() < 0.72 ? 0 : 1) => {
    const sy = s * (0.92 + R() * 0.16);
    (kind ? flat : spired)[age].push([x, y, z, s, kind ? s : sy, s, turn]);
    doors[kind].push([x, y, z, s, s, s, turn]);
  };
  // The shrines along each terrace, a front row some 3.6 m apart and a thinner row behind it, left
  // as gaps where none has been set up: about a third of them mandapikas, which are the smaller,
  // and one in ten a larger spired one.
  ROWS.forEach(([z0, y], r) => {
    for (const back of [0, 1]) for (let x = -62 + ((r + back) % 2) * 1.8; x <= 62; x += 3.5 + R() * 0.7) {
      const kind = R() < 0.32 ? 1 : 0, s = kind ? 1.6 + R() * 0.7 : 1.7 + R() * 0.9 + (R() < 0.12 ? 0.8 : 0), z = z0 - 2.4 - back * 4.6 - R() * 1.2, turn = (R() - 0.5) * 0.06;
      if (r === 0 && x > -15 && x < 22) continue;
      if (R() < (back ? 0.5 : 0.2) || CARVED_SHRINES.some(([cx, , cz]) => Math.abs(x - cx) < 3.6 && Math.abs(z - cz) < 4)) continue;
      put(x, y, z, s, turn, kind);
    }
  });
  // The street to the tank: two rows facing each other across a paved way.
  for (let x = STREET.x0 + 2; x < STREET.x1; x += 3.6) for (const side of [-1, 1]) {
    if (R() < 0.15) continue;
    put(x + R() * 0.6, 0, STREET.z + side * (4.2 + R() * 0.5), 1.7 + R() * 0.8, side > 0 ? Math.PI : 0);
  }
  // Mandapikas at the edge of the tank, as they stand before the Bhuteshwar temple, and the
  // larger spired shrines (their carving is in the detail file).
  for (const [x, z, s] of [[-12, 20.2, 2.3], [-8.6, 20.4, 2.5], [9.5, 20.2, 2], [12.6, 20.4, 2.2], [-17.6, 24, 2]]) put(x, 0, z, s, 0, 1, 0);
  for (const [x, y, z, s, turn] of CARVED_SHRINES) { spired[0].push([x, y, z, s, s, s, turn]); doors[0].push([x, y, z, s, s, s, turn]); }
  const { body, spire } = shrineGeo();
  f.add(inst(body, spired[0], NEW), inst(body, spired[1], OLD), inst(spire, spired[0], NEW_CARVED), inst(spire, spired[1], OLD_CARVED));
  f.add(inst(mandapikaGeo(), flat[0], NEW), inst(mandapikaGeo(), flat[1], OLD), inst(doorGeos()[0], doors[0], DARK), inst(doorGeos()[1], doors[1], DARK));
  // The Bhuteshwar temple, the largest: on a low plinth a sanctum 4.8 m across its walls under a
  // spire 8.6 m high, and before it a low, wide hall of short carved pillars under a flat roof.
  const b = new THREE.Group(), P = 1, BW = 4.8, BH = 3.4;
  b.add(box(BW + 2, P, BW + 2, OLD, 0, 0, 0), box(12.4, P, 5.6, OLD, 0, 0, 5.4), box(12.7, 0.18, 5.9, NEW, 0, P - 0.18, 5.4));
  b.add(box(BW, BH, BW, NEW, 0, P, 0), box(BW + 0.6, BH, BW * 0.5, NEW, 0, P, 0), box(BW * 0.5, BH, BW + 0.6, NEW, 0, P, 0));
  b.add(mouldings(BW + 0.61, BW + 0.61, [[P, 0.28, 0.12, OLD], [P + 0.28, 0.22, 0.06, NEW], [P + BH - 0.28, 0.28, 0.14, OLD]], NEW));
  const sp = shikhara(BW + 0.2, 8.6, NEW_CARVED, nagaraProfile, 18, NEW, 0.6);
  b.add(at(sp, 0, P + BH, 0), at(flag(2.2, M.saffron), 0, P + BH + sp.userData.top - 0.2, 0));
  for (const x of [-5.25, -3.15, -1.05, 1.05, 3.15, 5.25]) for (const z of [3.9, 6.9]) b.add(at(carvedPillar(2.5, NEW), x, P, z));
  b.add(box(12, 0.36, 4.6, NEW, 0, P + 2.5, 5.4), box(12.9, 0.16, 5.5, OLD, 0, P + 2.86, 5.4), box(4.4, 0.3, 3, NEW, 0, P + 3.02, 5.2));
  b.add(at(steps(3.6, P, 4, OLD), 0, 0, 8.2));
  f.add(at(mergeByMaterial(b), BHUTESHWAR[0], 0, BHUTESHWAR[1]));
  addDetails(f, site, { R, P, BW, BH, land: g });
  // From across the tank: the two large temples at its head, the terraces of shrines behind.
  return { group: g, focus: f, view: [0.3, 0.3, 1], zoom: 0.52 };
}
