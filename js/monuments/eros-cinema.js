import * as THREE from 'three';
import { M, mat, photo, mesh, box, cyl, at, inst, unitBox } from '../helpers.js';
import { mergeByMaterial, lettering } from '../parts/components.js';
import { GLASS } from '../parts/colonial.js';
import { addDetails } from '../details/eros-cinema.js';

// Eros's cream render and the red Agra sandstone that faces its ground floor, its entrance block
// and the panels of its tower.
export const CREAM = photo(mat('#ece0c3', 0.8), 'plaster');
export const RED = photo(mat('#9c4338', 0.85), 'sandstone');

// The building's measures, shared with js/details/eros-cinema.js. From photographs: a wedge on the
// corner of Maharshi Karve Road and Veer Nariman Road, opposite Churchgate station. Two wings, WL
// long and WD deep, run back from the corner at ±A from the axis: a red ground floor G high with
// shops, five floors of flats (FL each) to the cornice at WH, and a top floor set back. At the
// corner stands the tower, faceted, R to its faces at the foot, stepping back in tiers; a rounded
// bay BR in radius turns each wing into it; and before it the red entrance block, EW wide and EH
// high, its front at EZ, carries the name. Each rounded bay stands BO proud of its wing.
export const P = { WL: 58, WD: 17, WH: 21.5, G: 5, FL: 3.3, R: 8, A: Math.PI / 4, BR: 7, BO: 3.4, EW: 9.5, EH: 18.2, EZ: 10.6 };

// The tower's tiers: [faces, distance to a face, foot, head]. The lowest rises from the pavement
// past the wings' roofs; four more step back above it.
export const TIERS = [[12, 8, 0, 25], [12, 6.3, 25, 30.4], [8, 4.7, 30.4, 35.4], [8, 3.3, 35.4, 39.8], [8, 2.2, 39.8, 43.6]];

// A point on a wing's street face (s: -1 or 1), t back from the corner and `out` proud of it, as
// [x, z]; and the turn that makes a part built facing +z look out from that face.
export const wingAt = (s, t, out = 0) => {
  const { R, A } = P, o = R - 1.2 + out;
  return [s * (Math.cos(A) * o + Math.sin(A) * t), Math.sin(A) * o - Math.cos(A) * t];
};
export const wingTurn = (s) => s * (Math.PI / 2 - P.A);

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

// A prism of n faces, a to each face, one face looking along +z.
const prism = (n, a, h, m, y) => { const p = cyl(a / Math.cos(Math.PI / n), a / Math.cos(Math.PI / n), h, m, 0, y, 0, n); p.rotation.y = Math.PI / n; return p; };

