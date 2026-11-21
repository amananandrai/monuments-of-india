import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace } from '../helpers.js';
import { railing, jali, clockFace, rosette, windowFrame, bracketGeo, mergeByMaterial } from './components.js';
import { figure, gothicPinnacle } from './sculpture.js';
import { allegory, hold } from './figures.js';
import { detail } from '../detail.js';
import { GLASS } from './colonial.js';
import { couchant } from './animals.js';
import { trees, lampPosts, along, cityAround } from './realism.js';

// CSMT, finer detail. From photographs of the terminus: a pierced Gothic parapet runs along the
// eaves of every range, with pinnacles at the corners; carved roundels sit between the windows of
// the central block; a clock is set over the main portal; and the turrets carry a second band and
// slit windows. Dimensions follow js/monuments/csmt.js: the ranges [w, h, d] stand on a 1 m base.
const BAND = mat('#7e7c78', 0.9);
function architecture(f) {
  const d = new THREE.Group();
  // Each range: [x, z, rotY, w, h, d].
  const ranges = [[0, 0, 0, 36, 22, 26], [-33, -5, 0, 30, 16, 16], [33, -5, 0, 30, 16, 16], [-52, 14, -Math.PI / 2, 16, 18, 30], [52, 14, Math.PI / 2, 16, 18, 30]];
  for (const [x, z, ry, w, h, dd] of ranges) {
    const t = at(new THREE.Group(), x, 1, z);
    t.rotation.y = ry;
    t.add(at(railing(w - 0.4, 1.1, 0.22, M.cream, 1.8, jali(M.cream)), 0, h, dd / 2 + 0.05));
    for (const sx of [-1, 1]) t.add(cyl(0.05, 0.42, 3, BAND, sx * (w / 2 - 0.3), h, dd / 2 - 0.1, 8));
    d.add(t);
  }
  for (let k = 0; k < 9; k++) {
    const x = -16.2 + (k + 1) * 3.6 - 1.8;
    for (const y of [8.7, 16]) if (Math.abs(x) > 4 || y > 10) d.add(at(rosette(0.45, BAND, 8), x, 1 + y, 13.02));
  }
  d.add(at(clockFace(1.2, 10, 10), 0, 1 + 19.5, 13.02));
  for (const x of [-18, 18]) for (const z of [-13, 13]) {
    d.add(cyl(1.72, 1.72, 0.5, BAND, x, 1 + 8, z, 8));
    const t = at(new THREE.Group(), x, 0, z);
    for (let k = 0; k < 4; k++) t.add(onFace(box(0.3, 1.4, 0.05, M.recess, 0, 1 + 18, 0), (k / 4) * Math.PI * 2 + Math.PI / 8, 1.5 * Math.cos(Math.PI / 8) + 0.02));
    d.add(t);
  }
  mergeByMaterial(d);
  f.add(d);
}

