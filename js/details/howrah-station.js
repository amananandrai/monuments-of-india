import * as THREE from 'three';
import { M, V, mat, mesh, box, at, sheet, strut, inst, unitBox, rng, surface } from '../helpers.js';
import { mergeByMaterial, clockFace, bracketGeo } from '../parts/components.js';
import { GLASS } from '../parts/colonial.js';
import { track, train, overhead, platform } from '../parts/transport.js';
import { trees, lampPosts, along, cityAround, townHouses, traffic, boats, launches } from '../parts/realism.js';
import { detail } from '../detail.js';
import { BANK, FRONT, LEN, HT, TOWERS, STONE, BRICK } from '../monuments/howrah-station.js';

// Howrah Station, finer detail and the setting. The front faces east over the Hooghly (+z here);
// north, and the Howrah Bridge, are towards +x. Behind the front block the concourse runs the
// width of the station, and from it the platforms run west (-z) under long pitched trainsheds of
// sheet iron, then out into the open under their own canopies. The site group `s` stands BANK
// above the river; heights below are above the bank.
const SHEET = surface(mat('#7f8a8f', 0.6, 0.3), 'none'), IRON = surface(mat('#4a4f52', 0.6, 0.5), 'none');
const BALLAST = mat('#625b53', 0.97), SLAB = mat('#bdb6a8', 0.9), PAVE = M.path, CREAM = mat('#e4dccb', 0.85);

// Platform islands (their centres along x), 20 m apart, a track either side of each: twenty faces
// under the old sheds, and the new complex's two islands to the south.
const ISLANDS = [-90, -70, -50, -30, -10, 10, 30, 50, 70, 90], NEW = [-133, -153];
const Z0 = -47, SHED = 300, OPEN = 250, TRACKS = [];
for (const x of [...ISLANDS, ...NEW]) TRACKS.push(x - 7.1, x + 7.1);

function architecture(f) {
  const d = new THREE.Group();
  // The clock in the gable, and brackets under the towers' cornices.
  d.add(at(clockFace(1.5, 10, 10), 0, 25.2, FRONT + 1.03));
  const br = bracketGeo(0.8, 0.7, 0.35);
  for (const x of TOWERS) {
    const h = Math.abs(x) < 20 ? 34 : 29;
    for (const k of [-3.6, -1.8, 0, 1.8, 3.6]) d.add(at(new THREE.Mesh(br, STONE), x + k, h - 1.2, FRONT + 2));
  }
  // Rainwater pipes down the front between the bays' ends and the towers, and stone finials on
  // the parapet over every other pier.
  for (let k = 0; k < TOWERS.length - 1; k++) {
    if (k === 3) continue;
    const a = TOWERS[k] + 4.9, b = TOWERS[k + 1] - 4.9, n = Math.round((b - a) / 4.2);
    for (let j = 1; j < n; j += 2) d.add(box(0.7, 1.0, 0.7, STONE, a + (j * (b - a)) / n, HT + 1.5, FRONT - 0.2));
  }
  f.add(mergeByMaterial(d));
}

// The trainsheds: five pitched roofs side by side, each 40 m across over two platform islands
// and their four tracks, on iron columns along the valleys and down the middle of the platforms;
// a ventilator along each ridge, and a glazed gable screen at the open western end.
function trainSheds() {
  const g = new THREE.Group(), zm = Z0 - SHED / 2, eave = 9.6, ridge = 15.6, half = 20, run = Math.hypot(half, ridge - eave), tilt = Math.atan2(ridge - eave, half);
  const cols = [], ties = [];
  for (const cx of [-80, -40, 0, 40, 80]) {
    for (const s of [-1, 1]) {
      const slab = box(run + 0.4, 0.22, SHED, SHEET, 0, 0, 0);
      slab.position.set(cx + s * half / 2, (eave + ridge) / 2, zm);
      slab.rotation.z = -s * tilt;
      g.add(slab);
    }
    g.add(box(4.4, 1.3, SHED - 6, IRON, cx, ridge - 0.5, zm), box(5.6, 0.2, SHED - 4, SHEET, cx, ridge + 0.8, zm));
    // The gable screen: glazing in the triangle over a deep iron valance.
    const tri = new THREE.Shape();
    tri.moveTo(-half, 0); tri.lineTo(half, 0); tri.lineTo(0, ridge - eave); tri.closePath();
    g.add(mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.2, bevelEnabled: false }), GLASS, cx, eave, Z0 - SHED - 0.1));
    g.add(box(2 * half, 1.6, 0.36, IRON, cx, eave - 1.6, Z0 - SHED));
    for (let k = -4; k <= 4; k++) g.add(box(0.22, (ridge - eave) * (1 - Math.abs(k) / 5), 0.3, IRON, cx + k * 4, eave, Z0 - SHED - 0.12));
    for (let z = Z0 - 6; z > Z0 - SHED + 1; z -= 12) {
      for (const x of [cx - 10, cx + 10]) cols.push([x, 1.3, z, 0.34, eave + 2.6, 0.34]);
      ties.push([cx, eave - 0.2, z, 2 * half, 0.3, 0.2]);
    }
  }
  for (let z = Z0 - 6; z > Z0 - SHED + 1; z -= 12) for (let x = -100; x <= 100; x += 40) cols.push([x, 0, z, 0.5, eave, 0.5]);
  g.add(inst(unitBox(), cols, IRON), inst(unitBox(), ties, IRON));
  // The side walls of the sheds in brick, with a row of arched panels, and the concourse between
  // the front block and the buffer stops under a flat roof with a clerestory.
  for (const s of [-1, 1]) g.add(box(0.8, eave, SHED, BRICK, s * 100.6, 0, zm), box(1.0, 0.5, SHED, STONE, s * 100.6, eave, zm));
  g.add(box(LEN - 2, 0.5, 34, SHEET, 0, 12.4, -31), box(LEN - 30, 2.2, 14, GLASS, 0, 12.9, -31), box(LEN - 28, 0.4, 15, SHEET, 0, 15.1, -31));
  for (const s of [-1, 1]) g.add(box(0.8, 12.4, 33, BRICK, s * 100.6, 0, -31));
  return g;
}

