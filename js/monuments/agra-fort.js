import * as THREE from 'three';
import { M, mesh, box, cyl, at, onFace, archPanel, chhatri, hemi, finial, inst, unitBox, unitCyl, aroundRect } from '../helpers.js';

// The curved, gilded "bangaldar" roof of the Khas Mahal pavilions.
function bangaldar(w, d, h, m) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.quadraticCurveTo(-w / 2, h * 1.1, 0, h); s.quadraticCurveTo(w / 2, h * 1.1, w / 2, 0); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 12 });
  geo.translate(0, 0, -d / 2);
  return mesh(geo, m);
}

export function buildAgraFort() {
  const Rd = M.red, Rl = M.redLight, Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(700, 0.4, 260, M.water, 0, -0.1, -150), box(320, 0.2, 200, M.path, 0, 0, 60));
  // Crescent of red sandstone walls along the river, with round bastions
  const R = 125, wall = [], merlons = [];
  for (let k = 0; k <= 60; k++) {
    const t = (k / 60) * Math.PI, x = Math.cos(t) * R, z = Math.sin(t) * R;
    wall.push([x, 0, z, 14, 20, 6, -(t + Math.PI / 2)]);
    merlons.push([x * 1.025, 20, z * 1.025, 1.4, 1.6, 1, -(t + Math.PI / 2)]);
  }
  f.add(inst(unitBox(), wall, Rd), inst(unitBox(), merlons, Rd));
  for (let k = 1; k < 6; k++) {
    const t = (k / 6) * Math.PI, x = Math.cos(t) * (R + 2), z = Math.sin(t) * (R + 2);
    f.add(cyl(7, 8, 22, Rd, x, 0, z, 20), cyl(7.4, 7.4, 0.7, Rl, x, 21.3, z, 20), at(chhatri(3.4, 8, Rd, Mb), x, 22, z));
  }
  f.add(box(2 * R, 12, 6, Rd, 0, 0, 0));
  // Amar Singh Gate in the south-west
  const ta = Math.PI * 0.72, gate = new THREE.Group();
  gate.add(box(26, 24, 16, Rd), box(26.6, 1, 16.6, Rl, 0, 24), onFace(at(archPanel(9, 15, true, M.recess, 0.4), 0, 0.3, 0), 0, 8.1));
  for (const x of [-15, 15]) gate.add(cyl(4.6, 5, 28, Rd, x, 0, 4, 8), at(chhatri(3.4, 8, Rd, Mb), x, 28, 4));
  gate.position.set(Math.cos(ta) * (R + 4), 0, Math.sin(ta) * (R + 4));
  gate.rotation.y = Math.PI / 2 - ta;
  f.add(gate);
  // White marble palaces on the river front: Khas Mahal and the octagonal Musamman Burj
  f.add(box(90, 1, 20, Mb, -10, 12, 8));
  for (const [x, w, roofM] of [[-34, 14, M.gild], [-10, 22, Mb], [14, 14, M.gild]]) {
    f.add(box(w, 7, 10, Mb, x, 13, 6), onFace(at(archPanel(3, 5, true, M.recess, 0.2), 0, 13.4, 0), 0, 11, x));
    f.add(at(bangaldar(w + 1, 11, 4, roofM), x, 20, 6));
  }
  f.add(cyl(7, 7, 12, Mb, 44, 12, 6, 8), at(hemi(6, Mb, 16), 44, 24, 6), at(finial(4), 44, 30, 6));
  // Diwan-i-Am, the hall of public audience, in the inner court
  const cols = [];
  aroundRect(50, 24, 4).forEach(([x, z]) => cols.push([x, 1, z + 60, 1.4, 8, 1.4]));
  f.add(box(54, 1, 28, Rd, 0, 0, 60), inst(unitCyl(12), cols, M.lime), box(54, 1.6, 28, M.lime, 0, 9, 60));
  return { group: g, focus: f, view: [0.4, 0.42, 1.2] };
}
