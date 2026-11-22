import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, inst, unitBox, unitCyl, unitSpire, mown, rng } from '../helpers.js';
import { mergeByMaterial, petalRing } from '../parts/components.js';
import { trees, shrubs, lampPosts, fountains, along, around } from '../parts/realism.js';
import { detail } from '../detail.js';
import { TIERS, STONE, TRIM, DARK } from '../monuments/statue-of-equality.js';

const RING = 132;   // the radius of the ring of Divya Desams
const DARK2 = mat('#5d5650', 0.75), GILT = M.gild;

// The 108 Divya Desams: models of the shrines of Vishnu sung by the Alvars, in dark stone, in a
// ring round the statue, each facing it: a plinth, a cella with a pillared porch before its door,
// and over it a small vimana of stepped storeys under a domed cap and a gilt pot. Every ninth is
// larger and stands behind a little gopuram, its storeys tapering to a barrel roof. All of them
// are instances of a box, a drum and a spire.
function divyaDesams() {
  const g = new THREE.Group(), R = rng(108), boxes = [], light = [], drums = [], caps = [], pots = [], doors = [];
  for (let k = 0; k < 108; k++) {
    const a = ((k + 0.5) / 108) * Math.PI * 2, big = k % 9 === 4, s = (big ? 1.45 : 1) * (0.92 + R() * 0.16), sn = Math.sin(a), cs = Math.cos(a);
    const P = (r, y, w, h, d, list = boxes) => list.push([sn * r, y, cs * r, w, h, d, a]);
    P(RING, 0.2, 5.4 * s, 0.6, 7.6 * s, light);
    P(RING + 1.2 * s, 0.8, 3.6 * s, 3.2 * s, 3.6 * s);
    P(RING + 1.2 * s, 0.8 + 3.2 * s, 4.1 * s, 0.3 * s, 4.1 * s, light);
    // The porch: a slab on four posts, towards the statue.
    P(RING - 2.1 * s, 0.8 + 2.4 * s, 3.2 * s, 0.3 * s, 3.0 * s, light);
    for (const [u, v] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) boxes.push([sn * (RING - 2.1 * s + v * 1.2 * s) + cs * u * 1.3 * s, 0.8, cs * (RING - 2.1 * s + v * 1.2 * s) - sn * u * 1.3 * s, 0.3 * s, 2.4 * s, 0.3 * s, a]);
    doors.push([sn * (RING - 0.62 * s), 0.8, cs * (RING - 0.62 * s), 1.1 * s, 2.1 * s, 0.06, a]);
    // The vimana.
    const tiers = big ? 3 : 2 + (k % 2);
    let y = 0.8 + 3.5 * s, w = 3.3 * s;
    for (let i = 0; i < tiers; i++) { P(RING + 1.2 * s, y, w, 0.95 * s, w); P(RING + 1.2 * s, y + 0.95 * s, w + 0.3 * s, 0.18 * s, w + 0.3 * s, light); y += 1.13 * s; w *= 0.76; }
    drums.push([sn * (RING + 1.2 * s), y, cs * (RING + 1.2 * s), w * 0.8, 0.5 * s, w * 0.8, a]);
    caps.push([sn * (RING + 1.2 * s), y + 0.5 * s, cs * (RING + 1.2 * s), w * 1.15, w * 0.8, w * 1.15, a]);
    pots.push([sn * (RING + 1.2 * s), y + 0.5 * s + w * 0.36, cs * (RING + 1.2 * s), 0.3 * s, 0.9 * s, 0.3 * s, a]);
    if (big) {
      // Its gopuram, at the ring's inner edge: a gateway block and four storeys to a barrel roof.
      const r = RING - 7.5 * s;
      P(r - 1.4, 0.2, 1.6, 3.6, 2.4); 
      for (const u of [-1, 1]) boxes.push([sn * r + cs * u * 2.1, 0.2, cs * r - sn * u * 2.1, 2.2, 3.6, 2.4, a]);
      let gy = 3.8, gw = 6.4, gd = 2.6;
      P(r, gy - 0.3, 6.8, 0.3, 2.9, light);
      for (let i = 0; i < 4; i++) { P(r, gy, gw, 1.25, gd); P(r, gy + 1.25, gw + 0.3, 0.2, gd + 0.25, light); gy += 1.45; gw *= 0.84; gd *= 0.86; }
      P(r, gy, gw * 1.05, 0.9, gd * 0.9, light);
      for (const u of [-1, 0, 1]) pots.push([sn * r + cs * u * gw * 0.32, gy + 0.9, cs * r - sn * u * gw * 0.32, 0.26, 0.8, 0.26, a]);
    }
  }
  g.add(inst(unitBox(), boxes, DARK), inst(unitBox(), light, DARK2), inst(unitBox(), doors, M.recess), inst(unitCyl(8), drums, DARK));
  g.add(inst(new THREE.SphereGeometry(0.5, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), caps, DARK2), inst(unitSpire(), pots, GILT));
  // The paved walk they stand on, and the lawn inside it.
  const walk = mesh(new THREE.RingGeometry(RING - 12, RING + 8, 108).rotateX(-Math.PI / 2), STONE, 0, 0.36, 0);
  walk.receiveShadow = true;
  g.add(walk);
  return g;
}

