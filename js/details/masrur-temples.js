import * as THREE from 'three';
import { M, V, mat, mesh, box, at, sheet, inst, unitBox, rng, strut } from '../helpers.js';
import { mergeByMaterial, templeNiche } from '../parts/components.js';
import { templeDoorway } from '../parts/doorways.js';
import { carvedPillar } from '../parts/temples.js';
import { figure, figureFrieze, elephantGeo } from '../parts/sculpture.js';
import { trees, shrubs, scatter, asiBoard, townHouses } from '../parts/realism.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { detail } from '../detail.js';
import { ROCK, ROCK_DARK, SHRINES, SANCTUM_Z, SHELF } from '../monuments/masrur-temples.js';

// Masrur, finer detail and setting. The sanctum's doorway in its porch, with the nine seated gods
// over it; what is left of the hall before it (the floor, one pillar, the stumps of three); the
// doors to the two rock-cut stairs; the named images in niches on the shrines; the rubble of the
// fallen spires, with the large fallen figures of Varuna and Agni; the pool before the temple; the
// ridge behind; fields, mango and pine round the village; and the snows of the Dhauladhar, which
// the temple faces, across the valley to the north-east.
// Dimensions follow js/monuments/masrur-temples.js: the roof T high, the hall's floor 0.45 m. The
// temple (f) stands SHELF above the ground and the pool; the setting (g) is at the ground's level.

// The land: the ridge behind (south-west, -z) rising to some 60 m, a knoll off the north-west end
// (+x), gentle fields in front, and the Dhauladhar range, snow-capped, far off in front.
function landY(x, z) {
  const ridge = smooth(-20, -120, z) * (45 + 25 * ridged(x, z, { scale: 0.006, octaves: 3 }));
  const knoll = 14 * smooth(46, 66, x) * smooth(120, 90, x) * smooth(8, -12, z) * smooth(-90, -50, z);
  const range = smooth(900, 1500, z + 0.25 * x) * (700 + 260 * ridged(x, z, { scale: 0.0018, octaves: 4 }));
  // The pool lies before the temple, its water just below the lip of the rock.
  if (Math.abs(x) < 27 && Math.abs(z - 28) < 14.5) return -0.5;
  return ridge + knoll + range + 2.5 * fbm(x, z, { scale: 0.01, octaves: 3 }) * smooth(30, 80, Math.abs(z - 20) + Math.abs(x) * 0.5) - 0.3;
}

