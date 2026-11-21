import * as THREE from 'three';
import { M, mat, box, cyl, mesh, at, inst, unitBox, unitCyl } from '../helpers.js';
import { rosette, petalRing, railing, archCurve, mergeByMaterial } from './components.js';
import { balustrade } from './colonial.js';
import { trees, shrubs, lampPosts, scatter, along } from './realism.js';
import { rideElephant, elephant } from './animals.js';
import { crossLegged, hold } from './figures.js';
import { detail } from '../detail.js';
import { kalash } from '../helpers.js';
import { BAYS, FZ, ARC_SILL, PALACE } from '../monuments/mysore-palace.js';

// Mysore Palace, finer detail, after photographs of the main front. Dimensions follow
// js/monuments/mysore-palace.js: the arcade's bays (BAYS) on a sill at y 6.4 in the front at z 24,
// the gallery above to the cornice at 17.4, the parapet over it.
// - cusps (small lobes) round the inside of each of the great arches, so they read as multi-foiled,
//   and carved roundels in the spandrels between the wide ones;
// - the arches carried on round granite columns, paired on the broad piers, with bases and capitals;
// - a pierced railing along the foot of the arcade, the Durbar Hall's balcony;
// - a balustrade along the parapet either side of the central bay;
// - the cups of lotus petals the domes rise from.
function architecture(f) {
  const d = new THREE.Group(), G = M.mysore, L = M.lime, { CREAM, RED } = PALACE;
  const lobe = new THREE.TorusGeometry(0.36, 0.09, 4, 8, Math.PI), cols = [], caps = [];
  BAYS.forEach(([cx, w, h], k) => {
    const r = w / 2, pts = archCurve(r, h - r, false, 10).slice(1, -1);
    pts.forEach((p, i) => {
      if (i % (detail.low ? 3 : 2)) return;
      const o = new THREE.Mesh(lobe, L);
      o.position.set(cx + p.x * 0.95, ARC_SILL + p.y * 0.97 + (1 - 0.97) * (h - r), FZ + 0.06);
      o.rotation.z = Math.atan2(p.y - (h - r), p.x) - Math.PI / 2;
      d.add(o);
    });
    // The piers: between this bay and the next, a pair of columns on a broad pier, one on a narrow.
    if (k < BAYS.length - 1) {
      const [nx, nw] = BAYS[k + 1], a = cx + w / 2, c = nx - nw / 2, mid = (a + c) / 2, pair = c - a > 1;
      for (const x of pair ? [mid - 0.48, mid + 0.48] : [mid]) cols.push([x, ARC_SILL, FZ + 0.35]);
      if (pair) d.add(at(rosette(0.8, L, 10), mid, ARC_SILL + 5.6, FZ + 0.02));
    }
  });
  for (const sx of [-1, 1]) cols.push([sx * 41.6, ARC_SILL, FZ + 0.35]);
  const H = 3.6;
  d.add(inst(unitCyl(12), cols.map(([x, y, z]) => [x, y + 0.35, z, 0.6, H, 0.6]), G), inst(unitBox(), cols.flatMap(([x, y, z]) => [[x, y, z, 0.85, 0.35, 0.85], [x, y + H + 0.35, z, 0.95, 0.45, 0.95]]), L));
  // The balcony's railing along the foot of the arcade, and the parapet's balustrade.
  // (On phones the parapet is a pierced screen like the railing, not a row of balusters.)
  for (const [x0, x1] of [[-41.6, -5.4], [5.4, 41.6]]) {
    d.add(at(railing(x1 - x0, 0.95, 0.22, G, 1.8), (x0 + x1) / 2, ARC_SILL, FZ + 0.25));
    const len = x1 - x0 - 5.8, x = (x0 + x1) / 2 + Math.sign(x0) * 2.9;
    d.add(at(detail.low ? railing(len, 1.1, 0.3, CREAM, 2.4) : balustrade(len, 1.1, CREAM, { t: 0.35 }), x, 18.0, FZ + 0.05));
  }
  // Lotus cups: under the gilt dome, the red domes of the end towers and of the bay's kiosks.
  d.add(at(petalRing(2.9 * 0.86, 18, 1.4, 1.0, 0.55, M.gild, 0.3), 0, 35.1, 12));
  for (const s of [-1, 1]) {
    for (const x of [46.1, 60.8]) d.add(at(petalRing(2.5 * 0.86, 14, 1.2, 0.9, 0.55, RED, 0.3), s * x, 27.05, 19.5));
  }
  mergeByMaterial(d);
  f.add(d);
}