// The sculpture and finer parts, after photographs of the terminus:
// - on the piers of the gateway into the forecourt, the lion (for Britain) and the tiger (for
//   India), lying couchant on moulded caps (Thomas Earp, in Bath stone);
// - above the gables of the two forward wings, the groups of Commerce and Agriculture;
// - a crocketed gable over each of the eight faces of the dome's drum, with pinnacles between
//   them, and crockets running up the dome's ribs;
// - robed statues on corbels either side of the clock;
// - gabled dormers with windows along the slate roofs of the side ranges, and gargoyles at the
//   corners of the eaves.
const CREAM_ = M.cream, SLATE_ = mat('#5b6067', 0.8);
function sculpture(f) {
  const d = new THREE.Group(), dt = 23;
  for (const x of [-10, 10]) d.add(box(2.4, 4.4, 3.2, BAND, x, 0, 36), box(2.8, 0.5, 3.7, CREAM_, x, 4.4, 36), box(2.2, 0.4, 3.3, BAND, x, 4.9, 36));
  // Drum gables (the drum is an octagon r = 9 to dt + 8, its faces centred between the corners).
  const gable = new THREE.Shape();
  gable.moveTo(-3, 0); gable.lineTo(3, 0); gable.lineTo(0, 3.2); gable.closePath();
  const gg = new THREE.ExtrudeGeometry(gable, { depth: 0.5, bevelEnabled: false });
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) / 8) * Math.PI * 2, ap = 9 * Math.cos(Math.PI / 8);
    d.add(onFace(new THREE.Mesh(gg, CREAM_).translateY(dt + 8.6), a, ap + 0.05));
    d.add(onFace(at(windowFrame(1, 1.6, BAND, { shape: 'pointed', back: GLASS, frame: 0.12 }), 0, dt + 8.8, 0), a, ap + 0.57));
    const va = (k / 8) * Math.PI * 2;
    d.add(at(gothicPinnacle(3.6, CREAM_), Math.sin(va) * 9.2, dt + 8.6, Math.cos(va) * 9.2));
  }
  // Crockets up the eight ribs of the dome (its profile from dt + 8.6).
  const prof = [[8.8, 3.4], [8.1, 5.5], [7.3, 7.6], [5.8, 9.2], [4.2, 10.8], [2.1, 11.8]];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    for (const [r, y] of prof) d.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 4), CREAM_), Math.sin(a) * (r + 0.2), dt + 8.6 + y, Math.cos(a) * (r + 0.2)));
  }
  for (const x of [-3.2, 3.2]) d.add(at(new THREE.Mesh(bracketGeo(0.8, 0.7, 0.9), BAND), x, 1 + 18.5, 13));
  for (const [x, key, o] of [[-3.2, 'csmt-robe-a', { right: 'down', left: 'chest' }], [3.2, 'csmt-robe-b', { right: 'chest', left: 'down', free: -1 }]]) f.add(at(robed(2.4, key, o), x, 1 + 18.5, 13.45));
  f.add(at(commerce(), -52, 0, 29.5), at(agriculture(), 52, 0, 29.5));
  // Dormers on the front slopes of the side ranges (30 × 16, roofs from y 17 at z = -5 ± 8).
  for (const sx of [-1, 1]) for (const k of [-1, 0, 1]) {
    const x = sx * 33 + k * 9, dm = at(new THREE.Group(), x, 17.2, 1.6);
    dm.add(box(2.2, 1.8, 2.6, CREAM_, 0, 0, 0), at(new THREE.Mesh(new THREE.ExtrudeGeometry(gable, { depth: 2.6, bevelEnabled: false }).scale(0.4, 0.45, 1).translate(0, 1.8, -1.3), SLATE_), 0, 0, 0));
    dm.add(at(windowFrame(0.9, 1.3, BAND, { shape: 'pointed', back: GLASS, frame: 0.12 }), 0, 0.2, 1.31));
    d.add(dm);
  }
  // Gargoyles at the eaves' corners of the central and side ranges.
  for (const [x, z, y] of [[-18, 13, 23], [18, 13, 23], [-48, 3, 17], [-18, 3, 17], [18, 3, 17], [48, 3, 17]]) {
    const gy = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.6, 6).rotateX(Math.PI / 2), BAND);
    gy.position.set(x, y - 0.3, z + 0.8);
    d.add(gy, at(new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 4), BAND), x, y - 0.3, z + 1.6));
  }
  mergeByMaterial(d);
  f.add(d);
  f.add(at(couchant(CREAM_), -10, 5.3, 35.95), at(couchant(CREAM_, { tiger: true }), 10, 5.3, 35.95));
}