// The images of Masrur, each the kit's figure with what it is known by, h tall, facing +z on y = 0.
// Varaha, the boar, lifting the earth goddess on his elbow; Narasimha, the man-lion, with the demon
// across his knees; Surya with a lotus in each hand; Ganesha; Kartikeya with his spear and peacock;
// Indra on his elephant; Saraswati with her vina; Ardhanarishvara (half Shiva with the trident, half
// Parvati with her mirror); Harihara (half Shiva, half Vishnu with the wheel); Varuna with his
// noose, on the makara; Agni in his flames.
const SEATED = ['ganesha', 'indra', 'saraswati', 'narasimha'];
export function deity(kind, h, m) {
  const g = new THREE.Group(), u = h / 10, sit = SEATED.includes(kind), y0 = kind === 'indra' ? 3.6 : sit ? 1.4 : 0, head = y0 + (sit ? 5.6 : 8.5);
  const B = (r, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = mesh(new THREE.SphereGeometry(r * u, 8, 6), m, x * u, y * u, z * u); o.scale.set(sx, sy, sz); g.add(o); };
  const rod = (x0, y0_, x1, y1, t = 0.22, z = 0.9) => g.add(strut(V(x0 * u, y0_ * u, z * u), V(x1 * u, y1 * u, z * u), t * u, m));
  const disc = (r, x, y, z) => g.add(at(mesh(new THREE.CylinderGeometry(r * u, r * u, 0.2 * u, 12).rotateX(Math.PI / 2), m), x * u, y * u, z * u));
  const trident = (x) => { rod(x, 0, x, 9.6); rod(x - 0.6, 9.2, x + 0.6, 9.2); for (const s of [-1, 0, 1]) rod(x + s * 0.6, 9.2, x + s * 0.6, 10.4 + (s ? 0 : 0.5)); };
  g.add(at(figure(sit ? 6.4 * u : h, m, sit ? 'seated' : 'standing'), 0, y0 * u, 0));
  if (sit && kind !== 'indra') g.add(box(4.4 * u, 1.4 * u, 2.4 * u, m));
  if (kind === 'varaha') {
    g.add(at(mesh(new THREE.ConeGeometry(0.7 * u, 2.2 * u, 8).rotateZ(-Math.PI / 2.6), m), 0.9 * u, 9.1 * u, 0.6 * u));
    B(0.5, 2.3, 7.6, 0.6); B(0.6, 2.3, 6.7, 0.6, 1, 1.4, 1); B(0.9, -1.2, 0.5, 0.9, 1.6, 0.5, 1);
  } else if (kind === 'narasimha') {
    B(1.5, 0, head + 0.1, -0.2, 1.15, 1.1, 0.45); rod(-2.4, y0 + 1.5, 2.2, y0 + 1.5, 0.8, 1.3); B(0.55, 2.6, y0 + 1.6, 1.3);
  } else if (kind === 'surya') {
    disc(1.9, 0, 8.7, -0.5);
    for (const s of [-1, 1]) { rod(s * 1.6, 4.4, s * 1.7, 7.4, 0.14); B(0.6, s * 1.7, 7.8, 0.9, 1, 0.8, 1); }
  } else if (kind === 'ganesha') {
    B(1.6, 0, y0 + 2.6, 0.6, 1, 0.9, 0.7); B(1.15, 0, head, 0.4, 1, 1, 0.8);
    for (const s of [-1, 1]) B(1.0, s * 1.5, head + 0.1, 0.1, 0.8, 1, 0.2);
    rod(0, head - 0.4, 0.3, y0 + 3.4, 0.5, 1.3); rod(0.3, y0 + 3.4, 1.1, y0 + 2.6, 0.4, 1.4);
  } else if (kind === 'kartikeya') {
    rod(1.9, 0, 1.9, 10.2, 0.16); g.add(at(mesh(new THREE.ConeGeometry(0.35 * u, 1.2 * u, 4), m), 1.9 * u, 10.8 * u, 0.9 * u));
    B(0.9, -1.9, 1.6, 0.5, 1, 0.8, 1.3); rod(-1.9, 2, -1.7, 3.6, 0.3, 1.1); B(0.35, -1.7, 3.8, 1.2);
  } else if (kind === 'indra') {
    const e = mesh(elephantGeo(), m);
    e.scale.set(3 * u, 3.8 * u, 2.6 * u);
    g.add(e);
    rod(1.5, y0 + 2.4, 1.5, y0 + 4, 0.3);
  } else if (kind === 'saraswati') {
    rod(-2.1, y0 + 0.9, 1.9, y0 + 5.4, 0.2, 1.2); B(0.7, -2.1, y0 + 0.9, 1.2); B(0.5, 1.9, y0 + 5.4, 1.2);
  } else if (kind === 'ardhanarishvara') {
    trident(1.9); disc(0.7, -1.9, 6.6, 0.9); rod(-1.8, 4.6, -1.9, 6, 0.14); B(0.5, -0.5, 6.6, 0.9);
  } else if (kind === 'harihara') {
    trident(1.9);
    g.add(at(mesh(new THREE.TorusGeometry(0.7 * u, 0.16 * u, 4, 12), m), -1.9 * u, 7.6 * u, 0.9 * u));
    rod(-1.8, 4.4, -1.9, 7, 0.14); rod(-1.6, 0, -1.7, 3.6, 0.4, 0.8);
  } else if (kind === 'varuna') {
    g.add(at(mesh(new THREE.TorusGeometry(0.8 * u, 0.14 * u, 4, 12), m), 1.9 * u, 6.2 * u, 0.9 * u));
    B(1, 0, 0.5, 0.6, 2.6, 0.5, 1); B(0.5, 2.6, 0.9, 0.6, 1.6, 0.6, 0.8);
  } else if (kind === 'agni') {
    for (let k = -3; k <= 3; k++) g.add(at(mesh(new THREE.ConeGeometry(0.45 * u, 1.8 * u, 4), m), k * 0.75 * u, (10.2 - Math.abs(k) * 0.75) * u, -0.3 * u));
    disc(2.6, 0, 8.2, -0.5); B(0.8, -1.8, 0.8, 0.6, 1.3, 0.8, 0.8);
  }
  return g;
}

