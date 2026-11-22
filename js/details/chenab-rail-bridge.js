import * as THREE from 'three';
import { M, mat, box, at, sheet, inst, unitBox, rng, surface } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { track, train, overhead, RAIL_TOP } from '../parts/transport.js';
import { trees, shrubs, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';
import { DECK, X0, XC, LENGTH, GIRDER, STEEL, CONCRETE, PIERS, COLUMNS, path, onPath, ground, archTop, ribZ } from '../monuments/chenab-rail-bridge.js';

// Chenab Rail Bridge, finer detail and the setting. On the deck: the single broad-gauge track on
// its steel sleepers' plate, the overhead wires, footways with railings either side, and the
// cross frames between the girders underneath. A Vande Bharat is crossing the arch. Round it, the
// gorge of the Chenab in the Reasi hills: chir pines and scrub on the slopes, the river far below,
// the tunnel mouth at the Bakkal end and the houses of Kauri on the shoulder beyond the viaduct.
const RAILING = surface(mat('#8f9a86', 0.6, 0.3), 'none'), DARK = mat('#2b2a28', 0.9);

function deck(f) {
  const STRAIGHT = XC - X0, ARC = LENGTH - STRAIGHT;
  const d = new THREE.Group(), posts = [], frames = [], nc = Math.ceil(ARC / 21), cl = ARC / nc, step = detail.low ? 6 : 3;
  // Railings: two rails a side on posts, straight and then round the curve.
  for (const s of [-1, 1]) {
    for (const y of [0.6, 1.15]) {
      d.add(box(STRAIGHT, 0.08, 0.08, RAILING, X0 + STRAIGHT / 2, DECK + y, s * 6.55));
      for (let k = 0; k < nc; k++) {
        const r = box(cl + 0.2, 0.08, 0.08, RAILING, 0, 0, s * 6.55), seg = onPath(new THREE.Group(), STRAIGHT + (k + 0.5) * cl, DECK + y);
        r.position.y = 0;
        d.add(seg.add(r));
      }
    }
    for (let x = 0; x <= LENGTH; x += step) {
      const [px, pz, a] = path(x);
      posts.push([px - Math.sin(a) * s * 6.55, DECK, pz + Math.cos(a) * s * 6.55, 0.1, 1.2, 0.1, -a]);
    }
  }
  // Cross frames between the girders and the cantilever brackets under the footways.
  for (let x = 4; x < LENGTH; x += detail.low ? 18 : 9) {
    const [px, pz, a] = path(x);
    frames.push([px, DECK - GIRDER + 0.3, pz, 0.3, 0.5, 6.8, -a], [px, DECK - 1.3, pz, 0.25, 0.9, 13.2, -a]);
  }
  // Gusset plates where the spandrel columns stand on the ribs, and bearings on the pier heads.
  for (const x of COLUMNS) for (const s of [-1, 1]) d.add(box(4.4, 2.6, 5.6, STEEL, x, archTop(x) - 1.1, s * ribZ(x)));
  for (const [s] of PIERS) d.add(onPath(box(3.2, 0.5, 8.6, DARK, 0, 0, 0), s, DECK - GIRDER - 0.02));
  f.add(mergeByMaterial(d), inst(unitBox(), posts, RAILING), inst(unitBox(), frames, STEEL));
  // The track, laid on the deck plate, and the wires over it.
  f.add(at(track(STRAIGHT, { ballast: false }), X0 + STRAIGHT / 2, DECK, 0), at(overhead(STRAIGHT - 8, { span: 49.5 }), X0 + STRAIGHT / 2, DECK, 0));
  for (let k = 0; k < nc; k++) {
    f.add(onPath(track(cl + 0.1, { ballast: false }), STRAIGHT + (k + 0.5) * cl, DECK));
    f.add(onPath(overhead(cl + 0.2, { span: k % 2 ? 1000 : cl / 2 + 0.1 }), STRAIGHT + (k + 0.5) * cl, DECK));
  }
}

// The line beyond the bridge: into a tunnel in the hill at the Bakkal end, and along a bench cut
// in the slope towards Kauri at the other.
function approaches(g) {
  const d = new THREE.Group();
  d.add(box(70, 0.5, 9, CONCRETE, X0 - 43, DECK - 0.5, 0), at(track(70, { ballast: false }), X0 - 43, DECK, 0));
  d.add(box(4, 13, 16, CONCRETE, X0 - 80, DECK - 2, 0), box(0.2, 7.2, 6.4, DARK, X0 - 77.95, DECK, 0), box(5, 1.2, 18, CONCRETE, X0 - 80, DECK + 11, 0));
  const bench = onPath(new THREE.Group(), LENGTH + 56, DECK);
  bench.add(box(96, 0.5, 9, CONCRETE, 0, -0.5, 0), track(96, { ballast: false }));
  d.add(bench);
  g.add(d);
}

// Pines on the gentler slopes (the trees thin out on the rock faces and near the river), and dry
// scrub among them and on the screes.
function slopes(g) {
  const R = rng(359), pines = [], firs = [], scrub = [], want = detail.low ? 220 : 900;
  for (let k = 0; k < want * 6 && pines.length + firs.length < want; k++) {
    const x = -1250 + R() * 2500, z = -1000 + R() * 2000, y = ground(x, z);
    if (y < 30) continue;
    const sl = Math.hypot(ground(x + 4, z) - ground(x - 4, z), ground(x, z + 4) - ground(x, z - 4)) / 8;
    if (sl > 0.85 || nearLine(x, z, 16)) continue;
    if (R() < 0.3 && scrub.length < want) { scrub.push([x, z, 1.6 + R() * 1.8, y - 0.3]); continue; }
    (R() < 0.7 ? pines : firs).push([x, z, 13 + R() * 11, y - 0.5]);
  }
  g.add(trees(pines, { kind: 'deodar', seed: 3 }), trees(firs, { kind: 'fir', seed: 5 }), shrubs(scrub, { dry: true, seed: 8 }));
}
// Is (x, z) within d of the bridge's line?
function nearLine(x, z, d) {
  for (let s = -90; s <= LENGTH + 110; s += 12) { const [px, pz] = path(s); if (Math.hypot(x - px, z - pz) < d) return true; }
  return false;
}

export function addDetails(f, g) {
  deck(f);
  approaches(g);
  // The Vande Bharat to Srinagar on the arch.
  const tr = train(8, { livery: 'orange' });
  f.add(at(tr, -20, DECK + RAIL_TOP, 0));
  // The Chenab: one sheet under the gorge's floor, showing where the bed drops below it.
  g.add(sheet(760, 2790, M.river, 0, 0.12, 0));
  slopes(g);
  // Kauri: a few hill houses under tin roofs on the shoulder beyond the viaduct.
  const H = rng(77), houses = [];
  for (let k = 0; k < (detail.low ? 8 : 16); k++) {
    const x = 620 + H() * 420, z = -260 + H() * 200, y = ground(x, z);
    houses.push([x, z, 7 + H() * 4, 7 + H() * 3, 1 + Math.floor(H() * 2), H() * 6.28, y - 0.8]);
  }
  g.add(townHouses(houses, { seed: 77, roof: 'pitched', tanks: 0, paint: ['#e6dfcf', '#d8c9ac', '#cfd6d2', '#e3c9a6'] }));
}
