import * as THREE from 'three';
import { M, mat, at, onFace, FACES, box } from '../helpers.js';
import { templeNiche, idol, mergeByMaterial } from '../parts/components.js';
import { figureFrieze, kuduGeo, instances } from '../parts/sculpture.js';
import { lion } from '../parts/animals.js';
import { trees, shrubs, asiBoard, along, scatter, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';

// Kanchipuram's soft sandstone, a warm buff; patched here and there with the grey of later repairs.
export const STONE = mat('#b39b7a', 0.93);
export const SHADE = mat('#8c7558', 0.94);

// VW, VH: the sanctum's width and wall height, at z = vz; the hall mw × md, MH high, at mz. The
// court runs x = ±cx, from z = cz0 to its east wall at cz1.
export const DIMS = { VW: 9, VH: 6, vz: -6, mz: 7, mw: 9, md: 8, MH: 5.2, cx: 17, cz0: -21, cz1: 20 };

// Kailasanathar, finer detail. From photographs:
// - every face of the sanctum, its seven shrines and the hall is carved with images in deep niches
//   between lion pilasters: Shiva as Gangadhara, Tripurantaka, the dancer, Durga on her lion;
// - each of the 58 cells of the court has its own image, Shiva and Parvati seated with Skanda
//   (Somaskanda) on its back wall, here seen as a small figure in each opening;
// - kudus along the cornices of the vimana's storeys;
// - seated lions at the corners of the hall's platform, and over the court wall a band of rearing
//   lions and riders.
function architecture(f) {
  const { VW, vz, mz, mw, md, cx, cz0, cz1 } = DIMS, d = new THREE.Group(), kudus = [];
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) for (const lat of [-2.8, 2.8]) {
    const o = onFace(at(templeNiche(1, 2.4, STONE, { figure: idol(2.1, STONE) }), 0, 1.4, 0), a, VW / 2 + 0.14, lat);
    o.position.z += vz;
    d.add(o);
  }
  for (const s of [-1, 1]) for (const lat of [-2.4, 0, 2.4]) {
    const o = onFace(at(templeNiche(0.9, 2.2, STONE, { figure: idol(1.9, STONE), crown: false }), 0, 1.3, 0), s * Math.PI / 2, mw / 2 + 0.14, lat);
    o.position.z += mz;
    d.add(o);
  }
  // The images in the cells, facing the sanctum from all sides.
  const fig = [], ix = cx - 1.45 - 0.96;
  const row = (x0, z0, x1, z1, n, a) => { for (let k = 0; k < n; k++) { const t = (k + 0.5) / n; fig.push([x0 + (x1 - x0) * t, 0.35, z0 + (z1 - z0) * t, 0.5, 0.6, 0.5, a]); } };
  row(-cx + 1.45, cz0 + 1.45 + 0.96, cx - 1.45, cz0 + 1.45 + 0.96, 15, 0);
  row(-ix, cz0 + 3.45, -ix, cz1 - 3.45, 13, Math.PI / 2);
  row(ix, cz0 + 3.45, ix, cz1 - 3.45, 13, -Math.PI / 2);
  for (const x of [-1, 1]) for (let k = 0; k < 8; k++) { const t = (k + 0.5) / 8, xx = x < 0 ? -cx + 1.45 + (cx - 1.45 - 3.5) * t : 3.5 + (cx - 1.45 - 3.5) * t; fig.push([xx, 0.35, cz1 - 1.45 - 0.96, 0.5, 0.6, 0.5, Math.PI]); }
  // Dark openings and the small images in them (cheap boxes: a figure seated on its pedestal).
  d.add(instances(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), fig.map(([x, y, z, , , , a]) => [x, 0, z, 1.1, 2.2, 0.04, a]), M.recess));
  d.add(instances(new THREE.BoxGeometry(1, 2, 0.5).translate(0, 1, 0), fig, STONE));
  // Kudus on the vimana's storeys.
  let y = 6.35, tw = VW - 1;
  for (let i = 0; i < 3; i++) {
    const n = Math.floor((tw * 0.6) / 0.9), ky = y + 2.4 * 0.86;
    for (const a of FACES) for (let k = 0; k < n; k++) {
      const lat = -tw * 0.3 + (k + 0.5) * ((tw * 0.6) / n), ca = Math.cos(a), sa = Math.sin(a), dist = (tw + 0.8) / 2 + 0.05;
      kudus.push([sa * dist + ca * lat, ky, vz + ca * dist - sa * lat, 0.55, 0.55, 0.55, a]);
    }
    y += 2.4;
    tw = (VW - 1) * (1 - (0.55 * (i + 1)) / 4);
  }
  d.add(instances(kuduGeo(), kudus, STONE));
  f.add(mergeByMaterial(d));
  // The band of rearing lions and riders along the top of the court's outer wall.
  if (!detail.low) for (const [a, len, dist] of [[0, cx * 2 - 8, cz1 + 0.5], [Math.PI / 2, cz1 - cz0 - 2, cx + 0.5], [-Math.PI / 2, cz1 - cz0 - 2, cx + 0.5], [Math.PI, cx * 2 - 2, -cz0 + 0.5]]) {
    if (a === 0) for (const s of [-1, 1]) f.add(at(figureFrieze(cx - 4.5, 0.7, STONE, { pitch: 0.9, kinds: ['horse', 'standing'], proud: 0.08 }), s * (cx + 4) / 2, 2.6, dist));
    else { const fr = onFace(at(figureFrieze(len, 0.7, STONE, { pitch: 0.9, kinds: ['horse', 'standing'], proud: 0.08 }), 0, 2.6, 0), a, dist); fr.position.z += (cz0 + cz1) / 2; f.add(fr); }
  }
  // Seated lions at the front corners of the hall's porch.
  for (const s of [-1, 1]) f.add(at(lion(0.55, STONE), s * 4.6, 0, mz + md / 2 + 2.9));
}

