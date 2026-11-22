import * as THREE from 'three';
import { mat, mesh, box, cyl, at, photo } from '../helpers.js';
import { mergeByMaterial, gableRoof, leanTo } from '../parts/components.js';
import { gothicDoor, gothicWindow, oculus } from '../parts/colonial.js';
import { gothicPinnacle } from '../parts/sculpture.js';
import { addDetails } from '../details/san-thome-basilica.js';

// San Thome: the Neo-Gothic basilica of 1896, brick plastered and painted white, its mouldings
// picked out in a pale grey, under steep roofs of grey tiles; the spire is white to its tip.
export const WHITE = photo(mat('#f6f4ef', 0.82), 'plaster');
export const TRIM = mat('#d2d0cb', 0.8);
export const ROOF = mat('#77706a', 0.8);

// The basilica's measures, shared with js/details/san-thome-basilica.js. The front faces +z at
// z = FZ and the church runs back 64 m to its apse. The nave is NW wide with walls NH high, the
// aisles AW wide and AH high either side; the tower, T square, stands in the middle of the front,
// its shaft rising to TH and its octagonal spire to 47.2 m.
export const S = { FZ: 30, LEN: 64, NW: 12.2, NH: 16, AW: 5.2, AH: 9, T: 7.6, TH: 27 };

