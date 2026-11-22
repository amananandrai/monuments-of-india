import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, inst, unitBox, photo, surface } from '../helpers.js';
import { carvedPillar } from '../parts/temples.js';
import { mergeByMaterial, frieze } from '../parts/components.js';
import { addDetails } from '../details/adalaj-stepwell.js';

// The Adalaj stepwell (Rudabai's vav), 1498–99: five storeys sunk into the ground, about 75 m
// from end to end. From photographs and plans: at the south end (+z) three flights, from the
// west, the south and the east, come down to a square landing one storey below ground, under a
// pavilion of sixteen pillars whose roof, at ground level, is open in the middle. From it a
// stepped corridor runs north, down four more flights; across it at each landing stands a
// pillared gallery (kuta) of carved pillars and beams storey on storey up to the ground, open in
// the middle to the sky. At the north end the corridor meets an octagonal shaft ringed by
// galleries on every storey, the water at its foot; beyond that, a round well. The side walls are
// carved all over with bands of flowers, elephants and little shrines.
export const STONE = photo(mat('#c7a87c', 0.9), 'sandstone');
export const SHADE = photo(mat('#a68960', 0.92), 'sandstone');
export const RELIEF = surface(mat('#c2a377', 0.9), 'reliefs');
export const GROUND = mat('#7f9150', 0.95);
// D: ground level; F: a storey; CW: half the corridor's width; the octagon's centre at z = OZ and
// its inner apothem OA. The round well at z = WZ.
export const F = 3.2, D = 5 * F, CW = 2.49, OZ = -24, OA = 6, WZ = -38;
// The landings along the corridor: [z where its flight down begins, its floor].
const KUTAS = [[23.2, 3 * F], [12.4, 2 * F], [1.6, F]];

// The octagon's corners round (0, OZ), apothem a, as [x, z] going round.
function octagon(a, cz = OZ) {
  const r = a / Math.cos(Math.PI / 8), pts = [];
  for (let k = 0; k < 8; k++) { const t = Math.PI / 8 + k * Math.PI / 4; pts.push([r * Math.cos(t), cz + r * Math.sin(t)]); }
  return pts;
}

// A solid of height h from y = 0 over the shape `outer` with `holes` (lists of [x, z]): its top
// and its walls as separate meshes, so that each takes its own material.
function solid(outer, holes, h, topM, sideM) {
  const toV = ([x, z]) => new THREE.Vector2(x, -z);
  const sh = new THREE.Shape(outer.map(toV));
  for (const hole of holes) sh.holes.push(Array.isArray(hole) ? new THREE.Path(hole.map(toV)) : hole);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 24 }).rotateX(-Math.PI / 2);
  const g = new THREE.Group();
  geo.groups.forEach(({ start, count, materialIndex }) => {
    const part = new THREE.BufferGeometry();
    for (const k of ['position', 'normal', 'uv']) {
      const a = geo.attributes[k];
      part.setAttribute(k, new THREE.BufferAttribute(a.array.slice(start * a.itemSize, (start + count) * a.itemSize), a.itemSize));
    }
    g.add(mesh(part, materialIndex === 0 ? topM : sideM));
  });
  return g;
}

