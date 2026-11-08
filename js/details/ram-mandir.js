import * as THREE from 'three';
import { M, mesh, box, at, onFace, flag, mat, nagaraProfile, steppedPlan, planBand } from '../helpers.js';
import { mouldings, frieze, templeNiche, idol, bracketGeo, placeAll, mergeByMaterial } from './components.js';
import { trees, lampPosts, garland, along } from './realism.js';

// The plinth's plan, after the published plan and aerial photographs: narrow round the sanctum at
// the back, widest across the two side halls (the Kirtan and Prarthana mandaps), then stepping in
// round the middle hall and again round the entrance hall, where the stair comes down. Every outer
// corner is cut back in two offsets. grow: how far a tier stands out from the top one.
const PLAN = [[-44, 18], [-14, 28], [8, 15], [28, 12], [44]];
export const plinthPlan = (grow = 0) => steppedPlan(PLAN, { grow, cut: 1.2 });

// The Ram Mandir, finer detail. From photographs and the published design (Nagara style, in pink
// Bansi Paharpur sandstone): the three tiers of the plinth are carved in bands, following its offsets; the sanctum walls stand on
// moulded courses with images of deities in niches on its outer faces; ribbed amalaka stones mark
// the storeys on the corners of the main spire; carved brackets spring from the tops of the halls'
// pillars. Dimensions follow js/monuments/ram-mandir.js: plinth to P = 6.5, the sanctum 22 square
// and 12 high at z = -26, its spire 19 wide and 30 high from P + 13.2.
function architecture(g) {
  const d = new THREE.Group(), m = M.pink, sh = M.pinkShade, P = 6.5, gz = -26;
  d.add(planBand(plinthPlan(4), 0.7, 0.6, 0.05, frieze(sh)), planBand(plinthPlan(2), 2.6, 0.7, 0.05, frieze(m)), planBand(plinthPlan(0), 4.8, 0.9, 0.05, frieze(sh)));
  const s = at(new THREE.Group(), 0, P, gz);
  s.add(mouldings(22, 22, [[0, 0.6, 0.35, sh], [0.6, 0.5, 0.15, frieze(m)], [1.1, 0.5, 0.3, sh], [8.8, 0.8, 0.08, frieze(m)]], m));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) for (const lat of [-6, 0, 6]) s.add(onFace(at(templeNiche(lat ? 1.6 : 2.4, lat ? 3.4 : 5, m, { figure: idol(lat ? 2.9 : 4.3, m) }), 0, 2.2, 0), a, 11, lat));
  d.add(s);
  const am = new THREE.SphereGeometry(1, 16, 6);
  for (let k = 1; k <= 4; k++) {
    const t = k / 5, wt = 19 * nagaraProfile(t), y = P + 13.2 + t * 30, r = wt * 0.085;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const o = mesh(am, m, sx * wt * 0.42, y, gz + sz * wt * 0.42); o.scale.set(r, r * 0.42, r); d.add(o); }
  }
  // Brackets from the outer pillars of the halls (mandap: n + 1 pillars a side, 0.6 in from the edge).
  const br = [];
  for (const [w, h, x0, z0] of [[24, 10, 0, -3], [18, 9, 0, 17], [14, 8, 0, 33], [10, 8, -17, -3], [10, 8, 17, -3]]) {
    const n = Math.max(3, Math.round(w / 2.6));
    for (let i = 0; i <= n; i++) {
      const t = -w / 2 + 0.6 + (i / n) * (w - 1.2);
      for (const [x, z, a] of [[t, w / 2 - 0.6, 0], [t, -w / 2 + 0.6, Math.PI], [w / 2 - 0.6, t, Math.PI / 2], [-w / 2 + 0.6, t, -Math.PI / 2]]) {
        br.push([x0 + x + Math.sin(a) * 0.38, P + h, z0 + z + Math.cos(a) * 0.38, a]);
      }
    }
  }
  d.add(placeAll(bracketGeo(0.9, 0.55, 0.36), br, sh));
  mergeByMaterial(d);
  g.add(d);
}

// The Ram Mandir at Ayodhya: the paved parikrama round the plinth with lawns beyond it, saffron
// flags, lamps, and garlands on the entrance pavilion.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(g) {
  architecture(g);
  g.add(box(160, 0.2, 200, M.path, 0, -0.2, 0));
  for (const s of [-1, 1]) g.add(box(40, 0.3, 160, M.grass, s * 64, -0.15, 0));
  for (const [x, z] of [[-15, -41], [15, -41], [-25, 5], [25, 5]]) g.add(at(flag(8, SAFFRON), x, 6.5, z));
  g.add(lampPosts([...along(8, [-34, -60], [-34, 90]), ...along(8, [34, -60], [34, 90])]));
  g.add(trees([...along(8, [-82, -90], [-82, 90]), ...along(8, [82, -90], [82, 90])], { kind: 'ashoka', seed: 6 }));
  g.add(garland([-5, 13, 40.2], [5, 13, 40.2], { sag: 0.7, strands: 3 }));
}