// Platforms, tracks and trains. Each island is a slab 9 m wide from the buffer stops to the end
// of the sheds, then an open platform under its butterfly canopy; the tracks lie on one bed of
// ballast, with sleepers where they are in the open.
function railway() {
  const g = new THREE.Group(), L = SHED + OPEN, y = 0.3, rails = [], R = rng(23);
  g.add(box(214, y, L + 420, BALLAST, 0, 0, Z0 - (L + 420) / 2), box(50, y, L + 420, BALLAST, -143, 0, Z0 - (L + 420) / 2));
  for (const x of ISLANDS) {
    g.add(box(9, 1.05, SHED, SLAB, x, y, Z0 - SHED / 2));
    for (const sx of [-1, 1]) g.add(box(0.5, 0.06, SHED, YELLOW, x + sx * 4, y + 1.02, Z0 - SHED / 2));
    const p = at(platform(OPEN, 9), x, y, Z0 - SHED - OPEN / 2);
    p.rotation.y = Math.PI / 2;
    g.add(p);
  }
  // The new complex (platforms 17 to 23, opened 1992): a plain block and two long island platforms.
  g.add(box(46, 13, 26, CREAM, -143, 0, -18), box(47, 0.6, 27, SLAB, -143, 13, -18), box(40, 1.6, 0.12, GLASS, -143, 4, -4.94), box(40, 1.6, 0.12, GLASS, -143, 8.5, -4.94));
  for (const x of NEW) {
    const p = at(platform(L - 20, 9), x, y, Z0 - 10 - L / 2);
    p.rotation.y = Math.PI / 2;
    g.add(p);
  }
  // Buffer stops at the concourse end of every track.
  const stops = [];
  for (const x of TRACKS) stops.push([x, y, Z0 - 1.5, 2.6, 1.5, 0.5]);
  g.add(inst(unitBox(), stops, mat('#b3262e', 0.7)));
  const fine = !detail.low;
  for (const x of TRACKS) {
    for (const sx of [-0.838, 0.838]) rails.push([x + sx, y + 0.1, Z0 - 2 - SHED / 2, 0.07, 0.42, SHED]);
    // Sleepered track where it is in the open beside the platforms (desktops); plain rails beyond.
    for (const sx of [-0.838, 0.838]) rails.push([x + sx, y + 0.1, Z0 - 2 - SHED - (fine ? OPEN : 0) - (fine ? 200 : 325), 0.07, 0.42, fine ? 400 : 650]);
    if (fine) {
      const t = at(track(OPEN, { ballast: false }), x, y, Z0 - 2 - SHED - OPEN / 2);
      t.rotation.y = Math.PI / 2;
      g.add(t);
    }
    if (fine || TRACKS.indexOf(x) % 2 === 0) {
      const o = at(overhead(OPEN + 380, { span: 54, side: TRACKS.indexOf(x) % 2 ? 1 : -1 }), x, y, Z0 - 12 - SHED - (OPEN + 380) / 2);
      o.rotation.y = Math.PI / 2;
      g.add(o);
    }
  }
  g.add(inst(unitBox(), rails, IRON));
  // Trains at the platforms: suburban EMUs in the middle, mail and express trains with their
  // locomotives at the outer end, a Rajdhani in red and a Vande Bharat.
  const liveries = ['blue', 'emu', 'red', 'emu', 'blue', 'green', 'emu', 'vande', 'blue', 'emu', 'red', 'blue', 'emu', 'orange'];
  let n = 0;
  TRACKS.forEach((x, i) => {
    if ((i * 7 + 3) % (fine ? 5 : 9) > 1) return;
    const livery = liveries[n++ % liveries.length], cars = livery === 'emu' ? 9 : ['vande', 'orange'].includes(livery) ? 8 : 9 + Math.floor(R() * 4);
    const tr = train(detail.low ? Math.min(cars, 8) : cars, { livery, locoColour: R() < 0.5 ? '#c23b2e' : '#e8e2cf' });
    tr.rotation.y = Math.PI / 2;
    g.add(at(tr, x, y + 0.52, Z0 - 8 - R() * 30 - tr.userData.length / 2));
  });
  return g;
}
const YELLOW = surface(mat('#e7c23a', 0.7), 'none');

