import * as THREE from 'three';
import { M, mat, mesh, box, at, onFace, archWall, archPanel, chhatri, guldasta, inst } from '../helpers.js';

const LIME = mat('#e6d8b8', 0.85);
const LIME_DARK = mat('#cbb994', 0.85);

// The flared hood over the arch: a half-round crown with a scalloped, flower-like rim.
function hood(R, depth, m) {
  const s = new THREE.Shape();
  s.moveTo(-R, 0);
  for (let i = 0; i <= 64; i++) {
    const a = Math.PI - (i / 64) * Math.PI, r = R * (1 + 0.045 * Math.cos(a * 18));
    s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.lineTo(R, 0); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  return mesh(geo, m);
}

export function buildRumiDarwaza() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(200, 0.2, 160, M.grass), box(14, 0.25, 160, M.asphalt));
  // The gate itself and its crown, about 18 m tall
  const H = 10;
  f.add(archWall(16, H, 9, 8, 9.4, true, LIME));
  f.add(at(hood(7.4, 2.4, LIME), 0, H, 2.1), at(hood(7.4, 4.6, LIME_DARK), 0, H, -2.5));
  f.add(at(archPanel(9, 6.4, true, M.recess, 0.3), 0, H + 0.4, 4.6));
  const buds = [];
  for (let i = 0; i <= 18; i++) {
    const a = Math.PI - (i / 18) * Math.PI;
    buds.push([Math.cos(a) * 7.7, H + Math.sin(a) * 7.7, 3.3, 0.6, 1.4, 0.6]);
  }
  f.add(inst(new THREE.ConeGeometry(0.5, 1, 6).translate(0, 0.5, 0), buds, LIME));
  f.add(at(chhatri(1.5, 4.6, LIME), 0, H + 7.6, 0.5));
  // Arcaded wings stepping down to either side
  for (const s of [-1, 1]) {
    f.add(box(26, 7, 5, LIME, s * 21, 0, 0), box(26.4, 0.6, 5.4, LIME_DARK, s * 21, 7, 0));
    for (let k = 0; k < 4; k++) f.add(onFace(at(archPanel(3.4, 5, true, M.recess, 0.25), 0, 0.4, 0), 0, 2.5, s * (11 + k * 6)));
    for (const x of [s * 9, s * 34]) f.add(at(guldasta(7, 0.7, LIME), x, 7.6, 0));
  }
  return { group: g, focus: f, view: [0.55, 0.22, 1.25] };
}