export function buildSanThomeBasilica() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { FZ, LEN, NW, NH, AW, AH, T, TH } = S, BZ = FZ - LEN, body = LEN - 8, bz = FZ - 0.5 - body / 2;
  const d = new THREE.Group();
  // The nave under its steep roof, the aisles under lean-tos, and the apse at the east end.
  d.add(box(NW, NH, body, WHITE, 0, 0, bz), at(gableRoof(NW + 1, body, 7.5, ROOF), 0, NH, bz));
  for (const s of [-1, 1]) d.add(box(AW, AH, body - 6, WHITE, s * (NW / 2 + AW / 2), 0, bz + 3), at(leanTo(AW + 0.8, body - 6, 3.2, ROOF, s), s * NW / 2, AH, bz + 3));
  const apse = new THREE.Group(), az = FZ - 0.5 - body;
  apse.add(cyl(NW / 2, NW / 2, NH - 2, WHITE, 0, 0, az, 7), mesh(new THREE.ConeGeometry(NW / 2 + 0.5, 5.5, 7), ROOF, 0, NH - 2 + 2.75, az));
  d.add(apse);
  // The transept, short, two-thirds of the way back.
  for (const s of [-1, 1]) d.add(box(3, NH - 2, 10, WHITE, s * (NW / 2 + AW + 1.5), 0, BZ + 22), at(gableRoof(10.6, 3.4, 4.5, ROOF).rotateY(Math.PI / 2), s * (NW / 2 + AW + 1.6), NH - 2, BZ + 22));
  // Pinnacled buttresses between the aisle windows, and the clerestory above them.
  const pin = gothicPinnacle(2.2, TRIM), win = gothicWindow(1.7, 4.6, { m: WHITE, trim: TRIM, depth: 0.25 });
  const cl = gothicWindow(1.4, 3.4, { m: WHITE, trim: TRIM, depth: 0.2 });
  for (const s of [-1, 1]) for (let k = 0; k < 8; k++) {
    const z = FZ - 4 - k * 5.6, x = s * (NW / 2 + AW);
    if (Math.abs(z - (BZ + 22)) < 6) continue;
    d.add(at(win.clone(), x, 2.2, z - 2.8).rotateY(s * Math.PI / 2), at(cl.clone(), s * NW / 2, AH + 1.6, z - 2.8).rotateY(s * Math.PI / 2));
    d.add(box(0.8, AH - 1, 0.9, WHITE, x + s * 0.4, 0, z), at(pin.clone(), x + s * 0.3, AH, z));
  }
  for (const s of [-1, 1]) d.add(at(gothicWindow(3.6, 7, { m: WHITE, trim: TRIM, depth: 0.3 }), s * (NW / 2 + AW + 3), 2.5, BZ + 22).rotateY(s * Math.PI / 2));
  // The front: the aisles' gabled ends beside the tower, each with a door and a window, and slender
  // octagonal turrets at the corners.
  for (const s of [-1, 1]) {
    const x = s * (NW / 2 + AW / 2) * 0.86;
    d.add(box(NW / 2 + AW - T / 2 + 0.6, AH + 3, 1.4, WHITE, s * (T / 2 + (NW / 2 + AW - T / 2) / 2), 0, FZ - 0.4));
    d.add(at(gableRoof(NW / 2 + AW - T / 2 + 0.6, 1.4, 3.6, WHITE), s * (T / 2 + (NW / 2 + AW - T / 2) / 2), AH + 3, FZ - 0.4));
    d.add(at(gothicDoor(1.8, 4.2, { m: WHITE, trim: TRIM, orders: 2, gable: false, pinnacles: false }), x, 0, FZ + 0.3));
    d.add(at(oculus(1.1, { m: WHITE, trim: TRIM }), x, 7.6, FZ + 0.3));
    const tx = s * (NW / 2 + AW + 0.2);
    d.add(cyl(0.75, 0.8, AH + 6, WHITE, tx, 0, FZ - 0.2, 8), cyl(0.9, 0.9, 0.3, TRIM, tx, AH + 6, FZ - 0.2, 8), at(gothicPinnacle(4.2, WHITE), tx, AH + 6.3, FZ - 0.2));
  }
  // The nave's gable seen above the aisles beside the tower.
  d.add(box(NW + 0.4, 0.4, 1.2, TRIM, 0, NH, FZ - 1.2));
  // The tower: a square shaft standing a little proud of the front, the great door at its foot,
  // a tall window over it, the belfry's paired louvred lancets, corner buttresses rising into
  // pinnacles, and the octagonal spire with its lucarnes and cross.
  const tz = FZ + 0.6;
  d.add(box(T, TH, T, WHITE, 0, 0, tz - T / 2 + 1.2));
  for (const y of [AH + 3, NH + 1.5, TH - 0.4]) d.add(box(T + 0.4, 0.4, T + 0.4, TRIM, 0, y, tz - T / 2 + 1.2));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (T / 2 + 0.2), z = tz - T / 2 + 1.2 + sz * (T / 2 + 0.2);
    d.add(box(1, TH - 1, 1, WHITE, x, 0, z), at(gothicPinnacle(5, WHITE), x, TH - 1, z));
  }
  d.add(at(gothicDoor(2.8, 6.4, { m: WHITE, trim: TRIM, orders: 3, gable: true, pinnacles: false }), 0, 0, tz + 1.2));
  d.add(at(gothicWindow(2.4, 5.6, { m: WHITE, trim: TRIM, depth: 0.3 }), 0, AH + 4.2, tz + 1.2));
  const bel = gothicWindow(1.1, 4.6, { m: WHITE, trim: TRIM, depth: 0.25, sill: false });
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) for (const s of [-0.9, 0.9]) {
    const o = at(bel.clone(), Math.sin(a) * T / 2 + Math.cos(a) * s, NH + 2.6, tz - T / 2 + 1.2 + Math.cos(a) * T / 2 - Math.sin(a) * s);
    o.rotation.y = a;
    d.add(o);
  }
  // Gabled lucarnes at the foot of the spire, and the spire itself.
  const sy = TH, cz = tz - T / 2 + 1.2;
  d.add(box(T + 0.8, 0.5, T + 0.8, TRIM, 0, sy, cz));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const l = new THREE.Group();
    l.add(box(1.8, 2.6, 1, WHITE, 0, 0, 0), at(gableRoof(2.2, 1.2, 1.6, WHITE), 0, 2.6, 0), box(0.9, 1.6, 0.05, mat('#3a3d42', 0.4), 0, 0.5, 0.52));
    l.position.set(Math.sin(a) * (T / 2 - 1.4), sy + 0.5, cz + Math.cos(a) * (T / 2 - 1.4));
    l.rotation.y = a;
    d.add(l);
  }
  const spire = mesh(new THREE.ConeGeometry(T / 2 - 0.2, 47.2 - sy - 2.6, 8, 1).rotateY(Math.PI / 8), WHITE, 0, sy + 0.5 + (47.2 - sy - 2.6) / 2, cz);
  d.add(spire);
  for (let y = sy + 6; y < 44; y += 5.5) {
    const r = (T / 2 - 0.2) * (1 - (y - sy - 0.5) / (47.2 - sy - 2.6));
    d.add(cyl(r + 0.12, r + 0.16, 0.25, TRIM, 0, y, cz, 8));
  }
  d.add(cyl(0.12, 0.12, 2.1, TRIM, 0, 45.1, cz, 6), box(1.2, 0.18, 0.18, TRIM, 0, 46.3, cz));
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From the north-west of the forecourt, the spire on the left.
  return { group: g, focus: f, view: [-0.65, 0.22, 1], zoom: 0.85 };
}
