import * as THREE from 'three';
import { M, V, mat, mesh, box, at, ellipsoid, capsule, tube, smoothLathe, sheet, face, fingers, inst, unitBox } from '../helpers.js';
import { patelBody } from '../details/figures.js';
import { addDetails } from '../details/statue-of-unity.js';

// Sardar Patel, walking forward a step in dhoti, kurta, bandi and a shawl over the shoulders, arms
// at his sides. The body is one cast skin (js/details/figures.js); the finer folds, the buttons, the
// hands and the features of the face are added here. All in the statue's own units (177.4 to the
// crown), scaled to 182 m at the end.
const SLIT = mat('#2a221c', 0.6, 0.3);
function patel(B) {
  const s = new THREE.Group();
  s.add(patelBody(B));
  // The kasta: the dhoti's front pleats falling in a fan between the legs.
  for (let i = -2; i <= 2; i++) {
    const x = i * 1.2;
    s.add(tube([[x * 0.6, 84, 10.4], [x * 0.85, 60, 11.2], [x * 1.1, 40, 10.6 - Math.abs(i) * 0.3], [x * 1.3, 18, 8.4]], 0.95 - Math.abs(i) * 0.1, B, 40, 8));
  }
  // The bandi's placket down the chest, with its buttons, under the shawl's opening.
  s.add(tube([[0, 141.5, 13.6], [0, 136, 15.6], [0, 127, 16.2]], 0.7, B, 24, 8));
  for (const [y, z] of [[139, 14.9], [135.5, 15.8], [132, 16.1]]) s.add(ellipsoid(0.65, 0.65, 0.45, B, 0, y, z));
  // The windows of the viewing gallery, a slit across the chest (the gallery is at 153 m).
  for (let x = -6.6; x <= 6.61; x += 2.2) if (Math.abs(x) > 0.5) s.add(box(1.6, 1.9, 1.2, SLIT, x, 122.5, 15.55));
  // Folds of the shawl's end where it is thrown across the chest from the right shoulder.
  for (const [pts, r] of [
    [[[15.2, 137.0, 9.6], [5.8, 126.5, 16.2], [-6.8, 114.5, 15.4], [-15.4, 103.5, 10.8], [-15.8, 92.5, 6.6]], 1.8],
    [[[18.0, 142.0, 5.4], [9.2, 134.0, 14.6], [-3.8, 122.5, 15.0], [-13.2, 111.5, 11.6]], 1.5],
  ]) s.add(tube(pts, r, B, 48, 10));
  for (const side of [-1, 1]) {
    // A crease at the elbow, the sleeve's cuff, the thumb, and fingers curling towards the thigh.
    s.add(tube([[side * 20.5, 112.5, 5.2], [side * 24.0, 110.5, 5.6], [side * 25.6, 108.5, 1.5]], 0.8, B, 20, 8));
    const cuff = ellipsoid(4.9, 1.3, 4.5, B, side * 22.3, 88.6, 3.8);
    cuff.rotation.z = side * 0.08;
    s.add(cuff, capsule(V(side * 21.0, 86.2, 6.0), V(side * 19.9, 82.2, 7.1), 1.2, B, 0.9));
    s.add(fingers(V(side * 22.4, 79.4, 1.6), V(side * 22.4, 79.4, 5.6), V(-side * 0.6, -0.8, 0).normalize(), 2.5, 0.95, B));
    // Sandals: a sole under each foot and a strap over the instep.
    const fz = side > 0 ? 6.4 : 3.0;
    s.add(ellipsoid(5.4, 0.8, 9.4, B, side * 7.8, 0.8, fz + 0.5), tube([[side * 7.8 - 4.6, 1.5, fz - 0.6], [side * 7.8, 4.3, fz + 0.6], [side * 7.8 + 4.6, 1.5, fz - 0.6]], 0.65, B, 16, 6));
  }
  // Head: the bare crown, heavy brow and broad jaw of the 1949 portrait, clean-shaven.
  const rx = 10.2, ry = 11.8, rz = 10.8, head = new THREE.Group();
  head.add(face(rx, ry, rz, B, { jaw: 0.2 }));
  // Features laid on the face's surface: z at (x, y) on the head's ellipsoid, plus a lift.
  const Z = (x, y, lift = 0) => rz * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2 - (y / ry) ** 2)) + lift;
  const P = (pts, lift) => pts.map(([x, y]) => [x, y, Z(x, y, lift)]);
  head.add(tube(P([[-5.8, 2.4], [-2.4, 2.9], [0, 2.5], [2.4, 2.9], [5.8, 2.4]], 0.25), 0.9, B, 32, 10));          // the heavy brow
  for (const side of [-1, 1]) {
    head.add(tube(P([[side * 5.0, 1.2], [side * 3.4, 1.6], [side * 1.9, 1.0]], 0.05), 0.42, B, 16, 6));          // heavy upper lids
    head.add(tube(P([[side * 4.8, -0.2], [side * 3.4, -0.6], [side * 2.1, -0.2]], 0.0), 0.32, B, 16, 6));        // pouches under the eyes
    head.add(tube(P([[side * 1.9, -1.9], [side * 3.3, -4.3], [side * 3.8, -6.9]], -0.12), 0.38, B, 20, 6));       // the deep folds from nose to mouth
    head.add(tube([[side * (rx - 0.3), 2.6, -0.2], [side * (rx + 0.35), 0.2, -1.4], [side * (rx - 0.2), -3.2, -0.2]], 0.5, B, 16, 6), ellipsoid(1.4, 3.4, 2.4, B, side * (rx - 0.4), -0.5, -0.4));  // ears
  }
  head.add(tube(P([[-3.1, -4.9], [-1.2, -4.5], [0, -4.6], [1.2, -4.5], [3.1, -4.9]], 0.05), 0.5, B, 24, 6));      // the set, downturned mouth
  // The full, broad jaw of his later years comes from the face itself (jaw: 0.2).
  s.add(at(head, 0, 163.6, 1.0));
  s.scale.setScalar(182 / 177.4);
  return s;
}

