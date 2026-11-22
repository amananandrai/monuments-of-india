import * as THREE from 'three';
import { M, mat, photo, mesh, box, cyl, at, inst, unitBox } from '../helpers.js';
import { mergeByMaterial, lettering } from '../parts/components.js';
import { GLASS } from '../parts/colonial.js';
import { addDetails } from '../details/eros-cinema.js';

// Eros's cream render and the red Agra sandstone that faces its ground floor and frames its tower.
export const CREAM = mat('#ece0c3', 0.8);
export const RED = photo(mat('#a7553c', 0.85), 'sandstone');

// The building's measures, shared with js/details/eros-cinema.js. From photographs: a wedge on the
// corner of Maharshi Karve Road and Veer Nariman Road, opposite Churchgate station. Two wings, WL
// long and WD deep, run back from the corner at ±A from the axis, five storeys (FL each) to the
// roof at WH, with shops on the ground floor and flats above, bands of windows between bands of
// render. The corner is a drum, R across, rising into the stepped tower over the entrance, its
// face ribbed with fins and the name in letters at its head.
export const P = { WL: 58, WD: 17, WH: 21, FL: 4, R: 10, A: Math.PI / 4 };

// An R for the name: lettering has no R, so it is drawn here from a stem, a bowl and a leg.
function letterR(size, depth, m) {
  const g = new THREE.Group(), t = size * 0.13;
  g.add(box(t, size, depth, m, t / 2, 0, depth / 2));
  const bowl = mesh(new THREE.TorusGeometry(1, t / 2 / (size * 0.25), 6, 20, Math.PI).rotateZ(-Math.PI / 2), m);
  bowl.scale.set(size * 0.3, size * 0.25, depth / 2 / (t / 2 / (size * 0.25)));
  bowl.position.set(t, size * 0.75, depth / 2);
  g.add(bowl, box(size * 0.3, t, depth, m, t + size * 0.08, size - t, depth / 2), box(size * 0.3, t, depth, m, t + size * 0.08, size * 0.5 - t / 2, depth / 2));
  const leg = box(t, size * 0.56, depth, m);
  leg.rotation.z = 0.55;
  leg.position.set(size * 0.36, size * 0.24, depth / 2);
  g.add(leg);
  return g;
}

