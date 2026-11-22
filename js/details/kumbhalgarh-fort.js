import * as THREE from 'three';
import { M, mat, box, cyl, at, chhatri, hemi, finial, kalash, sheet, rng } from '../helpers.js';
import { jharokha, chhajja, windowFrame, beltCourse, mergeByMaterial } from '../parts/components.js';
import { nagaraTemple, carvedPillar } from '../parts/temples.js';
import { towerDetail } from '../parts/forts.js';
import { trees, shrubs, asiBoard, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';
import { H, hill, loopR, GATE, STONE, TRIM } from '../monuments/kumbhalgarh-fort.js';

// The palace's lime-washed walls and the pale green of its window frames and doors.
const LIME = mat('#ece6d8', 0.85), LIME_SHADE = mat('#cfc6b3', 0.88), GREEN = mat('#7fae9c', 0.7);

// The lowest ground under a footprint w × d at (x, z): a building's base, so none floats.
const low = (x, z, w, d) => Math.min(hill(x, z), hill(x - w / 2, z - d / 2), hill(x + w / 2, z - d / 2), hill(x - w / 2, z + d / 2), hill(x + w / 2, z + d / 2));

// Kartargarh's summit, from photographs: Kumbha's palace, a plain range of the fort's own stone,
// stands on the peak's level top; over it rises the Badal Mahal of the 19th century, two lime-washed
// storeys with green-framed windows, jharokhas on its front and domed kiosks at its corners, so high
// it seems to stand in the clouds. Dimensions follow js/monuments/kumbhalgarh-fort.js: the top at H,
// R0 across.
function summit(f) {
  const d = new THREE.Group();
  // Kumbha's palace: two ranges round a small court, on the level top.
  d.add(box(44, 11, 14, STONE, 0, H, 6), box(14, 11, 30, STONE, -15, H, -8), box(46, 0.6, 16, TRIM, 0, H + 11, 6));
  for (let k = 0; k < 8; k++) d.add(at(windowFrame(1.3, 2.4, TRIM, { shape: 'pointed' }), -19.25 + k * 5.5, H + 5.5, 13.02));
  // The Badal Mahal: a lower storey and an upper storey stepped back, both under an eave.
  const by = H + 11.6;
  d.add(box(36, 7, 12, LIME, 2, by, 5), box(37, 0.4, 13, LIME_SHADE, 2, by + 7, 5), box(22, 6, 9, LIME, 4, by + 7.4, 4), box(23, 0.4, 10, LIME_SHADE, 4, by + 13.4, 4));
  d.add(at(chhajja(37, 1.2, 0.4, 0.14, LIME_SHADE), 2, by + 6.6, 11), at(chhajja(23, 1, 0.35, 0.12, LIME_SHADE), 4, by + 13, 8.5));
  for (let k = 0; k < 9; k++) d.add(at(windowFrame(1.2, 2.2, LIME_SHADE, { shape: 'pointed', back: GREEN }), -14 + k * 4, by + 2.2, 11.02));
  for (const x of [-9, 2, 13]) d.add(at(jharokha(2.6, 3, LIME, { d: 1.2, trim: LIME_SHADE }), x, by + 8.6, 8.52));
  for (const [x, z] of [[-16, 0], [20, 0], [-16, 10.4], [20, 10.4]]) d.add(at(chhatri(1.8, 4.6, LIME), x, by + 7.4, z));
  for (const [x, z] of [[-6, 0.4], [14, 0.4]]) d.add(at(chhatri(1.6, 4.2, LIME), x, by + 13.8, z));
  d.add(beltCourse(36, 12, by + 0.6, 0.35, 0.1, GREEN).translateX(2).translateZ(5));
  f.add(mergeByMaterial(d));
}

// The temples of the valley inside the walls (360 stand within them): Neelkanth Mahadev, a domed
// shrine ringed by pillars; the Vedi temple, three octagonal storeys under a dome, by the Hanuman
// Pol; and the Jain temples of Parsvanath and the Bawan Devi.
function temples(f) {
  const d = new THREE.Group();
  // Neelkanth Mahadev: a sanctum under a dome in a square colonnade of 24 pillars.
  {
    const x = -95, z = 105, y = low(x, z, 22, 22) - 1.5;
    d.add(box(22, 3, 22, TRIM, x, y, z), box(9, 6, 9, STONE, x, y + 3, z), at(hemi(4.8, LIME, 24), x, y + 9, z), at(kalash(1.2, M.gold), x, y + 13.6, z));
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) {
      const t = -8.75 + i * 3.5;
      d.add(at(carvedPillar(3.6, STONE), x + t, y + 3, z + s * 8.75), at(carvedPillar(3.6, STONE), x + s * 8.75, y + 3, z + t));
    }
    d.add(box(20, 0.5, 20, TRIM, x, y + 6.6, z), box(11, 0.5, 11, STONE, x, y + 8.5, z));
  }
  // The Vedi temple: three octagonal storeys on a terrace, each with an eave, under a dome.
  {
    const x = -150, z = 40, y = low(x, z, 18, 18) - 1;
    d.add(box(20, 3.5, 20, TRIM, x, y, z));
    let yy = y + 3.5;
    for (const [r, h] of [[7, 5], [5.6, 4.2], [4.2, 3.6]]) { d.add(cyl(r, r, h, STONE, x, yy, z, 8), cyl(r + 0.9, r + 0.5, 0.4, TRIM, x, yy + h, z, 8)); yy += h + 0.4; }
    d.add(at(hemi(3.8, STONE, 20), x, yy, z), at(finial(2, STONE), x, yy + 3.6, z));
  }
  f.add(mergeByMaterial(d));
  // The Jain temples, on desktops only: phones keep their triangles for the walls.
  if (!detail.low) for (const [x, z, w, h] of [[105, 75, 8, 17], [140, 20, 6, 12], [60, -120, 7, 14]]) f.add(at(nagaraTemple({ w, h, m: STONE, shade: TRIM, plinth: 2.5, urus: w > 7 ? 4 : 0, halls: [[w * 1.2, w * 0.8, 3]], apron: 3 }), x, low(x, z, w * 2, w * 3) - 1, z));
}

