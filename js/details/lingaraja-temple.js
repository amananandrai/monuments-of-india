import * as THREE from 'three';
import { M, mat, photo, flat, mesh, box, cyl, at, onFace, FACES, inst, sheet, kalash, bell, shikhara, pidaRoof, kalingaProfile, rng } from '../helpers.js';
import { mouldings, frieze, templeNiche, idol, pilasters, medallion, mergeByMaterial } from '../parts/components.js';
import { wallWithGaps } from '../parts/temples.js';
import { figureFrieze, figure } from '../parts/sculpture.js';
import { templeDoorway } from '../parts/doorways.js';
import { lion, nandi } from '../parts/animals.js';
import { trees, cityAround, scatter, along, lampPosts } from '../parts/realism.js';
import { detail } from '../detail.js';

// The Lingaraja's stone: a sandstone weathered to a dark red-grey; and the laterite of its wall.
export const STONE = mat('#7d6257', 0.93);
export const SHADE = mat('#5b4840', 0.95);
export const LATERITE = photo(mat('#8c5a42', 0.95), 'laterite');
const GHAT = mat('#a39684', 0.95);

// Lingaraja, finer detail. From photographs and descriptions of the temple: the walls of the deul
// stand on five base mouldings (pabhaga) and are cut into two storeys by a band (bandhana), each
// storey set with small shrine niches (mundis); on the south, west and north the middle face holds
// a side deity (Ganesha, Parvati, Kartikeya). Up the tower, ribbed stones (bhumi amlas) mark ten
// storeys on the corners, miniature rekha towers climb the faces beside them, and from the middle
// of each face a lion springs over a chaitya medallion. Under the amalaka sit four lions at the
// corners of the neck. Dimensions follow js/monuments/lingaraja-temple.js: the deul's walls 15.6
// square (arms to 17.4) and BH high at z = dz, its tower 17 wide and TH high on the Kalinga profile.
function deul(f, BH, TH, dz) {
  const d = new THREE.Group(), m = STONE, sh = SHADE;
  const s = at(new THREE.Group(), 0, 0, dz);
  const base = [[0, 0.6, 0.34, sh], [0.6, 0.5, 0.16, frieze(m)], [1.1, 0.5, 0.36, sh], [1.6, 0.4, 0.14, frieze(m)], [BH * 0.5, 0.7, 0.2, sh]];
  s.add(mouldings(17.4, 10.6, base, m), mouldings(10.6, 17.4, base.map(([y, h, p, c]) => [y + 0.01, h, p, c]), m), mouldings(15.6, 15.6, base.map(([y, h, p, c]) => [y + 0.02, h, p, c]), m));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) s.add(onFace(at(templeNiche(2.6, 4.6, m, { figure: idol(3.9, sh) }), 0, 2.6, 0), a, 8.72));
  for (const a of FACES) for (const [lat, dist] of [[-6.5, 7.82], [6.5, 7.82], [-3.7, 8.72], [3.7, 8.72]]) for (const y of [2.5, BH * 0.5 + 1.3]) {
    s.add(onFace(at(templeNiche(0.9, 2.3, m, { figure: detail.low ? null : idol(2, m) }), 0, y, 0), a, dist, lat));
  }
  d.add(s);
  // The bhumi amlas on the corners of the tower.
  const am = new THREE.SphereGeometry(1, detail.low ? 8 : 14, 5);
  for (let k = 1; k <= 9; k++) {
    const t = k / 10, wt = 17 * kalingaProfile(t), y = BH + t * TH, r = wt * 0.07;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const o = mesh(am, flat(m), sx * wt * 0.42, y, dz + sz * wt * 0.42); o.scale.set(r, r * 0.42, r); d.add(o); }
  }
  // The chaitya medallion on each face of the tower, under its lion.
  const t = 0.4, wt = 17 * kalingaProfile(t);
  for (const a of FACES) {
    const c = onFace(at(new THREE.Group(), 0, BH + 5.2, 0), a, 17 * kalingaProfile(0.17) * 0.5 + 0.02);
    c.add(box(3.6, 4.4, 0.3, sh, 0, -2.2, 0.15), at(medallion(1.5, m), 0, 0.2, 0.3), box(4.2, 0.4, 0.5, m, 0, 2.2, 0.25));
    c.position.z += dz;
    d.add(c);
  }
  f.add(mergeByMaterial(d));
  // The miniature towers (anga shikharas) in relief up the faces, four above one another, either
  // side of the middle band.
  const mini = [];
  for (const a of FACES) for (const lat of [-0.36, 0.36]) for (let k = 0; k < 4; k++) {
    const tt = 0.02 + k * 0.17, w = 17 * kalingaProfile(tt + 0.08), c = Math.cos(a), sn = Math.sin(a), dist = w * 0.42 + 0.1, l = lat * w, sc = w * 0.1;
    mini.push([sn * dist + c * l, BH + tt * TH, dz + c * dist - sn * l, sc, sc * 0.86, sc * 0.6, a]);
  }
  f.add(inst(rekhaGeo(), mini, m));
  // The lions: one springing from each face, and four seated at the corners under the amalaka.
  for (const a of FACES) {
    const l = onFace(detail.low ? stoneLion(2.1, m) : lion(2.1, m), a, wt * 0.5 + 0.3);
    l.position.y = BH + t * TH;
    l.position.z += dz;
    f.add(box(2.2, 0.5, 2.2, sh, l.position.x, l.position.y - 0.5, l.position.z), l);
  }
  const top = 17 * kalingaProfile(1);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const l = at(stoneLion(1.5, m), sx * top * 0.36, BH + TH, dz + sz * top * 0.36);
    l.rotation.y = Math.atan2(sx, sz);
    f.add(l);
  }
}