export function buildErosCinema() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  const { WL, WD, WH, FL, R, A } = P;
  const bands = [], fins = [];
  // The two wings, each turned to run back from the corner; its street face looks outward.
  for (const s of [-1, 1]) {
    const w = new THREE.Group(), ry = s * A;
    w.add(box(WL, WH, WD, CREAM, 0, 0, -WD / 2), box(WL + 0.3, 4.2, WD + 0.3, RED, 0, 0, -WD / 2));
    w.add(box(WL + 0.6, 0.6, WD + 0.6, CREAM, 0, WH, -WD / 2), box(WL - 2, 1.4, WD - 2, CREAM, 0, WH + 0.6, -WD / 2));
    // Shopfronts on the ground floor, bands of windows above, each floor under a thin sunshade.
    for (let fl = 1; fl < 5; fl++) {
      const y = fl * FL + 1;
      bands.push({ s, ry, x: 0, y, len: WL - 4, h: 1.9 });
      fins.push({ s, ry, y: y + 2.3, len: WL - 2 });
    }
    w.add(box(WL - 6, 3, 0.1, GLASS, 0, 0.4, 0.06));
    // The wing turns so that its street face (+z) looks out from the wedge.
    // Its street face stands OFF out from the drum's centre; it runs back from the corner along u.
    const OFF = R - 1.2, n = [s * Math.cos(A), Math.sin(A)], u = [s * Math.sin(A), -Math.cos(A)];
    w.rotation.y = s * (Math.PI / 2 - A);
    w.position.set(n[0] * OFF + u[0] * WL / 2, 0, n[1] * OFF + u[1] * WL / 2);
    d.add(w);
    const bl = new THREE.Group();
    for (const b of bands.filter((q) => q.s === s)) bl.add(box(b.len, b.h, 0.08, GLASS, b.x, b.y, 0.04));
    for (const b of fins.filter((q) => q.s === s)) bl.add(box(b.len, 0.18, 0.9, CREAM, 0, b.y, 0.45));
    // Mullions across each band.
    for (let k = 0; k <= 22; k++) for (let fl = 1; fl < 5; fl++) bl.add(box(0.22, 1.9, 0.14, CREAM, -WL / 2 + 2 + k * ((WL - 4) / 22), fl * FL + 1, 0.07));
    bl.rotation.copy(w.rotation);
    bl.position.copy(w.position);
    d.add(bl);
  }
  // The space between the wings, closed behind; the auditorium within it.
  d.add(box(46, 16, 34, CREAM, 0, 0, -36));
  // The corner drum: red stone at its foot, cream above, bands of glass round it.
  d.add(cyl(R, R, WH + 1, CREAM, 0, 0, 0, 48), cyl(R + 0.25, R + 0.25, 4.2, RED, 0, 0, 0, 48), cyl(R + 0.5, R + 0.5, 0.6, CREAM, 0, WH + 1, 0, 48));
  for (let fl = 1; fl < 5; fl++) d.add(cyl(R + 0.04, R + 0.04, 1.9, GLASS, 0, fl * FL + 1, 0, 48), cyl(R + 0.8, R + 0.8, 0.18, CREAM, 0, fl * FL + 3.3, 0, 48));
  // The marquee over the entrance, round the drum.
  d.add(cyl(R + 3.2, R + 3.2, 0.5, CREAM, 0, 4.3, 0, 48));
  // The stepped tower: three tiers of half-drum set back from the front, red-framed, ribbed with
  // fins, rising over the entrance.
  let y = WH + 1.6, r = 7.2;
  for (const h of [5, 4, 3.2]) {
    d.add(cyl(r, r, h, CREAM, 0, y, -1, 40), cyl(r + 0.3, r + 0.3, 0.45, RED, 0, y + h - 0.45, -1, 40));
    y += h; r -= 2;
  }
  d.add(cyl(0.12, 0.12, 6, M.steel, 0, y, -1, 6));
  const ribs = [];
  for (let k = -4; k <= 4; k++) {
    const a = k * 0.16;
    ribs.push([Math.sin(a) * 7.4, WH + 1.6, -1 + Math.cos(a) * 7.4, 0.35, 5, 0.5, a], [Math.sin(a) * 10.15, 5.2, Math.cos(a) * 10.15, 0.3, WH - 4.2, 0.35, a]);
  }
  // The red sandstone frame up either side of the drum's face.
  for (const s of [-1, 1]) d.add(at(box(1.2, WH + 6.6, 1.4, RED), Math.sin(s * 0.82) * (R + 0.2), 0, Math.cos(s * 0.82) * (R + 0.2)).rotateY(s * 0.82));
  // The name, at the head of the tower.
  const name = new THREE.Group(), sz = 2.6, gap = sz * 0.2;
  const E = lettering('E', sz, 0.25, RED), OS = lettering('OS', sz, 0.25, RED), Rr = letterR(sz, 0.25, RED);
  const wE = E.userData.width, wR = sz * 0.62, wOS = OS.userData.width, total = wE + wR + wOS + 2 * gap;
  E.position.x = -total / 2 + wE / 2; Rr.position.x = -total / 2 + wE + gap; OS.position.x = total / 2 - wOS / 2;
  name.add(E, Rr, OS);
  d.add(at(name, 0, WH + 2.4, 6.25));
  f.add(mergeByMaterial(d), inst(unitBox(), ribs, CREAM));
  addDetails(f, g);
  // From across the junction, looking at the corner.
  return { group: g, focus: f, view: [0.3, 0.2, 1], zoom: 0.85 };
}
