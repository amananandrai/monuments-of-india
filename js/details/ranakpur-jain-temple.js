import * as THREE from 'three';
import { M, mesh, at, aroundRect, nagaraProfile, inst, unitBox } from '../helpers.js';
import { mouldings, frieze, bracketGeo, placeAll, mergeByMaterial } from './components.js';
import { trees, scatter } from './realism.js';

// Ranakpur, finer detail. From photographs: the plinth is carved in bands; the walls of the
// temple carry a carved frieze under the roof line; each of the outer pillars stands on a moulded
// base and carries a bracket capital; and ribbed amalaka stones mark the storeys on the corners of
// the main spire. Dimensions follow js/monuments/ranakpur-jain-temple.js: plinth 64 × 66 to 5, the
// walls 60 × 62 from 5 to 12, the pillars round a 61 × 63 rectangle, the spire 15 wide and 19
// high from 17.6.
function architecture(f) {
  const d = new THREE.Group(), Mb = M.ranak, Sh = M.marbleShade;
  d.add(mouldings(64, 66, [[0.3, 0.5, 0.2], [2.2, 0.6, 0.06, frieze(Sh)], [4.2, 0.5, 0.2]], Sh));
  d.add(mouldings(60, 62, [[10.6, 0.9, 0.05, frieze(Mb)]], Mb));
  const bases = [], caps = [], br = [];
  for (const [x, z, a] of aroundRect(61, 63, 2.4)) {
    if (Math.min(Math.abs(x), Math.abs(z)) <= 3.5) continue;
    bases.push([x, 5, z, 1.2, 0.45, 1.2]);
    caps.push([x, 11.5, z, 1.2, 0.5, 1.2]);
    const o = a + Math.PI;
    br.push([x + Math.sin(o) * 0.4, 11.5, z + Math.cos(o) * 0.4, o]);
  }
  d.add(placeAll(bracketGeo(0.8, 0.7, 0.4), br, Mb));
  const am = new THREE.SphereGeometry(1, 16, 6);
  for (let k = 1; k <= 4; k++) {
    const t = k / 5, wt = 15 * nagaraProfile(t), y = 17.6 + t * 19, r = wt * 0.085;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const o = mesh(am, Mb, sx * wt * 0.42, y, sz * wt * 0.42); o.scale.set(r, r * 0.42, r); d.add(o); }
  }
  mergeByMaterial(d);
  f.add(d, inst(unitBox(), bases, Mb), inst(unitBox(), caps, Mb));
}

// The Chaumukha temple at Ranakpur, in a valley of the Aravalli: the wooded hills round it.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees(scatter(50, [-74, 74, -74, 74], { seed: 4, gap: 10 }).filter(([x, z]) => Math.max(Math.abs(x), Math.abs(z)) > 50), { kind: 'mango', seed: 4 }));
}
