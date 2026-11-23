import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, photo, hipRoof, FACES } from '../helpers.js';
import { mergeByMaterial, gableRoof, leanTo, railing } from '../parts/components.js';
import { gothicDoor, gothicWindow, gothicTurret, headSlab } from '../parts/colonial.js';
import { gothicPinnacle } from '../parts/sculpture.js';
import { addDetails } from '../details/san-thome-basilica.js';

// San Thome: the Neo-Gothic basilica of 1896, brick plastered and painted white to the tip of its
// spire, under steep roofs of red Mangalore tiles; the doors, the tracery of the windows and the
// louvres of the belfry are of red-brown timber. From photographs (Wikimedia Commons: SANTHOME
// CATHEDRAL.jpg and Santhome Basilica.jpg from the road, a night view of the north side).
export const WHITE = photo(mat('#f6f4ef', 0.82), 'plaster');
export const TRIM = mat('#dcdad5', 0.8);
export const ROOF = mat('#b2573c', 0.85);
export const TIMBER = mat('#7e3a22', 0.7);

// The basilica's measures, shared with js/details/san-thome-basilica.js. The entrance front faces
// +z at z = FZ and the church runs back 64 m. The nave is NW wide with walls NH high under a roof
// RH high; the great tower, T square, stands at the corner beside the front (its centre at TX, TZ),
// its shaft rising to the gallery at TH and its octagonal spire to 47.2 m. The transept, TW wide,
// crosses close behind the tower at z = CZ, reaching out to x = ±TXO; east of it the aisles, AW wide
// and AH high, run to the chancel, CH long, at the far end.
export const S = { FZ: 30, LEN: 64, NW: 12.2, NH: 13, RH: 5.5, AW: 6, AH: 7.5, T: 7.6, TH: 20, TX: 13.4, TZ: 27.2, CZ: 12, TW: 11, TXO: 14.1, CH: 12 };

// A pointed window whose opening is filled with red-brown timber (tracery or louvres).
const timberWindow = (w, h, o = {}) => {
  const g = gothicWindow(w, h, { m: WHITE, trim: TRIM, ...o });
  g.add(at(headSlab(w * 0.99, h * 0.99, 'pointed', TIMBER, 0.02), 0, 0, 0.045));
  return g;
};

// A round belfry opening closed by red louvres in a moulded ring, facing +z, centred on y = 0.
function louvreRound(R) {
  const g = new THREE.Group();
  g.add(at(mesh(new THREE.CircleGeometry(R, 20), TIMBER), 0, 0, 0.05), at(mesh(new THREE.TorusGeometry(R * 1.1, R * 0.2, 6, 24), TRIM), 0, 0, 0.05));
  return g;
}

// An octagonal turret of the front: the shaft (r, h), then an open belfry lantern of eight posts
// under little gables, and a spirelet ringed by pinnacles; `top` is its whole height.
function lanternTurret(r, h, top) {
  const g = new THREE.Group(), lh = r * 2.4, y1 = h + 0.5 + lh;
  g.add(gothicTurret(r, h, WHITE, TRIM, 0.01));
  g.add(cyl(r * 0.45, r * 0.45, lh, WHITE, 0, h + 0.5, 0, 8), cyl(r * 1.15, r * 1.15, 0.3, TRIM, 0, y1, 0, 8));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, x = Math.sin(a) * r * 0.95, z = Math.cos(a) * r * 0.95;
    g.add(cyl(r * 0.13, r * 0.13, lh, WHITE, x, h + 0.5, z, 6), at(gothicPinnacle(r * 2.2, WHITE), x, y1 + 0.3, z));
  }
  g.add(cyl(0, r * 0.8, top - y1 - 0.3, WHITE, 0, y1 + 0.3, 0, 8));
  return g;
}

