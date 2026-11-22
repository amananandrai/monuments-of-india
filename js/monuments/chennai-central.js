import * as THREE from 'three';
import { M, mat, box, at, onFace, hipRoof, surface, FACES } from '../helpers.js';
import { mergeByMaterial, windowFrame, beltCourse } from '../parts/components.js';
import { cutSlab, headRing, gothicWindow } from '../parts/colonial.js';
import { addDetails } from '../details/chennai-central.js';

// George Harding's terminus of 1873, with Chisholm's towers: red brick, every arch, band and
// coping picked out in white, under steep roofs.
export const BRICK = surface(mat('#a23f2e', 0.85), 'brick');
export const WHITE = mat('#f0eadd', 0.8);
export const TILE = mat('#8b4b39', 0.8);
export const SLATE = mat('#5d5a5c', 0.8);
const SHADE = mat('#4b2c25', 0.9);

// The site stands BANK above the canal's water. The main block is W long, D deep and two storeys
// (H1 and H2) high, its front at z = D / 2; the clock tower rises to TOP above the forecourt.
export const BANK = 2.5, W = 104, D = 22, H1 = 7.6, H2 = 6.6, H = H1 + H2, TOP = 41;

// One arcaded face `len` long: a skin of brick 0.9 m thick with a round arch to each bay of the
// ground floor and a pair of pointed ones above it, white rings round them all, standing before
// the shaded back wall of the verandahs. Its outer face is at z = 0; skip: [x0, x1] left blank.
function arcade(len, skip = null) {
  const g = new THREE.Group(), n = Math.round(len / 5.2), p = len / n, holes = [], t = 0.9;
  const ring1 = headRing(3.3, 5.7, 'round', 0.3, 0.08, WHITE), ring2 = headRing(1.5, 4.3, 'pointed', 0.22, 0.08, WHITE);
  for (let k = 0; k < n; k++) {
    const x = -len / 2 + (k + 0.5) * p;
    if (skip && x > skip[0] && x < skip[1]) continue;
    holes.push([x, 0, 3.3, 5.7, 'round']);
    g.add(at(ring1.clone(), x, 0, 0));
    for (const s of [-1.05, 1.05]) {
      holes.push([x + s, H1 + 1.1, 1.5, 4.3, 'pointed']);
      g.add(at(ring2.clone(), x + s, H1 + 1.1, 0), box(1.5, 1.0, 0.12, WHITE, x + s, H1 + 0.1, -0.5));
    }
  }
  g.add(at(cutSlab(len, H, holes, t, BRICK), 0, 0, -t));
  g.add(box(len - 0.4, H - 0.2, 0.1, SHADE, 0, 0, -3.2), box(len - 0.2, 0.5, 2.5, WHITE, 0, H1 - 0.25, -t - 1.2));
  for (const y of [H1 - 0.3, H - 0.55]) g.add(box(len, 0.55, 0.14, WHITE, 0, y, 0.07));
  g.add(box(len, 0.3, 0.1, WHITE, 0, H1 + 0.9, 0.05));
  return g;
}

// A corner tower w square and h high to its eaves: brick banded in white, lancets up its faces,
// and a steep pyramid of slates with a finial.
function cornerTower(w, h, cap) {
  const g = new THREE.Group(), win = windowFrame(1.1, 3.4, WHITE, { shape: 'pointed', frame: 0.16 });
  g.add(box(w, h, w, BRICK));
  for (const y of [H1 - 0.3, H - 0.55, h - 5.2, h - 0.6]) g.add(beltCourse(w, w, y, 0.55, 0.14, WHITE));
  for (const a of FACES) {
    for (const y of [1.6, H1 + 1.4]) g.add(onFace(at(win.clone(), 0, y, 0), a, w / 2));
    for (const s of w > 5 ? [-1.3, 1.3] : [0]) g.add(onFace(at(win.clone(), 0, h - 4.5, 0), a, w / 2, s));
  }
  g.add(box(w + 0.9, 0.45, w + 0.9, WHITE, 0, h, 0), at(hipRoof(w + 0.5, w + 0.5, cap, SLATE), 0, h + 0.45, 0), box(0.22, 1.6, 0.22, WHITE, 0, h + cap, 0));
  return g;
}

