import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, FACES, chhatri, finial, inst, unitBox, sheet, surface } from '../helpers.js';
import { jali } from '../details/components.js';
import { iwan } from '../details/mughal.js';
import { addDetails } from '../details/itmad-ud-daulah.js';

// Pietra dura: inlaid panels of coloured stone set into the white marble.
const INLAY = [mat('#8a5a3c', 0.5), mat('#c9a24a', 0.45), mat('#4f6b4a', 0.5), mat('#2f2b2a', 0.5)];
// The walls, towers and upper pavilion are inlaid all over, not just in panels: geometric stars of
// brown, ochre and green stone outlined in black (js/surface.js, 'pietra').
const INLAID = surface(mat('#f2eee6', 0.5), 'pietra');

// A canopy roof lofted from a square of half-width a at its eaves to a ridge of half-length r along
// x at height h, its sides following an ogee: steep at the eaves, curving in, flattening at the top.
function canopyRoof(a, r, h, m, steps = 14) {
  const ring = (t) => {
    const k = (1 - Math.cos(Math.PI * t)) / 2, hx = a - (a - r) * k, hz = a - (a - 0.05) * k, y = h * Math.sin((Math.PI / 2) * t);
    return [[-hx, y, -hz], [hx, y, -hz], [hx, y, hz], [-hx, y, hz]];
  };
  const pos = [];
  for (let i = 0; i < steps; i++) {
    const A = ring(i / steps), C = ring((i + 1) / steps);
    for (let j = 0; j < 4; j++) {
      const j2 = (j + 1) % 4;
      pos.push(...A[j], ...C[j2], ...A[j2], ...A[j], ...C[j], ...C[j2]);
    }
  }
  const top = ring(1);
  pos.push(...top[0], ...top[2], ...top[1], ...top[0], ...top[3], ...top[2]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return mesh(geo, m);
}

export function buildItmadUdDaulah() {
  const Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Charbagh garden on the bank of the Yamuna
  g.add(box(150, 0.15, 150, M.grass, 0, 0, 20), sheet(400, 120, M.river, 0, 0.3, -110));
  for (const [w, d] of [[5, 150], [150, 5]]) g.add(box(w + 3, 0.25, d + 3, M.path, 0, 0, 20), box(w, 0.35, d, M.water, 0, 0, 20));
  f.add(box(50, 1.5, 50, M.red), box(36, 2, 36, Mb, 0, 1.5));
  const B = 3.5, s = 11;
  // The tomb: three arches a side, panels of inlay, and an octagonal tower at each corner
  f.add(box(22, 8, 22, INLAID, 0, B), box(23, 0.6, 23, M.marbleShade, 0, B + 8));
  const tiles = INLAY.map(() => []);
  for (const a of FACES) {
    // A door in the middle arch, pierced screens in the two beside it.
    for (const lat of [-6, 0, 6]) f.add(onFace(at(iwan(3.2, 6, { m: Mb, trim: Mb, shade: M.marbleShade, depth: 0.8, frame: 0.5, top: 0.6, band: false, fill: lat ? 'jali' : 'door' }), 0, B + 0.6, 0), a, s, lat));
    for (let k = 0; k < 18; k++) for (const [row, y] of [[0, B + 7.2], [1, B + 0.3]]) {
      const lat = -8.5 + k * 1, o = onFace(new THREE.Object3D(), a, s + 0.05, lat);
      tiles[(k + row) % 4].push([o.position.x, y, o.position.z, a === 0 || a === Math.PI ? 0.7 : 0.12, 0.45, a === 0 || a === Math.PI ? 0.12 : 0.7]);
    }
  }
  tiles.forEach((t, i) => f.add(inst(unitBox(), t, INLAY[i])));
  for (const x of [-s, s]) for (const z of [-s, s]) f.add(cyl(1.9, 2.1, 13, INLAID, x, B, z, 8), at(chhatri(1.9, 5.4, Mb), x, B + 13, z));
  // The upper pavilion with its canopy roof
  // The upper pavilion, its front a marble screen over the dark room behind.
  f.add(box(10, 4.5, 10, INLAID, 0, B + 8.6), onFace(box(6, 3, 0.04, M.recess, 0, B + 9.3), 0, 5.02), onFace(box(5.96, 2.96, 0.06, jali(Mb), 0, B + 9.32), 0, 5.09));
  for (const [w, h, x, y] of [[6.5, 0.25, 0, B + 9.05], [6.5, 0.25, 0, B + 12.3], [0.25, 3.5, -3.12, B + 9.05], [0.25, 3.5, 3.12, B + 9.05]]) f.add(onFace(box(w, h, 0.16, M.marbleShade, 0, y, 0), 0, 5.08, x));
  // The tomb has no dome. The pavilion is roofed by an ogee-curved canopy over a wide chhajja,
  // drawn out along one axis to a short ridge carrying two finials.
  f.add(box(13.2, 0.35, 13.2, Mb, 0, B + 13.1), box(11.6, 0.3, 11.6, M.marbleShade, 0, B + 12.8));
  f.add(at(canopyRoof(5.3, 2.2, 3.4, Mb), 0, B + 13.45, 0));
  for (const x of [-2.2, 2.2]) f.add(at(finial(1.8), x, B + 13.45 + 3.4, 0));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.85, 0.42, 1.2] };
}
