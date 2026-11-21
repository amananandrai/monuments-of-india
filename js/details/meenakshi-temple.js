import * as THREE from 'three';
import { M, mat, box, at, onFace, FACES, inst, unitBox } from '../helpers.js';
import { mouldings, chhajja, columnTrim, mergeByMaterial } from './components.js';
import { haraRow } from './sculpture.js';
import { dravidaDress } from './temples.js';
import { trees, stalls, along, cityAround } from './realism.js';
import { detail } from '../detail.js';
import { rideElephant } from './animals.js';

// Meenakshi, finer architecture (desktops, inside the temple budget of js/detail.js; phones keep
// the plain masses). From photographs: the halls round the two shrines stand on moulded bases,
// ribbed with pilasters under a deep curved eave (kapota) and a parapet of miniature shrines; the
// Golden Lotus Tank is ringed by a pillared cloister; every pillar of the corridors and of the
// Thousand Pillar Hall has a moulded base, a capital and a bracket (pushpapodigai); and the outer
// walls are moulded at the foot and coped. Dimensions follow js/monuments/meenakshi-temple.js.
const Gr = M.granite;

// A kapota eave len long at (x, y, z), its lip facing angle a.
const eave = (len, x, y, z, a, dep = 1.2) => { const o = chhajja(len, dep, 0.45, 0.14, M.graniteDark); o.position.set(x, y, z); o.rotation.y = a; return o; };

// Bases, capitals and cross brackets for a list of square pillars [x, y, z, w, h, w].
function pillarTrim(d, list) {
  d.add(columnTrim(list, Gr, { capM: M.graniteDark }));
  const br = [];
  for (const [x, y, z, w, h] of list) {
    const yb = y + h - Math.min(0.6, h * 0.06) - 0.38;
    br.push([x, yb, z, w * 2.6, 0.32, w * 0.6], [x, yb, z, w * 0.6, 0.32, w * 2.6]);
  }
  d.add(inst(unitBox(), br, Gr));
}

// The Golden Lotus Tank (centred on x = -86, z = 10): a colonnade on the walk round the water,
// carrying a roof back to the cloister wall, with an eave over the steps.
function tankCloister(d) {
  const TX = -86, TZ = 10, WALK = 2, cols = [];
  for (const s of [-1, 1]) {
    for (let k = 0; k <= 16; k++) cols.push([TX + s * 18.4, WALK, TZ - 21.4 + k * (42.8 / 16), 0.6, 4.5, 0.6]);
    for (let k = 1; k < 14; k++) cols.push([TX - 18.4 + k * (36.8 / 14), WALK, TZ + s * 21.4, 0.6, 4.5, 0.6]);
    d.add(box(2.6, 0.45, 46, Gr, TX + s * 19.3, 6.5, TZ), box(36, 0.45, 2.3, Gr, TX, 6.5, TZ + s * 22.15));
    d.add(eave(46, TX + s * 18, 6.75, TZ, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0.9), eave(36, TX, 6.75, TZ + s * 21, s > 0 ? Math.PI : 0, 0.9));
  }
  d.add(inst(unitBox(), cols, Gr));
  pillarTrim(d, cols);
}

// The Thousand Pillar Hall (42 m square centred on x = 82, z = 84, its roof from 6.6 to 7.4): the
// pillars dressed, mouldings on its plinth, an eave and a parapet round its roof.
function thousandPillars(d) {
  const pil = [];
  for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) pil.push([66.5 + i * 2.8, 1, 68.5 + j * 2.8, 0.7, 5.6, 0.7]);
  pillarTrim(d, pil);
  const g = new THREE.Group();
  g.add(mouldings(42, 42, [[0.1, 0.3, 0.15], [0.55, 0.3, 0.2]], Gr));
  for (const a of FACES) {
    g.add(onFace(at(chhajja(42.8, 1.3, 0.5, 0.15, M.graniteDark), 0, 7.2, 0), a, 21));
    g.add(onFace(at(haraRow(39.4, 1.1, M.stucco), 0, 7.4, 0), a, 20.3));
  }
  d.add(at(g, 82, 0, 84));
}