// The fountain before the stair (the Leela Neerajanam): an octagonal basin with a lotus of pink
// petals standing open at its centre, a ring of jets round it.
function fountain() {
  const g = new THREE.Group(), PINK = mat('#e48fa3', 0.6);
  g.add(cyl(13, 13.6, 0.9, STONE, 0, 0.2, 0, 8), cyl(12, 12, 0.08, M.water, 0, 1.06, 0, 8), cyl(13.3, 13.3, 0.16, TRIM, 0, 1.1, 0, 8), cyl(11.9, 11.9, 0.3, M.water, 0, 0.95, 0, 8));
  g.add(cyl(1.6, 2.2, 2.2, DARK, 0, 1.0, 0, 16), at(petalRing(1.9, 12, 3.4, 1.9, 0.75, PINK, 0.25), 0, 3.0, 0), at(petalRing(1.3, 12, 3.2, 1.6, 0.4, PINK, 0.25), 0, 3.1, 0).rotateY(0.26), cyl(0.9, 1.2, 1.4, GILT, 0, 3.2, 0, 12));
  g.add(fountains(around(12, 8, 0, 0), { y: 1.1, h: 4.5 }), fountains([[0, 0]], { y: 4.6, h: 6 }));
  return g;
}

// The Statue of Equality, the setting: the fountain and the paved approach from the south, the
// ring of the 108 Divya Desams on its walk, lawns between it and the Bhadra Vedi cut by the four
// axial paths, lamps, and the trees of the Deccan (neem, with ashokas and palms planted along
// the walks) beyond.
export function addDetails(f, g) {
  const stairEnd = TIERS[2] + 47;
  g.add(at(fountain(), 0, 0, stairEnd + 30));
  g.add(divyaDesams());
  const lawn = mown(mesh(new THREE.RingGeometry(TIERS[0] + 10, RING - 12, 96).rotateX(-Math.PI / 2), M.grass, 0, 0.32, 0));
  lawn.receiveShadow = true;
  g.add(lawn);
  const paths = new THREE.Group();
  for (let k = 0; k < 4; k++) {
    const q = new THREE.Group();
    q.add(box(k ? 9 : 34, 0.2, RING - 12 - TIERS[0] - 10, STONE, 0, 0.2, (RING - 12 + TIERS[0] + 10) / 2));
    q.rotation.y = k * Math.PI / 2;
    paths.add(q);
  }
  g.add(mergeByMaterial(paths));
  g.add(lampPosts([...along(8, [-19, 60], [-19, 118]), ...along(8, [19, 60], [19, 118]), ...around(24, RING - 14, 0, 0, 0.13)]));
  const beds = [];
  for (const [n, r] of [[40, TIERS[0] + 14], [64, RING - 16]]) for (const [x, z] of around(n, r)) if (Math.abs(x) > 20 || z < 0) beds.push([x, z, 1.3]);
  g.add(shrubs(beds.filter((_, i) => i % 2 === 0), { flowers: '#e8a020', seed: 5 }), shrubs(beds.filter((_, i) => i % 2 === 1), { flowers: '#d0306f', seed: 6 }));
  g.add(trees(around(detail.low ? 28 : 56, RING + 16, 0, 0, 0.05), { kind: 'ashoka', seed: 7 }), trees(around(20, 86, 0, 0, 0.4).filter(([x, z]) => Math.abs(x) > 24 || z < 0), { kind: 'palm', seed: 8 }));
  g.add(trees(around(detail.low ? 30 : 60, 190, 0, 0, 0.2).map(([x, z], i) => [x * (1 + (i % 5) * 0.06), z * (1 + (i % 5) * 0.06)]), { kind: 'neem', seed: 9 }));
}
