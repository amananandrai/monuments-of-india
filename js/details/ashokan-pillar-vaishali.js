import * as THREE from 'three';
import { box, cyl, at, inst, unitBox, unitCyl, surface, mat } from '../helpers.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, asiBoard, scatter, along, benches, townHouses } from '../parts/realism.js';
import { BRICK, BRICK_DARK, LIFT } from '../monuments/ashokan-pillar-vaishali.js';
import { detail } from '../detail.js';

const LAWN = surface(mat('#6f8a49', 0.95), 'ground'), EARTH = surface(mat('#b49a78', 0.95), 'ground'), PAVE = surface(mat('#a8786a', 0.95), 'paving');

// The land round the site: level at LIFT about the monuments, falling gently to the fields.
const groundY = (x, z) => LIFT - 0.06 - (LIFT + 0.3) * smooth(118, 330, Math.max(Math.abs(x), Math.abs(z - 5)));

// The swastika-plan monastery: twelve cells round an open court, three to each arm, the arms set
// off like a pinwheel, with a verandah wall round the court and the entrance on the east (-x).
function swastika() {
  const g = new THREE.Group(), w = [], c = 4.2, t = 0.55, h = 0.9;
  const room = (x, z, k) => { const cs = Math.round(Math.cos(k * Math.PI / 2)), sn = Math.round(Math.sin(k * Math.PI / 2)), rx = x * cs + z * sn, rz = -x * sn + z * cs; w.push([rx, 0.3, rz - c / 2, c + t, h, t, 0], [rx, 0.3, rz + c / 2, c + t, h, t, 0], [rx - c / 2, 0.3, rz, t, h, c, 0], [rx + c / 2, 0.3, rz, t, h, c, 0]); };
  for (let k = 0; k < 4; k++) { room(7.4, -2.1, k); room(7.4 + c, -2.1, k); room(7.4 + c, -2.1 - c, k); }
  for (const s of [-1, 1]) w.push([0, 0.3, s * 5, 10.5, 0.6, t, 0], [5, 0.3, s * 0, t, 0.6, 10, 0]);
  w.push([-5, 0.3, 3.4, t, 0.6, 3.2, 0], [-5, 0.3, -3.4, t, 0.6, 3.2, 0]);
  g.add(inst(unitBox(), w, BRICK), box(30, 0.3, 30, BRICK_DARK, 0, 0, 0), box(9.4, 0.06, 9.4, PAVE, 0, 0.3, 0));
  for (let k = 0; k < 3; k++) g.add(box(0.5, 0.3 - k * 0.1, 3, BRICK, -15.25 - k * 0.5, 0, 0));
  return g;
}

// The Kutagarshala, where the Buddha stayed in the rains: the footings of a hall on a stepped
// brick plinth, low walls dividing it into rooms.
function kutagarshala() {
  const g = new THREE.Group(), w = [];
  g.add(box(26, 0.3, 17, BRICK_DARK, 0, 0, 0), box(24.5, 0.3, 15.5, BRICK, 0, 0.3, 0));
  for (const z of [-6.6, 6.6, 0]) w.push([0, 0.6, z, z ? 22 : 14, 0.5, 0.6, 0]);
  for (const x of [-10.7, 10.7, -3.6, 3.6]) w.push([x, 0.6, 0, 0.6, 0.5, Math.abs(x) > 5 ? 13.8 : 13.2, 0]);
  for (const [x, z] of [[-7.2, 3.3], [7.2, -3.3], [7.2, 3.3]]) w.push([x, 0.6, z, 6.6, 0.4, 0.5, 0]);
  g.add(inst(unitBox(), w, BRICK));
  return g;
}

