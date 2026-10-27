import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, archPanel, hipRoof } from '../helpers.js';

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
  for (let z = -40; z <= 6; z += 7) for (const s of [-1, 1]) f.add(at(archPanel(2, 4.2, false, M.recess, 0.2).rotateY(s * Math.PI / 2), s * 9, 8.5, z));
  // The three-tier Baroque facade, framed by basalt pilasters and crowned by a carved pediment
  const fz = 12.2;
  f.add(box(24, 24, 2.4, LATERITE, 0, 0, fz));
  for (const y of [8, 16, 24]) f.add(box(25, 0.8, 2.8, BASALT, 0, y - 0.4, fz));
  for (const x of [-12, -4.3, 4.3, 12]) f.add(box(1.2, 24, 0.8, BASALT, x, 0, fz + 1.3));
  f.add(onFace(at(archPanel(4, 6.6, false, M.recess, 0.3), 0, 0.2, 0), 0, fz + 1.2), onFace(at(archPanel(2.8, 5, false, M.recess, 0.3), 0, 0.2, 0), 0, fz + 1.2, -8.2));
  f.add(onFace(at(archPanel(2.8, 5, false, M.recess, 0.3), 0, 0.2, 0), 0, fz + 1.2, 8.2));
  for (const x of [-8.2, 0, 8.2]) {
    f.add(onFace(at(archPanel(2.2, 4.4, false, M.recess, 0.3), 0, 9.6, 0), 0, fz + 1.2, x));
    const ocu = mesh(new THREE.CylinderGeometry(1, 1, 0.3, 20), M.recess, x, 20, fz + 1.3);
    ocu.rotation.x = Math.PI / 2;
    f.add(ocu);
  }
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
  for (let z = -38; z <= 2; z += 5) for (const y of [1.5, 6.5]) f.add(at(archPanel(1.6, 3, false, M.recess, 0.2).rotateY(Math.PI / 2), 26, y, z));
  return { group: g, focus: f, view: [0.75, 0.32, 1.2] };
}