export function buildErosCinema() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  const { WL, WD, WH, G, FL, BR, EW, EH, EZ } = P;
  const glass = [], sills = [], cream = [], shut = [];
  // The two wings, each turned to run back from the corner; its street face looks outward.
  for (const s of [-1, 1]) {
    const w = new THREE.Group(), ry = wingTurn(s), [cx, cz] = wingAt(s, WL / 2);
    w.add(box(WL, WH, WD, CREAM, 0, 0, -WD / 2), box(WL + 0.2, G - 0.8, WD + 0.2, RED, 0, 0, -WD / 2));
    w.add(box(WL + 0.5, 0.8, WD + 0.5, CREAM, 0, G - 0.8, -WD / 2), box(WL + 0.9, 0.4, WD + 0.9, CREAM, 0, WH, -WD / 2));
    // The top floor, set back behind the cornice under a thin flat canopy.
    w.add(box(WL - 3, 3, WD - 3, CREAM, 0, WH + 0.4, -WD / 2), box(WL - 1.2, 0.22, WD - 1.2, CREAM, 0, WH + 3.4, -WD / 2));
    w.add(box(WL - 8, 1.4, 0.08, GLASS, 0, WH + 1.5, -1.47));
    w.rotation.y = ry;
    w.position.set(cx, 0, cz);
    d.add(w);
    // Paired casements with red sills on each floor of flats; shop shutters between red piers.
    for (let t = 15.5; t < WL - 2; t += 3.6) for (let k = 0; k < 5; k++) {
      const y = G + k * FL + 1;
      for (const e of [-0.55, 0.55]) { const [x, z] = wingAt(s, t + e, 0.02); glass.push([x, y, z, 0.85, 1.7, 0.08, ry]); }
      const [x, z] = wingAt(s, t, 0.08);
      sills.push([x, y - 0.14, z, 2.3, 0.14, 0.24, ry]);
    }
    for (let t = 17; t < WL - 2; t += 5.2) { const [x, z] = wingAt(s, t, 0.12); shut.push([x, 0.3, z, 3.8, 3.3, 0.08, ry]); }
    // The rounded bay that turns the wing into the tower: red at its foot, windows round it.
    const [bx, bz] = wingAt(s, 10, P.BO - BR);
    d.add(cyl(BR, BR, WH, CREAM, bx, 0, bz, 40), cyl(BR + 0.1, BR + 0.1, G - 0.8, RED, bx, 0, bz, 40), cyl(BR + 0.25, BR + 0.25, 0.8, CREAM, bx, G - 0.8, bz, 40));
    d.add(cyl(BR + 0.45, BR + 0.45, 0.4, CREAM, bx, WH, bz, 40), cyl(BR - 1.5, BR - 1.5, 3, CREAM, bx, WH + 0.4, bz, 32), cyl(BR - 0.6, BR - 0.6, 0.22, CREAM, bx, WH + 3.4, bz, 32));
    for (let q = -1; q <= 3; q++) for (let k = 0; k < 5; k++) {
      const a = ry + s * (0.2 - q * 0.34), y = G + k * FL + 1, x = bx + Math.sin(a) * BR, z = bz + Math.cos(a) * BR;
      glass.push([x, y, z, 0.9, 1.7, 0.1, a]);
      sills.push([x, y - 0.14, z, 1.2, 0.14, 0.3, a]);
    }
  }
  // The space between the wings, closed behind; the auditorium within it.
  d.add(box(46, 16, 34, CREAM, 0, 0, -36));
  // The tower: five faceted tiers, each stepping back from the one below.
  TIERS.forEach(([n, a, y0, y1]) => d.add(prism(n, a, y1 - y0, CREAM, y0)));
  d.add(prism(12, TIERS[0][1] + 0.1, G - 0.8, RED, 0));
  // Its finial: a small drum banded red and cream under a cap, and a short mast.
  const [, , , ty] = TIERS[4];
  for (let k = 0; k < 5; k++) d.add(cyl(1.45, 1.45, 0.62, k % 2 ? CREAM : RED, 0, ty + k * 0.62, 0, 24));
  d.add(cyl(0.9, 1.45, 0.5, CREAM, 0, ty + 3.1, 0, 24), cyl(0.07, 0.07, 2.6, M.steel, 0, ty + 3.6, 0, 6));
  // Fins up every edge of each tier, each rising past its tier's head as a stub.
  TIERS.forEach(([n, a, y0, y1], i) => {
    const rv = a / Math.cos(Math.PI / n), from = i ? y0 : G;
    for (let k = 0; k < n; k++) {
      const an = ((k + 0.5) / n) * Math.PI * 2;
      if (i === 0 && Math.cos(an) < -0.3) continue;
      cream.push([Math.sin(an) * rv, from, Math.cos(an) * rv, i > 1 ? 0.75 : 0.7, y1 - from + (i === 4 ? 0.8 : 1.4), 1.2, an]);
    }
  });
  // Windows on the tower's street faces, two to a face on every floor.
  for (let k = -2; k <= 2; k++) for (let fl = 0; fl < 6; fl++) {
    const an = (k / 12) * Math.PI * 2, a = TIERS[0][1], y = G + fl * FL + 1;
    for (const e of [-0.85, 0.85]) {
      const x = Math.sin(an) * a + Math.cos(an) * e, z = Math.cos(an) * a - Math.sin(an) * e;
      glass.push([x, y, z, 0.8, 1.7, 0.1, an]);
      sills.push([x, y - 0.14, z, 1.05, 0.14, 0.26, an]);
    }
  }
  // The entrance block before the tower: red stone, its sides stepping down, three windows to a
  // floor, and the name across its head.
  d.add(box(EW, EH, EZ - 5, RED, 0, 0, (EZ + 5) / 2));
  [[1.3, 14.6, 0.5], [2.6, 11.2, 1], [3.9, 7.6, 1.5]].forEach(([w, h, back]) => d.add(box(EW + 2 * w, h, EZ - 5 - back, RED, 0, 0, (EZ - back + 5) / 2)));
  for (let k = -2; k <= 2; k++) d.add(cyl(0.34, 0.34, 0.45, RED, k * 1.9, EH, EZ - 0.5, 12));
  for (let fl = 0; fl < 3; fl++) for (const x of [-2.6, 0, 2.6]) {
    glass.push([x, G + fl * FL + 0.9, EZ, 1.3, 1.9, 0.08, 0]);
    cream.push([x, G + fl * FL + 0.9 - 0.12, EZ, 1.6, 0.12, 0.2, 0]);
  }
  const name = new THREE.Group(), sz = 1.9, gap = sz * 0.22;
  const E = lettering('E', sz, 0.22, CREAM), OS = lettering('OS', sz, 0.22, CREAM), Rr = letterR(sz, 0.22, CREAM);
  const wE = E.userData.width, wR = sz * 0.62, wOS = OS.userData.width, total = wE + wR + wOS + 2 * gap;
  E.position.x = -total / 2 + wE / 2; Rr.position.x = -total / 2 + wE + gap; OS.position.x = total / 2 - wOS / 2;
  name.add(E, Rr, OS);
  d.add(at(name, 0, EH - 2.5, EZ + 0.01));
  f.add(mergeByMaterial(d), inst(unitBox(), cream, CREAM), inst(unitBox(), glass, GLASS), inst(unitBox(), sills, RED), inst(unitBox(), shut, M.steel));
  addDetails(f, g);
  // From across the junction, looking at the corner.
  return { group: g, focus: f, view: [0.32, 0.2, 1], zoom: 0.8 };
}
