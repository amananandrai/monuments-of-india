import * as THREE from 'three';
import { M, box, cyl, at, sheet, chhatri, inst, unitBox, rng } from '../helpers.js';
import { arcadeSkin } from '../parts/mughal.js';
import { mergeByMaterial } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { trees, lampPosts, scatter, traffic, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { GILT, SAFFRON } from '../parts/sikh.js';

// A line of raised Gurmukhi len long and h high on a wall at z = 0, its foot at y = 0: the headline
// the letters hang from, and under it the letters as blocks of uneven width in words.
function gurmukhi(len, h, m, seed = 7) {
  const R = rng(seed), list = [[0, h * 0.86, 0, len, h * 0.14, 0.05]];
  for (let x = -len / 2 + 0.05; x < len / 2 - h * 0.5;) {
    const w = h * (0.35 + R() * 0.3);
    list.push([x + w / 2, R() < 0.25 ? -h * 0.15 : 0, 0, w, h, 0.04]);
    x += w + h * (R() < 0.2 ? 0.5 : 0.14);
  }
  return inst(unitBox(), list, m);
}

// Bangla Sahib in Lutyens' Delhi: the marble forecourt and its gilded Nishan Sahib, the sarovar to
// the west (-x) inside a marble walk with arcaded ranges round it, lawns and trees, Baba Kharak
// Singh Marg in front (+z) and the city beyond. The hall is w × d on its plinth, centred at z = bz;
// the entrance block's front is at z = fz and its cornice TH above the plinth (js/monuments).
export function addDetails(f, g, { P, bz, TH, fz }) {
  // The gold lettering of the red board over the entrance.
  f.add(at(gurmukhi(8.8, 0.8, GILT), 0, P + TH + 1.2, fz + 1.02));
  const sx = -84, PW = 69, PD = 72, Z = PD / 2 + 12;
  g.add(box(600, 0.2, 600, M.grass, 0, -0.2, 0), box(36 - (sx + PW / 2), 0.25, 2 * Z, M.marble, (36 + sx + PW / 2) / 2, 0, 0), box(14, 0.25, 2 * Z, M.marble, sx - PW / 2 - 7, 0, 0));
  for (const z of [-1, 1]) g.add(box(PW, 0.25, 12, M.marble, sx, 0, z * (PD / 2 + 6)));
  const NX = -40, NZ = 26;
  // The Nishan Sahib here is cased in gilt, on a tall marble plinth.
  g.add(box(2.4, 2.2, 2.4, M.marble, NX, 0.25, NZ), cyl(0.3, 0.45, 38, GILT, NX, 2.45, NZ, 12));
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3), SAFFRON);
  cl.position.set(NX, 39, NZ + 3.4); cl.rotation.y = Math.PI / 2; g.add(cl, box(0.1, 1, 1, GILT, NX, 40.4, NZ));
  // The sarovar: a pool of 225 × 235 ft (69 × 72 m), steps down at the sides, inside a marble walk,
  // two storeys of arches round it on three sides.
  const T = new THREE.Group();
  T.add(sheet(PW, PD, M.lake, sx, 0.05, 0));
  for (const s of [-1, 1]) T.add(box(PW + 2, 1.2, 1, M.marbleShade, sx, -0.95, s * (PD / 2 + 0.5)), box(1, 1.2, PD + 2, M.marbleShade, sx + s * (PW / 2 + 0.5), -0.95, 0));
  for (const s of [-1, 1]) T.add(at(steps(16, 0.25, 3, M.marble), sx, 0, s * PD / 2).rotateY(s > 0 ? Math.PI : 0));
  T.add(at(steps(30, 0.25, 3, M.marble), sx + PW / 2, 0, bz).rotateY(-Math.PI / 2));
  const range = (len, x, z, ry) => {
    const n = Math.floor(len / 4.6), cells = [];
    for (let k = 0; k < n; k++) { const cx = -len / 2 + (k + 0.5) * (len / n); cells.push([cx, 0.4, 2.8, 3.8, 'room'], [cx, 5.2, 2.4, 3, 'jali']); }
    const r = new THREE.Group();
    r.add(box(len, 9, 6, M.marble, 0, 0, -3.6), arcadeSkin(len, 9, cells, 0.6, M.marble, { trim: M.marbleShade }), box(len, 0.5, 1, M.marble, 0, 9, 0));
    for (let k = 0; k < Math.floor(len / 20); k++) r.add(at(chhatri(1, 3.2, M.marble, GILT), -len / 2 + 10 + k * 20, 9.5, -1));
    T.add(at(mergeByMaterial(r), x, 0.25, z).rotateY(ry));
  };
  range(PW + 34, sx - 3, -Z, 0);
  range(PW + 34, sx - 3, Z, Math.PI);
  range(2 * Z - 14, sx - PW / 2 - 14, 0, Math.PI / 2);
  g.add(T);
  g.add(lampPosts([[-16, 32], [16, 32], [-44, -30], [-44, 30], [-124, -30], [-124, 30], [-84, -41], [-84, 41]], { y: 0.25 }));
  // Lawns with trees round the complex; the road in front; Delhi beyond.
  g.add(trees(scatter(40, [-200, 200, -200, 200], { seed: 5, gap: 14, avoid: [[-144, 38, -64, 60], [-300, 300, 50, 80]] }), { kind: 'neem', seed: 5 }));
  g.add(trees([[33, -12], [33, 8], [-24, 44], [-60, 46]], { kind: 'ashoka', seed: 9, y: 0.25 }));
  g.add(box(600, 0.06, 18, M.asphalt, 0, -0.02, 65));
  g.add(traffic([[59, 1], [62.5, 1], [67.5, -1], [71, -1]], -280, 280, { gap: 18, seed: 4, buses: 0.08 }));
  g.add(cityAround([-180, 180, -150, 150], { rows: detail.low ? 1 : 2, every: detail.low ? 3 : 1, fine: false, gap: 50, storeys: [3, 6], seed: 52 }));
}