// The pedestal, 58 m: a broad hall (the museum) to 22, a stage to 42, and the top tier to 55.6,
// faced with grey stone in vertical fins, under a round lotus plinth at the statue's feet; steps up
// the front. Then Sadhu Bet, the rocky island in the Narmada it stands on, a causeway to the bank,
// the hills of the Satpura and Vindhya round the reservoir, and the Sardar Sarovar Dam.
const STONE = mat('#8e8a83', 0.9), STONE_DARK = mat('#6f6b65', 0.9), ROCK = mat('#5f574d', 0.95, 0, { flatShading: true });
export function buildStatue() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  f.add(box(82, 22, 82, M.concrete), box(62, 20, 62, M.concrete, 0, 22), box(46, 13.6, 46, M.marbleShade, 0, 42));
  const fins = [];
  for (const [w, y, h, step] of [[82, 0, 21.6, 8], [62, 22, 19.6, 8]]) for (let k = -w / 2 + step / 2; k < w / 2; k += step) {
    for (const sd of [-1, 1]) fins.push([k, y, sd * (w / 2 + 0.5), 1.2, h, 1], [sd * (w / 2 + 0.5), y, k, 1, h, 1.2]);
  }
  f.add(inst(unitBox(), fins, STONE));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(box(10, 21, 10, STONE_DARK, sx * 37, 0, sz * 37));
  f.add(smoothLathe([[25.6, 55.6], [24.8, 56.6], [22.4, 57.3], [20.4, 58.0], [0.1, 58.0]], M.marbleShade, 64));
  for (let st = 0; st < 8; st++) f.add(box(30, 1.1, 2, M.marbleShade, 0, st * 1.1, 49 - st * 1.0));
  f.add(at(patel(M.bronze), 0, 58, 0));
  // Sadhu Bet: the island's rock round the lawn, falling to the river; the causeway to the bank.
  g.add(box(160, 0.3, 160, M.grass));
  const isl = new THREE.LatheGeometry([[150, -4], [138, 0.5], [118, 0.2], [100, 0.1]].map(([r, y]) => new THREE.Vector2(r, y)), 48), ip = isl.attributes.position;
  for (let k = 0; k < ip.count; k++) { const x = ip.getX(k), z = ip.getZ(k), y = ip.getY(k), w = 1 + 0.12 * Math.sin(Math.atan2(z, x) * 5 + 1); ip.setXYZ(k, x * w, y + (y > 0 ? 1.4 * Math.sin(x * 0.3) * Math.cos(z * 0.27) : 0), z * w); }
  isl.computeVertexNormals();
  g.add(mesh(isl, ROCK));
  g.add(box(18, 2, 420, M.concrete, 0, 0, 290));
  for (let z = 100; z <= 480; z += 40) g.add(box(10, 6, 4, M.concrete, 0, -6, z));
  g.add(sheet(7000, 7000, M.river, 0, 0.08, 0));
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.2, d = 1000 + (i % 3) * 140;
    if (Math.abs(Math.sin(a)) > 0.85 && Math.sin(a) < 0) continue;
    const h = ellipsoid(420 + (i % 4) * 80, 60 + (i % 3) * 25, 260 + (i % 2) * 80, mat('#5d6a4a', 0.95, 0, { flatShading: true }), Math.cos(a) * d * 1.6, -14, Math.sin(a) * d * 1.6);
    h.rotation.y = -a;
    g.add(h);
  }
  // The Sardar Sarovar Dam (3.2 km downstream; drawn nearer, at 1.9 km, so it shows through the haze): a long concrete wall 160 m high with its spillway
  // piers along the crest, across the valley behind the statue.
  const dz = -1900, dam = new THREE.Group();
  dam.add(box(1300, 150, 40, STONE, 0, 0, dz), box(1300, 8, 52, M.concrete, 0, 150, dz - 4));
  for (let x = -280; x <= 280; x += 24) dam.add(box(6, 22, 52, M.concrete, x, 128, dz + 6));
  g.add(dam);
  addDetails(f, g);
  return { group: g, focus: f };
}
