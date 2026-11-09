import * as THREE from 'three';
import { surface } from '../surface.js';
import { mat, mesh, box, at, chhatri, inst, unitBox, aroundRect, ellipsoid, tube, face } from '../helpers.js';
import { bahubaliBody } from '../details/figures.js';
import { addDetails } from '../details/gommateshwara.js';

const GRANITE = mat('#c9c3b6', 0.8);
// The statue is one smooth monolith, so it gets plain stone rather than coursed masonry.
const STATUE = surface(mat('#cfc9bc', 0.75), 'marble');
const HILL = mat('#9a917f', 0.95, 0, { flatShading: true });
const VINE = mat('#5c7a44', 0.9);

// Bahubali standing in kayotsarga: upright, arms straight at his sides, with creepers winding
// up his legs and arms, curled hair and long ears, all as carved from the one block of granite.
function bahubali() {
  const g = new THREE.Group(), G = STATUE, leaves = [];
  // The body as one carved skin, from the feet to the neck
  g.add(bahubaliBody(G));
  for (const s of [-1, 1]) {
    // Creepers spiralling up the legs and the arms
    for (const [x0, y0, y1, r] of [[s * 1.3, 0.8, 8.4, 1.1], [s * 3.5, 7.6, 14.6, 0.95]]) {
      const pts = [];
      for (let k = 0; k <= 26; k++) { const a = k * 0.62 + (s > 0 ? 0 : Math.PI); pts.push([x0 + Math.sin(a) * r, y0 + (k / 26) * (y1 - y0), Math.cos(a) * r]); }
      g.add(tube(pts, 0.12, VINE, 120, 6));
      // Leaves along the creeper, in pairs.
      pts.forEach(([x, y, z], k) => { if (k % 2) leaves.push([x + Math.sin(k) * 0.25, y, z + 0.2, 0.42, 0.18, 0.28, k * 1.3]); });
    }
    // The anthills that rose round his feet as he stood, carved beside the legs up to the knee,
    // with snakes coming out of them.
    const hill = new THREE.IcosahedronGeometry(1, 2), hp = hill.attributes.position;
    for (let k = 0; k < hp.count; k++) { const y = hp.getY(k), w = 1 + 0.18 * Math.sin(hp.getX(k) * 7 + y * 5) * Math.cos(hp.getZ(k) * 6); hp.setXYZ(k, hp.getX(k) * w * (1.2 - y * 0.45), y, hp.getZ(k) * w * (1.2 - y * 0.45)); }
    hill.computeVertexNormals();
    const ah = mesh(hill, G, s * 3.3, 2.4, 0.3);
    ah.scale.set(1.3, 2.6, 1.2);
    g.add(ah);
    for (const ph of [0, 2.4]) {
      const sp = [];
      for (let k = 0; k <= 12; k++) { const t = k / 12, a = ph + t * 5; sp.push([s * (3.3 + Math.cos(a) * (1.4 - t * 0.6)), 1.2 + t * 4.2, 0.3 + Math.sin(a) * (1.2 - t * 0.5)]); }
      g.add(tube(sp, 0.13, VINE, 48, 6));
    }
  }
  g.add(inst(new THREE.SphereGeometry(0.5, 6, 4), leaves, VINE));
  // The serene face, and the long ears
  g.add(at(face(1.32, 1.65, 1.4, G), 0, 17.4, 0.1));
  for (const s of [-1, 1]) g.add(ellipsoid(0.22, 0.95, 0.4, G, s * 1.32, 17.0, 0));
  // Tight curls of hair over the crown
  const curls = [];
  for (let k = 0; k < 140; k++) {
    const phi = Math.acos(1 - (k + 0.5) / 140 * 1.1), th = k * 2.39996;
    curls.push([Math.sin(phi) * Math.cos(th) * 1.32, 17.55 + Math.cos(phi) * 1.62, 0.05 + Math.sin(phi) * Math.sin(th) * 1.36, 0.36, 0.3, 0.36]);
  }
  g.add(inst(new THREE.SphereGeometry(0.5, 10, 8), curls, mat('#8d877a', 0.9)));
  return g;
}

export function buildGommateshwara() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Vindhyagiri: a bare granite hill, with steps cut up its face
  const H = 40;
  const hill = mesh(new THREE.SphereGeometry(80, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), HILL);
  hill.scale.y = H / 80;
  g.add(hill, box(300, 0.2, 300, mat('#7d8c5a', 0.95)));
  // The Vindhyagiri stair, cut in the rock: a steep flight up the foot of the hill, then a switchback
  // of six legs with a landing at each turn, some 250 treads to the gateway of the enclosure. Each
  // tread reaches from below the hill's faceted surface to just above its curve, and none is lower
  // than the one before it.
  const ground = (x, z) => H * Math.sqrt(Math.max(0, 1 - (x * x + z * z) / 6400)), TOP = H + 0.5, treads = [];
  const nodes = [[4, 86], [4, 70.5], ...[0, 1, 2, 3, 4].map((i) => [i % 2 ? 10 : -10, 62 - i * 8.6]), [0, 20.6]];
  let top = 0;
  const put = (x, z, w, d, ry) => {
    const c = Math.cos(ry), sn = Math.sin(ry), corners = [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].map(([u, v]) => [x + u * c + v * sn, z - u * sn + v * c]);
    top = Math.min(TOP, Math.max(top, ...corners.map(([px, pz]) => ground(px, pz) + 0.3)));
    const lo = Math.min(...corners.map(([px, pz]) => ground(px, pz))) - 2.5;
    treads.push([x, lo, z, w, top - lo, d, ry]);
  };
  for (let k = 1; k < nodes.length; k++) {
    const [x0, z0] = nodes[k - 1], [x1, z1] = nodes[k], len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0), n = Math.floor(len / 0.55);
    for (let i = 1; i < n; i++) put(x0 + ((x1 - x0) * i) / n, z0 + ((z1 - z0) * i) / n, 3.4, 0.57, ry);
    put(x1, z1, 4, 4, ry);
  }
  g.add(inst(unitBox(), treads, GRANITE));
  // The hilltop enclosure, with pillared cloisters round the statue
  f.add(box(40, 1, 40, GRANITE, 0, H - 0.5, 0));
  const walls = [];
  // The cloister wall, open in the middle of the front where the stair arrives.
  aroundRect(36, 36, 3).forEach(([x, z, ry]) => { if (!(z > 0 && Math.abs(x) < 3.5)) walls.push([x, H + 0.5, z, 3, 4.5, 2.2, ry]); });
  f.add(inst(unitBox(), walls, GRANITE));
  for (const x of [-14, 14]) f.add(at(chhatri(2.2, 6, GRANITE), x, H + 5, 18));
  // The 17.4 m monolith of Bahubali
  f.add(at(bahubali(), 0, H + 0.5, -4));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.4, 0.2, 1.25] };
}