// A seated lion blocked out in a few stones, s high, facing +z: for the lions too small or too high
// to need the sculpted one (and for all of the tower's lions on phones).
function stoneLion(s, m) {
  const g = new THREE.Group();
  const body = box(0.42 * s, 0.62 * s, 0.6 * s, m, 0, 0, -0.08 * s);
  body.rotation.x = -0.35;
  g.add(body, box(0.5 * s, 0.14 * s, 0.34 * s, m, 0, 0, -0.3 * s));
  for (const x of [-1, 1]) g.add(cyl(0.07 * s, 0.09 * s, 0.6 * s, m, x * 0.15 * s, 0, 0.2 * s, 6));
  const mane = mesh(new THREE.SphereGeometry(0.3 * s, 8, 6), m, 0, 0.72 * s, 0.12 * s), head = mesh(new THREE.SphereGeometry(0.2 * s, 8, 6), m, 0, 0.8 * s, 0.3 * s);
  mane.scale.z = 0.8;
  g.add(mane, head, box(0.16 * s, 0.12 * s, 0.14 * s, m, 0, 0.68 * s, 0.44 * s));
  return mergeByMaterial(g);
}

// A small rekha deul as one unit shape, for the shrines that crowd the court and the miniature
// towers on the great one: 1 wide and about 3.5 high on y = 0 (walls, a cornice, the curved tower
// in steps, an amalaka and a kalasha).
let rekha_ = null;
function rekhaGeo() {
  if (rekha_) return rekha_;
  const g = new THREE.Group(), m = STONE, n = detail.low ? 5 : 8;
  g.add(box(0.92, 1.1, 0.92, m), box(1.02, 1.1, 0.5, m), box(0.5, 1.1, 1.02, m), box(1.08, 0.08, 1.08, m, 0, 1.02, 0));
  for (let i = 0; i < n; i++) {
    const w = kalingaProfile(i / n), y = 1.1 + i * (1.7 / n), h = 1.7 / n;
    g.add(box(w * 0.86, h, w * 0.86, m, 0, y, 0), box(w, h * 0.8, w * 0.52, m, 0, y, 0), box(w * 0.52, h * 0.8, w, m, 0, y, 0));
  }
  g.add(box(0.34, 0.12, 0.34, m, 0, 2.8, 0));
  const a = mesh(new THREE.SphereGeometry(0.36, 10, 4), m, 0, 3.06, 0);
  a.scale.y = 0.42;
  g.add(a, at(kalash(0.26, m), 0, 3.2, 0));
  rekha_ = mergeByMaterial(g).children[0].geometry;
  return rekha_;
}

