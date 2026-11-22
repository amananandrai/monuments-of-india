import * as THREE from 'three';
import { M, mat, mesh, box, at, sheet, rng, inst, unitBox, pidaRoof, kalash } from '../helpers.js';
import { gopuram, wallWithGaps, dravidaVimana } from '../parts/temples.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { clusterPillar } from '../parts/sculpture.js';
import { heightField, fbm } from '../parts/terrain.js';
import { addDetails } from '../details/virupaksha-temple-hampi.js';
import { detail } from '../detail.js';

const GRANITE = mat('#a58d6e', 0.9);
const GRANITE_DARK = mat('#7d6a53', 0.9);
const STUCCO = mat('#eadfc6', 0.85);
const BOULDER = mat('#9c7b5c', 0.95, 0, { flatShading: true });
const EARTH = mat('#b9a17c', 0.95);
// The gopurams' stucco is limewashed a pale cream all over, not painted in colours as in the
// Tamil country: the figures and cornices take shades of the one colour.
const CREAM = ['#eadfc6', '#e2d3b2', '#f1e8d2', '#d9c9a6', '#e6d8b8'];

// The layout (js/details/virupaksha-temple-hampi.js repeats it). The temple faces east, here +z:
// the east gopuram stands at z = 0 and the courts run back to z = -170 between walls at x = ±32;
// north is +x (the tank, then the Tungabhadra), south is -x (Hemakuta hill).
const W = 32, L = 170, MID = -75;

// Hemakuta: a long whaleback of bare granite south of the temple, rising some 34 m. Its height at (x, z).
export const hemakuta = (x, z) => {
  const k = 1 - ((x + 150) / 114) ** 2 - ((z + 70) / 165) ** 2;
  return k > 0 ? 34 * Math.pow(k, 0.7) * (0.82 + 0.22 * fbm(x, z, { scale: 0.02, octaves: 3 })) - 0.3 : -0.3;
};

// A flat-roofed hall of plain square granite pillars, w × d, its pillars h high, on a low plinth.
function plainHall(w, d, h, step = 3) {
  const g = new THREE.Group(), p = [];
  for (let x = -w / 2 + 1; x <= w / 2 - 0.9; x += (w - 2) / Math.round((w - 2) / step)) for (let z = -d / 2 + 1; z <= d / 2 - 0.9; z += (d - 2) / Math.round((d - 2) / step)) p.push([x, 0.8, z, 0.6, h, 0.6]);
  g.add(box(w, 0.8, d, GRANITE_DARK), inst(unitBox(), p, GRANITE), box(w + 0.8, 0.7, d + 0.8, GRANITE, 0, 0.8 + h, 0));
  return g;
}