export function addDetails(f, g, { T }) {
  const d = new THREE.Group(), F = 0.45, Z = SANCTUM_Z;
  // The sanctum's doorway at the back of the porch, facing the pool: five bands round the opening
  // (the river goddesses at their feet), two square pillars before it under the lintel of rock,
  // and over the door the nine seated gods in a row, Shiva in the middle.
  const door = templeDoorway(1.5, 2.6, { m: ROCK, bands: 5, bw: 0.2, open: 0.5, hood: false, guardianH: 1.2 });
  d.add(at(door, 0, F, Z + 3.82));
  const lz = Z + 3.82 + door.userData.depth, ly = F + door.userData.outerH;
  d.add(box(4.9, 4.9 - ly, door.userData.depth, ROCK, 0, ly, lz - door.userData.depth / 2));
  f.add(at(figureFrieze(4.6, 0.58, ROCK, { pitch: 0.51, kinds: ['seated'], back: M.recess }), 0, ly + 0.14, lz + 0.01));
  for (const s of [-1, 1]) d.add(box(0.75, 4.9 - F, 0.75, ROCK, s * 2.7, F, -4.9), box(1, 0.3, 1, ROCK_DARK, s * 2.7, F, -4.9), box(1.05, 0.35, 1.05, ROCK_DARK, s * 2.7, 4.55, -4.9));
  // The hall: of its four carved pillars one stands, the others are stumps on the floor.
  for (const [x, z, h] of [[-2.4, -2.3, 5.2], [2.4, -2.3, 0.7], [-2.4, 1.5, 0.5], [2.4, 1.5, 1.1]]) d.add(h > 2 ? at(carvedPillar(h, ROCK), x, F, z) : box(0.95, h, 0.95, ROCK, x, F, z));
  // The two rock-cut stairs, north and south: from the sides of the hall a few steps climb into a
  // door in each stair tower, and come out behind it on the roof.
  for (const s of [-1, 1]) {
    for (let k = 0; k < 4; k++) d.add(box(0.36, F + (k + 1) * 0.26, 1.3, ROCK_DARK, s * (3.0 + k * 0.36), 0, -1.4));
    d.add(box(0.06, 2.3, 1.1, M.recess, s * 4.16, F + 1.1, -1.4), box(0.2, 0.3, 1.7, ROCK_DARK, s * 4.14, F + 3.4, -1.4));
    d.add(box(1.1, 1.9, 0.06, M.recess, s * 8.3, T, -1.4 - 2.52), box(1.6, 0.25, 0.2, ROCK_DARK, s * 8.3, T + 1.9, -1.4 - 2.5));
    for (let k = 0; k < 3; k++) d.add(box(1.2, 0.2 * (3 - k), 0.3, ROCK_DARK, s * 8.3, T - 0.15, -4.1 - k * 0.3));
  }
  // The images in their niches. On the fronts of the shrines that face the pool: Surya and
  // Kartikeya on the end spires, Indra and Ganesha on the half spires, Saraswati on the ruined
  // free shrine and Ardhanarishvara on the stub by the hall's entrance; Harihara in the great panel
  // on the face of the main spire. Varaha and Narasimha in the side niches of the standing free
  // shrine, whose own door faces the pool.
  const niche = ([x, z, w, y0, wh, , , , deep = 1], kind, a = 0, up = 0.2) => {
    const nh = Math.min(wh * 0.62, w * 0.5), n = templeNiche(nh * 0.6, nh, ROCK, { figure: deity(kind, nh * 0.92, ROCK_DARK) }), r = ((w + 0.5) / 2) * (a ? 1 : deep) + 0.02;
    n.rotation.y = a;
    d.add(at(n, x + Math.sin(a) * r, y0 + wh * up + 0.3, z + Math.cos(a) * r));
  };
  niche(SHRINES.ends[0], 'surya'); niche(SHRINES.ends[1], 'kartikeya');
  niche(SHRINES.half[0], 'indra'); niche(SHRINES.half[1], 'ganesha');
  niche(SHRINES.free[0], 'saraswati'); niche(SHRINES.front[1], 'ardhanarishvara');
  niche(SHRINES.free[1], 'varaha', -Math.PI / 2); niche(SHRINES.free[1], 'narasimha', Math.PI / 2);
  const [mx, mz, mw, my] = SHRINES.main[0], panel = templeNiche(1.7, 2.9, ROCK, { figure: deity('harihara', 2.6, ROCK_DARK), crown: false });
  d.add(at(panel, mx, my + 2.4, mz + mw * 0.47));
  const [fx, fz, fw] = SHRINES.free[1];
  d.add(at(templeDoorway(0.9, 1.7, { m: ROCK, bands: 3, bw: 0.14, open: 0.4, hood: false, guardians: false, moon: false }), fx, 0.5, fz + fw / 2 + 0.27));
  // The large images found in the ruins, Varuna and Agni, lying where they fell.
  for (const [kind, x, z, ry] of [['varuna', -9.2, 9.6, 0.5], ['agni', 9.4, 10.4, -0.7]]) {
    const o = deity(kind, 2.3, ROCK_DARK);
    o.rotation.set(-1.25, ry, 0, 'YXZ');
    d.add(at(o, x, 0.55, z), box(2.8, 0.3, 1.4, ROCK, x, 0.5, z - 0.9));
  }
  // Rubble of fallen spires: on the roof, heaped at the foot of the front, and thick round the
  // two entrance shrines and the ruined free shrine.
  const R = rng(8), rub = [];
  for (let k = 0; k < (detail.low ? 50 : 120); k++) {
    const where = k % 4, s = 0.4 + R() * 1.1;
    let x, z, y = 0;
    if (where === 0) { x = (R() - 0.5) * 24; z = Z - 2 + (R() - 0.5) * 10; y = T; if (Math.abs(x) < 6 && z > Z - 6) continue; }
    else if (where === 1) { x = (R() - 0.5) * 54; z = 2 + R() * 9; }
    else if (where === 2) { x = -5 + (R() - 0.5) * 6; z = 6 + (R() - 0.5) * 6; y = R() * 1.6; }
    else { x = -19.3 + (R() - 0.5) * 9; z = 5.2 + (R() - 0.5) * 9; y = R() * 1.2; }
    if (where && Math.abs(x) < 2.3 && z < 12) continue;
    if (where === 1 && Math.abs(x) < 12 && z < 2.5) continue;
    rub.push([x, y, z, s * 1.3, s * 0.7, s, R() * 3]);
  }
  d.add(inst(unitBox(), rub, ROCK_DARK));
  f.add(mergeByMaterial(d));
  // The ground and the ridge.
  g.add(heightField(3600, 3600, detail.low ? 110 : 170, landY, { rock: ['#8c7d64', '#7a6f5e', '#9a8a70'], cover: '#5f7a3f', steep: 0.72, band: 30, snow: 520 }));
  // The shelf of bare rock the temple is cut from, SHELF above the water (the temple itself stands
  // on it: see the monument file), with a step down to the pool along its front.
  g.add(box(60, SHELF, 34.4, ROCK, 0, 0, -2.2), box(50, SHELF * 0.5, 1.2, ROCK_DARK, 0, 0, 15.5));
  // The pool: 50 m by 25 (two squares), cut in the rock, its water a little below the shelf; a low
  // wall of stone round its other three sides.
  const tz = 27.5, tw = 50, td = 25, tank = new THREE.Group();
  tank.add(box(tw + 2.4, 0.45, 1.2, ROCK_DARK, 0, -0.1, tz + td / 2 + 0.6));
  for (const s of [-1, 1]) tank.add(box(1.2, 0.45, td, ROCK_DARK, s * (tw / 2 + 0.6), -0.1, tz), box(3, 0.08, td + 6, M.path, s * (tw / 2 + 2.8), -0.04, tz + 1));
  g.add(mergeByMaterial(tank), box(tw, 0.3, td, M.bank, 0, -0.26, tz), sheet(tw, td, M.lake, 0, 0.1, tz));
  g.add(asiBoard('Rock-cut Temples, Masrur', 33, 13, -0.4));
  // The village: slate-roofed houses on the slopes to either side.
  g.add(townHouses([[-60, 30, 8, 9, 2], [-74, 44, 9, 8, 2], [-58, 58, 8, 9, 1], [64, 34, 9, 8, 2], [78, 50, 8, 8, 2], [60, 64, 9, 9, 1], [-88, 18, 8, 8, 2]], { seed: 6, roof: 'pitched', roofs: ['#5f6266', '#6c6f73'], paint: ['#e9e3d6', '#d8cdb8', '#efe7d6'], tanks: 0 }));
  // Fields below the pool.
  for (const [x, z, w, dd, c] of [[-40, 80, 60, 40, '#8aa34e'], [30, 85, 50, 45, '#a3ac55'], [-5, 130, 90, 40, '#7d9a4a']]) g.add(sheet(w, dd, mat(c, 0.95), x, 0.02, z));
  // Mango and peepal in the village, pines up the ridge.
  const keep = [[-48, 48, -30, 52], [-90, 90, 60, 160]];
  g.add(trees(scatter(detail.low ? 14 : 24, [-130, 130, -10, 110], { seed: 3, gap: 14, avoid: keep }).map(([x, z]) => [x, z, null, landY(x, z)]), { kind: 'mango', seed: 3 }));
  g.add(trees([[-54, 0], [56, 4], [-58, 54], [60, 56]].map(([x, z]) => [x, z, null, landY(x, z)]), { kind: 'peepal', seed: 5 }));
  const pines = scatter(detail.low ? 70 : 150, [-300, 300, -320, -30], { seed: 9, gap: 12, avoid: [[-34, 34, -30, 10]] }).map(([x, z]) => [x, z, 14 + 8 * fbm(x, z, { scale: 0.05, octaves: 2 }), landY(x, z)]);
  g.add(trees(pines, { kind: 'fir', seed: 9 }));
  g.add(shrubs(scatter(40, [-110, 110, -30, 70], { seed: 4, gap: 6, avoid: keep }).map(([x, z]) => [x, z, 1.1, landY(x, z)]), { seed: 4 }));
}
