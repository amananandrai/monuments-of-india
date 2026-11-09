import * as THREE from 'three';
import { M, mat, mesh, box, at, archWall, chhatri, guldasta, inst } from '../helpers.js';
import { jali, archSlab, archRing } from '../details/components.js';
import { arcadeSkin } from '../details/mughal.js';
import { addDetails } from '../details/rumi-darwaza.js';

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
  f.add(at(hood(6.0, 2.4, LIME), 0, H, 2.1), at(hood(6.0, 4.6, LIME_DARK), 0, H, -2.5));
  // Under the hood, a pierced screen over the dark space behind it, in a moulded ring.
  f.add(at(archSlab(8, 5.4, true, M.recess, 0.04), 0, H + 0.4, 4.5), at(archSlab(7.98, 5.38, true, jali(LIME), 0.06), 0, H + 0.4, 4.56));
  f.add(at(archRing(8, 5.4, true, 0.3, 0.12, LIME_DARK), 0, H + 0.4, 4.5));
  const buds = [];
  for (let i = 0; i <= 18; i++) {
    const a = Math.PI - (i / 18) * Math.PI;
    buds.push([Math.cos(a) * 6.3, H + Math.sin(a) * 6.3, 3.3, 0.6, 1.4, 0.6]);
  }
  f.add(inst(new THREE.ConeGeometry(0.5, 1, 6).translate(0, 0.5, 0), buds, LIME));
  f.add(at(chhatri(1.1, 2.6, LIME), 0, H + 6.2, 0.5));
  // Arcaded wings stepping down to either side
  for (const s of [-1, 1]) {
    // Each wing: four arched cells 1 m deep, each with a door at its back.
    f.add(box(26, 7, 4, LIME, s * 21, 0, -0.5), box(26.4, 0.6, 5.4, LIME_DARK, s * 21, 7, 0));
    const cells = [0, 1, 2, 3].map((k) => [s * (6 * k - 10), 0.4, 3.4, 5]);
    f.add(at(arcadeSkin(26, 7, cells, 1, LIME, { trim: LIME_DARK }), s * 21, 0, 1.5));
    for (const x of [s * 9, s * 34]) f.add(at(guldasta(7, 0.7, LIME), x, 7.6, 0));
  }
  addDetails(f, g);
  return { group: g, focus: f, view: [0.55, 0.22, 1.25] };
}
