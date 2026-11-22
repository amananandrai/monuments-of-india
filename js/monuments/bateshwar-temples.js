import * as THREE from 'three';
import { mat, mesh, box, at, inst, rng, photo, nagaraProfile, flat, kalash, shikhara, flag, M } from '../helpers.js';
import { carvedPillar } from '../parts/temples.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial, mouldings, templeNiche, idol } from '../parts/components.js';
import { addDetails } from '../details/bateshwar-temples.js';

// The Bateshwar temples, in the ravines of the Chambal near Morena: some two hundred small
// sandstone temples to Shiva and Vishnu of the Gurjara-Pratiharas (8th to 10th centuries), on a
// slope above a tank. All but a few had fallen when the Archaeological Survey began to set them up
// again in 2005. From photographs: rows of little shrines, each a square sanctum about 3 to 4 m
// across under a curved spire, with a small porch on two pillars, crowded shoulder to shoulder on
// terraces that climb the hill; the rebuilt ones pale and sharp, with the old weathered stones
// grey among them; heaps of numbered stones still waiting; and, by the tank at the foot, the
// largest, the Bhuteshwar temple, before a pillared hall. Front (+z) is the tank.
export const NEW = photo(mat('#c4a682', 0.9), 'sandstone');
export const OLD = photo(mat('#8e7b64', 0.93), 'sandstone');

// One small shrine, 1 m across its walls (scaled up 3 to 4 times when placed): plinth, walls on
// the cross plan, a cornice, the curved spire in courses, its amalaka, and a little porch on two
// pillars before the door. Its foot at y = 0, facing +z. Built once, as one geometry.
let shrine_ = null;
export function shrineGeo() {
  if (shrine_) return shrine_;
  const g = new THREE.Group(), m = NEW, n = 8;
  g.add(box(1.4, 0.22, 1.7, m, 0, 0, 0.15), box(1, 0.9, 1, m, 0, 0.22, 0), box(1.1, 0.9, 0.5, m, 0, 0.22, 0), box(0.5, 0.9, 1.1, m, 0, 0.22, 0), box(1.16, 0.08, 1.16, m, 0, 1.12, 0));
  for (let i = 0; i < n; i++) { const w = nagaraProfile(i / n), y = 1.2 + i * (1.6 / n); g.add(box(w * 0.86, 1.6 / n, w * 0.86, m, 0, y, 0), box(w, 1.3 / n, w * 0.5, m, 0, y, 0), box(w * 0.5, 1.3 / n, w, m, 0, y, 0)); }
  g.add(box(0.26, 0.08, 0.26, m, 0, 2.8, 0));
  const a = mesh(new THREE.SphereGeometry(0.3, 12, 4), m, 0, 2.98, 0);
  a.scale.y = 0.42;
  g.add(a, box(0.1, 0.18, 0.1, m, 0, 3.08, 0));
  // The porch: two pillars, a beam and a slab, before a dark door.
  for (const x of [-0.3, 0.3]) g.add(box(0.1, 0.62, 0.1, m, x, 0.22, 0.85));
  g.add(box(0.8, 0.08, 0.42, m, 0, 0.84, 0.75), box(0.86, 0.06, 0.5, m, 0, 0.92, 0.76));
  shrine_ = mergeByMaterial(g).children[0].geometry;
  return shrine_;
}
// The door of a small shrine: a dark slot, as its own geometry.
let door_ = null;
export function doorGeo() {
  return door_ || (door_ = new THREE.BoxGeometry(0.3, 0.55, 0.04).translate(0, 0.5, 0.57));
}

// The terraces: [z of the front, y of the top]. Each climbs 2.2 m behind the one before.
export const ROWS = [[6, 0], [-8, 2.2], [-22, 4.4], [-36, 6.6], [-50, 8.8]];

export function buildBateshwarTemples() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const R = rng(23), fresh = [], old = [], doors = [];
  // The shrines along each terrace, some 4.5 m apart, left as gaps where none has been set up.
  ROWS.forEach(([z0, y], r) => {
    for (let x = -62 + (r % 2) * 2.2; x <= 62; x += 4.4 + R() * 0.8) {
      if (r === 0 && Math.abs(x) < 15) continue;
      if (R() < 0.22) continue;
      const s = 2.8 + R() * 1.4 + (R() < 0.1 ? 1.2 : 0), z = z0 - 3 - R() * 1.5, turn = (R() - 0.5) * 0.06;
      (R() < 0.72 ? fresh : old).push([x, y, z, s, s * (0.92 + R() * 0.16), s, turn]);
      doors.push([x, y, z, s, s, s, turn]);
    }
  });
  f.add(inst(shrineGeo(), fresh, NEW), inst(shrineGeo(), old, OLD), inst(doorGeo(), doors, mat('#2f2822', 0.95)));
  // The Bhuteshwar temple, the largest, on the axis by the tank: a plinth, a sanctum 7 m across
  // under a spire 11 m high, and a hall of carved pillars before it under a slab roof.
  const b = new THREE.Group(), P = 1.4, BW = 7, BH = 4.2;
  b.add(box(BW + 3, P, BW + 14, OLD, 0, 0, 4), box(BW + 3.3, 0.2, BW + 14.3, NEW, 0, P - 0.2, 4));
  b.add(box(BW, BH, BW, NEW, 0, P, 0), box(BW + 0.7, BH, BW * 0.5, NEW, 0, P, 0), box(BW * 0.5, BH, BW + 0.7, NEW, 0, P, 0));
  b.add(mouldings(BW + 0.71, BW + 0.71, [[P, 0.3, 0.12, OLD], [P + 0.3, 0.25, 0.06, NEW], [P + BH - 0.3, 0.3, 0.14, OLD]], NEW));
  const sp = shikhara(BW + 0.3, 11, NEW, nagaraProfile, 18, NEW, 0.6);
  b.add(at(sp, 0, P + BH, 0));
  b.add(at(flag(2.4, M.saffron), 0, P + BH + sp.userData.top - 0.2, 0));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) {
    const nn = at(templeNiche(1.2, 2.2, NEW, { figure: idol(1.9, OLD) }), 0, P + 0.7, 0);
    nn.rotation.y = a;
    nn.position.set(Math.sin(a) * (BW / 2 + 0.36), P + 0.7, Math.cos(a) * (BW / 2 + 0.36));
    b.add(nn);
  }
  // Its hall: four rows of pillars under a flat roof with a low stepped centre.
  for (const x of [-3.6, -1.2, 1.2, 3.6]) for (const z of [5.2, 7.8, 10.4]) b.add(at(carvedPillar(3.2, NEW), x, P, z));
  b.add(box(9.2, 0.45, 8, NEW, 0, P + 3.2, 7.8), box(9.8, 0.2, 8.6, OLD, 0, P + 3.65, 7.8), box(5, 0.5, 4.6, NEW, 0, P + 3.85, 7.8), box(2.8, 0.4, 2.6, NEW, 0, P + 4.35, 7.8));
  b.add(at(templeDoorway(1.5, 2.8, { m: NEW, guardianH: 1.3, hood: false }), 0, P, BW / 2 + 0.36), at(steps(4, P, 5, OLD), 0, 0, 11));
  f.add(at(mergeByMaterial(b), 0, 0, 6));
  addDetails(f, g, { R });
  // From the tank, up the slope of rebuilt shrines.
  return { group: g, focus: f, view: [0.38, 0.32, 1], zoom: 0.62 };
}
