import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, photo, hipRoof } from '../helpers.js';
import { mergeByMaterial, star } from '../parts/components.js';
import { classicalDoor, column, balustrade } from '../parts/colonial.js';
import { steps } from '../parts/doorways.js';
import { addDetails } from '../details/solomons-temple-aizawl.js';

// Solomon's Temple of the Kohhran Thianghlim: white Rajasthani marble over a concrete frame, its
// windows in grey-blue glass, the crowns of its towers gilded.
export const MARBLE = photo(mat('#f3f1ec', 0.5), 'marble');
export const SHADE = mat('#dcd8cf', 0.6);
export const GLASSB = mat('#4d6573', 0.2, 0.6);

// A crown h high and r in radius on y = 0: a jewelled band, a ring of eight points each with a
// ball, arches rising from them to an orb, and a cross.
export function crown(r, h, m) {
  const g = new THREE.Group();
  g.add(cyl(r, r * 0.92, h * 0.32, m, 0, 0, 0, 24), cyl(r * 1.06, r * 1.06, h * 0.06, m, 0, 0, 0, 24), cyl(r * 1.06, r * 1.06, h * 0.06, m, 0, h * 0.28, 0, 24));
  const pt = new THREE.ConeGeometry(r * 0.16, h * 0.3, 4), ball = new THREE.SphereGeometry(r * 0.09, 8, 6);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    g.add(mesh(pt, m, Math.cos(a) * r * 0.98, h * 0.47, Math.sin(a) * r * 0.98), mesh(ball, m, Math.cos(a) * r * 0.98, h * 0.65, Math.sin(a) * r * 0.98));
  }
  for (let k = 0; k < 4; k++) {
    const arc = new THREE.TorusGeometry(r * 0.8, r * 0.05, 5, 16, Math.PI);
    const o = mesh(arc, m, 0, h * 0.32, 0);
    o.rotation.y = (k / 4) * Math.PI;
    o.scale.y = 0.62;
    g.add(o);
  }
  g.add(mesh(new THREE.SphereGeometry(r * 0.2, 12, 8), m, 0, h * 0.32 + r * 0.5, 0));
  g.add(box(r * 0.08, r * 0.5, r * 0.08, m, 0, h * 0.32 + r * 0.66, 0), box(r * 0.32, r * 0.08, r * 0.08, m, 0, h * 0.32 + r * 0.95, 0));
  return g;
}

// The temple's measures, shared with js/details/solomons-temple-aizawl.js. The hall is H square
// (120 ft) and WH high, under a low hipped roof and a square lantern; a porch on every side carries
// it out to 55 m (180 ft) across; a tower T square stands at each corner, TH high to its parapet,
// with its crown on top. It stands on a podium P high on its ridge; the main front faces +z.
export const S = { H: 36.6, WH: 16, T: 7, TH: 26, P: 1.6, PW: 16, PD: 9.2, PH: 12.5 };