// Gajalakshmi in the gable over the central bay, under its red hood: the goddess seated
// cross-legged on an open lotus, crowned, holding a lotus up in each hand, between two elephants
// that face her with their trunks raised over her, each lifting a pot to pour water on her; all
// gilt, on the ledge at the foot of the tympanum. (Painted plaster, by the palace artist B. Basavaiah, by one account; her pose and the
// elephants' are the traditional ones.) On phones, a simpler goddess and the elephants without pots.
export function gajalakshmi() {
  const g = new THREE.Group(), G = M.gild;
  g.add(at(petalRing(1.0, 14, 0.7, 0.55, 1.25, G), 0, 0.3, 0.15), at(petalRing(0.7, 10, 0.5, 0.45, 0.8, G), 0, 0.42, 0.15));
  // (Seen from far below, so meshed coarsely: 1.6 cm, 4 cm on phones.)
  const fig = crossLegged('lakshmi', { head: 'kirita', right: 'lotusUp', left: 'lotusUp' }, G, 0.016, { low: 2.5 }), s = new THREE.Group();
  s.add(fig.mesh);
  if (!detail.low) { hold(s, fig, 'r', 'lotus', G); hold(s, fig, 'l', 'lotus', G); }
  s.scale.setScalar(2.2);
  s.position.set(0, 0.55, 0.15);
  g.add(s);
  for (const sx of [-1, 1]) {
    const e = elephant(G, 0.33, { raised: true });
    if (!detail.low) { const pot = kalash(0.5, G); pot.position.set(0, 5.1, 3.2); pot.rotation.x = 2.2; e.children[0].add(pot); }
    e.position.set(sx * 2.75, 0.13, 0.1);
    e.rotation.y = -sx * Math.PI / 2;
    g.add(e);
  }
  return g;
}


// The sculpture: Gajalakshmi in the central gable (gajalakshmi(), above), sized to the tympanum.
function sculpture(f) {
  const ga = gajalakshmi();
  ga.scale.setScalar(0.72);
  f.add(at(ga, 0, 22.3, FZ + 1.1));
}

// The forecourt as photographed from the approach: the red-brick drive between low green railings
// of hoops, the lawns behind them with beds of red flowers, and lamp posts with white globes along
// the drive; at Dasara the caparisoned elephants of the procession on the lawns, one under the
// golden howdah; palms to either side.
export function addDetails(f, g) {
  architecture(f);
  sculpture(f);
  [[-30, 62, '#b3262e', '#e3b54a'], [-18, 66, '#2f5d9a', '#e3b54a'], [18, 66, '#2f7a3f', '#e3b54a'], [30, 62, '#7a1f5a', '#e3b54a']].forEach(([x, z, c, t], i) => {
    const e = rideElephant(mat('#6a605a', 0.9), 1, { cloth: c, trim: t, howdah: i === 1 });
    e.position.set(x, 0.15, z);
    e.rotation.y = Math.PI;
    g.add(e);
  });
  // The railings: a rail on short posts with a row of hoops along it, either side of the drive and
  // round the lawns' fronts.
  const GREEN = mat('#2f6b3a', 0.6, 0.2), posts = [], rails = [], hoops = [];
  for (const sx of [-1, 1]) {
    for (const [x0, z0, x1, z1] of [[sx * 9, 30, sx * 9, 132], [sx * 9, 30, sx * 70, 30]]) {
      const L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / 2.4), ry = Math.atan2(x1 - x0, z1 - z0);
      rails.push([(x0 + x1) / 2, 1.05, (z0 + z1) / 2, 0.06, 0.06, L, ry]);
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n, z = z0 + ((z1 - z0) * i) / n;
        posts.push([x, 0, z, 0.1, 1.15, 0.1, ry]);
        if (i < n) hoops.push([x + (x1 - x0) / n / 2, 0.15, z + (z1 - z0) / n / 2, 1, 1, 1, ry + Math.PI / 2]);
      }
    }
  }
  g.add(inst(unitBox(), posts, GREEN), inst(new THREE.BoxGeometry(1, 1, 1), rails, GREEN), inst(new THREE.TorusGeometry(1.05, 0.04, detail.low ? 3 : 4, detail.low ? 6 : 12, Math.PI), hoops.map(([x, y, z, , , , ry]) => [x, y, z, 1.1, 0.85, 1, ry]), GREEN));
  // Lamp posts with white globes along the drive.
  const lamps = [];
  for (let z = 34; z <= 128; z += 12) for (const x of [-10, 10]) lamps.push([x, z]);
  g.add(inst(unitCyl(8), lamps.map(([x, z]) => [x, 0, z, 0.16, 3.6, 0.16]), mat('#3a3a38', 0.5, 0.4)), inst(new THREE.SphereGeometry(0.5, 12, 8), lamps.map(([x, z]) => [x, 3.9, z, 0.72, 0.72, 0.72]), mat('#f4f1ea', 0.3, 0, { emissive: '#fff6dc', emissiveIntensity: 0.15 })));
  g.add(shrubs(scatter(26, [-68, 68, 36, 128], { seed: 5, gap: 5, avoid: [[-12, 12, 30, 140], [-36, 36, 56, 72]] }).map(([x, z]) => [x, z, 1.2]), { flowers: '#c62828', seed: 5 }));
  g.add(trees([...along(6, [-90, 35], [-90, 125]), ...along(6, [90, 35], [90, 125])], { kind: 'palm', seed: 4 }));
}
