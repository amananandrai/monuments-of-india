import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, inst, surface } from '../helpers.js';
import { mergeByMaterial, jali } from '../parts/components.js';
import { gothicWindow, GLASS } from '../parts/colonial.js';
import { trees, lampPosts, traffic, along, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, TIERS, CREAM, RED, wingAt, wingTurn } from '../monuments/eros-cinema.js';

const STONE = mat('#b8a888', 0.88);
// The canopy's streamlined ribs, painted silver.
const SILVER = surface(mat('#dfe0dc', 0.45, 0.25), 'none');

// A slab w wide and d deep (from z = 0 out to d) with its two front corners rounded to radius r.
function roundSlab(w, d, h, r, m) {
  const sh = new THREE.Shape();
  sh.moveTo(-w / 2, 0); sh.lineTo(-w / 2, -d + r); sh.absarc(-w / 2 + r, -d + r, r, Math.PI, Math.PI * 1.5, false);
  sh.lineTo(w / 2 - r, -d); sh.absarc(w / 2 - r, -d + r, r, Math.PI * 1.5, Math.PI * 2, false); sh.lineTo(w / 2, 0);
  sh.closePath();
  return mesh(new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 6 }).rotateX(-Math.PI / 2), m);
}

// A panel of red stone w × h on a face at z = 0, crossed by a cream chevron: the tower's setbacks.
function chevronPanel(w, h) {
  const g = new THREE.Group(), n = Math.max(1, Math.round(w / 1.3)), cw = (w - 0.2) / n, len = Math.hypot(cw / 2, h * 0.55);
  g.add(box(w, h, 0.1, RED, 0, 0, 0.05));
  for (let k = 0; k < n; k++) for (const s of [-1, 1]) {
    const b = box(len, 0.13, 0.05, CREAM, 0, -0.065, 0);
    b.rotation.z = s * Math.atan2(h * 0.55, cw / 2);
    b.position.set(-w / 2 + 0.1 + (k + 0.5) * cw + s * cw / 4, h * 0.5, 0.115);
    g.add(b);
  }
  return g;
}

// Eros, finer detail. From photographs: red panels with cream chevrons between the fins at each
// of the tower's setbacks, and hexagonal openings on its second tier; the entrance canopy, a thick
// streamlined slab with rounded corners and stacked ribs on red columns banded with groups of
// cream stripes; a cream Deco grille over the showcase window beside it; curved bay balconies with
// red bands along the wings; and a red zigzag frieze under the cornice. Measures follow
// js/monuments/eros-cinema.js.
function architecture(f) {
  const { WL, WH, G, FL, BR, EW, EZ } = P, d = new THREE.Group(), teeth = [];
  // The tower's setbacks.
  TIERS.forEach(([n, a, y0, y1], i) => {
    const fw = 2 * a * Math.tan(Math.PI / n) - (i > 1 ? 0.75 : 0.7), ph = i === 4 ? 0.7 : 1.1;
    for (let k = 0; k < n; k++) {
      const an = (k / n) * Math.PI * 2;
      if (Math.cos(an) < (i ? -0.6 : -0.3)) continue;
      d.add(at(chevronPanel(fw, ph), Math.sin(an) * a, y1 - ph, Math.cos(an) * a).rotateY(an));
      if (i === 1 && Math.cos(an) > -0.2) {
        const hex = (r, t, m) => at(mesh(new THREE.CylinderGeometry(r, r, t, 6).rotateX(Math.PI / 2), m), Math.sin(an) * (a + t / 2), y0 + 2.4, Math.cos(an) * (a + t / 2)).rotateY(an);
        d.add(hex(0.62, 0.08, RED), hex(0.44, 0.12, GLASS));
      }
    }
  });
  // The canopy over the entrance: four ribs, each a little broader than the one below.
  const cw = EW + 2.6, cd = 5.2;
  for (let k = 0; k < 4; k++) d.add(at(roundSlab(cw + k * 0.3, cd + k * 0.15, 0.26, 1.4, SILVER), 0, 4.15 + k * 0.32, EZ));
  d.add(at(roundSlab(cw - 0.3, cd - 0.15, 1.2, 1.3, CREAM), 0, 4.1, EZ));
  for (const s of [-1, 1]) {
    const x = s * (cw / 2 - 1.5), z = EZ + cd - 1.5;
    d.add(cyl(0.7, 0.7, 4.1, RED, x, 0, z, 20));
    for (const y of [0.5, 1.5, 2.5, 3.4]) for (let k = 0; k < 4; k++) d.add(cyl(0.72, 0.72, 0.06, CREAM, x, y + k * 0.12, z, 20));
  }
  // The foyer's glass doors under it.
  d.add(box(EW - 2.4, 3.4, 0.08, GLASS, 0, 0.2, EZ + 0.04));
  for (const x of [-2.4, 0, 2.4]) d.add(box(0.12, 3.4, 0.12, SILVER, x, 0.2, EZ + 0.06));
  for (const s of [-1, 1]) {
    const ry = wingTurn(s);
    // The showcase window in the rounded bay's foot, a cream grille over it.
    const [bx, bz] = wingAt(s, 10, P.BO - BR), a = ry - s * 0.5;
    const show = new THREE.Group();
    show.add(box(1.7, 2.9, 0.1, GLASS, 0, 0.5, 0), box(1.9, 0.5, 0.14, jali(CREAM), 0, 3.4, 0), box(2, 0.08, 0.18, CREAM, 0, 3.9, 0));
    d.add(at(show, bx + Math.sin(a) * (BR + 0.12), 0, bz + Math.cos(a) * (BR + 0.12)).rotateY(a));
    // The frieze: a red band under the cornice with a row of points along its lower edge.
    const [fx, fz] = wingAt(s, WL / 2 + 8, 0.04), fl = WL - 16;
    d.add(at(box(fl, 0.34, 0.08, RED), fx, WH - 0.5, fz).rotateY(ry));
    for (let t = 16.3; t < WL; t += 0.62) { const [x, z] = wingAt(s, t, 0.04); teeth.push([x, WH - 0.5, z, 1, 1, 1, ry]); }
    d.add(cyl(BR + 0.05, BR + 0.05, 0.34, RED, bx, WH - 0.5, bz, 40));
    for (let q = -0.55; q < 1.3; q += 0.62 / BR) { const an = ry - s * q; teeth.push([bx + Math.sin(an) * (BR + 0.05), WH - 0.5, bz + Math.cos(an) * (BR + 0.05), 1, 1, 1, an]); }
    // Curved bay balconies up the wing: a red band at each floor, a ribbon of glass above it.
    for (const t of [WL * 0.45, WL * 0.82]) {
      const [x, z] = wingAt(s, t, -0.9), r = 2.9;
      d.add(cyl(r, r, 4 * FL, CREAM, x, G + FL * 0.2, z, 24), cyl(r + 0.1, r + 0.1, 0.25, RED, x, G + FL * 4.2, z, 24));
      for (let k = 0; k < 4; k++) d.add(cyl(r + 0.14, r + 0.14, 0.3, RED, x, G + (k + 0.2) * FL, z, 24), cyl(r + 0.03, r + 0.03, 1.2, GLASS, x, G + (k + 0.2) * FL + 1.3, z, 24));
    }
  }
  f.add(mergeByMaterial(d), inst(new THREE.BoxGeometry(0.44, 0.44, 0.07).rotateZ(Math.PI / 4), teeth, RED));
}