// Kolhua, finer detail and setting. From photographs of the site: the stupa's brick-paved walk
// and the brick platforms (ayakas) built against it at the cardinal points; the votive stupas,
// round drums of stacked brick rings and square platforms, crowding round the pillar's foot, with
// a few miniature shrines among them; the tank's bathing ghats, stair landings standing out from
// its south and north banks; beyond the tank the swastika-plan monastery, and west of the stupa
// the Kutagarshala; mown lawns between, and round the whole, mango orchards and the fields and
// houses of the village. Dimensions follow js/monuments/ashokan-pillar-vaishali.js: the pillar at
// the origin, the stupa's centre at z = sz, the tank tw by tl centred at (tx, tz); west is +x.
export function addDetails(f, g, { sz, tz, tx, tw, tl, n, R }) {
  const S = new THREE.Group();
  g.add(at(S, 0, LIFT, 0));
  // The ground: lawn round the monuments, open over the tank; bare earth about the pillar and stupa.
  const x0 = -120, x1 = 120, z0 = -115, z1 = 125, a = tx - tw / 2, b = tx + tw / 2, c = tz - tl / 2, d = tz + tl / 2, lawn = new THREE.Group();
  lawn.add(box(a - x0, 0.5, z1 - z0, LAWN, (x0 + a) / 2, -0.5, (z0 + z1) / 2), box(x1 - b, 0.5, z1 - z0, LAWN, (b + x1) / 2, -0.5, (z0 + z1) / 2));
  lawn.add(box(tw, 0.5, c - z0, LAWN, tx, -0.5, (z0 + c) / 2), box(tw, 0.5, z1 - d, LAWN, tx, -0.5, (d + z1) / 2));
  S.add(mergeByMaterial(lawn), box(tw + 5, 0.03, 46, EARTH, tx, 0, d + 23), box(tw + 3, 0.05, 1.5, PAVE, tx, 0, d + 0.75));
  g.add(heightField(2400, 2400, detail.low ? 80 : 120, (x, z) => (Math.abs(x - tx) < tw / 2 + 24 && Math.abs(z - tz) < tl / 2 + 24 ? LIFT - 4.2 : groundY(x, z)) + (Math.abs(x) > 130 || Math.abs(z) > 130 ? 0.5 * fbm(x, z, { scale: 0.004, octaves: 3 }) : 0), { cover: '#6d8848', rock: ['#8a7c5e'], steep: 0.5 }));
  // The stupa's walk, paved in brick, and the ayaka platforms against it at the cardinal points.
  const st = new THREE.Group();
  st.add(cyl(13.6, 13.6, 0.06, PAVE, 0, 0, sz, 48));
  for (let k = 0; k < 4; k++) { const an = k * Math.PI / 2, x = Math.sin(an) * 11.3, z = sz + Math.cos(an) * 11.3; st.add(at(box(4.6, 1.1, 2.6, BRICK, 0, 0, 0), x, 0, z).rotateY(an), at(box(3.6, 0.5, 1.8, BRICK_DARK, 0, 1.1, -0.3), x, 0, z).rotateY(an)); }
  f.add(st);
  // The votive stupas: drums of two or three brick rings, and square platforms, set close round
  // the pillar and along the stupa's south side; some carry a little shrine with a niche.
  const drums = [], squares = [], RR = () => R();
  const spots = [[-3.6, -2.6, 1.1], [-5.8, -4.6, 0.9], [-3.2, -6, 1.0], [-7.6, -2.2, 0.8], [-8.4, -5.4, 0.9], [-5.6, -7.6, 0.7], [3.4, -3, 1.5], [6.6, -3.4, 1.9], [4.6, -6.8, 1.0], [8.6, -7, 0.9], [-9.8, 1.4, 0.8], [-6.2, 2.6, 1.0], [9.4, 1.2, 1.2], [6.2, 3.8, 0.9], [12.4, -2, 1.0], [-12.6, -3.6, 0.8], [-13, 4.4, 1.1], [13.6, 4.6, 0.9]];
  spots.forEach(([x, z, r], k) => {
    const h = 0.45 + RR() * 0.2;
    if (k % 3 === 2) {
      // A square platform in two or three offsets; every other one bears a miniature shrine.
      for (let j = 0; j < 3; j++) squares.push([x, j * h * 0.8, z, (r * 2.6) * (1 - j * 0.16), h * 0.8, (r * 2.6) * (1 - j * 0.16), 0.2 * RR()]);
      if (k % 2 === 0) squares.push([x, 2.4 * h, z, r * 1.1, r * 1.3, r * 1.1, 0], [x, 2.4 * h + r * 1.3, z, r * 1.35, 0.15, r * 1.35, 0], [x, 2.4 * h + r * 1.45, z, r * 0.7, r * 0.5, r * 0.7, 0]);
    } else for (let j = 0; j < 3; j++) drums.push([x, j * h, z, 2 * r * (1 - j * 0.1), h, 2 * r * (1 - j * 0.1), 0]);
  });
  // Longer brick platforms south of the pillar, towards the tank, and wall stumps by the stupa.
  squares.push([9, 0, -8.4, 9, 0.5, 5, 0.1], [9, 0.5, -8.4, 7.6, 0.4, 3.8, 0.1], [15.5, 0, 9, 7, 1.3, 0.9, 0.3], [-15, 0, 10.5, 0.9, 1.6, 6, -0.2], [-10.5, 0, 6.5, 5, 0.9, 0.9, 0.1]);
  f.add(inst(unitCyl(18), drums, BRICK), inst(unitBox(), squares, BRICK));
  // The bathing ghats: landings standing out from the bank, stepping down with the tiers; two
  // on the south bank and one on the north, with a flight of steps down the middle of each.
  const ghat = [];
  for (const [gx, s] of [[tx - 14, -1], [tx + 14, -1], [tx + 4, 1]]) {
    for (let k = 0; k < n; k++) ghat.push([gx, -(k + 1) * 0.45, tz + s * (tl / 2 - 3.2 - k * 0.8 + 0.4), 8, 0.45, 6.4 + 0.8, 0]);
    for (let k = 0; k < 2 * n; k++) ghat.push([gx, -(k + 1) * 0.225, tz + s * (tl / 2 - 3.2 - 3.6 - k * 0.4 - 0.2), 2.6, 0.225, 0.4, 0]);
  }
  S.add(inst(unitBox(), ghat, BRICK_DARK));
  // Brick walks: round the tank and out to the monastery and the Kutagarshala.
  const walks = [[tx, 0.02, c - 2.2, tw + 8, 0.04, 1.8, 0], [a - 2.2, 0.02, tz, 1.8, 0.04, tl + 6, 0], [b + 2.2, 0.02, tz, 1.8, 0.04, tl + 6, 0], [34, 0.02, c - 12, 1.8, 0.04, 20, 0], [34, 0.02, sz + 4, 30, 0.04, 1.8, 0]];
  S.add(inst(unitBox(), walks, PAVE));
  S.add(at(swastika(), 36, 0, c - 38), at(kutagarshala(), 62, 0, sz + 6));
  S.add(asiBoard('Kolhua, Vaishali', -22, 4, Math.PI / 4));
  S.add(benches([[-26, 14, Math.PI / 2], [26, -6, -Math.PI / 2]]));
  // The old peepal south-east of the tank; ashoka along the south boundary.
  S.add(trees([[-44, c - 34, 17]], { kind: 'peepal', seed: 2 }), trees(along(10, [-70, z0 + 8], [80, z0 + 8]), { kind: 'ashoka', seed: 4 }));
  S.add(shrubs(scatter(40, [x0 + 6, x1 - 6, z0 + 6, z1 - 6], { seed: 5, gap: 6, avoid: [[a - 6, b + 6, c - 6, d + 50], [14, 58, c - 60, c - 14], [44, 80, sz - 6, sz + 18]] }), { size: 0.9 }));
  // Mango orchards round the site, and the village to the east, in its trees.
  const away = ([x, z]) => !(x > x0 - 10 && x < x1 + 10 && z > z0 - 10 && z < z1 + 10), onGround = ([x, z]) => [x, z, undefined, groundY(x, z)];
  g.add(trees(scatter(detail.low ? 60 : 110, [-300, 300, -300, 300], { seed: 3, gap: 12 }).filter(away).map(onGround), { kind: 'mango', seed: 3 }));
  g.add(trees(scatter(14, [-320, 320, -320, 320], { seed: 9, gap: 50 }).filter(away).map(onGround), { kind: 'peepal', seed: 9 }));
  g.add(townHouses(scatter(30, [-340, -170, -160, 160], { seed: 6, gap: 13 }).map(([x, z], k) => [x, z, 6 + (k % 3) * 1.5, 7 + (k % 2) * 2, 1 + (k % 4 === 0), (k * 0.7) % 1.57, groundY(x, z) - 0.2]), { seed: 6, roof: 'pitched' }));
}