export function buildAdalajStepwell() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  // The ground, cut through by the well: the entrance square, the corridor and the octagon as one
  // opening, and the round well as another.
  const oct = octagon(OA);
  const open = [[-CW, OZ + OA], [-CW, 28], [-10, 28], [-10, 46], [10, 46], [10, 28], [CW, 28], ...[1, 0, 7, 6, 5, 4, 3].map((k) => oct[k])];
  const wellHole = new THREE.Path();
  wellHole.absarc(0, -WZ, 2.8, 0, Math.PI * 2, false);
  g.add(solid([[-600, -600], [600, -600], [600, 600], [-600, 600]], [open, wellHole], D, GROUND, RELIEF));
  // The entrance: the landing a storey down, and the three flights to it.
  const yL = D - F;
  d.add(box(12, yL, 14, STONE, 0, 0, 35));
  const N = 13, run = 4 / N;
  for (let k = 0; k < N; k++) {
    const h = D - (k + 1) * (F / (N + 1));
    for (const s of [-1, 1]) d.add(box(run, h, 12, STONE, s * (10 - (k + 0.5) * run), 0, 36));
    d.add(box(12, h, run, STONE, 0, 0, 46 - (k + 0.5) * run));
  }
  for (const s of [-1, 1]) d.add(box(4, D - 0.02, 2, STONE, s * 8, 0, 29), box(4, D - 0.02, 4, STONE, s * 8, 0, 44));
  // Its pavilion: sixteen carved pillars and a roof at ground level open in the middle, with a
  // parapet round the opening.
  for (const x of [-4.5, -1.5, 1.5, 4.5]) for (const z of [29.6, 33.4, 37.2, 41]) { const p = carvedPillar(F - 0.4, STONE); p.scale.set(0.7, 1, 0.7); d.add(at(p, x, yL, z)); }
  d.add(box(12, 0.4, 3.2, SHADE, 0, D - 0.4, 29.6), box(12, 0.4, 3.2, SHADE, 0, D - 0.4, 41), box(3.8, 0.4, 8.2, SHADE, -4.1, D - 0.4, 35.3), box(3.8, 0.4, 8.2, SHADE, 4.1, D - 0.4, 35.3));
  for (const s of [-1, 1]) d.add(box(4.6, 0.7, 0.3, SHADE, 0, D, 35.3 + s * 2.15), box(0.3, 0.7, 4.0, SHADE, s * 2.15, D, 35.3));
  // The corridor: four flights down, a landing with its gallery after each of the first three, and
  // the floor at the foot running on to the octagon.
  const FN = 16, frun = 4.8 / FN;
  let z = 28;
  for (let lv = 0; lv < 4; lv++) {
    const top = D - F * (lv + 1);
    for (let k = 0; k < FN; k++) d.add(box(2 * CW, top - (k + 1) * (F / FN), frun, STONE, 0, 0, z - (k + 0.5) * frun));
    z -= 4.8;
    if (lv < 3) { d.add(box(2 * CW, top - F, 6, STONE, 0, 0, z - 3)); z -= 6; }
  }
  d.add(box(2 * CW, 0.2, z - (OZ + OA) + 0.1, SHADE, 0, 0, (z + OZ + OA) / 2));
  // The galleries across the corridor: at each storey from the landing to the ground, two rows of
  // four pillars, beams across, and a walk along each wall, open in the middle.
  const piers = [];
  for (const [zk, y0] of KUTAS) {
    const zc = zk - 3;
    for (let y = y0; y < D - 0.1; y += F) {
      for (const x of [-1.95, -0.7, 0.7, 1.95]) for (const dz of [-2.3, 2.3]) piers.push([x, y, zc + dz]);
      d.add(box(2 * CW, 0.45, 0.7, SHADE, 0, y + F - 0.45, zc - 2.3), box(2 * CW, 0.45, 0.7, SHADE, 0, y + F - 0.45, zc + 2.3));
      for (const s of [-1, 1]) d.add(box(1.1, 0.35, 5.3, SHADE, s * (CW - 0.55), y + F - 0.45, zc), box(0.12, 0.5, 4.6, frieze(STONE), s * (CW - 1.16), y + F - 0.95, zc));
    }
    for (const dz of [-2.3, 2.3]) d.add(box(2 * CW + 0.8, 0.3, 1.2, STONE, 0, D, zc + dz));
    for (const sx of [-1, 1]) d.add(box(1.3, 0.3, 3.4, STONE, sx * (CW - 0.25), D, zc));
  }
  for (const [x, y, zz] of piers) { const p = carvedPillar(F - 0.45, STONE); p.scale.set(0.42, 1, 0.42); d.add(at(p, x, y, zz)); }
  // The octagon: a gallery round the shaft at every storey, on pillars at its corners, and the
  // water at its foot.
  const ringGeo = (a0, a1, t) => {
    const toV = ([x, zz]) => new THREE.Vector2(x, -(zz - OZ));
    const sh = new THREE.Shape(octagon(a1, OZ).map(toV));
    sh.holes.push(new THREE.Path(octagon(a0, OZ).map(toV)));
    return new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }).rotateX(-Math.PI / 2);
  };
  for (let k = 1; k <= 4; k++) d.add(mesh(ringGeo(4.3, OA - 0.02, 0.4), SHADE, 0, k * F - 0.4, OZ));
  d.add(mesh(ringGeo(OA + 0.3, OA + 1.6, 0.7), STONE, 0, D, OZ));
  const cr = 4.55 / Math.cos(Math.PI / 8);
  for (let k = 0; k < 4; k++) for (let c = 0; c < 8; c++) {
    const t = Math.PI / 8 + c * Math.PI / 4, p = carvedPillar(F - 0.4, STONE);
    p.scale.set(0.42, 1, 0.42);
    d.add(at(p, cr * Math.cos(t), k * F, OZ - cr * Math.sin(t)));
  }
  d.add(mesh(new THREE.CylinderGeometry(4.3 / Math.cos(Math.PI / 8), 4.3 / Math.cos(Math.PI / 8), 0.3, 8).rotateY(Math.PI / 8), M.water, 0, 0.6, OZ));
  // The round well beyond, its kerb and the frame for the rope.
  d.add(cyl(2.8, 2.8, 0.4, M.water, 0, 2, WZ, 32), cyl(3.4, 3.4, 0.7, SHADE, 0, D, WZ, 32));
  for (const s of [-1, 1]) d.add(box(0.4, 2.4, 0.4, SHADE, s * 3, D + 0.7, WZ));
  d.add(box(6.4, 0.3, 0.4, SHADE, 0, D + 3.1, WZ));
  f.add(mergeByMaterial(d));
  addDetails(f, g, { D, F, CW, OZ, OA, WZ });
  // From above the entrance, looking down the length of the well to the octagon.
  return { group: g, focus: f, view: [0.3, 0.7, 0.75], zoom: 0.48, target: [0, 8, 4], minElevation: 0.35 };
}
