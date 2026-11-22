import * as THREE from 'three';
import { mat, box, inst, surface } from '../helpers.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/chand-baori.js';

// The well's stone, weathered grey-brown, the lighter treads of the flights, and the buff stone
// and plaster of the pavilions on its north side.
export const STONE = mat('#8d8170', 0.92), TREAD = mat('#a99b85', 0.9), BUFF = mat('#c9b48d', 0.88), BUFF_DARK = mat('#a8946f', 0.9);
export const EARTH = surface(mat('#b9a47c', 0.95), 'ground');
const ALGAE = surface(mat('#3f5a2a', 0.1, 0, { envMapIntensity: 1 }), 'water');
ALGAE.userData.wave = [0.8, 0.3, 0.03];
ALGAE.userData.reflect = false;

// The well is cut into the ground: the land round it is modelled as raised blocks whose top is
// ground level (y = D), and the pit goes down thirteen storeys of TIER each to its floor at y = 0.
// S is the well's side at the rim; each storey steps in by RUN on the three stepped sides. North
// is -z: the pavilion side, which steps down in three great blocks (their south faces at ZA, ZB
// and ZC, their tops at ground level, four storeys down and eight storeys down) before the last
// five storeys close round the pool.
export const TIER = 1.8, TIERS = 13, D = TIER * TIERS, S = 35, RUN = 1.15, ZA = -13, ZB = -10, ZC = -8;
// One of the double flights that make the diamonds: a little stepped pyramid 4.1 m wide and a
// storey high standing against the wall of its terrace, six steps up from each side to a landing.
const PITCH = 4.2;
function flightGeo() {
  const n = detail.low ? 3 : 6, rise = TIER / n, parts = [];
  for (let j = 0; j < n; j++) parts.push(new THREE.BoxGeometry(0.5 + 2 * (3.6 / (2 * n)) * (n - j), rise, 0.55).translate(0, (j + 0.5) * rise, 0.275));
  return mergeGeometries(parts);
}
// Where the flights stand along a wall `len` long: side by side, alternate storeys shifted half a
// flight, so that each flight stands over the gap between two below.
function spots(len, k) {
  const out = [];
  for (let i = -12; i <= 12; i++) { const c = (i + (k % 2 ? 0 : 0.5)) * PITCH; if (Math.abs(c) + PITCH / 2 <= len / 2 + 0.05) out.push(c); }
  return out;
}

export function buildChandBaori() {
  const g = new THREE.Group(), f = new THREE.Group(), h = S / 2, G = 260;
  g.add(f);
  // The land, and the stone lining of the rim with its kerb.
  g.add(box(2 * G, D, G - h - 1, EARTH, 0, 0, -(G + h + 1) / 2), box(2 * G, D, G - h - 1, EARTH, 0, 0, (G + h + 1) / 2));
  for (const s of [-1, 1]) {
    g.add(box(G - h - 1, D, S + 2, EARTH, s * (G + h + 1) / 2, 0, 0));
    f.add(box(1, D + 0.15, S + 2, STONE, s * (h + 0.5), 0, 0), box(S, D + 0.15, 1, STONE, 0, 0, s * (h + 0.5)));
  }
  // The terraces. Storey k's terrace is the ring between k - 1 and k steps in from the rim, its top
  // k storeys down: a strip down the west and the east side and one along the south, and for the
  // last five storeys one along the north too, below the pavilions.
  const flights = [];
  for (let k = 1; k <= TIERS; k++) {
    const y = D - k * TIER, o = (k - 1) * RUN, i = k * RUN;
    const zn = k < 4 ? ZA : k < 8 ? ZB : k === 8 ? ZC : ZC + (k - 9) * RUN, zs = h - o;
    for (const s of [-1, 1]) {
      f.add(box(RUN, y, zs - zn, STONE, s * (h - o - RUN / 2), 0, (zs + zn) / 2));
      for (const c of spots(zs - zn - 2 * RUN, k)) flights.push([s * (h - o), y, (zs + zn) / 2 + c, 1, 1, 1, -s * Math.PI / 2]);
    }
    f.add(box(S - 2 * i, y, RUN, STONE, 0, 0, h - o - RUN / 2));
    for (const c of spots(S - 2 * i, k)) flights.push([c, y, h - o, 1, 1, 1, Math.PI]);
    if (k >= 9) {
      f.add(box(S - 2 * i, y, RUN, STONE, 0, 0, zn + RUN / 2));
      for (const c of spots(S - 2 * i, k)) flights.push([c, y, zn, 1, 1, 1, 0]);
    }
  }
  f.add(inst(flightGeo(), flights, TREAD));
  // The pavilion side: three blocks stepping down towards the pool.
  f.add(box(S, D, ZA + h, BUFF, 0, 0, (ZA - h) / 2), box(S, D - 4 * TIER, ZB - ZA, BUFF, 0, 0, (ZA + ZB) / 2), box(S, D - 8 * TIER, ZC - ZB, STONE, 0, 0, (ZB + ZC) / 2));
  // The floor of the pool and its green water, a metre deep over the lowest steps.
  const pz0 = ZC + 5 * RUN, pz1 = h - TIERS * RUN, pw = S - 2 * TIERS * RUN;
  f.add(box(pw + 2 * RUN, 0.3, pz1 - pz0 + 2 * RUN, ALGAE, 0, 0.9, (pz0 + pz1) / 2));
  addDetails(f, g);
  // From the south-east corner of the rim, down into the well and across to the pavilions.
  return { group: g, focus: f, view: [0.42, 0.8, 0.7], zoom: 0.38, target: [0, 10, -3], minElevation: 0.4 };
}