// The clock tower over the entrance, TOP high: a brick shaft banded in white with tall lancets,
// the clock stage with a face to each side between four corner turrets, and a pyramidal cap.
function clockTower() {
  const g = new THREE.Group(), w = 9.6, shaft = 29.5, stage = 5.6, win = windowFrame(1.3, 5.2, WHITE, { shape: 'pointed', frame: 0.18 });
  g.add(box(w, shaft, w, BRICK), box(w - 0.5, stage, w - 0.5, BRICK, 0, shaft, 0));
  for (const y of [H - 0.55, H + 6.2, shaft - 0.6]) g.add(beltCourse(w, w, y, 0.6, 0.16, WHITE));
  g.add(box(w + 1.0, 0.5, w + 1.0, WHITE, 0, shaft, 0), box(w + 0.3, 0.5, w + 0.3, WHITE, 0, shaft + stage, 0));
  for (const a of FACES) {
    for (const s of [-2.2, 0, 2.2]) g.add(onFace(at(win.clone(), 0, H + 7.6, 0), a, w / 2, s));
    for (const s of [-1.8, 1.8]) g.add(onFace(at(win.clone(), 0, H + 0.6, 0).clone(), a, w / 2, s));
    // The white dial frame the clock sits in (the faces are in the detail file).
    g.add(onFace(box(4.6, 4.6, 0.12, WHITE, 0, shaft + 0.55, 0), a, (w - 0.5) / 2 + 0.06));
  }
  // Corner turrets, octagonal in white-banded brick, with pointed caps.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (w / 2 - 0.5), z = sz * (w / 2 - 0.5), t = new THREE.Group();
    t.add(new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, stage + 1.6, 8).translate(0, (stage + 1.6) / 2, 0), BRICK));
    t.add(new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.4, 8).translate(0, stage + 1.6, 0), WHITE), new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.35, 8).translate(0, 2.4, 0), WHITE));
    t.add(new THREE.Mesh(new THREE.ConeGeometry(1.05, 3.2, 8).translate(0, stage + 3.4, 0), SLATE));
    g.add(at(t, x, shaft + 0.5, z));
  }
  const capY = shaft + stage + 0.5, cap = TOP - capY - 1.2;
  g.add(at(hipRoof(w - 1.4, w - 1.4, cap, SLATE), 0, capY, 0), box(0.25, 1.8, 0.25, WHITE, 0, TOP - 1.8, 0));
  return g;
}

export function buildChennaiCentral() {
  const g = new THREE.Group(), s = at(new THREE.Group(), 0, BANK, 0), f = new THREE.Group(), b = new THREE.Group();
  g.add(s);
  s.add(f);
  // The main block: its core behind the verandahs, an arcaded skin on the front and both ends,
  // and a steep tiled roof.
  b.add(box(W - 7, H, D - 7, BRICK, 0, 0, 0), box(W + 1, 0.5, D + 1, WHITE, 0, -0.3, 0));
  for (const sx of [-1, 1]) {
    b.add(at(arcade(39), sx * 27.5, 0, D / 2));
    const e = arcade(12);
    e.rotation.y = sx * Math.PI / 2;
    b.add(at(e, sx * W / 2, 0, 0));
  }
  const back = arcade(94);
  back.rotation.y = Math.PI;
  b.add(at(back, 0, 0, -D / 2));
  b.add(box(W + 0.8, 0.5, D + 0.8, WHITE, 0, H, 0), at(hipRoof(W + 0.4, D + 0.4, 7, TILE), 0, H + 0.5, 0));
  // Four corner towers, and the frontispiece under the clock tower: three doors, a great pointed
  // window, and a gable either side of the tower's foot.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(at(cornerTower(7.6, 21.5, 7.5), sx * (W / 2 - 1.2), 0, sz * (D / 2 - 1.2)));
  const fw = 16, fz = D / 2 + 3;
  b.add(box(fw, H + 1.5, 8, BRICK, 0, 0, fz - 4), box(fw + 0.5, 0.5, 8.3, WHITE, 0, H + 1.5, fz - 4));
  for (const x of [-5, 0, 5]) b.add(at(windowFrame(3, 5.4, WHITE, { shape: 'pointed', frame: 0.3 }), x, 0.2, fz));
  for (const x of [-5.2, 5.2]) b.add(at(gothicWindow(1.9, 4.6, { m: WHITE, trim: WHITE, depth: 0.16, frame: 0.26 }), x, H1 + 1.2, fz));
  b.add(at(gothicWindow(3.2, 5.4, { m: WHITE, trim: WHITE, depth: 0.16, frame: 0.3 }), 0, H1 + 0.9, fz));
  for (const y of [H1 - 0.3, H - 0.55]) b.add(box(fw, 0.55, 0.14, WHITE, 0, y, fz + 0.07));
  for (const sx of [-1, 1]) b.add(at(cornerTower(3.2, H + 5, 4.2), sx * (fw / 2), 0, fz - 0.6));
  b.add(at(clockTower(), 0, 0, D / 2 - 3.2));
  f.add(mergeByMaterial(b));
  addDetails(f, g, s);
  // The home view: the clock tower and the long brick front from across Poonamallee High Road.
  return { group: g, focus: f, view: [0.4, 0.12, 1], zoom: 0.62, target: [0, BANK + 15, 0] };
}
