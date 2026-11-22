import * as THREE from 'three';
import { M, mat, photo, mesh, box, inst, unitBox, rng } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { mountainRing } from '../parts/terrain.js';
import { trees, scatter, along, asiBoard, bollards } from '../parts/realism.js';
import { detail } from '../detail.js';

// Martand's grey limestone, in great dressed blocks, weathered to a warm grey with darker stains.
export const STONE = photo(mat('#a59d8d', 0.93), 'blocks');
export const SHADE = photo(mat('#857e70', 0.95), 'blocks');
const HOLLOW = M.recess;

// The trefoil opening of Kashmiri building, w wide, its jambs rising to `spring` and its head a
// trefoil: two side lobes and a taller middle lobe, as a closed path (for a hole or a solid).
function trefoilPath(w, spring, path = new THREE.Path(), y0 = 0) {
  const r1 = w * 0.26, r2 = w * 0.3;
  path.moveTo(-w / 2, y0);
  path.lineTo(-w / 2, spring);
  path.absarc(-w / 2 + r1, spring, r1, Math.PI, Math.PI * 0.35, true);
  path.absarc(0, spring + w * 0.2, r2, Math.PI * 0.92, Math.PI * 0.08, true);
  path.absarc(w / 2 - r1, spring, r1, Math.PI * 0.65, 0, true);
  path.lineTo(w / 2, y0);
  path.lineTo(-w / 2, y0);
  return path;
}

// A Kashmiri portal, w wide and h high, facing +z on z = 0 and 0.7 deep: a frame between two
// pilasters, pierced by a trefoil arch, under a steep triangular pediment that holds a smaller
// trefoil niche. The opening's back is left open.
export function portal(w, h, m, trim) {
  const g = new THREE.Group(), ph = Math.min(h * 0.38, w * 0.62), fh = h - ph, aw = w * 0.5, depth = 0.7;
  const outer = new THREE.Shape();
  outer.moveTo(-w / 2, 0); outer.lineTo(w / 2, 0); outer.lineTo(w / 2, fh); outer.lineTo(0, h); outer.lineTo(-w / 2, fh); outer.lineTo(-w / 2, 0);
  outer.holes.push(trefoilPath(aw, fh - aw * 0.75, undefined, 0.03));
  const slab = new THREE.ExtrudeGeometry(outer, { depth, bevelEnabled: false, curveSegments: 6 }).translate(0, 0, -depth / 2);
  g.add(mesh(slab, m));
  // The pilasters, the cornice over the frame, the pediment's raking mouldings, and its niche.
  for (const s of [-1, 1]) g.add(box(w * 0.14, fh, 0.25, trim, s * (w / 2 - w * 0.07), 0, depth / 2 + 0.12), box(w * 0.18, w * 0.06, 0.4, trim, s * (w / 2 - w * 0.07), fh - w * 0.06, depth / 2 + 0.18));
  g.add(box(w + 0.3, w * 0.05, depth + 0.5, trim, 0, fh, 0));
  const L = Math.hypot(w / 2, ph), a = Math.atan2(ph, w / 2);
  for (const s of [-1, 1]) {
    const r = box(L, w * 0.05, 0.3, trim, 0, 0, 0);
    r.position.set(s * w / 4, fh + ph / 2, depth / 2 + 0.12);
    r.rotation.z = s * -a;
    g.add(r);
  }
  const nw = w * 0.22, nShape = new THREE.Shape();
  trefoilPath(nw, nw * 0.9, nShape);
  g.add(mesh(new THREE.ShapeGeometry(nShape, 6), HOLLOW, 0, fh + ph * 0.18, depth / 2 + 0.03));
  return mergeByMaterial(g);
}

// The colonnade: fluted columns (16 flutes, drawn as a sixteen-sided shaft with a moulded base and
// a square capital) at the places [x, y, z, k] where k < 1 leaves a broken stump k of the shaft.
const COL_H = 3.8;
export function colonnade(list) {
  const g = new THREE.Group(), whole = list.filter((c) => c[3] >= 1), stumps = list.filter((c) => c[3] < 1);
  const shaft = new THREE.CylinderGeometry(0.34, 0.4, 1, 16).translate(0, 0.5, 0);
  const base = new THREE.CylinderGeometry(0.52, 0.56, 0.4, 16).translate(0, 0.2, 0);
  const cap = new THREE.BoxGeometry(1.0, 0.4, 1.0).translate(0, 0.2, 0), echinus = new THREE.CylinderGeometry(0.5, 0.36, 0.3, 16).translate(0, 0.15, 0);
  const all = list.map(([x, y, z]) => [x, y, z, 1, 1, 1, 0]);
  g.add(inst(base, all, SHADE));
  g.add(inst(shaft, whole.map(([x, y, z]) => [x, y + 0.4, z, 1, COL_H - 1.1, 1, 0]), STONE), inst(echinus, whole.map(([x, y, z]) => [x, y + COL_H - 0.7, z, 1, 1, 1, 0]), STONE), inst(cap, whole.map(([x, y, z]) => [x, y + COL_H - 0.4, z, 1, 1, 1, 0]), SHADE));
  g.add(inst(shaft, stumps.map(([x, y, z, k]) => [x, y + 0.4, z, 1, (COL_H - 1.1) * k, 1, 0]), STONE));
  return g;
}

