import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, lathe, group, rng } from '../helpers.js';
import { mergeByMaterial, petalRing } from '../parts/components.js';
import { trees, shrubs, scatter, around } from '../parts/realism.js';
import { detail } from '../detail.js';
import { PETALS, P0, P1, RED, RED_DARK } from '../monuments/matrimandir.js';

const EARTH = mat('#b9684c', 0.95);   // the red laterite of Auroville's paths
const deg = Math.PI / 180;

// The ways in: between each two petals a narrow ramp of red stone runs down towards the sphere
// (those on the four axes, to the entrances under the piers, are broader), each between low kerbs,
// and carries on outward as a path between two of the twelve gardens. Dimensions follow
// js/monuments/matrimandir.js: the petals from P0 to P1, their axes at 15° + k·30°.
function ways(f, g) {
  const d = new THREE.Group(), e = new THREE.Group();
  for (let k = 0; k < PETALS; k++) {
    const s = new THREE.Group(), p = new THREE.Group(), w = k % 3 ? 1.6 : 2.8, len = P1 - P0 + 4, mid = (P1 + P0) / 2 + 1;
    s.add(box(w, 0.12, len, RED_DARK, 0, 0.3, mid));
    for (const x of [-1, 1]) s.add(box(0.25, 0.45, len, RED, x * (w / 2 + 0.12), 0.3, mid));
    s.rotation.y = k * 30 * deg;
    d.add(s);
    p.add(box(k % 3 ? 2.2 : 4, 0.06, 36, EARTH, 0, 0.2, P1 + 2.5 + 18));
    p.rotation.y = k * 30 * deg;
    e.add(p);
  }
  f.add(mergeByMaterial(d));
  g.add(mergeByMaterial(e));
}

// The twelve gardens round the petals, one to each (Existence, Consciousness, Bliss, Light, Life,
// Power, Wealth, Utility, Progress, Youth, Harmony, Perfection): each a wedge of lawn between two
// paths with beds of one flower's colour, a few with a small pool, and low flowering trees. A
// circular path closes them, and beyond it the oval lawn runs to the trees.
const BLOOM = ['#f1ece2', '#e9c7d8', '#d85a8a', '#f0d24a', '#e0523a', '#c92f3e', '#f29a2e', '#e8b0c8', '#f4e06a', '#d77fb4', '#ffffff', '#e86a5a'];
function gardens(g) {
  const R = rng(31), small = [];
  for (let k = 0; k < PETALS; k++) {
    const a = (k + 0.5) * 30 * deg, beds = [], n = detail.low ? 10 : 22;
    for (let i = 0; i < n; i++) {
      const r = 51 + R() * 26, b = a + (R() - 0.5) * 21 * deg;
      beds.push([Math.sin(b) * r, Math.cos(b) * r, 0.9 + R() * 0.8]);
    }
    g.add(shrubs(beds, { flowers: BLOOM[k], seed: 40 + k }));
    if (k % 3 === 1) {
      const pool = group(cyl(4.2, 4.4, 0.35, M.marble, 0, 0.2, 0, 32), cyl(3.8, 3.8, 0.05, M.water, 0, 0.53, 0, 32));
      pool.scale.set(1.4, 1, 1);
      g.add(at(pool, Math.sin(a) * 66, 0, Math.cos(a) * 66).rotateY(a));
    }
    for (const [r, da] of [[58, -8], [72, 7]]) small.push([Math.sin(a + da * deg) * r, Math.cos(a + da * deg) * r, 5]);
  }
  g.add(trees(small, { kind: 'mango', seed: 33 }));
  const ringPath = mesh(new THREE.RingGeometry(82, 85, 96).rotateX(-Math.PI / 2), EARTH, 0, 0.24, 0);
  ringPath.receiveShadow = true;
  g.add(ringPath);
}

// The amphitheatre west of the sphere, where Auroville was founded on 28 February 1968: an oval
// bowl of stepped tiers faced in red Agra sandstone inside a grassed bank, and at its centre the
// white marble urn in the shape of a lotus bud that holds earth from 124 countries.
function amphitheatre() {
  const a = new THREE.Group(), prof = [[0, 0.3], [9, 0.3]];
  for (let k = 0; k < 8; k++) prof.push([9 + k * 2.2, 0.3 + (k + 1) * 0.42], [11.2 + k * 2.2, 0.3 + (k + 1) * 0.42]);
  prof.push([27.2, 4.1], [29, 4.1], [29, 0]);
  const bowl = lathe(prof, RED, detail.low ? 40 : 72);
  bowl.material = RED;
  a.add(bowl);
  const bank = lathe([[29, 3.9], [31, 3.6], [38, 0.2]], M.grass, 48);
  a.add(bank);
  a.scale.set(1.3, 1, 1);
  const urn = new THREE.Group();
  urn.add(cyl(2.2, 2.5, 0.4, M.marble, 0, 0.3, 0, 24), lathe([[0.5, 0], [0.9, 0.5], [1.15, 1.2], [0.95, 2.0], [0.4, 2.6], [0, 2.75]], M.marble, 24).translateY(0.7));
  urn.add(at(petalRing(0.75, 8, 1.7, 1.0, 0.32, M.marble, 0.25), 0, 0.75, 0), at(petalRing(1.0, 8, 0.9, 1.1, 0.95, M.marble, 0.25), 0, 0.72, 0).rotateY(0.39));
  return group(a, urn);
}

// Matrimandir, the setting: the ways in between the petals, the twelve gardens, the amphitheatre
// with its urn to the west, the great banyan that marks the centre of Auroville to the north-west
// (a century old, 50 m across, its aerial roots grown into a grove of trunks), and the forest of
// the tropical dry evergreen kind that Auroville planted round the Peace Area.
export function addDetails(f, g) {
  ways(f, g);
  gardens(g);
  g.add(at(amphitheatre(), -128, 0, 28));
  const bx = -92, bz = -68;
  g.add(trees([[bx, bz, 24]], { kind: 'banyan', seed: 3 }), trees(around(6, 11, bx, bz, 0.4).map(([x, z]) => [x, z, 15]), { kind: 'banyan', seed: 4 }));
  g.add(mesh(new THREE.RingGeometry(21, 22.2, 48).rotateX(-Math.PI / 2), EARTH, bx, 0.24, bz));
  // The forest beyond the lawn, and palms among it.
  const far = scatter(detail.low ? 70 : 130, [-215, 215, -190, 190], { seed: 7, gap: 9 }).filter(([x, z]) => (x / 172) ** 2 + (z / 150) ** 2 > 0.92);
  g.add(trees(far.filter((_, i) => i % 3 === 0), { kind: 'neem', seed: 8 }), trees(far.filter((_, i) => i % 3 === 1), { kind: 'tamarind', seed: 9 }), trees(far.filter((_, i) => i % 3 === 2), { kind: 'jamun', seed: 10 }));
  g.add(trees(scatter(16, [-160, 160, -140, 140], { seed: 12, gap: 20 }).filter(([x, z]) => Math.hypot(x, z) > 100 && Math.hypot(x + 128, z - 28) > 50 && Math.hypot(x - bx, z - bz) > 30), { kind: 'palm', seed: 13 }));
}
