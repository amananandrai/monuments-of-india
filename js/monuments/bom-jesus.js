import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, hipRoof } from '../helpers.js';
import { mergeByMaterial } from '../details/components.js';
import { classicalDoor, oculus } from '../details/colonial.js';

const LATERITE = mat('#9b5b3f', 0.95);
const BASALT = mat('#8a847a', 0.85);
const TILE = mat('#b5523b', 0.8);

function gableRoof(w, d, h, m) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  geo.translate(0, 0, -d / 2);
  return mesh(geo, m);
}

export function buildBomJesus() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(160, 0.15, 160, M.grass, 0, 0, 20), box(30, 0.2, 60, M.path, 0, 0, 50));
  // Nave under a tiled gable roof
  f.add(box(18, 16, 56, LATERITE, 0, 0, -16), at(gableRoof(19.5, 57, 6, TILE), 0, 16, -16));
  const nave = classicalDoor(1.8, 3.8, { m: LATERITE, trim: BASALT, fill: 'glass', top: null, depth: 0.25, frame: 0.3 }), nw = new THREE.Group();
  for (let z = -40; z <= 6; z += 7) for (const s of [-1, 1]) nw.add(at(nave.clone(), s * 9, 8.5, z).rotateY(s * Math.PI / 2));
  f.add(mergeByMaterial(nw));
  // The three-tier Baroque facade, framed by basalt pilasters and crowned by a carved pediment
  const fz = 12.2;
  f.add(box(24, 24, 2.4, LATERITE, 0, 0, fz));
  for (const y of [8, 16, 24]) f.add(box(25, 0.8, 2.8, BASALT, 0, y - 0.4, fz));
  for (const x of [-12, -4.3, 4.3, 12]) f.add(box(1.2, 24, 0.8, BASALT, x, 0, fz + 1.3));
  // The main portal between basalt columns under a broken pediment; the side doors between
  // pilasters; windows with segmental pediments above, and round windows in the top tier
  const fd = { m: LATERITE, trim: BASALT, colM: BASALT };
  f.add(onFace(classicalDoor(3.2, 5.2, { ...fd, columns: 1, top: 'broken', depth: 0.5, frame: 0.55 }), 0, fz + 1.2));
  const side = classicalDoor(2.4, 4.4, { ...fd, pilasters: true, depth: 0.4 });
  const win = classicalDoor(1.8, 3.4, { ...fd, shape: 'flat', fill: 'glass', top: 'segment', depth: 0.3, frame: 0.35 });
  const ocu = oculus(1, { m: LATERITE, trim: BASALT, frame: 0.35 }), front = new THREE.Group();
  for (const x of [-8.2, 8.2]) front.add(onFace(side.clone(), 0, fz + 1.2, x));
  for (const x of [-8.2, 0, 8.2]) front.add(onFace(at(win.clone(), 0, 9.6, 0), 0, fz + 1.2, x), onFace(at(ocu.clone(), 0, 20, 0), 0, fz + 1.2, x));
  f.add(mergeByMaterial(front));
  f.add(box(9, 6, 2.2, LATERITE, 0, 24, fz), box(10, 0.6, 2.6, BASALT, 0, 30, fz), box(3.4, 3.4, 0.4, BASALT, 0, 25.4, fz + 1.2));
  for (const s of [-1, 1]) {
    const v = cyl(1.4, 1.4, 1.8, LATERITE, 0, 0, 0, 16);
    v.rotation.x = Math.PI / 2;
    v.position.set(s * 5.8, 25.2, fz);
    f.add(v);
  }
  f.add(box(0.4, 3.6, 0.4, BASALT, 0, 30.6, fz), box(1.8, 0.4, 0.4, BASALT, 0, 32.6, fz));
  // Bell tower behind the church, and the two-storey Professed House beside it
  f.add(box(6, 22, 6, LATERITE, -12.5, 0, -40), box(6.6, 0.6, 6.6, BASALT, -12.5, 22, -40), at(hipRoof(6.6, 6.6, 4, TILE), -12.5, 22.6, -40));
  f.add(box(16, 11, 48, LATERITE, 18, 0, -18), at(hipRoof(17, 49, 4, TILE), 18, 11, -18));
  const pw = classicalDoor(1.4, 2.6, { m: LATERITE, trim: BASALT, shape: 'flat', fill: 'glass', depth: 0.2, frame: 0.25 }), ph = new THREE.Group();
  for (let z = -38; z <= 2; z += 5) for (const y of [1.5, 6.5]) ph.add(at(pw.clone(), 26, y, z).rotateY(Math.PI / 2));
  f.add(mergeByMaterial(ph));
  return { group: g, focus: f, view: [0.75, 0.32, 1.2] };
}