export function buildSolomonsTempleAizawl() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { H, WH, T, TH, P, PW, PD, PH } = S, d = new THREE.Group(), W = H + 2 * PD;
  // The podium with steps on every side, and the hall.
  d.add(box(W + 8, P, W + 8, SHADE, 0, 0, 0), box(W + 8.4, 0.2, W + 8.4, MARBLE, 0, P - 0.2, 0));
  d.add(box(H, WH, H, MARBLE, 0, P, 0));
  d.add(at(hipRoof(H + 1.2, H + 1.2, 4.2, SHADE), 0, P + WH + 0.6, 0), box(H + 1.4, 0.6, H + 1.4, MARBLE, 0, P + WH, 0));
  // The lantern over the middle of the hall: clerestory windows under a low pyramid.
  d.add(box(11, 5.4, 11, MARBLE, 0, P + WH + 2.6, 0), box(11.8, 0.4, 11.8, SHADE, 0, P + WH + 8, 0), at(hipRoof(11.6, 11.6, 2.4, SHADE), 0, P + WH + 8.4, 0));
  const ord = { m: MARBLE, trim: SHADE, fill: 'glass', top: null, depth: 0.25 };
  const lw = classicalDoor(1.3, 2.8, ord);
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) for (const s of [-3, 0, 3]) {
    const o = at(lw.clone(), Math.sin(a) * 5.5 + Math.cos(a) * s, P + WH + 3.6, Math.cos(a) * 5.5 - Math.sin(a) * s);
    o.rotation.y = a;
    d.add(o);
  }
  // Tall arched windows along each face of the hall, either side of the porch.
  const win = classicalDoor(2, 7.2, ord);
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) for (const s of [-1, 1]) for (const l of [11.6, 14.8]) {
    const o = at(win.clone(), Math.sin(a) * H / 2 + Math.cos(a) * s * (l - 1.6), P + 4.2, Math.cos(a) * H / 2 - Math.sin(a) * s * (l - 1.6));
    o.rotation.y = a;
    d.add(o);
  }
  // The four porches: a portico of four columns under an entablature and parapet with a Star of
  // David at its middle, before three great doors.
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const p = new THREE.Group();
    p.add(box(PW, 0.3, PD, MARBLE, 0, P, H / 2 + PD / 2));
    p.add(box(PW + 0.6, 1.6, PD + 0.3, MARBLE, 0, P + PH, H / 2 + PD / 2), box(PW + 1, 0.4, PD + 0.6, SHADE, 0, P + PH + 1.6, H / 2 + PD / 2));
    p.add(box(PW + 1, 2.4, 0.6, MARBLE, 0, P + PH + 2, H / 2 + PD - 0.1), box(PW + 1.2, 0.3, 0.8, SHADE, 0, P + PH + 4.4, H / 2 + PD - 0.1));
    for (const s of [-1, 1]) p.add(box(0.6, 2.4, PD, MARBLE, s * (PW / 2 + 0.2), P + PH + 2, H / 2 + PD / 2));
    p.add(at(star(6, 1.2, M.gild, 0.12), 0, P + PH + 3.2, H / 2 + PD + 0.22));
    for (let k = 0; k < 4; k++) p.add(at(column(0.55, PH, MARBLE), -PW / 2 + 1 + k * ((PW - 2) / 3), P + 0.3, H / 2 + PD - 1));
    for (const x of [-4.4, 0, 4.4]) p.add(at(classicalDoor(2.6, 6.2, { m: MARBLE, trim: SHADE, top: 'cornice', depth: 0.35 }), x, P, H / 2 + 0.02));
    p.add(at(steps(PW - 2, P, 6, MARBLE, 0.45), 0, 0, H / 2 + PD + 0.01).translateZ(0));
    p.rotation.y = a;
    d.add(p);
  }
  // The corner towers: square shafts rising past the roof, banded at each stage, with slim arched
  // windows, a balustraded parapet, and a gilded crown.
  const tw = classicalDoor(1.1, 4.2, ord);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * H / 2, z = sz * H / 2;
    d.add(box(T, TH, T, MARBLE, x, P, z));
    for (const y of [WH, WH + 5.4, TH - 0.5]) d.add(box(T + 0.5, 0.5, T + 0.5, SHADE, x, P + y, z));
    for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      const o = at(tw.clone(), x + Math.sin(a) * T / 2, P + WH + 1.6, z + Math.cos(a) * T / 2);
      o.rotation.y = a;
      const o2 = at(tw.clone(), x + Math.sin(a) * T / 2, P + WH + 6.8, z + Math.cos(a) * T / 2);
      o2.rotation.y = a;
      d.add(o, o2);
    }
    for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) d.add(at(balustrade(T, 1, MARBLE, { t: 0.5 }), x + Math.sin(a) * (T / 2 - 0.2), P + TH, z + Math.cos(a) * (T / 2 - 0.2)).rotateY(a));
    d.add(cyl(1.9, 2.1, 1.4, MARBLE, x, P + TH, z, 20), at(crown(1.9, 3.6, M.gild), x, P + TH + 1.4, z));
  }
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From the south-east, below the ridge: the main porch and two crowned towers.
  return { group: g, focus: f, view: [0.65, 0.25, 1], zoom: 0.85 };
}
