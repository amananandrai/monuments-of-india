import * as THREE from 'three';
import { mat, box, cyl, lathe, at, onFace, FACES, photo, guldasta } from '../helpers.js';
import { iwan, arcadeSkin, cellRow } from '../parts/mughal.js';
import { mergeByMaterial } from '../parts/components.js';
import { addDetails } from '../details/bara-gumbad.js';

// The grey quartzite rubble of the walls, plastered in places; the red sandstone of the frames and
// bands; the buff plaster of the mosque.
export const RUBBLE = photo(mat('#8c8578', 0.94), 'rubble');
export const RED = photo(mat('#a65b3f', 0.86), 'blocks');
export const PLASTER = mat('#cbbfa6', 0.9);
export const DOME = mat('#8f897c', 0.92);

// Bara Gumbad, Lodhi Gardens (1490): a square domed building 20 m on a side and 29 m high, on the
// east side of a raised court. Its walls stand about 12 m; each face has a projecting frame round a
// tall arch, with two storeys of smaller arched openings either side, in grey rubble trimmed in red
// sandstone. Slender turrets stand at the corners of the parapet; the dome, the first full dome in
// Delhi, rises on a drum. West of the court stands the mosque of 1494, five arched bays 27 m long
// under three small domes; opposite it, the guest house (mehman khana). Facing +z: the gumbad's
// east face, the way in from the garden.
export const P = 1.2, S = 20, WH = 13.2, MZ = -26;
export function buildBaraGumbad() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  // The raised court: the gumbad on its east side (z = 0), the mosque on its west (z = MZ), the
  // guest house along its north side.
  d.add(box(36, P, 46, RUBBLE, 0, 0, -14), box(36.4, 0.25, 46.4, RED, 0, P - 0.25, -14));
  // The square body, its band and parapet.
  const y0 = P;
  d.add(box(S, WH, S, RUBBLE, 0, y0, 0), box(S + 0.5, 0.45, S + 0.5, RED, 0, y0 + WH - 1.6), box(S + 0.2, 1.1, S + 0.2, RUBBLE, 0, y0 + WH));
  for (const a of FACES) {
    // The frame round the great arch, standing proud of the wall and above the parapet.
    d.add(onFace(box(9.6, WH + 1.9, 0.8, RUBBLE, 0, y0, 0.4), a, S / 2));
    d.add(onFace(at(iwan(5.2, 9.4, { m: RUBBLE, trim: RED, shade: PLASTER, depth: 1.4, frame: 1.8, top: 1.6, band: true, cells: false }), 0, y0 + 0.3, 0), a, S / 2 + 0.8));
    // Two storeys of smaller arches either side of it.
    for (const lat of [-6.9, 6.9]) for (const [y, w, h] of [[0.5, 2.6, 4.6], [6.4, 2.2, 3.8]]) {
      d.add(onFace(at(iwan(w, h, { m: RUBBLE, trim: RED, shade: PLASTER, depth: 0.5, frame: 0.35, top: 0.35, fill: y > 1 ? 'jali' : 'door', band: false, cells: false }), 0, y0 + y, 0), a, S / 2, lat));
    }
  }
  // The corner turrets and the parapet's merlon-topped corners.
  for (const x of [-1, 1]) for (const z of [-1, 1]) d.add(cyl(0.9, 1.05, WH + 1.1, RUBBLE, x * (S / 2 - 0.4), y0, z * (S / 2 - 0.4), 8), at(guldasta(3.2, 0.75, RED), x * (S / 2 - 0.4), y0 + WH + 1.1, z * (S / 2 - 0.4)));
  // The drum and the dome, slightly stilted, crowned by a lotus and a short finial.
  const dy = y0 + WH + 1.1;
  d.add(cyl(7.3, 7.5, 4, RUBBLE, 0, dy, 0, 40), cyl(7.7, 7.7, 0.4, RED, 0, dy + 4, 0, 40));
  const dome = [];
  for (let k = 0; k <= 18; k++) { const t = (k / 18) * Math.PI / 2; dome.push([7.3 * Math.cos(t), 8.1 * Math.sin(t)]); }
  d.add(at(lathe(dome, DOME, 48), 0, dy + 4.4, 0));
  d.add(at(lathe([[1.2, 0], [1.4, 0.3], [0.7, 0.8], [0.35, 1.0], [0.45, 1.4], [0.15, 2.0], [0, 2.6]], RED, 16), 0, dy + 12.4, 0));
  // The mosque: a hall 27.2 x 7.3, five arched bays facing east, three domes over the middle bays,
  // turrets at the corners.
  const mq = new THREE.Group(), MH = 7.6;
  mq.add(box(27.2, MH, 7.3, PLASTER, 0, 0, 0), box(27.6, 0.4, 7.7, RED, 0, MH - 0.9), box(27.4, 0.9, 7.5, PLASTER, 0, MH));
  mq.add(at(arcadeSkin(26.4, 6.4, cellRow(5, 5.2, 0, 3.6, 5.6), 0.7, PLASTER, { trim: RED, fill: 'room' }), 0, 0, 3.65));
  for (const x of [-5.2, 0, 5.2]) mq.add(cyl(2.3, 2.4, 1.2, PLASTER, x, MH + 0.9, 0, 24), at(lathe(dome.map(([r, y]) => [r * 0.32, y * 0.32]), PLASTER, 32), x, MH + 2.1, 0), cyl(0.12, 0.3, 1, RED, x, MH + 4.7, 0, 8));
  for (const x of [-13.4, 13.4]) for (const z of [-3.4, 3.4]) mq.add(cyl(0.7, 0.8, MH + 0.9, PLASTER, x, 0, z, 8), at(guldasta(2.4, 0.55, PLASTER), x, MH + 0.9, z));
  d.add(at(mq, 0, P, MZ));
  // The guest house along the north side of the court: a long low arcade.
  const gh = new THREE.Group();
  gh.add(box(24, 6, 6.4, PLASTER, 0, 0, 0), box(24.4, 0.5, 6.8, PLASTER, 0, 6), box(24.5, 0.3, 6.9, RED, 0, 5.2), at(arcadeSkin(23, 5, cellRow(5, 4.4, 0, 3, 4.2), 0.5, PLASTER, { trim: RED, fill: 'room' }), 0, 0, 3.2));
  d.add(at(gh, 14.5, P, -14).rotateY(-Math.PI / 2));
  f.add(mergeByMaterial(d));
  addDetails(f, g, { P, S, WH, MZ });
  // From the south-east, the gumbad's east face, the mosque's domes behind.
  return { group: g, focus: f, view: [0.75, 0.32, 1], zoom: 0.85 };
}