// A road along one of the wings: a carriageway and its pavement, with traffic in both directions.
function road(s, len, off, width) {
  const { A } = P, n = [s * Math.cos(A), Math.sin(A)], u = [s * Math.sin(A), -Math.cos(A)], ry = s * (Math.PI / 2 - A);
  const r = new THREE.Group();
  r.add(box(len, 0.06, width, M.asphalt, 0, 0, 0), box(len, 0.18, 4.5, M.path, 0, 0, -width / 2 - 2.25));
  r.add(traffic([[-width / 4, 1], [width / 4, -1]], -len / 2, len / 2 - 50, { gap: 18, seed: 3 + s, taxis: 0.35, buses: 0.12, trucks: 0.02, colours: ['#e8e6e1', '#3c4046', '#b9bcc0', '#8c2f2a'] }));
  r.add(trees(along(7, [-len / 2 + 52, -width / 2 - 2.5], [len / 2 - 40, -width / 2 - 2.5]), { kind: 'peepal', seed: 5 + s, h: 13 }));
  r.add(lampPosts(along(7, [-len / 2 + 6, -width / 2 - 0.6], [len / 2 - 10, -width / 2 - 0.6])));
  r.rotation.y = ry;
  r.position.set(n[0] * (off + width / 2 + 4.5) + u[0] * (len / 2 - 30), 0, n[1] * (off + width / 2 + 4.5) + u[1] * (len / 2 - 30));
  return r;
}

// Churchgate station across the junction: a long stone front under a central gable and tower,
// simplified, facing the cinema.
function churchgate(z) {
  const c = new THREE.Group();
  c.add(box(90, 13, 22, STONE, 0, 0, z), box(91, 0.8, 23, CREAM, 0, 13, z), box(14, 26, 14, STONE, 0, 0, z - 2));
  c.add(at(new THREE.Mesh(new THREE.ConeGeometry(7, 9, 4).rotateY(Math.PI / 4), STONE), 0, 30.5, z - 2));
  for (let k = -5; k <= 5; k++) if (k) c.add(at(gothicWindow(2.2, 5, { m: STONE, trim: CREAM }), k * 7.6, 3, z - 11.01).rotateY(Math.PI));
  return mergeByMaterial(c);
}

// Eros on its corner at Churchgate: the two roads along its wings meeting at the junction in
// front, Churchgate station across it, the Art Deco blocks of the reclaimed land round about, rain
// trees and street lamps along the pavements, and the city's traffic.
export function addDetails(f, g) {
  architecture(f);
  const { R } = P;
  g.add(box(600, 0.05, 600, M.asphalt, 0, -0.06, 0));
  g.add(box(70, 0.06, 40, M.asphalt, 0, 0.002, 40));
  for (const s of [-1, 1]) g.add(road(s, 150, R - 1.2, 16));
  g.add(cyl(R + 9, R + 9, 0.18, M.path, 0, 0, 0, 48));
  g.add(at(churchgate(0), -120, 0, 110).rotateY(-0.5));
  // The Oval Maidan beyond the road in front, an open lawn.
  g.add(box(260, 0.08, 200, M.grass, 90, 0, 182));
  g.add(traffic([[66, -1], [72, 1]], -120, 120, { gap: 16, seed: 9, taxis: 0.35, buses: 0.12, trucks: 0.02 }));
  g.add(cityAround([-110, 110, -150, 64], { rows: detail.low ? 1 : 2, every: detail.low ? 3 : 1, gap: 10, storeys: [4, 7], seed: 21, fine: !detail.low,
    keep: [[-300, 300, 30, 300]],
    paint: ['#efe6d2', '#e9dcc0', '#d9c9a8', '#e4d6c8', '#cfd8d4', '#f1e9d8'] }));
}