// The corridors (prakaram) inside the outer wall: their pillars dressed, an eave on the court side.
function corridors(d) {
  const cor = [];
  for (const s of [-1, 1]) {
    for (const [a, b] of [[-114, -16], [16, 114]]) {
      for (let x = a + 1; x < b; x += 4) cor.push([x, 0, s * 118.6, 0.8, 7, 0.8], [x, 0, s * 123.8, 0.8, 7, 0.8]);
      d.add(eave(b - a, (a + b) / 2, 7.6, s * 118, s > 0 ? Math.PI : 0));
    }
    for (const [a, b] of [[-118, -16], [16, 118]]) {
      for (let z = a + 1; z < b; z += 4) cor.push([s * 108.6, 0, z, 0.8, 7, 0.8], [s * 113.8, 0, z, 0.8, 7, 0.8]);
      d.add(eave(b - a, s * 108, 7.6, (a + b) / 2, s > 0 ? -Math.PI / 2 : Math.PI / 2));
    }
  }
  pillarTrim(d, cor);
}

// Base mouldings on the outer face and a coping along the top of the outer and inner walls.
function walls(d) {
  for (const [len, dist, H, T, gap] of [[242, 130, 8, 2.5, 29], [260, 120, 8, 2.5, 29], [112, 62, 7, 2, 17], [124, 55, 7, 2, 17]]) {
    for (const a of len === 242 || len === 112 ? [0, Math.PI] : [Math.PI / 2, -Math.PI / 2]) for (const s of [-1, 1]) {
      const l = (len - gap) / 2, lat = s * (gap / 2 + l / 2);
      d.add(onFace(new THREE.Group().add(box(l, 0.5, 0.25, Gr, 0, 0, 0.12), box(l, 0.25, 0.15, Gr, 0, 0.75, 0.07)), a, dist + T / 2, lat));
      d.add(onFace(new THREE.Group().add(box(l, 0.4, T + 0.5, M.graniteDark, 0, H, 0)), a, dist, lat));
    }
  }
}

function architecture(f) {
  const d = new THREE.Group();
  // The halls round the two shrines (js/monuments: 44 × 32 and 34 × 40, 7 high).
  d.add(at(dravidaDress(44, 32, 7, Gr, { eaveM: M.graniteDark, haraM: M.stucco }), 22, 0, 30));
  d.add(at(dravidaDress(34, 40, 7, Gr, { eaveM: M.graniteDark, haraM: M.stucco }), -22, 0, -28));
  tankCloister(d);
  thousandPillars(d);
  corridors(d);
  walls(d);
  f.add(mergeByMaterial(d));
}

// The Meenakshi Amman temple at Madurai: the temple elephant, flower and pooja stalls outside the
// gopurams, and coconut palms in the streets round the walls.
export function addDetails(f, g) {
  if (!detail.low) architecture(f);
  const tusker = rideElephant(mat('#5e5650', 0.9), 0.9, { cloth: '#b3262e', howdah: false });
  tusker.position.set(-20, 0, 70);
  tusker.rotation.y = 0.4;
  g.add(tusker);
  const st = [];
  for (const [x0, z0, x1, z1, ry] of [[-12, 134, -12, 150, Math.PI / 2], [12, 134, 12, 150, -Math.PI / 2], [124, -12, 140, -12, 0], [124, 12, 140, 12, Math.PI]]) st.push(...along(5, [x0, z0], [x1, z1]).map(([x, z]) => [x, z, ry]));
  g.add(stalls(st));
  g.add(trees([...along(10, [-130, -140], [130, -140]), ...along(10, [-135, -130], [-135, 130])], { kind: 'palm', seed: 6 }));
  // Madurai is laid out round the temple: the Chithirai streets run outside its walls, then rings of
  // houses along the Avani Moola and Masi streets, the four axial streets leading out from the
  // gopurams kept open. Plain houses, two rows on desktops, and on phones one row with every other
  // plot built: the budget goes to the temple.
  g.add(cityAround([-122, 122, -132, 132], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, fine: false, gap: 24, seed: 91, paint: ['#efe2c4', '#e3c08f', '#d9a37a', '#cfe0d6', '#f1e6cf', '#e7b9b0', '#d6b06a'],
    keep: [[-16, 16, -400, 400], [-400, 400, -16, 16]] }));
}