// The great tower, standing on its own centre. A square shaft with stepped corner buttresses; on
// each exposed face a gabled portal, then three louvred lancets, then a two-light belfry window;
// at TH a balustraded gallery with four tall corner pinnacles; within it an octagonal stage with
// lancets and round red-louvred openings, eight very steep gabled lucarnes with pinnacles between
// them, and the spire with its cross.
function tower(open) {
  const { T, TH } = S, g = new THREE.Group(), h2 = T / 2;
  g.add(box(T, TH, T, WHITE));
  for (const y of [7.4, 12.4]) g.add(box(T + 0.3, 0.3, T + 0.3, TRIM, 0, y, 0));
  g.add(box(T + 1.0, 0.5, T + 1.0, TRIM, 0, TH - 0.5, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    [[1.5, 7.4], [1.25, 12.4], [1.0, TH - 0.5]].forEach(([w, y], k) => g.add(box(w, y, w, WHITE, sx * (h2 + 0.3 - k * 0.12), 0, sz * (h2 + 0.3 - k * 0.12))));
    for (const [w, y] of [[1.5, 7.4], [1.25, 12.4]]) g.add(at(gableRoof(w, w, w * 0.9, WHITE), sx * (h2 + 0.3), y, sz * (h2 + 0.3)));
    g.add(at(gothicPinnacle(7.6, WHITE), sx * (h2 + 0.1), TH, sz * (h2 + 0.1)));
  }
  const lancet = timberWindow(0.85, 3.3, { depth: 0.2, sill: false }), bel = timberWindow(1.7, 4.6, { depth: 0.25 });
  const blind = gothicWindow(0.7, 3.6, { m: WHITE, trim: TRIM, depth: 0.15, sill: false });
  FACES.forEach((a, k) => {
    const f = new THREE.Group();
    if (open.includes(k)) f.add(gothicDoor(2.1, 4.4, { m: WHITE, trim: TRIM, orders: 3, gable: true, pinnacles: false, leafM: TIMBER }));
    for (const x of [-1.35, 0, 1.35]) f.add(at(lancet.clone(), x, 8.2, 0));
    f.add(at(bel.clone(), 0, 13.4, 0));
    for (const s of [-1, 1]) f.add(at(blind.clone(), s * 2.1, 13.6, 0));
    f.add(at(railing(T + 0.6, 1.1, 0.14, WHITE, 0.9), 0, TH, 0.3));
    f.position.set(Math.sin(a) * h2, 0, Math.cos(a) * h2);
    f.rotation.y = a;
    g.add(f);
  });
  // The octagonal stage and the foot of the spire.
  const R = 3.0, ap = R * Math.cos(Math.PI / 8), side = 2 * R * Math.sin(Math.PI / 8), y0 = TH, y1 = 26, top = 46;
  g.add(mesh(new THREE.CylinderGeometry(R, R, y1 - y0, 8).rotateY(Math.PI / 8), WHITE, 0, (y0 + y1) / 2, 0));
  g.add(mesh(new THREE.ConeGeometry(R, top - y1, 8).rotateY(Math.PI / 8), WHITE, 0, (y1 + top) / 2, 0));
  const slit = timberWindow(0.8, 2.8, { depth: 0.15, sill: false });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, f = new THREE.Group(), c = a + Math.PI / 8;
    if (k % 2 === 0) f.add(at(slit.clone(), 0, y0 + 0.9, ap));
    // The lucarne: a tall sharp gable with the round opening in its field, running back into the spire.
    f.add(at(gableRoof(side, 1.7, 7.2, WHITE), 0, 24.1, ap - 0.7), at(louvreRound(0.42), 0, 25.3, ap + 0.15), box(side, 0.2, 0.25, TRIM, 0, 24, ap + 0.05));
    f.rotation.y = a;
    g.add(f);
    g.add(cyl(0.17, 0.17, 6.6, WHITE, Math.sin(c) * (R + 0.1), y0, Math.cos(c) * (R + 0.1), 8), at(gothicPinnacle(4.6, WHITE), Math.sin(c) * (R + 0.1), y0 + 6.6, Math.cos(c) * (R + 0.1)));
  }
  g.add(cyl(0.1, 0.1, 1.9, TRIM, 0, top - 0.7, 0, 6), box(1.0, 0.16, 0.16, TRIM, 0, 46.55, 0));
  return g;
}