// The halls, after photographs: each stands on carved base mouldings, with pilasters and a band of
// figures on its projecting faces; the jagamohana has a balustraded window on the north, and a
// lion sits over the middle of each face of its roof, between the two flights of slabs; the
// natamandira's faces are open bays between thick piers, closed by balustrades. Dimensions follow
// js/monuments/lingaraja-temple.js: halls [w, h, z], each a cross of a w square and two arms
// w + 2.4 by 0.56 w.
function halls(f) {
  const d = new THREE.Group(), m = STONE, sh = SHADE;
  for (const [w, h, z, kind] of [[19, 10, -5.5, 'jaga'], [15, 8, 11.5, 'nata'], [17, 8, 27.5, 'bhoga']]) {
    const t = at(new THREE.Group(), 0, 0, z), arm = w * 0.56, out = (w + 2.4) / 2;
    const base = [[0, 0.5, 0.3, sh], [0.5, 0.45, 0.14, frieze(m)], [0.95, 0.45, 0.32, sh], [h - 0.9, 0.5, 0.16, frieze(m)]];
    t.add(mouldings(w + 2.4, arm, base, m), mouldings(arm, w + 2.4, base.map(([y, hh, p, c]) => [y + 0.01, hh, p, c]), m), mouldings(w, w, base.map(([y, hh, p, c]) => [y + 0.02, hh, p, c]), m));
    for (const a of [Math.PI / 2, -Math.PI / 2]) {
      // The corners of the square, either side of the arm.
      for (const l of [-1, 1]) t.add(onFace(at(templeNiche(1.0, 2.4, m, { figure: idol(2.1, m) }), 0, 2.4, 0), a, w / 2 + 0.03, l * (arm / 2 + (w - arm) / 4)));
      if (kind === 'nata') {
        for (const l of [-1, 1]) {
          t.add(onFace(box(1.9, 3.6, 0.06, M.recess, 0, 1.6, 0), a, out + 0.03, l * arm * 0.3));
          for (let k = -2; k <= 2; k++) t.add(onFace(cyl(0.11, 0.13, 1.5, m, 0, 1.6, 0, 6), a, out + 0.12, l * arm * 0.3 + k * 0.36));
          t.add(onFace(box(2.2, 0.2, 0.3, sh, 0, 3.1, 0), a, out + 0.15, l * arm * 0.3));
        }
        continue;
      }
      t.add(onFace(at(pilasters(arm - 0.6, 4, 0.5, h - 3.4, 0.14, m), 0, 2.2, 0), a, out + 0.012));
      if (kind === 'jaga' && a > 0) {
        // The north window: five turned balusters in a deep frame.
        t.add(onFace(box(3, 2.8, 0.06, M.recess, 0, 2.6, 0), a, out + 0.16));
        for (let k = -2; k <= 2; k++) t.add(onFace(cyl(0.16, 0.2, 2.8, m, 0, 2.6, 0, 8), a, out + 0.3, k * 0.6));
        t.add(onFace(box(3.6, 0.35, 0.5, sh, 0, 5.4, 0), a, out + 0.25), onFace(box(3.6, 0.35, 0.5, sh, 0, 2.25, 0), a, out + 0.25));
      } else if (kind === 'bhoga') {
        for (const l of [-0.26, 0.26]) t.add(onFace(at(templeNiche(1.2, 2.6, m, { figure: figure(2.3, m, 'standing') }), 0, 2.4, 0), a, out + 0.024, l * arm));
      }
      t.add(onFace(at(figureFrieze(arm - 0.6, 0.9, m, { pitch: 0.8, kinds: ['standing', 'dancer', 'musician'] }), 0, h - 2.2, 0), a, out + 0.16));
    }
    d.add(t);
  }
  f.add(mergeByMaterial(d));
  // The lions on the jagamohana's roof (its first flight ends at y = 10 + 9 x 0.5 x 1.55 on a
  // recess 11.9 wide).
  for (const a of [0, Math.PI / 2, -Math.PI / 2]) {
    const l = onFace(a === 0 && !detail.low ? lion(1.7, STONE) : stoneLion(1.7, STONE), a, 6.4);
    l.position.y = 10 + 9 * 0.5 * 1.55;
    l.position.z += -5.5;
    f.add(l);
  }
}

