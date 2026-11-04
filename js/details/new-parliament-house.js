import * as THREE from 'three';
import { windowFrame, jali, frieze, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, around } from './realism.js';
import { M, box, at, tricolour } from '../helpers.js';

// The new Parliament House, finer detail. From photographs: the red sandstone base storey is pierced
// by rows of tall jali windows along each long face, and a carved band runs along the buff upper
// storeys behind the stone fins. Dimensions follow js/monuments/new-parliament-house.js: the plan
// a triangle (R = 74) with its corners cut back 20 m, the red base from 1.5 to 7.5.
function architecture(f) {
  const d = new THREE.Group(), R = 74, c = 20, Rd = M.red, Bf = M.buff;
  const V3 = [0, 1, 2].map((i) => { const a = Math.PI / 2 + (i * 2 * Math.PI) / 3; return [Math.cos(a) * R, Math.sin(a) * R]; }), poly = [];
  V3.forEach((v, i) => {
    const p = V3[(i + 2) % 3], n = V3[(i + 1) % 3];
    const to = (q) => { const dx = q[0] - v[0], dz = q[1] - v[1], l = Math.hypot(dx, dz); return [v[0] + (dx / l) * c, v[1] + (dz / l) * c]; };
    poly.push(to(p), to(n));
  });
  poly.forEach(([x0, z0], i) => {
    const [x1, z1] = poly[(i + 1) % poly.length], len = Math.hypot(x1 - x0, z1 - z0);
    const nx = (z1 - z0) / len, nz = -(x1 - x0) / len, ry = Math.atan2(nx, nz);
    const put = (o, t, off) => { o.position.set(x0 + (x1 - x0) * t + nx * off, o.position.y, z0 + (z1 - z0) * t + nz * off); o.rotation.y = ry; d.add(o); };
    if (len > 30) {
      const n = Math.floor(len / 4.4);
      for (let k = 1; k < n; k++) { const w = windowFrame(1.8, 3.6, Rd, { shape: 'flat', screen: jali(Bf) }); w.position.y = 2.6; put(w, k / n, 0.01); }
    }
    const b = box(len - 1, 1.1, 0.05, frieze(Bf), 0, 20, 0);
    put(b, 0.5, 0.33);
  });
  mergeByMaterial(d);
  f.add(d);
}

// The new Parliament House in Delhi: the tricolour over the building, lawns and hedges round the
// triangle, neem trees on the edge of the grounds, and lamps.
export function addDetails(f, g) {
  architecture(f);
  f.add(at(tricolour(12), 18, 24, 0));
  g.add(trees(around(30, 120, 0, 0, 0.05), { kind: 'neem', seed: 3 }), shrubs(around(48, 102).map(([x, z]) => [x, z, 1.4]), { seed: 4 }));
  g.add(lampPosts(around(18, 96, 0, 0, 0.17)));
}