export function buildSanThomeBasilica() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { FZ, LEN, NW, NH, RH, AW, AH, T, TX, TZ, CZ, TW, TXO, CH } = S, BZ = FZ - LEN, nave = LEN - CH, nz = FZ - nave / 2;
  const ez = CZ - TW / 2, al = ez - (BZ + CH), az = ez - al / 2, ax = NW / 2 + AW, d = new THREE.Group();
  const pin = gothicPinnacle(2.6, WHITE), para = (len) => railing(len, 0.8, 0.14, WHITE, 1.4);
  // The nave under its steep red roof, a pierced parapet with pinnacles along the wall head.
  d.add(box(NW, NH, nave, WHITE, 0, 0, nz), at(gableRoof(NW - 0.3, nave - 0.6, RH, ROOF), 0, NH, nz));
  for (const s of [-1, 1]) {
    d.add(at(para(al), s * (NW / 2 - 0.07), NH, az).rotateY(Math.PI / 2), at(para(FZ - CZ - TW / 2 - 1), s * (NW / 2 - 0.07), NH, (FZ + CZ + TW / 2 - 1) / 2).rotateY(Math.PI / 2));
    // The aisles east of the transept: lean-to roofs behind a parapet, a window and a clerestory
    // window to each bay, and buttresses that end in pinnacles.
    d.add(box(AW, AH, al, WHITE, s * (NW / 2 + AW / 2), 0, az), at(leanTo(AW - 0.2, al, 2.4, ROOF, s), s * NW / 2, AH, az), at(para(al), s * (ax - 0.07), AH, az).rotateY(Math.PI / 2));
    const win = gothicWindow(1.8, 4.2, { m: WHITE, trim: TRIM, depth: 0.25 }), cl = gothicWindow(1.3, 2.1, { m: WHITE, trim: TRIM, depth: 0.2 });
    for (let k = 0; k <= 5; k++) {
      const z = ez - (k / 5) * al;
      d.add(box(0.8, AH, 1, WHITE, s * (ax + 0.4), 0, z), at(gableRoof(0.8, 1, 0.8, WHITE), s * (ax + 0.4), AH, z), at(pin.clone(), s * (ax + 0.2), AH + 0.4, z), at(pin.clone(), s * (NW / 2 - 0.1), NH, z));
      if (k < 5) d.add(at(win.clone(), s * ax, 1.8, z - al / 10).rotateY(s * Math.PI / 2), at(cl.clone(), s * NW / 2, AH + 2.7, z - al / 10).rotateY(s * Math.PI / 2));
    }
    // The transept's gabled end: a great traceried window between corner buttresses with pinnacles.
    d.add(at(gableRoof(TW + 0.4, 0.8, RH + 0.9, WHITE, { axis: 'x' }), s * (TXO - 0.4), NH, CZ), at(timberWindow(3.4, 8, { depth: 0.3 }), s * TXO, 2.6, CZ).rotateY(s * Math.PI / 2));
    d.add(box(0.2, 1.6, 0.2, TRIM, s * (TXO - 0.4), NH + RH + 0.9, CZ), box(0.2, 0.2, 0.9, TRIM, s * (TXO - 0.4), NH + RH + 1.9, CZ));
    for (const e of [-1, 1]) d.add(box(1.2, NH, 1.2, WHITE, s * (TXO + 0.1), 0, CZ + e * (TW / 2 + 0.1)), at(gothicPinnacle(4.4, WHITE), s * (TXO + 0.1), NH, CZ + e * (TW / 2 + 0.1)));
    // The chancel's tall windows.
    for (const z of [-4, 0, 4]) d.add(at(gothicWindow(1.9, 7.2, { m: WHITE, trim: TRIM, depth: 0.25 }), s * (NW / 2 + 3), 2.6, BZ + CH / 2 + z).rotateY(s * Math.PI / 2));
    for (const z of [BZ, BZ + CH]) d.add(box(1.2, NH, 1.2, WHITE, s * (NW / 2 + 3.1), 0, z), at(gothicPinnacle(4, WHITE), s * (NW / 2 + 3.1), NH, z));
    d.add(at(para(CH - 1.2), s * (NW / 2 + 2.93), NH, BZ + CH / 2).rotateY(Math.PI / 2));
  }
  // The transept, crossing just behind the tower, and over the crossing the smaller octagonal
  // spire that marks the apostle's tomb.
  d.add(box(2 * TXO, NH, TW, WHITE, 0, 0, CZ), at(gableRoof(TW - 0.3, 2 * TXO - 1.6, RH, ROOF, { axis: 'x' }), 0, NH, CZ));
  const fl = new THREE.Group(), fy = NH + RH - 2.2;
  fl.add(cyl(1.9, 1.9, 5.2, WHITE, 0, fy, 0, 8), cyl(2.1, 2.1, 0.3, TRIM, 0, fy + 5.2, 0, 8), cyl(0, 1.9, 13, WHITE, 0, fy + 5.5, 0, 8));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8, c = a + Math.PI / 8;
    fl.add(at(timberWindow(0.6, 2, { depth: 0.12, sill: false }), Math.sin(a) * 1.75, fy + 2.6, Math.cos(a) * 1.75).rotateY(a), at(gothicPinnacle(3, WHITE), Math.sin(c) * 1.95, fy + 5.5, Math.cos(c) * 1.95));
  }
  fl.add(cyl(0.07, 0.07, 1.4, TRIM, 0, fy + 18.3, 0, 6), box(0.7, 0.12, 0.12, TRIM, 0, fy + 19.2, 0));
  d.add(at(fl, 0, 0, CZ));
  // The chancel at the east end, as high as the nave and broader, under a hipped roof.
  d.add(box(NW + 6, NH, CH, WHITE, 0, 0, BZ + CH / 2), at(hipRoof(NW + 5.6, CH - 0.4, RH, ROOF), 0, NH, BZ + CH / 2));
  d.add(at(timberWindow(3.4, 8, { depth: 0.3 }), 0, 2.6, BZ).rotateY(Math.PI), at(para(NW + 4.8), 0, NH, BZ + 0.07));
  // The entrance front: a gable between two octagonal turrets. Six pointed arches fill it, three
  // gabled doorways below and three tall windows above, all with red-brown timber tracery; a small
  // window in the gable, a cresting up its rakes and a cross on the apex.
  const gh = RH + 0.9, rake = Math.hypot(NW / 2 + 0.2, gh), ra = Math.atan2(gh, NW / 2 + 0.2);
  d.add(at(gableRoof(NW + 0.4, 0.9, gh, WHITE), 0, NH, FZ - 0.45), box(NW + 0.5, 0.3, 0.3, TRIM, 0, NH - 0.3, FZ + 0.1), box(NW + 0.3, 0.25, 0.25, TRIM, 0, 5.6, FZ + 0.1));
  for (const s of [-1, 1]) {
    d.add(at(box(rake, 0.3, 1.1, TRIM, 0, -0.15, 0), s * (NW / 4 + 0.1), NH + gh / 2 + 0.1, FZ - 0.45).rotateZ(-s * ra));
    for (let t = 0.1; t < 0.95; t += 0.085) d.add(cyl(0, 0.13, 0.55, TRIM, s * (NW / 2 + 0.2) * (1 - t), NH + gh * t + 0.25, FZ - 0.45, 4));
    d.add(at(lanternTurret(1.1, 12, 21), s * (NW / 2 + 0.5), 0, FZ));
    d.add(at(gothicWindow(1.6, 5, { m: WHITE, trim: TRIM, depth: 0.25 }), -NW / 2, 3, FZ - 4 - (s + 1) * 2.4).rotateY(-Math.PI / 2));
  }
  for (const x of [-3.5, 0, 3.5]) {
    d.add(at(gothicDoor(1.8, 3.7, { m: WHITE, trim: TRIM, orders: 2, gable: true, pinnacles: false, leafM: TIMBER }), x, 0, FZ));
    d.add(at(timberWindow(2.1, 5.4, { depth: 0.3 }), x, 6.6, FZ));
  }
  d.add(at(timberWindow(1.1, 2.3, { depth: 0.2 }), 0, NH + 0.5, FZ), box(0.18, 1.3, 0.1, TRIM, 0, NH + 3.6, FZ + 0.05), box(0.7, 0.18, 0.1, TRIM, 0, NH + 4.4, FZ + 0.05));
  d.add(box(0.22, 2.2, 0.22, TRIM, 0, NH + gh, FZ - 0.45), box(1.1, 0.22, 0.22, TRIM, 0, NH + gh + 1.4, FZ - 0.45));
  // The bay that links the front to the tower, the tower at the corner with portals on its two
  // exposed faces, and the stair turret at its back corner.
  d.add(box(TX - T / 2 - NW / 2 + 0.4, NH - 1.5, 2, WHITE, (TX - T / 2 + NW / 2) / 2, 0, FZ - 2.2), at(gothicWindow(1.1, 4.6, { m: WHITE, trim: TRIM, depth: 0.2 }), TX - T / 2 - 0.85, 5.6, FZ - 1.2));
  d.add(box(T - 1, NH, TZ - T / 2 - CZ - TW / 2 + 0.4, WHITE, TX - 2.5, 0, (TZ - T / 2 + CZ + TW / 2) / 2));
  d.add(at(tower([0, 1]), TX, 0, TZ), at(lanternTurret(1.0, 12.5, 19), TX + T / 2 - 0.7, 0, TZ - T / 2 - 0.5));
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From the road, as in the photographs: the gabled front on the left, the tower at the corner.
  return { group: g, focus: f, view: [0.75, 0.2, 1], zoom: 0.85 };
}
