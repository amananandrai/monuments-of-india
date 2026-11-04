import * as THREE from 'three';
import { M, mat, box, at, pidaRoof, hemi, kalash, inst, unitCyl, unitBox, aroundRect, sheet } from '../helpers.js';
import { gopuram, wallWithGaps } from '../details/temples.js';
import { addDetails } from '../details/ramanathaswamy-temple.js';

const STONE = ['#cfc6b3', '#b9ae97', '#ddd5c4', '#a89c83'];
const GRANITE = mat('#a89c83', 0.9);
const LIME = mat('#e7dfcd', 0.85);

export function buildRamanathaswamy() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Rameswaram island in the sea
  g.add(sheet(1400, 1400, M.sea, 0, 0.3, 0), box(320, 0.5, 300, mat('#dcc9a3', 0.95), 0, 0, 0));
  // Outer walls and the great gopurams on east and west
  const W = 140, D = 190;
  for (const s of [-1, 1]) f.add(wallWithGaps('x', W, 8, 3, LIME, [[0, s > 0 ? 29 : 25]], 0, s * D / 2), wallWithGaps('z', D, 8, 3, LIME, [[20, 15]], s * W / 2, 0));
  f.add(at(gopuram(30, 16, 38, 9, 3, STONE), 0, 0, D / 2), at(gopuram(26, 14, 32, 8, 4, STONE), 0, 0, -D / 2));
  for (const s of [-1, 1]) f.add(at(gopuram(16, 10, 18, 5, 5, STONE).rotateY(Math.PI / 2), s * W / 2, 0, 20));
  // The famous pillared corridors: three rings of colonnades round the shrines
  // Each is an open hall: the pillars stand in two rows on raised platforms either side of a long
  // walkway, each with a bracket capital, and the flat ceiling is painted with lotus medallions
  // down the middle, so the eye runs the length of the corridor.
  const cols = [], caps = [], meds = [], R = 3, PH = 1.3;
  for (const [w, d] of [[124, 172], [96, 132], [70, 96]]) {
    for (const off of [0, 14]) aroundRect(w - off, d - off, R).forEach(([x, z]) => { cols.push([x, PH, z, 1.1, 7 - PH, 1.1]); caps.push([x, 6.3, z, 1.8, 0.7, 1.8]); });
    for (const s of [-1, 1]) {
      f.add(box(w + 2, 1, 9, GRANITE, 0, 7, s * (d - 7) / 2), box(9, 1, d + 2, GRANITE, s * (w - 7) / 2, 7, 0));
      for (const off of [0, 14]) f.add(box(w - off + 2.4, PH, 2.4, GRANITE, 0, 0, s * (d - off) / 2), box(2.4, PH, d - off - 2.4, GRANITE, s * (w - off) / 2, 0, 0));
    }
    aroundRect(w - 7, d - 7, R).forEach(([x, z]) => meds.push([x, 6.985, z]));
  }
  f.add(inst(unitCyl(8), cols, GRANITE), inst(unitBox(), caps, GRANITE));
  const medGeo = new THREE.CircleGeometry(1.1, 16).rotateX(Math.PI / 2), mi = new THREE.InstancedMesh(medGeo, mat('#ffffff', 0.7), meds.length), o = new THREE.Object3D(), c = new THREE.Color();
  meds.forEach(([x, y, z], i) => { o.position.set(x, y, z); o.updateMatrix(); mi.setMatrixAt(i, o.matrix); mi.setColorAt(i, c.set(['#b8322a', '#e0a93a', '#2f6c8f', '#f2e6cc'][i % 4])); });
  f.add(mi);
  // Shrines of Ramanathaswamy and Parvatavardhini
  for (const [x, w] of [[-10, 14], [18, 10]]) {
    const r = pidaRoof(w, w * 0.45, 4, 1, GRANITE, mat('#8d826b', 0.9));
    f.add(box(w * 1.1, 8, w * 1.1, LIME, x, 0, -14), at(r, x, 8, -14), at(hemi(w * 0.24, GRANITE, 20), x, 8 + r.userData.top, -14), at(kalash(w * 0.15), x, 8 + r.userData.top + w * 0.24, -14));
  }
  addDetails(f, g);
  // Framed on the monument itself, closer than its grounds would set.
  return { group: g, focus: f, view: [0.7, 0.42, 1.2], zoom: 0.62 };
}
