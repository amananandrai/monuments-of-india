import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, tricolour, surface, inst, unitBox } from '../helpers.js';
import { instances, elephantGeo, horseGeo } from './sculpture.js';
import { lion } from './animals.js';
import { windowFrame, jali, frieze, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, around } from './realism.js';

// The new Parliament House, finer detail. From photographs: the red sandstone base storey is pierced
// by rows of tall jali windows along each long face, and a carved band runs along the buff upper
// storeys behind the stone fins, with three floors of dark glazing between them. On the roof the
// two chambers show as low domes (the Lok Sabha's the larger) among rows of skylights, inside a
// parapet; and each ceremonial entrance is guarded by a pair of stone animals on pedestals
// (elephants at the Gaja Dwar, horses at the Ashwa Dwar, lions at the Shardula Dwar). Dimensions follow js/monuments/new-parliament-house.js: the plan
// a triangle (R = 74) with its corners cut back 20 m, the red base from 1.5 to 7.5.
const GLASS = surface(mat('#2f3a44', 0.3, 0.2), 'none'), STATUE = surface(mat('#c9b79a', 0.85), 'carved');
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
    // Glazing between the fins on the long faces: three floors, each a dark band behind them.
    if (len > 30) for (const [y, h] of [[8.4, 3], [12.4, 3], [16.4, 2.8]]) put(box(len - 2, h, 0.06, GLASS, 0, y, 0), 0.5, -0.55);
    // The roof's parapet along this face.
    put(box(len * 0.93, 1.1, 0.5, Bf, 0, 23.7, 0), 0.5, -2.2);
  });
  // The roof (at 23.7): the two chambers as low domes, the Lok Sabha's the larger, each on a
  // drum; and rows of skylights between them and the Constitution Hall.
  for (const [deg, r] of [[210, 13], [330, 10]]) {
    const a = (deg * Math.PI) / 180, x = Math.cos(a) * 27, z = Math.sin(a) * 27;
    const dome = mesh(new THREE.SphereGeometry(r, 40, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.cream);
    dome.scale.y = 0.28;
    d.add(cyl(r + 0.6, r + 0.6, 1.6, Bf, x, 23.7, z, 40), at(dome, x, 25.3, z), cyl(r * 0.22, r * 0.22, 0.5, GLASS, x, 25.3 + r * 0.27, z, 20));
  }
  const lights = [];
  for (let i = -3; i <= 3; i++) for (let j = 0; j < 3; j++) lights.push([i * 3.4, 23.95, 30 + j * 3.4, 2.4, 0.35, 2.4, 0]);
  const sky = inst(unitBox(), lights, GLASS);
  sky.castShadow = false;
  f.add(sky);
  // The guardians of the three ceremonial entrances, a pair at each, on red sandstone pedestals.
  V3.forEach(([x, z], i) => {
    const a = Math.atan2(x, z), dist = Math.hypot(x, z) - c * 0.866 + 9;
    for (const s of [-1, 1]) {
      const px = Math.sin(a) * dist + Math.cos(a) * s * 9, pz = Math.cos(a) * dist - Math.sin(a) * s * 9;
      d.add(onFace(box(4, 2.2, 5.4, Rd), a, dist, s * 9), onFace(box(4.4, 0.3, 5.8, Bf, 0, 2.2, 0), a, dist, s * 9));
      if (i === 0) f.add(instances(elephantGeo(), [[px, 2.5, pz, 2.6, 2.9, 3.4, a]], STATUE));
      else if (i === 1) f.add(instances(horseGeo(), [[px, 2.5, pz, 2.6, 2.9, 3.4, a]], STATUE));
      else { const l = lion(3, STATUE); l.position.set(px, 2.5, pz); l.rotation.y = a; f.add(l); }
    }
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
