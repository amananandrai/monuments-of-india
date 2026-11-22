import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, archPanel, sheet, rng, inst, unitBox } from '../helpers.js';
import { archRing, star, inlayBorder, merlons, chhajja, jharokha, mergeByMaterial } from '../parts/components.js';
import { iwan, arcadeSkin, cellRow } from '../parts/mughal.js';
import { towerDetail } from '../parts/forts.js';
import { trees, shrubs, lampPosts, benches, asiBoard, scatter, along, boats } from '../parts/realism.js';
import { detail } from '../detail.js';
import { A, B, GATES, RED, BUFF, MARBLE, RUBBLE, MOSQUE, MW, MD, MH, SHER } from '../monuments/purana-qila.js';

// Purana Qila, finer detail. From photographs of the Bara Darwaza: the red sandstone of the gate is
// framed in bands of white marble, inlaid with stars in the spandrels of its great arch; either side
// of the arch the face is opened in two storeys of arched niches, under a jharokha over the arch
// and a crest of merlons; the rubble bastions are banded and slit. The Qila-i-Kuhna mosque's front
// is five arches in marble frames, the middle one a tall iwan; the Sher Mandal's eight faces each
// hold an arch on both storeys. Dimensions follow js/monuments/purana-qila.js.
function gateDress(w, h, d, { iw, ih, br, bh, big }) {
  const g = new THREE.Group(), z = d / 2;
  g.add(at(inlayBorder(iw + 3, ih + 2.2, 0.55, MARBLE, M.stoneDark), 0, -0.55, z + 0.01));
  for (const s of [-1, 1]) g.add(at(star(6, 0.9, MARBLE), s * (iw / 2 + 0.2), ih - 1.6, z + 0.06));
  // Two storeys of arched niches either side of the great arch.
  const span = w / 2 - iw / 2 - 1.7, n = big ? 2 : 1;
  for (const s of [-1, 1]) for (let k = 0; k < n; k++) for (const y of [2.2, ih * 0.62]) {
    const x = s * (iw / 2 + 1.7 + (k + 0.5) * (span / n));
    g.add(at(archPanel(2.2, 4.2, true, M.recess, 0.06), x, y, z), at(archRing(2.2, 4.2, true, 0.22, 0.08, MARBLE), x, y, z + 0.02));
  }
  if (big) g.add(at(jharokha(3.2, 2.8, RED, { d: 1.4, trim: MARBLE, roofM: MARBLE }), 0, ih + 0.9, z));
  g.add(at(merlons(w - 0.6, 1, 1.3, 0.5, RED, 0.35), 0, h, z - 0.3), box(w + 0.2, 0.5, 0.3, MARBLE, 0, h - 1.2, z + 0.12));
  for (const s of [-1, 1]) g.add(at(towerDetail(br * 1.12, br, bh, RUBBLE, RED, { n: 9, courses: [0.4, 0.75], slits: [0.25, 0.58, 0.88], seg: 24 }), s * (w / 2 + br * 0.55), 0, z - br * 0.75));
  return g;
}

function architecture(f) {
  const d = new THREE.Group();
  GATES.forEach(([x, z, a], i) => {
    const big = i === 0, gd = big ? gateDress(30, 21, 18, { iw: 9, ih: 15, br: 8.5, bh: 23, big }) : gateDress(22, 18, 14, { iw: 7.5, ih: 13, br: 7, bh: 20, big });
    gd.position.set(x, 0, z);
    gd.rotation.y = a;
    d.add(gd);
  });
  // The mosque's front (facing -z in the world, +z in its own frame before it is turned): a tall
  // iwan in the middle and two arches either side, each in a marble frame; a chhajja over them.
  const mq = new THREE.Group(), fz = MD / 2;
  mq.add(at(iwan(6.5, 12.5, { m: RED, trim: MARBLE, shade: RED, depth: 2.2, frame: 2.2, top: 2.5, rosettes: true }), 0, 1.2, fz + 0.8));
  for (const x of [-18, -10, 10, 18]) {
    mq.add(at(iwan(5, 8.5, { m: RED, trim: MARBLE, shade: RED, depth: 1.2, frame: 1.2, top: 1.6, cells: false }), x, 1.2, fz));
    mq.add(at(inlayBorder(7.6, 10.4, 0.4, MARBLE, M.stoneDark), x, 1.0, fz + 1.21));
  }
  mq.add(at(chhajja(MW, 1.2, 0.4, 0.14, BUFF), 0, MH - 0.2, fz), at(merlons(MW - 1, 0.9, 1.2, 0.45, RED, 0.3), 0, MH + 1.7, fz - 0.3));
  mq.position.set(MOSQUE[0], 0, MOSQUE[1]);
  mq.rotation.y = Math.PI;
  d.add(mq);
  // The Sher Mandal: an arch on each face of both storeys (lower r 7.6, upper r 6.2).
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    for (const [r, y, aw, ah] of [[7.6, 2.4, 3, 5.4], [6.2, 10.4, 2.4, 3.8]]) {
      const ap = r * Math.cos(Math.PI / 8);
      d.add(onFace(at(archPanel(aw, ah, true, M.recess, 0.06), 0, y, 0), a, ap).translateX(SHER[0]).translateZ(SHER[1]));
      d.add(onFace(at(archRing(aw, ah, true, 0.2, 0.08, MARBLE), 0, y, 0), a, ap + 0.02).translateX(SHER[0]).translateZ(SHER[1]));
    }
  }
  f.add(mergeByMaterial(d));
}