// The forecourt and the river front: the cab road before the station with its ranks of yellow
// taxis, the bus stand to the north, the road along the bank, and the ferry ghat.
function forecourt(s, g) {
  s.add(box(700, 0.12, 49, M.asphalt, 0, 0, FRONT + 26.5), box(700, 0.2, 12, PAVE, 0, 0, 72));
  s.add(box(LEN + 30, 0.16, 5.5, PAVE, 0, 0, FRONT + 2.75 - 0.6));
  // Taxis waiting in two ranks before the porte-cochère and passing through it; buses at the stand.
  s.add(traffic([[34, 1], [37.5, 1]], -95, 95, { y: 0.12, gap: 7.5, seed: 4, taxis: 1, buses: 0, trucks: 0 }));
  s.add(traffic([[22.5, 1]], -60, 60, { y: 0.12, gap: 16, seed: 9, taxis: 0.8, buses: 0, trucks: 0 }));
  s.add(traffic([[33, 1], [37, -1], [41, 1], [45, -1]], 125, 250, { y: 0.12, gap: 24, seed: 6, taxis: 0, buses: 1, trucks: 0 }));
  s.add(traffic([[51.5, 1], [55, 1], [59.5, -1], [63, -1]], -340, 340, { y: 0.12, gap: 20, seed: 12, taxis: 0.4, buses: 0.2, trucks: 0.05 }));
  // Kerbs between the cab road and the main road, and the railing along the bank.
  const d = new THREE.Group();
  d.add(box(680, 0.3, 0.6, STONE, 0, 0, 48.5), box(680, 0.3, 0.5, STONE, 0, 0, 57.25));
  for (const y of [0.55, 1.05]) d.add(box(680, 0.08, 0.08, IRON, 0, y + 0.2, 77.6));
  const posts = [];
  for (let x = -340; x <= 340; x += 3) if (Math.abs(x + 40) > 31 && Math.abs(x - 30) > 5) posts.push([x, 0.2, 77.6, 0.1, 1.1, 0.1]);
  s.add(mergeByMaterial(d), inst(unitBox(), posts, IRON));
  s.add(lampPosts([...along(22, [-330, 49], [330, 49]), ...along(22, [-330, 67.5], [330, 67.5])], { h: 6, y: 0.2 }));
  s.add(trees([...along(9, [-330, 72], [-80, 72]), ...along(10, [60, 72], [330, 72])], { kind: 'banyan', seed: 5, h: 10, y: 0.2 }));
  // The ghat: steps down to the water the width of the station's middle, and beside them the
  // ferry jetty, a gangway out to a roofed pontoon where the launches tie up.
  const GHAT = mat('#a79f90', 0.9), gh = new THREE.Group();
  for (let k = 0; k < 9; k++) gh.add(box(60, Math.max(0.3, BANK - (k + 1) * 0.42), 1.1, GHAT, -40, 0, 78.55 + k * 1.1));
  gh.add(box(1530, BANK + 0.3, 1.2, GHAT, -835, 0, 78.4), box(1590, BANK + 0.3, 1.2, GHAT, 785, 0, 78.4));
  gh.add(box(4.5, 0.4, 34, IRON, 30, BANK - 0.5, 95), box(46, 1.6, 12, mat('#5c6b73', 0.7, 0.3), 30, -0.5, 118));
  for (const sx of [-1, 1]) gh.add(box(0.1, 1.1, 34, IRON, 30 + sx * 2.2, BANK - 0.1, 95));
  gh.add(box(38, 0.25, 9, SHEET, 30, 4.6, 118));
  const pc = [];
  for (let x = 12; x <= 48; x += 6) for (const z of [114, 122]) pc.push([x, 1.1, z, 0.2, 3.5, 0.2]);
  g.add(mergeByMaterial(gh), inst(unitBox(), pc, IRON));
  g.add(launches([[30, 127.5, Math.PI / 2], [-28, 150, 1.9], [150, 260, -1.2], [-210, 330, 1.4], [60, 420, -1.7]], { y: 0.15 }));
  const R = rng(31), fleet = [];
  for (let i = 0; i < (detail.low ? 8 : 16); i++) fleet.push([-420 + R() * 760, 100 + R() * 380, R() * 6.28]);
  g.add(boats(fleet.filter(([x, z]) => !(Math.abs(x - 30) < 40 && z < 140)), { y: 0.15, size: 2.2, canopy: true, colours: ['#5a3d2a', '#3d2f24', '#7a4e2d'] }));
}

