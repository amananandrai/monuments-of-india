import * as THREE from 'three';
import { M, box, cyl, at, onFace, FACES, sheet, chhatri } from '../helpers.js';
import { chhajja, bracketGeo, placeAll, alongFace, railing, jharokha, mergeByMaterial } from '../parts/components.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { steps } from '../parts/doorways.js';
import { elephant } from '../parts/animals.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE } from '../monuments/jahangir-mahal-orchha.js';

// Jahangir Mahal, finer detail. From photographs: deep eaves on brackets run round the outer walls
// over each storey of openings, bands of glazed tiles (now mostly lost) between them; balconies
// under curved Bengal roofs jut from the windows; a pierced balustrade links the domes along the
// roof's edge; the courtyard's galleries have eaves over every storey. Before the gateway a flight
// of steps rises between two stone elephants, each with a bell in its trunk. Dimensions follow
// js/monuments/jahangir-mahal-orchha.js: W square outside, a courtyard C square, H high on a plinth P.
function architecture(f, { W, C, H, P, top, cd }) {
  const S = STONE, d = new THREE.Group(), span = W - 12;
  for (const a of FACES) {
    for (const [y, dep] of [[P + 10.4, 1.4], [P + 16.6, 1.6]]) {
      d.add(onFace(at(chhajja(span, dep, 0.55, 0.12, S.shade), 0, y, 0), a, W / 2));
      d.add(placeAll(bracketGeo(0.7, 1.0, 0.24), alongFace(a, W / 2, span - 2, 16, y - 0.6), S.shade));
    }
    // The bands of glazed tile under each storey of openings.
    for (const [y, m] of [[P + 5.6, S.tile], [P + 10.9, S.tileBlue], [P + 17.3, S.tile]]) d.add(onFace(box(span, 0.35, 0.06, m, 0, y, 0), a, W / 2 + 0.02));
    // Balconies under Bengal roofs at four of the windows of each face.
    for (const lat of [-22.4, -11.2, 11.2, 22.4]) d.add(onFace(at(jharokha(2.4, 2.6, S.wall, { d: 1.2, roof: 'bangla', trim: S.light }), 0, P + 6.1, 0), a, W / 2, lat));
    // The balustrade along the roof's edge, between the towers and the middle pavilion.
    for (const s of [-1, 1]) d.add(onFace(at(railing(14, 1, 0.24, S.light, 1.6), 0, top, 0), a, W / 2 - 0.4, s * 17));
    // The courtyard's eaves.
    for (const y of [P + 4.8, P + 11, P + 17]) d.add(onFace(at(chhajja(C - 2, 1.1, 0.45, 0.1, S.shade), 0, y, 0), a + Math.PI, -(C / 2)));
  }
  // The tower bands: a string course at each storey.
  for (const x of [-1, 1]) for (const z of [-1, 1]) for (const y of [P + 5.6, P + 10.9, P + 17.3]) d.add(cyl(5.25, 5.25, 0.4, S.shade, x * (W / 2 - 1), y, z * (W / 2 - 1), 16));
  // The steps up to the gateway, between low walls.
  d.add(at(steps(9, P, 6, S.shade), 0, 0, W / 2 + 6), box(1, P, 3, S.light, -5, 0, W / 2 + 7.4), box(1, P, 3, S.light, 5, 0, W / 2 + 7.4));
  f.add(mergeByMaterial(d));
  // The two elephants, each on a pedestal at the foot of the steps, facing out.
  for (const s of [-1, 1]) {
    f.add(box(3.4, 1.2, 5, S.light, s * 7.6, 0, W / 2 + 9.5));
    const e = at(elephant(S.light, 0.75, { coarse: detail.low }), s * 7.6, 1.2, W / 2 + 9.5);
    f.add(e);
  }
}

// The ridge of Orchha above the Betwa: rocky ground, falling to the river to the north (-z).
function groundY(x, z) {
  return -smooth(-160, -240, z) * 9 + 6 * (fbm(x, z, { scale: 0.006, octaves: 4 }) - 0.5) * smooth(60, 160, Math.hypot(x, z)) - 0.05;
}

// Jahangir Mahal within Orchha Fort: the paved court, the fort's wall and bastions, the Raja Mahal
// beside it to the west, the Betwa river to the north, and the dry scrub and trees of Bundelkhand.
export function addDetails(f, g, dims) {
  architecture(f, dims);
  const { W, C, P } = dims, S = STONE;
  g.add(heightField(1400, 1400, detail.low ? 100 : 160, groundY, { rock: ['#8a7a62', '#9b8a6e'], cover: '#8f8a5a', steep: 0.8 }));
  g.add(sheet(1400, 260, M.river, 0, -7, -400));
  g.add(box(W + 40, 0.3, W + 40, M.path, 0, -0.1, 0));
  // The courtyard: paving with a square lawn and a small pool in the middle.
  g.add(box(14, 0.12, 14, M.grass, 0, P, 0), box(4.4, 0.3, 4.4, S.light, 0, P, 0), sheet(3.6, 3.6, M.water, 0, P + 0.31, 0));
  // The Raja Mahal: a tall plain block with chhatris on its roof, west of the palace.
  const rm = new THREE.Group();
  rm.add(box(60, 24, 44, S.wall, -105, 0, -10), box(61, 0.6, 45, S.shade, -105, 24, -10));
  for (const x of [-128, -82]) for (const z of [-28, 8]) rm.add(at(chhatri(2.6, 7, S.light), x, 24.6, z));
  rm.add(onFace(at(arcadeSkin(60, 24, cellRow(8, 6.5, 10, 2.6, 4), 0.8, S.wall, { trim: S.light, fill: 'jali' }), 0, 0, 0), 0, 0).translateX(-105).translateZ(12));
  // The fort's wall and bastions along the south and east.
  for (const [x, z, w, dd] of [[0, 150, 300, 3], [150, 40, 3, 220]]) rm.add(box(w, 8, dd, S.shade, x, 0, z));
  for (const [x, z] of [[-150, 150], [-60, 150], [40, 150], [150, 150], [150, 60], [150, -40]]) rm.add(cyl(5, 5.6, 10, S.shade, x, 0, z, 12));
  g.add(mergeByMaterial(rm));
  const clear = ([x, z]) => (Math.abs(x) > W / 2 + 24 || Math.abs(z) > W / 2 + 24) && !(x < -60 && x > -150 && z > -50 && z < 30);
  g.add(trees(scatter(60, [-320, 320, -220, 320], { seed: 5, gap: 18 }).filter(clear), { kind: 'tamarind', seed: 4 }));
  g.add(trees(scatter(40, [-300, 300, -200, 300], { seed: 15, gap: 20 }).filter(clear), { kind: 'neem', seed: 9 }));
  g.add(shrubs(along(12, [-30, W / 2 + 18], [30, W / 2 + 18]).map(([x, z]) => [x, z, 1]), { seed: 3, dry: true }));
  g.add(asiBoard('Jahangir Mahal', 14, W / 2 + 16, 0));
}