// The temple on the western edge of Kanchipuram: a lawn round the court, a paved approach from the
// east, coconut palms and neem, the town's tiled houses beyond, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  const { cx, cz0, cz1 } = DIMS;
  g.add(box(260, 0.2, 260, M.grass, 0, -0.25, 0), box(cx * 2 + 16, 0.06, cz1 - cz0 + 18, mat('#7d9757', 0.95), 0, -0.1, (cz0 + cz1) / 2 + 2));
  g.add(box(cx * 2 - 2, 0.05, cz1 - cz0 - 2, M.path, 0, 0, (cz0 + cz1) / 2), box(6, 0.06, 60, M.path, 0, 0, cz1 + 34));
  g.add(trees([...along(6, [-cx - 30, cz0 - 4], [-cx - 30, cz1 + 6]), ...along(6, [cx + 30, cz0 - 4], [cx + 30, cz1 + 6]), ...scatter(16, [-110, 110, -110, -40], { seed: 3, gap: 10 })], { kind: 'palm', seed: 5 }));
  g.add(trees([...scatter(detail.low ? 6 : 12, [-110, -40, -30, 110], { seed: 6, gap: 12 }), ...scatter(detail.low ? 6 : 12, [40, 110, -30, 110], { seed: 8, gap: 12 })], { kind: 'neem', seed: 7 }));
  g.add(shrubs([...along(6, [-6, cz1 + 10], [-6, cz1 + 40]), ...along(6, [6, cz1 + 10], [6, cz1 + 40])], { size: 0.9 }));
  if (!detail.low) g.add(townHouses(scatter(30, [-120, 120, 75, 160], { seed: 9, gap: 15 }).map(([x, z], k) => [x, z, 7 + (k % 3), 9, 1 + (k % 2)]), { seed: 4, roof: 'pitched', roofs: ['#9a4a32', '#8a3f2c', '#a65a3c'], tanks: 0.2 }));
  g.add(asiBoard('Kailasanatha Temple, Kanchipuram', 7, cz1 + 14, -0.3));
}