// One of the larger shrines of the court: a rekha deul w wide and about 3.4 w high, with a small
// pidha porch before it if asked. Faces +z.
function shrine(w, porch) {
  const g = new THREE.Group(), m = STONE, sh = SHADE, bh = w * 1.05;
  g.add(box(w * 0.92, bh, w * 0.92, m), box(w * 1.03, bh, w * 0.56, m), box(w * 0.56, bh, w * 1.03, m), box(w * 1.1, 0.3, w * 1.1, sh, 0, bh - 0.3, 0));
  g.add(at(shikhara(w, w * 1.75, m, kalingaProfile, 12, m, 0.45), 0, bh, 0));
  if (!porch) { g.add(at(templeDoorway(w * 0.2, w * 0.45, { m, guardians: false, shakha: false }), 0, 0, w * 0.515)); return g; }
  const pw = w * 1.15, ph = w * 0.7, pz = w * 0.5 + pw * 0.5;
  g.add(box(pw, ph, pw, m, 0, 0, pz), box(pw * 1.1, ph, pw * 0.56, m, 0, 0, pz), box(pw * 1.14, 0.3, pw * 1.14, sh, 0, ph - 0.3, pz));
  const r = pidaRoof(pw * 1.1, pw * 0.4, 5, w * 0.085, m, sh), ry = ph + r.userData.top;
  g.add(at(r, 0, ph, pz), at(bell(pw * 0.22, m), 0, ry, pz), at(kalash(pw * 0.13, m), 0, ry + pw * 0.23, pz));
  g.add(at(templeDoorway(w * 0.22, w * 0.45, { m, guardians: false, shakha: false }), 0, 0, pz + pw * 0.5));
  return g;
}

// The court: the wall's coping; the larger shrines (the Parvati temple north of the jagamohana is
// the greatest of them, with its own porch); scores of small rekha shrines, no two of a size; and
// before the bhogamandapa the pillar that carries Shiva's bull.
function court(f, g, X, Z0, Z1) {
  const cz = (Z0 + Z1) / 2, len = Z1 - Z0, d = new THREE.Group();
  d.add(at(wallWithGaps('x', X * 2 + 2.9, 0.4, 2.9, SHADE, [[0, 13]], 0, Z1), 0, 6, 0), box(X * 2 + 2.9, 0.4, 2.9, SHADE, 0, 6, Z0));
  for (const s of [-1, 1]) d.add(at(wallWithGaps('z', len - 2.9, 0.4, 2.9, SHADE, [[10, 9]], s * X, cz), 0, 6, 0));
  g.add(mergeByMaterial(d));
  // [x, z, width, porch, turn]
  const big = [[36, -14, 6.4, true, 0], [-30, -30, 4.6, true, 0], [26, -52, 4.2, false, 0], [-42, 4, 4.4, true, 0], [40, 30, 3.8, false, Math.PI / 2], [-24, -62, 3.6, false, 0], [-46, 44, 3.4, true, Math.PI / 2], [22, 48, 3.2, false, -Math.PI / 2], [50, -44, 3.6, true, 0], [-52, -40, 3.2, false, 0], [-22, 40, 3.0, false, Math.PI / 2], [0, -52, 4.4, false, 0]];
  const bg = new THREE.Group();
  for (const [x, z, w, porch, ry] of big) bg.add(at(shrine(w, porch), x, 0, z).rotateY(ry));
  f.add(mergeByMaterial(bg));
  // The small shrines keep clear of the halls, the way in from the Lion Gate and the larger shrines.
  const avoid = [[-15, 15, -38, Z1], ...big.map(([x, z, w]) => [x - w - 2, x + w + 2, z - w - 2, z + w * 2.4 + 2])];
  const R = rng(11), spots = scatter(detail.low ? 48 : 96, [-X + 6, X - 6, Z0 + 6, Z1 - 8], { seed: 9, gap: 6.5, avoid });
  const list = spots.map(([x, z]) => { const w = 1.5 + R() * R() * 2.4; return [x, 0, z, w, w * (0.9 + R() * 0.25), w, R() < 0.75 ? 0 : (R() < 0.5 ? 1 : -1) * Math.PI / 2]; });
  // The nearest stand inside the focus, so the home view shows the tower among them.
  f.add(inst(rekhaGeo(), list, STONE));
  const doors = list.map(([x, , z, w, , , ry]) => [x + Math.sin(ry) * w * 0.52, 0, z + Math.cos(ry) * w * 0.52, w * 0.28, w * 0.6, 0.06, ry]);
  f.add(inst(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), doors, M.recess));
  // The Vrisha stambha, east of the bhogamandapa.
  const p = at(new THREE.Group(), 0, 0, 47);
  p.add(box(2.6, 0.8, 2.6, SHADE), box(1.9, 0.6, 1.9, STONE, 0, 0.8, 0), cyl(0.5, 0.6, 8, STONE, 0, 1.4, 0, 16), cyl(1.0, 0.55, 0.7, SHADE, 0, 9.4, 0, 16), box(1.9, 0.3, 1.9, STONE, 0, 10.1, 0));
  f.add(mergeByMaterial(p));
  if (!detail.low) f.add(at(nandi(STONE, 0.42), 0, 10.4, 47));
}

