import * as THREE from 'three';
import { M, mat, mesh, at, box, flat, planPrism } from '../helpers.js';
import { templeNiche, idol, mergeByMaterial, frieze } from '../parts/components.js';
import { figureFrieze } from '../parts/sculpture.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, along, scatter, townHouses } from '../parts/realism.js';
import { apse } from '../monuments/durga-temple-aihole.js';
import { detail } from '../detail.js';

// Aihole's sandstone, a warm brown, weathered darker and patched with lichen.
export const STONE = mat('#a88a68', 0.93);
export const SHADE = mat('#7e664c', 0.95);

// P: the plinth's height; W: the temple's width, its apse ending at z = z0 and its body at z1; the
// porch to pz; PH: the gallery's pillars; CH: the hall's wall over the plinth.
export const DIMS = { P: 2.4, W: 11, z0: -11, z1: 7.3, pz: 14.6, PH: 3.4, CH: 5.2 };

// The Durga temple, finer detail. From photographs:
// - the hall's outer wall, seen through the gallery, holds large images in niches: Shiva with Nandi,
//   Narasimha, Vishnu on Garuda, Varaha, Durga slaying the buffalo demon, Harihara;
// - the plinth's faces carry a band of small scenes and, at the top, a course of ganas;
// - the porch's pillars and the gallery's are carved with couples (mithunas) and guardians;
// - the fallen amalaka lies on the ground to the south of the temple.
function architecture(f) {
  const { P, W, z0, z1, pz } = DIMS, d = new THREE.Group(), r = (W - 4.4) / 2, c = z0 + 2.2 + r;
  // Images round the hall's wall: along its straight sides and round its apse.
  const spots = [];
  for (const s of [-1, 1]) for (const z of [z1 - 3, z1 - 7]) spots.push([s * (r + 0.02), z, s * Math.PI / 2]);
  for (const a of [-0.6, 0, 0.6].map((k) => Math.PI + k)) spots.push([Math.sin(a) * (r + 0.02), c + Math.cos(a) * (r + 0.02), a]);
  for (const [x, z, a] of spots) { const n = at(templeNiche(1.2, 2.5, STONE, { figure: idol(2.2, STONE), crown: false }), x, P + 0.5, z); n.rotation.y = a; d.add(n); }
  f.add(mergeByMaterial(d));
  // The band of small scenes round the plinth, on its straight runs and the porch's front.
  if (!detail.low) {
    for (const s of [-1, 1]) {
      const fr = at(figureFrieze(z1 - z0 - W / 2 - 0.5, 0.55, STONE, { pitch: 0.5, kinds: ['standing', 'dancer', 'elephant'], proud: 0.07 }), s * (W / 2 + 0.01), 1.4, (z0 + W / 2 + z1) / 2);
      fr.rotation.y = s * Math.PI / 2;
      f.add(fr);
    }
    f.add(at(figureFrieze(W - 3.2, 0.55, STONE, { pitch: 0.5, kinds: ['standing', 'dancer'], proud: 0.07 }), 0, 1.4, pz + 0.01));
  }
  f.add(planPrism(apse(W + 0.12, z0 - 0.06, z1), P - 0.75, 0.32, frieze(SHADE)));
}

// Aihole: the village of stone houses round the temples, the other early temples close by (the Lad
// Khan temple to the south, with its flat roof and the small shrine on it, and two small Nagara
// shrines), the ruined fort wall of the lookout, babul and neem, the low sandstone hills to the north,
// and the ASI board.
function neighbours(g) {
  const n = new THREE.Group(), S = STONE, Sd = SHADE;
  // The Lad Khan temple: a square hall on a low plinth under a two-tiered sloping roof, a small shrine
  // on its roof, and a porch of pillars on the east.
  const lk = at(new THREE.Group(), 34, 0, -14);
  lk.add(box(15, 1.2, 15, Sd), box(12.5, 4.2, 12.5, S, 0, 1.2), box(14, 0.5, 14, Sd, 0, 5.4), box(11, 0.5, 11, S, 0, 5.9), box(3.5, 2.4, 3.5, S, 0, 6.4), box(4, 0.4, 4, Sd, 0, 8.8));
  for (const x of [-4.5, -1.5, 1.5, 4.5]) lk.add(box(0.7, 4.2, 0.7, S, x, 1.2, 7.1));
  lk.add(box(13, 0.4, 3, Sd, 0, 5.4, 7.6));
  n.add(lk);
  for (const [x, z, w] of [[-28, -6, 4.4], [-36, 12, 3.6], [22, 26, 3.8]]) {
    const s = at(new THREE.Group(), x, 0, z);
    s.add(box(w + 1, 0.8, w + 1, Sd), box(w, 3.2, w, S, 0, 0.8));
    for (let i = 0; i < 6; i++) { const ww = w * (0.95 - 0.08 * i); s.add(box(ww, 0.5, ww, S, 0, 4 + i * 0.5)); }
    const am = mesh(new THREE.SphereGeometry(w * 0.32, 16, 6), flat(S), 0, 7.2, 0);
    am.scale.y = 0.4;
    s.add(am);
    n.add(s);
  }
  // The fallen amalaka beside the Durga temple.
  const am = mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.9, 16), flat(STONE), 9, 0.9, -4);
  am.rotation.z = Math.PI / 2;
  n.add(am);
  // The ruined wall of the lookout, low and broken, to the north-west.
  for (let k = 0; k < 7; k++) n.add(box(6, 2 + (k % 3) * 0.7, 1.6, Sd, -60 + k * 6.2, 0, -40 + k * 1.5));
  g.add(mergeByMaterial(n));
}

export function addDetails(f, g) {
  architecture(f);
  neighbours(g);
  const ground = mat('#a48a62', 0.97);
  g.add(box(420, 0.2, 420, ground, 0, -0.25, 0), box(70, 0.06, 60, mat('#8c9a5c', 0.95), 0, -0.05, 2));
  g.add(box(4, 0.06, 40, M.path, 0, 0.02, 36), box(20, 0.06, 4, M.path, 0, 0.02, 15.5));
  // The hills to the north and west, low and rocky.
  const hy = (x, z) => smooth(150, 320, -z + 0.4 * Math.abs(x)) * (22 + 30 * fbm(x, z, { scale: 0.008, octaves: 4 })) - 0.4;
  g.add(heightField(1400, 1000, detail.low ? 90 : 140, hy, { cz: -250, rock: ['#8d7458', '#9a7f60', '#7f684f'], cover: '#7d8250', steep: 0.8 }));
  g.add(trees([...scatter(detail.low ? 10 : 22, [-140, 140, -110, 110], { seed: 3, gap: 12, avoid: [[-45, 50, -35, 45]] })], { kind: 'neem', seed: 4 }));
  g.add(trees(scatter(detail.low ? 8 : 18, [-160, 160, -150, 160], { seed: 5, gap: 12, avoid: [[-50, 55, -40, 50]] }), { kind: 'babul', seed: 6 }));
  g.add(shrubs(along(10, [-30, 30], [30, 30]), { dry: true, size: 1 }));
  if (!detail.low) g.add(townHouses(scatter(26, [-120, 120, 60, 150], { seed: 7, gap: 14 }).map(([x, z], k) => [x, z, 6 + (k % 3), 8, 1]), { seed: 5, paint: ['#c9b08a', '#b89c74', '#d4c3a3'], tanks: 0.1 }));
  g.add(asiBoard('Durga Temple, Aihole', 6, 26, -0.3));
}