// The Howrah Bridge, a few hundred metres to the north: its cantilever outline only, two planes
// of chords, posts and diagonals between the banks (the bridge itself is its own monument).
function bridge() {
  const g = new THREE.Group(), S = M.steel, xs = [], deck = BANK + 7, W = 11, z0 = 400;
  const seg = (a, b, n) => { for (let i = 0; i < n; i++) xs.push(a + ((b - a) * i) / n); };
  seg(-330, -228.5, 4); seg(-228.5, -80, 5); seg(-80, 80, 6); seg(80, 228.5, 5); seg(228.5, 330, 4); xs.push(330);
  const topY = (x) => { const a = Math.abs(x); return deck + (a <= 80 ? 28 : a <= 228.5 ? 28 + ((a - 80) / 148.5) * 44 : 72 - ((a - 228.5) / 101.5) * 58); };
  for (const w of detail.low ? [0] : [-W, W]) xs.forEach((x, i) => {
    const tower = Math.abs(Math.abs(x) - 228.5) < 0.5;
    g.add(strut(V(w, tower ? 0 : deck, z0 + x), V(w, topY(x) + (tower ? 4 : 0), z0 + x), tower ? 3.4 : 1.1, S));
    if (i === xs.length - 1) return;
    const x2 = xs[i + 1];
    g.add(strut(V(w, topY(x), z0 + x), V(w, topY(x2), z0 + x2), 1.9, S));
    g.add(i % 2 ? strut(V(w, topY(x), z0 + x), V(w, deck, z0 + x2), 0.9, S) : strut(V(w, deck, z0 + x), V(w, topY(x2), z0 + x2), 0.9, S));
  });
  g.add(box(2 * W + 4, 1.6, 900, S, 0, deck - 1.6, z0 - 80));
  for (const x of [-228.5, 228.5]) g.add(box(36, deck - 1.4, 18, M.concrete, 0, 0, z0 + x));
  return mergeByMaterial(g);
}

export function addDetails(f, g, s) {
  architecture(f);
  s.add(trainSheds(), railway());
  // The bank the station stands on, the Hooghly, and Kolkata's bank across it.
  g.add(box(3200, BANK, 2400, M.bank, 0, 0, 78 - 1200), box(3200, BANK, 900, M.bank, 0, 0, 640 + 450));
  g.add(sheet(3200, 566, M.river, 0, 0.12, 78 + 281));
  forecourt(s, g);
  g.add(at(bridge(), 430, 0, 0));
  // Howrah round the station: streets of houses either side of the yard, clear of the forecourt,
  // the road along the bank and the tracks running out to the west.
  const paint = ['#d9c7a8', '#c98f6a', '#e4d8c2', '#b9a27e', '#d6b48a', '#c7c0b0'];
  s.add(cityAround([-182, 112, -1000, 12], { rows: detail.low ? 1 : 2, gap: 8, depth: [12, 18], storeys: [2, 5], seed: 41, paint, every: detail.low ? 2 : 1,
    keep: [[-2000, 2000, 10, 2000], [-2000, 2000, -3000, -720], [100, 2000, -8, 100], [400, 460, -200, 100]] }));
  // Kolkata's river front: a line of old warehouses and offices along the far bank.
  const R = rng(57), far = [];
  for (let x = -700; x < 700; x += 16 + R() * 14) if (Math.abs(x - 430) > 30) far.push([x, 664 + R() * 10, 12 + R() * 8, 12, 2 + Math.floor(R() * 4), Math.PI, BANK]);
  g.add(townHouses(far, { seed: 57, paint, fine: false }));
}