// The cells behind the columns: in the wall's inner face, a trefoil recess 1.6 m wide under a
// pointed pediment between pilasters, at the places [x, y, z, 1, 1, 1, ry] (facing ry).
export function cellNiches(list) {
  const frame = new THREE.Group(), w = 1.6, fh = 3.0;
  const outer = new THREE.Shape();
  outer.moveTo(-1.15, 0); outer.lineTo(1.15, 0); outer.lineTo(1.15, fh); outer.lineTo(0, fh + 1.3); outer.lineTo(-1.15, fh); outer.lineTo(-1.15, 0);
  outer.holes.push(trefoilPath(w, fh - w * 0.75, undefined, 0.03));
  frame.add(mesh(new THREE.ExtrudeGeometry(outer, { depth: 0.15, bevelEnabled: false, curveSegments: 4 }), STONE));
  const fg = mergeByMaterial(frame).children[0].geometry;
  const hole = new THREE.ShapeGeometry(trefoilPath(w, fh - w * 0.75, new THREE.Shape(), 0.03), 4).translate(0, 0, 0.01);
  return new THREE.Group().add(inst(fg, list, STONE), inst(hole, list, HOLLOW));
}

// Martand on the Karewa plateau: the court's grass, worn into paths, with fallen blocks and column
// drums lying where they fell; the plateau's fields and chinar trees round about; the village of
// Mattan's houses below to the south-west; and the Pir Panjal, snow on its ridges, across the
// valley to the south, the hills of the Lidder valley behind.
export function addDetails(f, g, { X, Z }) {
  g.add(box(900, 0.1, 900, M.grass, 0, -0.1, 0));
  g.add(box(X * 2 - 1, 0.04, Z * 2 - 1, mat('#7f9454', 0.95), 0, -0.02, 0));
  g.add(box(3, 0.06, Z * 2, M.path, 0, 0, 0), box(4, 0.06, 40, M.path, 0, -0.02, Z + 26));
  // The fallen stones.
  const R = rng(3), blocks = [], drums = [];
  for (let k = 0; k < (detail.low ? 60 : 140); k++) {
    const x = (R() - 0.5) * (X * 2 - 8), z = (R() - 0.5) * (Z * 2 - 8);
    if (Math.abs(x) < 9 && z > -16 && z < 14) continue;
    if (Math.abs(x) < 2.5) continue;
    const near = Math.abs(Math.abs(x) - X) < 8 || Math.abs(Math.abs(z) - Z) < 8;
    if (!near && R() < 0.6) continue;
    if (R() < 0.4) drums.push([x, 0.38, z, 1, 1, 1, R() * 3]);
    else blocks.push([x, 0, z, 0.8 + R() * 1.4, 0.5 + R() * 0.6, 0.6 + R() * 0.9, R() * 3]);
  }
  g.add(inst(unitBox(), blocks, SHADE));
  g.add(inst(new THREE.CylinderGeometry(0.38, 0.38, 1.1, 16).rotateZ(Math.PI / 2), drums, STONE));
  g.add(bollards(along(8, [-X - 8, Z + 10], [X + 8, Z + 10]), { h: 0.7 }));
  g.add(asiBoard('Martand Sun Temple', -6, Z + 14, 0));
  // The mountains round the valley, the Pir Panjal to the south carrying snow.
  g.add(mountainRing({ inner: 650, outer: 1250, h: 420, vary: 140, size: 3200, snow: 330, rock: ['#7f7a70', '#8b867b', '#6f6b62'], cover: '#5f7346', steep: 0.8, aspect: 1.3, cz: -100 }));
  // Chinar and poplar trees on the plateau, and walnut-like broad trees by the fields.
  const keep = [[-X - 14, X + 14, -Z - 14, Z + 40]];
  g.add(trees(scatter(detail.low ? 12 : 24, [-260, 260, -260, 260], { seed: 7, gap: 24, avoid: keep }), { kind: 'chinar', seed: 7 }));
  g.add(trees([...along(9, [-140, -70], [-140, 120]), ...along(7, [150, -90], [150, 80])], { kind: 'poplar', seed: 3 }));
  g.add(trees(scatter(detail.low ? 10 : 20, [-300, 300, -300, 300], { seed: 11, gap: 22, avoid: keep }), { kind: 'willow', seed: 11 }));
  // Fields in strips of different greens and the ochre of stubble.
  const F = [mat('#8aa05a', 0.95), mat('#a7a066', 0.95), mat('#6f8f4c', 0.95)];
  const fields = new THREE.Group();
  for (let i = 0; i < 18; i++) { const x = -260 + (i % 6) * 90, z = -260 + Math.floor(i / 6) * 180; if (Math.abs(x) < 110 && Math.abs(z) < 130) continue; fields.add(box(80, 0.04, 160, F[i % 3], x + 40, -0.06, z + 80)); }
  g.add(mergeByMaterial(fields));
}