// Purana Qila: lawns and paths inside the walls, the ASI's excavation trenches by the Sher
// Mandal, the boating lake that is left of the old moat along the east wall, neem and ashoka trees,
// the road to the Bara Darwaza, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  g.add(box(1400, 0.2, 1000, mat('#8a915c', 0.95), 0, -0.2, 0));
  // Inside: lawns, and paths from each gate to the middle.
  g.add(sheet(2 * A - 30, 2 * B - 30, M.grass, 0, 0.02, 0));
  g.add(box(6, 0.06, B, M.path, 0, 0.04, B / 2), box(2 * A - 20, 0.06, 6, M.path, 0, 0.04, 0));
  // The excavation: stepped trenches cut down through the mound's layers, beside the Sher Mandal.
  const tr = [], R = rng(3);
  for (let k = 0; k < 6; k++) tr.push([SHER[0] - 34 + (k % 3) * 12, -0.15, SHER[1] - 30 + Math.floor(k / 3) * 12, 9, 0.2, 9]);
  g.add(inst(unitBox(), tr, mat('#8a6f52', 0.95)));
  for (const [x, , z] of tr) g.add(box(9.6, 0.5, 0.4, BUFF, x, 0, z - 4.8), box(9.6, 0.5, 0.4, BUFF, x, 0, z + 4.8));
  // Outside: the lake along the east wall (-z), with paddle boats.
  g.add(sheet(2 * A, 70, M.lake, 0, 0.1, -B - 50), box(2 * A, 0.8, 2, BUFF, 0, -0.4, -B - 14), box(2 * A, 0.8, 2, BUFF, 0, -0.4, -B - 86));
  g.add(boats(scatter(8, [-200, 200, -B - 75, -B - 25], { seed: 4, gap: 14 }), { y: 0.1, size: 0.6, canopy: true }));
  // The approach to the Bara Darwaza: a paved forecourt and the road.
  g.add(box(46, 0.08, 40, M.path, 0, 0.02, B + 30), box(12, 0.06, 200, M.asphalt, 0, 0.02, B + 150));
  g.add(lampPosts([...along(6, [-9, B + 55], [-9, B + 200]), ...along(6, [9, B + 55], [9, B + 200])]));
  g.add(benches([[-16, B + 40, 0], [16, B + 40, 0]]));
  const inside = scatter(detail.low ? 50 : 90, [-A + 25, A - 25, -B + 25, B - 25], { seed: 5, gap: 14, avoid: [[MOSQUE[0] - 35, MOSQUE[0] + 35, MOSQUE[1] - 20, MOSQUE[1] + 22], [SHER[0] - 52, SHER[0] + 14, SHER[1] - 45, SHER[1] + 14], [-6, 6, 0, B], [-A, A, -6, 6]] });
  g.add(trees(inside.filter((_, i) => i % 2 === 0), { kind: 'neem', seed: 6 }), trees(inside.filter((_, i) => i % 2 === 1), { kind: 'peepal', seed: 7 }));
  const out = scatter(detail.low ? 120 : 260, [-600, 600, -480, 480], { seed: 8, gap: 12 }).filter(([x, z]) => Math.abs(x / (A + 30)) ** 2.5 + Math.abs(z / (B + 95)) ** 2.5 > 1 && !(Math.abs(x) < 30 && z > 0));
  g.add(trees(out.filter((_, i) => i % 3 !== 2), { kind: 'neem', seed: 9 }), trees(out.filter((_, i) => i % 3 === 2), { kind: 'ashoka', seed: 10 }));
  g.add(shrubs(scatter(40, [-A + 20, A - 20, -B + 20, B - 20], { seed: 11, gap: 8 }).map(([x, z]) => [x, z, 1.4 + R()]), { seed: 12 }));
  g.add(asiBoard('Purana Qila', 20, B + 48, -0.3));
}
