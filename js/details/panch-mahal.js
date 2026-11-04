import * as THREE from 'three';
import { M, at, onFace, FACES, inst, unitBox } from '../helpers.js';
import { chhajja, railing, bracketGeo, placeAll, mergeByMaterial } from './components.js';
import { trees, asiBoard, scatter } from './realism.js';

// Panch Mahal, finer detail. From photographs: every one of the 176 columns stands on a moulded
// base and carries a bracket capital; each storey's floor projects as a sloping eave all round;
// and the storeys were closed by pierced screens (jali) between their outer columns, here as a
// railing along the edge of each floor. Dimensions follow js/monuments/panch-mahal.js.
function architecture(f) {
  const d = new THREE.Group(), Rd = M.red, Rl = M.redLight;
  const levels = [[12, 7], [8, 7], [5, 4], [4, 3], [2, 2]], gap = 3.6, h = 4.2, bases = [], caps = [], br = [];
  let y = 1.2;
  levels.forEach(([nx, nz], li) => {
    const w = (nx - 1) * gap, dd = (nz - 1) * gap;
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const x = -w / 2 + i * gap, z = -dd / 2 + j * gap;
      bases.push([x, y, z, 1.0, 0.45, 1.0]);
      caps.push([x, y + h - 0.4, z, 1.0, 0.4, 1.0]);
      if (i === 0 || i === nx - 1) br.push([x + (i ? 0.35 : -0.35), y + h, z, i ? Math.PI / 2 : -Math.PI / 2]);
      if (j === 0 || j === nz - 1) br.push([x, y + h, z + (j ? 0.35 : -0.35), j ? 0 : Math.PI]);
    }
    for (const a of FACES) {
      const long = Math.abs(Math.sin(a)) < 0.5, len = long ? w + 2.6 : dd + 2.6, dist = (long ? dd : w) / 2 + 1.3;
      d.add(onFace(at(chhajja(len, 0.9, 0.4, 0.12, Rl), 0, y + h + 0.5, 0), a, dist));
      if (li > 0) d.add(onFace(at(railing(len - 1.2, 0.9, 0.18, Rd, gap), 0, y, 0), a, dist - 0.75));
    }
    y += h + 1;
  });
  d.add(placeAll(bracketGeo(0.8, 0.9, 0.3), br, Rl));
  mergeByMaterial(d);
  f.add(d, inst(unitBox(), bases, Rl), inst(unitBox(), caps, Rl));
}

// The Panch Mahal at Fatehpur Sikri: neem trees on the ridge, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees(scatter(12, [-58, 58, -48, 48], { seed: 6, gap: 14, avoid: [[-30, 30, -20, 20], [-58, -20, 4, 36]] }), { kind: 'neem', seed: 6 }));
  g.add(asiBoard('Panch Mahal, Fatehpur Sikri', 30, 46, 0, { line2: 'WORLD HERITAGE SITE' }));
}