// A robed woman in stone h tall, facing +z (js/details/figures.js; on phones, from the light kit),
// holding what `held` lists ([side, kind, opts] for hold()).
function robed(h, key, opts, held = []) {
  if (detail.low) return figure(h, CREAM_, 'robed');
  const fig = allegory(key, opts, CREAM_, opts.seated ? 0.024 : 0.028), g = new THREE.Group();
  g.add(fig.mesh);
  for (const [side, kind, o] of held) hold(g, fig, side, kind, CREAM_, o);
  g.scale.setScalar(h / (opts.seated ? 1.62 : 1.76));
  return g;
}
// The groups above the forward wings' gables, each on a corbelled platform at the gable's apex (the
// gable 16 wide and 7 high from y 19, its face at z 29 to 30). Commerce: a standing woman, one arm
// held out in welcome and a caduceus in the other hand, between a seated figure with her hand on a
// model ship and Britannia seated with her trident and shield. Agriculture: a standing woman with a
// ploughshare and a cornucopia, and beside her a seated figure with a sickle and a sheaf of grain.
// After the descriptions of Earp's groups (Victorian Web); their exact arrangement is not recorded.
function apexPlatform(g) {
  g.add(box(3.2, 1.6, 1.4, BAND, 0, 23.6, 0), box(4.2, 0.45, 2.0, CREAM_, 0, 25.2, 0.1));
  return 25.65;
}
function commerce() {
  const g = new THREE.Group(), y = apexPlatform(g);
  g.add(at(robed(2.5, 'commerce', { right: 'out', left: 'chest' }, [['l', 'caduceus', { axis: [0.1, 1, 0.1] }]]), 0, y, 0.1));
  g.add(at(robed(2.1, 'trade', { seated: true, right: 'lap', left: 'forward' }, [['l', 'ship', { axis: [0, 1, 0], offset: [0, 0.05, 0] }]]), -1.35, y, 0.35).rotateY(0.3));
  const b = at(robed(2.1, 'britannia', { seated: true, head: 'helmet', right: 'holdUp', left: 'lap' }, [['r', 'trident', { axis: [0, 1, 0] }]]), 1.35, y, 0.35).rotateY(-0.3);
  if (!detail.low) { const sh = at(new THREE.Group(), 0.5, 0.42, 0.12).add(hold(new THREE.Group(), { hands: { c: [0, 0, 0] }, dirs: {} }, 'c', 'shield', CREAM_)); sh.rotation.y = Math.PI / 2 - 0.3; sh.scale.setScalar(1.25); b.add(sh); }
  return g.add(b);
}
function agriculture() {
  const g = new THREE.Group(), y = apexPlatform(g);
  g.add(at(robed(2.5, 'agriculture', { right: 'down', left: 'chest' }, [['r', 'plough', { axis: [0, 1, 0] }], ['l', 'cornucopia', { axis: [0.3, 1, 0.2] }]]), 0.5, y, 0.1));
  return g.add(at(robed(2.1, 'harvest', { seated: true, right: 'lap', left: 'cradle' }, [['r', 'sickle', { axis: [0, 1, 0.3] }], ['l', 'sheaf', { axis: [0.5, 1, 0.2] }]]), -1.1, y, 0.35).rotateY(0.25));
}


// Chhatrapati Shivaji Maharaj Terminus: lamps along the forecourt and the road in front, and the
// rain trees along the road.
export function addDetails(f, g) {
  architecture(f);
  sculpture(f);
  g.add(lampPosts([...along(9, [-100, 58], [100, 58]), ...along(9, [-100, 90], [100, 90])], { h: 5 }));
  g.add(trees(along(8, [-100, 95], [100, 95]), { kind: 'banyan', seed: 7, h: 12 }));
  // It is a working station: behind the head office, the platforms run out under long trainsheds.
  g.add(at(trainShed(), 0, 0, -36));
  // Fort and Bori Bunder round it: blocks of offices and houses along the streets, clear of the
  // forecourt, the road in front (whose far side they line) and the tracks.
  g.add(cityAround([-110, 110, -260, 100], { rows: 2, gap: 8, depth: [14, 20], storeys: [3, 6], seed: 81,
    paint: ['#d8c9ac', '#c9b08a', '#e2d6bf', '#b9a58a', '#d6cfc2', '#cdb594'] }));
}

// The trainsheds: eight platforms 240 m long between the tracks, under three long pitched roofs of
// grey sheet carried on iron columns, running back (-z) from the head office.
const SHEET = mat('#7f8a8f', 0.6, 0.3), IRON = mat('#4a4f52', 0.6, 0.5), BALLAST = mat('#5c5650', 0.95);
function trainShed() {
  const g = new THREE.Group(), L = 240, z0 = -L / 2;
  g.add(box(200, 0.3, L, BALLAST, 0, 0, z0));
  for (let k = 0; k < 8; k++) {
    const x = -84 + k * 24;
    g.add(box(8, 1, L - 10, M.path, x, 0, z0 + 5));
    for (const s of [-1, 1]) for (const r of [-0.75, 0.75]) g.add(box(0.15, 0.2, L, IRON, x + s * 8 + r, 0.3, z0));
  }
  for (const cx of [-64, 0, 64]) {
    for (const s of [-1, 1]) {
      const slab = box(33.5, 0.3, L - 10, SHEET, 0, 0, 0);
      slab.position.set(cx + s * 16, 15.2, z0 + 5);
      slab.rotation.z = -s * 0.24;
      g.add(slab);
    }
    for (let z = z0 + 10; z < -6; z += 20) for (const x of [cx - 30, cx, cx + 30]) g.add(cyl(0.35, 0.4, x === cx ? 18.6 : 11.4, IRON, x, 0, z, 8));
  }
  return g;
}