// Kumbhalgarh: the Ram Pol's towers banded and slit, the summit and the temples, a stepped tank in
// the valley, scrub forest of dhok and babul over the hills (the fort stands in a wildlife
// sanctuary), and the ASI board at the gate.
export function addDetails(f, g, { gy }) {
  summit(f);
  temples(f);
  for (const s of [-1, 1]) f.add(at(towerDetail(5.4, 5, 15, STONE, TRIM, { n: 8, courses: [0.45], slits: [0.3, 0.7] }), GATE[0] + s * 10.75, gy - 0.2, GATE[1] + 1.5));
  // The stepped tank (kund), its water at the level of its lowest rim.
  const [tx, tz] = [-40, 188], ty = Math.max(hill(tx, tz), hill(tx - 15, tz - 11), hill(tx + 15, tz + 11), hill(tx - 15, tz + 11), hill(tx + 15, tz - 11)) + 0.4;
  g.add(sheet(30, 22, M.lake, tx, ty - 1.4, tz), box(34, 3.5, 2, TRIM, tx, ty - 3.5, tz - 12), box(34, 3.5, 2, TRIM, tx, ty - 3.5, tz + 12), box(2, 3.5, 22, TRIM, tx - 16, ty - 3.5, tz), box(2, 3.5, 22, TRIM, tx + 16, ty - 3.5, tz));
  const R = rng(5), spots = scatter(detail.low ? 260 : 520, [-700, 700, -700, 700], { seed: 11, gap: 12 }).filter(([x, z]) => {
    const r = Math.hypot(x, z), d = r - loopR(Math.atan2(z, x));
    return r > 75 && Math.abs(d) > 12 && Math.hypot(x - GATE[0], z - GATE[1]) > 30 && !(Math.abs(x + 95) < 18 && Math.abs(z - 105) < 18) && !(Math.abs(x + 150) < 15 && Math.abs(z - 40) < 15) && !(Math.abs(x - tx) < 22 && Math.abs(z - tz) < 18) && ![[105, 75], [140, 20], [60, -120]].some(([px, pz]) => Math.hypot(x - px, z - pz) < 20) && !(Math.abs(x - 14) < 14 && z > 30 && z < 180);
  });
  const kinds = ['dhok', 'babul', 'dhok', 'khejri'];
  for (let k = 0; k < 4; k++) g.add(trees(spots.filter((_, i) => i % 4 === k && i < spots.length * 0.55).map(([x, z]) => [x, z, null, hill(x, z) - 0.2]), { kind: kinds[k], seed: 3 + k }));
  g.add(shrubs(spots.filter((_, i) => i >= spots.length * 0.55).map(([x, z]) => [x, z, 1.6 + R(), hill(x, z) - 0.3]), { dry: true, seed: 7 }));
  g.add(asiBoard('Kumbhalgarh Fort', GATE[0] + 12, GATE[1] + 16, 0.2, { y: hill(GATE[0] + 12, GATE[1] + 16), line2: 'HILL FORTS OF RAJASTHAN' }));
}