export function buildVirupaksha() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(27);
  g.add(f);
  g.add(box(470, 0.25, 760, EARTH, 40, 0, 60), sheet(130, 1200, M.river, 262, 0.14, 0));
  // Hemakuta hill, and boulders heaped on it, round its foot and on the far hills.
  g.add(heightField(240, 340, detail.low ? 40 : 70, hemakuta, { cx: -150, cz: -70, rock: ['#a98a68', '#9c7b5c', '#b39672'], cover: '#a58d6e', steep: 0.9, band: 9 }));
  const rocks = [];
  for (let i = 0; i < 34; i++) { const x = -60 - R() * 180, z = -210 + R() * 280; rocks.push([x, z, 2 + R() * 4.5, hemakuta(x, z)]); }
  for (let i = 0; i < 26; i++) { const a = R() * Math.PI * 2, d = 250 + R() * 110; rocks.push([40 + Math.cos(a) * d * 0.8, -40 + Math.sin(a) * d * 1.3, 7 + R() * 12, 0]); }
  for (const [x, z, r, y] of rocks) {
    if (x > 190 && Math.abs(z) < 420) continue;
    const b = mesh(new THREE.IcosahedronGeometry(r, 1), BOULDER, x, y + r * 0.5, z);
    b.scale.y = 0.75;
    g.add(b);
  }

  // The walls of the two courts, open where the gopurams stand.
  f.add(wallWithGaps('x', 2 * W + 2, 6, 2, GRANITE, [[0, 24]], 0, 0), wallWithGaps('x', 2 * W + 2, 6, 2, GRANITE, [], 0, -L));
  f.add(wallWithGaps('x', 2 * W, 5.5, 1.6, GRANITE, [[0, 15]], 0, MID));
  f.add(wallWithGaps('z', L, 6, 2, GRANITE, [[-120, 14]], W, -L / 2), wallWithGaps('z', L, 6, 2, GRANITE, [], -W, -L / 2));
  // The east gopuram: nine storeys of cream stucco over two of granite, about 50 m, tapering
  // steeply. Krishnadevaraya's gopuram of three storeys (1510) between the courts, and the
  // Kanakagiri gopuram of five in the north wall, towards the tank and the river.
  const lite = detail.low ? { pitch: 2.4, kuduEvery: 3, cheap: true } : { pitch: 1.5, kuduEvery: 1 };
  f.add(gopuram(22, 15, 48.2, 9, 3, CREAM, lite));
  f.add(at(gopuram(13, 9, 17, 3, 5, CREAM, lite), 0, 0, MID));
  f.add(at(gopuram(12, 8, 22, 5, 7, CREAM, lite), W, 0, -120).rotateY(Math.PI / 2));

  // The inner court. The ranga mandapa (1510): an open hall of composite pillars, five bays by
  // six, on a moulded plinth; behind it the closed hall and the sanctum under its small vimana.
  const ranga = at(new THREE.Group(), 0, 0, -108), pil = new THREE.Group(), cp = clusterPillar(5, GRANITE, { low: detail.low });
  ranga.add(box(20, 1.4, 22, GRANITE_DARK));
  for (let i = 0; i < 6; i++) for (let j = 0; j < 7; j++) pil.add(at(cp.clone(), -8.5 + i * 3.4, 1.4, -9.6 + j * 3.2));
  ranga.add(mergeByMaterial(pil), box(21.4, 0.9, 23.4, GRANITE_DARK, 0, 6.4, 0), box(20, 0.7, 22, GRANITE, 0, 7.3, 0));
  f.add(ranga, at(steps(6, 1.4, 5, GRANITE_DARK), 0, 0, -97));
  f.add(box(15, 6.6, 15.96, GRANITE, 0, 0, -127), box(10.5, 7.2, 10.5, GRANITE, 0, 0, -140.2));
  f.add(at(dravidaVimana(9.4, 3, 2.3, STUCCO, STUCCO, { kalashM: M.gild }), 0, 7.2, -140.2));
  f.add(at(templeDoorway(1.6, 3.2, { m: GRANITE, open: 0.9 }), 0, 1.4, -119));
  // The shrines of Pampa and Bhuvaneshwari north of the sanctum, each under a small tower.
  for (const z of [-134, -148]) f.add(box(7, 5, 8, GRANITE, 21, 0, z), at(dravidaVimana(5, 2, 1.5, STUCCO, STUCCO, { kalashM: M.gild }), 21, 5, z));
  // The cloister round the inner court: two rows of pillars under a flat roof against the walls.
  const cl = [], roofs = [];
  for (const s of [-1, 1]) {
    for (let z = MID - 3; z > -L + 3; z -= 3.2) if (!(s > 0 && Math.abs(z + 120) < 7 || s > 0 && z < -128)) cl.push([s * 26, 0.5, z, 0.55, 4.2, 0.55]);
    roofs.push(...(s > 0 ? [[28.5, 4.7, -94.5, 6.2, 0.6, 36]] : [[-28.5, 4.7, -122.5, 6.2, 0.6, 92]]));
  }
  for (let x = -24; x <= 14; x += 3.2) cl.push([x, 0.5, -L + 6, 0.55, 4.2, 0.55]);
  roofs.push([-8, 4.7, -L + 3.9, 47, 0.6, 6.2]);
  f.add(inst(unitBox(), cl, GRANITE), inst(unitBox(), roofs, GRANITE_DARK));
  f.add(box(6.2, 0.5, 36, GRANITE_DARK, 28.5, 0, -94.5), box(6.2, 0.5, 92, GRANITE_DARK, -28.5, 0, -122.5), box(47, 0.5, 6.2, GRANITE_DARK, -8, 0, -L + 3.9));

  // The outer court: the hundred-pillared hall on the south side, the kitchen range on the north.
  f.add(at(plainHall(20, 30, 4.6), -19, 0, -44), box(12, 5.2, 36, GRANITE, 23, 0, -42));

  // Hampi Bazaar: the street running 700 m east from the gate, some 30 m wide, between long
  // colonnades of rough granite posts and beams, in places of two storeys (260 m of it here).
  const post = [], beam = [];
  for (const s of [-1, 1]) {
    for (let z = 24; z < 284; z += 3.1) {
      const two = (z > 60 && z < 110) || (s > 0 && z > 170 && z < 215);
      for (const x of [18, 23.4]) post.push([s * x, 0.5, z, 0.5, two ? 6.6 : 3.2, 0.5]);
    }
    beam.push([s * 20.7, 0, 153.5, 7, 0.5, 262], [s * 20.7, 3.7, 153.5, 7.4, 0.45, 262], [s * 20.7, 7.1, 85, 7.4, 0.45, 51.5]);
    if (s > 0) beam.push([20.7, 7.1, 192.5, 7.4, 0.45, 46.5]);
  }
  g.add(inst(unitBox(), post, GRANITE), inst(unitBox(), beam, GRANITE_DARK));

  // The Manmatha tank outside the north gopuram: steps down to the water on all four sides, set
  // in a stone embankment.
  const TX = 62, TZ = -120, tank = new THREE.Group();
  for (let k = 0; k < 6; k++) {
    const ox = 44 - k * 2, oz = 56 - k * 2, h = 1.8 - k * 0.27;
    for (const s of [-1, 1]) tank.add(box(ox, h, 1.02, GRANITE, TX, 0, TZ + s * (oz / 2 - 0.5)), box(1.02, h, oz - 2, GRANITE, TX + s * (ox / 2 - 0.5), 0, TZ));
  }
  g.add(mergeByMaterial(tank), sheet(32, 44, M.water, TX, 0.32, TZ));

  // On Hemakuta, the early shrines: small granite temples under stepped pyramid roofs, singly and
  // in threes sharing a hall.
  const hk = new THREE.Group();
  for (const [x, z, n, ry] of [[-84, -18, 3, 0.3], [-104, -62, 1, 0.1], [-92, -104, 3, -0.2], [-128, -30, 1, 0.5], [-70, -64, 1, 0]]) {
    const t = at(new THREE.Group(), x, hemakuta(x, z) - 0.4, z);
    t.rotation.y = ry;
    t.add(box(n === 3 ? 15 : 7, 0.8, 11, GRANITE_DARK), box(6, 3.6, 6, GRANITE, 0, 0.8, 2.2));
    for (const [sx, sz] of n === 3 ? [[-4.6, 2.2], [4.6, 2.2], [0, -2.4]] : [[0, -2.2]]) {
      const r = pidaRoof(4.4, 1.4, 5, 0.42, GRANITE, GRANITE_DARK);
      t.add(box(4.6, 3.8, 4.6, GRANITE, sx, 0.8, sz), at(r, sx, 4.6, sz), at(kalash(0.7, GRANITE), sx, 4.6 + r.userData.top, sz));
    }
    hk.add(t);
  }
  g.add(mergeByMaterial(hk));

  addDetails(f, g);
  // From Hemakuta hill, as the temple is most often photographed: the east gopuram over the
  // courts, the river behind.
  return { group: g, focus: f, view: [-0.85, 0.25, 0.7], zoom: 0.55, target: [0, 20, -40] };
}