// The Lingaraja at Bhubaneswar: the crowded court inside its laterite wall; the Bindusagar, the
// great tank to the north with its stepped stone banks and the small shrine on its island; the
// low houses of the old town round the wall; and coconut palms and mango trees among them.
export function addDetails(f, g, { BH = 15, TH = 30, dz = -24, X = 70, Z0 = -90, Z1 = 70 } = {}) {
  deul(f, BH, TH, dz);
  halls(f);
  court(f, g, X, Z0, Z1);
  // Bindusagar: about 400 m north to south and 210 m across, its banks stepped down to the water.
  const tx = 345, tw = 400, td = 210, t = new THREE.Group();
  g.add(sheet(tw, td, M.lake, tx, 0.14, 0));
  for (let k = 0; k < 3; k++) {
    const o = 2 + k * 2.2, y = 0.2 + k * 0.35;
    for (const s of [-1, 1]) t.add(box(tw + 2 * o + 2.2, y, 2.2, GHAT, tx, 0, s * (td / 2 + o)), box(2.2, y, td + 2 * o - 2.2, GHAT, tx + s * (tw / 2 + o), 0, 0));
  }
  const isle = at(new THREE.Group(), tx - 30, 0, 0);
  isle.add(box(16, 1.4, 16, GHAT), box(6, 4, 6, STONE, 0, 1.4, 0), at(pidaRoof(6.6, 2.4, 5, 0.5, STONE, SHADE), 0, 5.4, 0), at(kalash(0.9, STONE), 0, 9.3, 0));
  t.add(isle);
  g.add(mergeByMaterial(t));
  g.add(cityAround([-X - 2, X + 2, Z0 - 2, Z1 + 2], { rows: 2, gap: 10, storeys: [1, 3], seed: 31, every: detail.low ? 2 : 1, tanks: 0.4,
    keep: [[-9, 9, Z1, 600], [X, 600, 2, 18], [tx - tw / 2 - 12, 700, -td / 2 - 12, td / 2 + 12]], paint: ['#e9d9b8', '#f1e6cf', '#d9c7a8', '#e7b9b0', '#cfd8d4', '#d6b06a', '#c9d6a3'] }));
  g.add(trees(scatter(26, [-130, 130, -150, 130], { seed: 5, gap: 14, avoid: [[-X - 44, X + 44, Z0 - 44, Z1 + 44]] }), { kind: 'palm', seed: 5 }));
  g.add(trees([...along(9, [tx - tw / 2 - 12, -td / 2 - 16], [tx + tw / 2, -td / 2 - 16]), ...along(9, [tx - tw / 2 - 12, td / 2 + 16], [tx + tw / 2, td / 2 + 16])], { kind: 'mango', seed: 6 }));
  g.add(trees(scatter(detail.low ? 20 : 44, [-200, 150, -220, 200], { seed: 13, gap: 16, avoid: [[-X - 44, X + 44, Z0 - 44, Z1 + 44]] }), { kind: 'mango', seed: 13 }));
  g.add(trees([[-40, -76], [48, -70], [52, 56], [-54, 58], [-58, -12]], { kind: 'banyan', seed: 7, h: 10 }));
  g.add(lampPosts([...along(4, [-7, 76], [-7, 130]), ...along(4, [7, 76], [7, 130])]));
}
