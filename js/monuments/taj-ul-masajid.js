import * as THREE from 'three';
import { M, box, cyl, at, onionDome, finial, minaret, chhatri } from '../helpers.js';
import { iwan, arcadeSkin, cellRow } from '../parts/mughal.js';
import { mughalChhatri } from '../parts/components.js';
import { addDetails, PINK, PINK_LIGHT, P } from '../details/taj-ul-masajid.js';

// Taj-ul-Masajid, Bhopal: the pink mosque begun under Shah Jahan Begum and finished in 1985. From
// photographs: a vast square court, raised on a plinth and ringed by arcaded cloisters, with a great
// gateway in the middle of its east side; across the court, the prayer hall's long pink front of
// pointed arches round a tall central iwan; three white marble onion domes over the hall; and at
// its two ends, the eighteen-storey octagonal minarets, pink, banded with balconies and capped by
// white domes. Faces east (+z); the court is about 99 m square, the minarets about 63 m high.

// An octagonal minaret h high: a square base up to the hall's roof, then the eight-sided shaft with
// a balcony every few storeys, an open kiosk and a white dome.
function tower(h, base) {
  const g = new THREE.Group(), r = 3.6;
  g.add(box(2 * r + 1.6, base, 2 * r + 1.6, PINK), box(2 * r + 2.2, 0.6, 2 * r + 2.2, PINK_LIGHT, 0, base));
  g.add(at(minaret(h - base - 0.6, r, PINK, { balconies: 6, seg: 8, cap: 'dome', capM: M.marble }), 0, base + 0.6, 0));
  return g;
}

export function buildTajUlMasajid() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The plinth of the court, with the hall at its west end.
  const W = 100, z0 = -36, z1 = 56, HZ = -50, HH = 17;
  f.add(box(W + 18, P, z1 - HZ + 26, PINK, 0, 0, (z1 + HZ) / 2 + 2), box(W - 2, 0.12, z1 - z0 - 2, PINK_LIGHT, 0, P, (z1 + z0) / 2));
  // The prayer hall: a block 92 wide and 28 deep, its front an arcade 2 m deep: a tall iwan in the
  // middle and six pointed arches either side, under a parapet.
  const hd = 2;
  f.add(box(92, HH, 28 - hd, PINK, 0, P, HZ - hd / 2), box(92.6, 0.7, 28.6, PINK_LIGHT, 0, P + HH, HZ));
  f.add(box(20, HH + 4.5, 2, PINK, 0, P, z0 - 1), box(20.4, 0.6, 2.4, PINK_LIGHT, 0, P + HH + 4.5, z0 - 1));
  f.add(at(iwan(11, 18, { m: PINK, trim: M.marble, shade: PINK_LIGHT, depth: 2.4, frame: 2.4, top: 3.2 }), 0, P, z0));
  for (const s of [-1, 1]) {
    const cells = cellRow(6, 5.6, 0.6, 3.8, 9.5).map(([cx, ...r]) => [cx, ...r]);
    f.add(at(arcadeSkin(34, HH - 1.5, cells, hd, PINK, { trim: M.marble, fill: 'room' }), s * 27, P, z0 - hd));
    // A second, smaller row of windows above.
    f.add(at(arcadeSkin(34, 3.4, cellRow(6, 5.6, 0.5, 2.2, 2.6), 0.35, PINK, { trim: M.marble, fill: 'jali' }), s * 27, P + HH - 4.2, z0 - 0.05));
  }
  // The three white domes, on drums over the hall: the middle one largest.
  for (const [x, r] of [[-22, 5.4], [0, 7], [22, 5.4]]) {
    f.add(cyl(r * 0.95, r * 1.0, 3.2, PINK, x, P + HH + 0.7, HZ, 32), cyl(r * 1.02, r * 1.02, 0.5, PINK_LIGHT, x, P + HH + 3.9, HZ, 32));
    f.add(at(onionDome(r, M.marble), x, P + HH + 4.4, HZ), at(finial(r * 0.75), x, P + HH + 4.4 + r * 1.8, HZ));
  }
  // Small kiosks at the corners of the hall's roof, behind the minarets.
  for (const x of [-38, 38]) f.add(at(mughalChhatri(1.6, 6, PINK, { domeM: M.marble }), x, P + HH + 0.7, HZ - 10));
  // The minarets at the two front corners of the hall.
  for (const s of [-1, 1]) f.add(at(tower(62, HH + 2), s * 49.5, P, z0 - 4));
  // The cloisters round the court's north, south and east sides: an arcade towards the court, a walk
  // and an outer wall under a flat roof, two storeys high.
  const CH = 9, CD = 7;
  const cloister = (len) => {
    const c = new THREE.Group();
    c.add(box(len, CH, CD - 1.2, PINK, 0, 0, -CD / 2 - 0.6), box(len + 0.4, 0.5, CD + 0.4, PINK_LIGHT, 0, CH, -CD / 2));
    const n = Math.floor(len / 4.6);
    c.add(at(arcadeSkin(len, CH, cellRow(n, len / n, 0.4, 2.8, 6.2), 1.2, PINK, { trim: PINK_LIGHT, fill: 'room' }), 0, 0, -1.2));
    // The outer face: a row of blind arches, each with a small window, over the plinth.
    c.add(at(arcadeSkin(len, CH - 0.6, cellRow(n, len / n, 1.2, 2.4, 5.2), 0.3, PINK, { trim: PINK_LIGHT, fill: 'jali' }), 0, 0, -CD).rotateY(Math.PI));
    return c;
  };
  for (const s of [-1, 1]) f.add(at(cloister(z1 - z0), s * (W / 2), P, (z0 + z1) / 2).rotateY(-s * Math.PI / 2));
  for (const s of [-1, 1]) f.add(at(cloister(45), s * 34.5, P, z1 + 0.01).rotateY(Math.PI));
  // The east gateway: a tall block with an iwan on both faces, kiosks at its corners, steps down to
  // the road.
  const gate = new THREE.Group(), GW = 24, GH = 15;
  gate.add(box(GW, GH, 12, PINK), box(GW + 0.6, 0.7, 12.6, PINK_LIGHT, 0, GH));
  gate.add(at(iwan(7.5, 11.5, { m: PINK, trim: M.marble, shade: PINK_LIGHT, depth: 1.6, frame: 1.8, top: 2 }), 0, 0, 6));
  gate.add(at(iwan(7.5, 11.5, { m: PINK, trim: M.marble, shade: PINK_LIGHT, depth: 1.6, frame: 1.8, top: 2 }), 0, 0, -6).rotateY(Math.PI));
  for (const x of [-GW / 2 + 1.6, GW / 2 - 1.6]) for (const z of [-4.4, 4.4]) gate.add(at(chhatri(1.4, 5, PINK, M.marble), x, GH + 0.7, z));
  gate.add(at(onionDome(3, M.marble), 0, GH + 0.7, 0), at(finial(2.4), 0, GH + 0.7 + 5.5, 0));
  f.add(at(gate, 0, P, z1 + 3));
  for (let k = 0; k < 6; k++) f.add(box(22 - k * 0.8, P - k * 0.4, 1.2, PINK_LIGHT, 0, 0, z1 + 9.6 + k * 1.2));
  addDetails(f, g, { W, z0, z1, HZ, HH, CH, CD });
  // From above the gateway, across the court to the hall, its domes and the two minarets.
  return { group: g, focus: f, view: [0.35, 0.42, 1], zoom: 0.72, target: [0, 16, -10] };
}
