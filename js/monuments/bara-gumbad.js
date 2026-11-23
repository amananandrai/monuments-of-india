import * as THREE from 'three';
import { mat, box, cyl, lathe, at, onFace, FACES, photo } from '../helpers.js';
import { iwan, arcadeSkin, cellRow } from '../parts/mughal.js';
import { mergeByMaterial } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { addDetails } from '../details/bara-gumbad.js';

// The grey quartzite, dressed on the gumbad and the mosque and laid as rubble in the platform and
// the guest house; the red sandstone of the frames and bands, and the black slate set against it;
// the old plaster of the blind arches and the stucco of the mosque; the weathered domes.
export const RUBBLE = photo(mat('#8c8578', 0.94), 'rubble');
export const ASHLAR = photo(mat('#a39c8e', 0.9), 'blocks');
export const RED = photo(mat('#a65b3f', 0.86), 'blocks');
export const BLACK = mat('#3d4046', 0.8);
export const PLASTER = mat('#cbbfa6', 0.9);
export const DOME = mat('#8f897c', 0.92);

// Bara Gumbad, Lodhi Gardens (1490): a square domed building 20 m on a side, its walls 12 m high,
// at the south end of a court raised 4 m above the garden. From photographs: each face has a tall
// frame standing forward and above the parapet, round a pointed arch with a doorway on brackets
// under a lintel and a window over it; either side, two storeys of two arched recesses in red
// frames, most of them blind. Small turrets stand at the corners; a sixteen-sided drum ringed with
// merlons carries the dome, the first full dome in Delhi, under a lotus cap. The court is some
// 30 m east to west and 25 m north to south: the mosque of 1494 closes its west side, five arched
// bays under three domes; the guest house (mehman khana) faces it from the east; a broad stair
// climbs to it from the north. +z is north, the stair and the usual view; +x is west.
export const P = 4, S = 20, WALL = 11.2, CW = 30, CD = 25, ML = 25, MD = 7.6, MH = 7.4;
// A part built facing +z, set on the court as the mosque (side 1, west, facing east) or the guest
// house (side -1): its front on the court's edge.
export const onCourt = (o, side, depth) => at(o, side * (CW / 2 + depth / 2), P, S / 2 + CD / 2).rotateY(-side * Math.PI / 2);
// The profile of a Lodi dome r across at its foot and h high, a little stilted.
export const domeProfile = (r, h, n = 18) => Array.from({ length: n + 1 }, (_, k) => { const t = (k / n) * Math.PI / 2; return [r * Math.cos(t) ** 0.9, h * Math.sin(t)]; });

export function buildBaraGumbad() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  // The platform under everything, with its red coping; the stair on the north, a broad lower
  // flight and a narrower upper one; a small stair to the gumbad's south door.
  const PW = CW + 2 * MD + 2, z0 = -S / 2 - 2.5, z1 = S / 2 + CD + 0.5;
  d.add(box(PW, P, z1 - z0, RUBBLE, 0, 0, (z0 + z1) / 2), box(PW + 0.3, 0.25, z1 - z0 + 0.3, RED, 0, P - 0.45, (z0 + z1) / 2), box(CW, 0.06, CD, ASHLAR, 0, P, S / 2 + CD / 2));
  d.add(box(20, P / 2, 4.6, RUBBLE, 0, 0, z1 + 2.3), at(steps(11, P / 2, 7, ASHLAR, 0.4), 0, P / 2, z1 + 0.1), at(steps(19, P / 2, 7, ASHLAR, 0.4), 0, 0, z1 + 4.6));
  d.add(at(steps(5, P, 12, ASHLAR, 0.38), 0, 0, z0).rotateY(Math.PI));
  // The gumbad: a core faced on each side with the frame of the great arch between two lengths of
  // wall half a metre thick, each cut by two storeys of two recesses.
  const y0 = P, FW = 8, FH = WALL + 1.9, side = (S - FW) / 2;
  d.add(box(S - 1, WALL, S - 1, PLASTER, 0, y0, 0), box(S + 1, 0.7, S + 1, ASHLAR, 0, y0, 0));
  const cells = [-1.45, 1.45].flatMap((x) => [[x, 1.1, 1.3, 3.3], [x, 6.7, 1.3, 3.1]]);
  for (const a of FACES) {
    d.add(onFace(at(iwan(4.4, 9.8, { m: ASHLAR, trim: RED, shade: PLASTER, depth: 1.1, frame: (FW - 4.4) / 2, top: FH - 9.8, fill: 'none', band: true, cells: false }), 0, y0, 0), a, S / 2 - 0.5));
    for (const s of [-1, 1]) {
      // The inner recess of the lower storey is open, a door into the chamber.
      const own = cells.map(([x, sill, w, h]) => [x, sill, w, h, sill < 2 && x * s < 0 ? 'room' : 'none']);
      d.add(onFace(at(arcadeSkin(side - 0.5, WALL, own, 0.5, ASHLAR, { trim: RED }), 0, y0, 0), a, S / 2 - 0.5, s * (FW / 2 + (side - 0.5) / 2)));
    }
  }
  for (const x of [-1, 1]) for (const z of [-1, 1]) d.add(box(0.5, WALL, 0.5, ASHLAR, x * (S / 2 - 0.25), y0, z * (S / 2 - 0.25)));
  // The string course between the storeys, the cornice and the parapet wall.
  for (const a of FACES) for (const s of [-1, 1]) {
    d.add(onFace(box(side, 0.3, 0.2, ASHLAR, 0, y0 + 5.9, 0), a, S / 2 + 0.1, s * (FW / 2 + side / 2)));
    d.add(onFace(box(side, 0.3, 0.24, ASHLAR, 0, y0 + WALL - 0.3, 0), a, S / 2 + 0.12, s * (FW / 2 + side / 2)));
  }
  // The drum, sixteen-sided, and the dome under its lotus cap.
  const dy = y0 + WALL, DR = 8, DH = 4.4;
  d.add(cyl(DR, DR, DH, ASHLAR, 0, dy, 0, 16), cyl(DR + 0.25, DR + 0.25, 0.3, RED, 0, dy + DH - 1.1, 0, 16), cyl(DR - 0.6, DR - 0.6, 0.5, ASHLAR, 0, dy + DH, 0, 32));
  d.add(at(lathe(domeProfile(DR - 0.85, 7.6), DOME, 48), 0, dy + DH + 0.4, 0));
  d.add(at(lathe([[1.5, 0], [1.75, 0.2], [1.6, 0.5], [0.7, 0.75], [0.55, 1.0], [0.25, 1.3], [0, 1.5]], DOME, 16), 0, dy + DH + 7.9, 0));
  // The mosque: a hall of five bays facing east across the court, on a low plinth, the three
  // middle bays domed; a mihrab bay stands out from its back.
  const mq = new THREE.Group();
  mq.add(box(ML, MH, MD - 0.9, ASHLAR, 0, 0, -0.45), box(ML + 0.4, 0.4, MD + 0.4, ASHLAR, 0, 0, 0), box(4.6, MH, 1, ASHLAR, 0, 0, -MD / 2 - 0.5));
  mq.add(at(arcadeSkin(ML, MH, cellRow(5, 4.8, 0.4, 3.5, 5.3), 0.9, ASHLAR, { trim: PLASTER, fill: 'room' }), 0, 0, MD / 2 - 0.9));
  mq.add(box(ML + 0.2, 0.7, MD + 0.2, ASHLAR, 0, MH, 0), box(4.8, 0.7, 1, RED, 0, MH + 0.7, MD / 2 - 0.6));
  for (const x of [-4.8, 0, 4.8]) mq.add(cyl(2.35, 2.45, 1.3, ASHLAR, x, MH + 0.7, -0.3, 16), at(lathe(domeProfile(2.2, 2.3, 12), DOME, 32), x, MH + 2.0, -0.3), at(lathe([[0.5, 0], [0.6, 0.1], [0.25, 0.3], [0.2, 0.5], [0, 0.75]], DOME, 12), x, MH + 4.25, -0.3));
  d.add(onCourt(mq, 1, MD));
  // The guest house opposite: a rubble hall of five arches, its north end standing higher, in ruin.
  const gh = new THREE.Group(), GD = 6.6, GH = 6.2;
  gh.add(box(ML, GH, GD - 0.7, RUBBLE, 0, 0, -0.35), at(arcadeSkin(ML, GH, cellRow(5, 4.8, 0.3, 3.2, 4.4), 0.7, RUBBLE, { trim: RED, fill: 'room' }), 0, 0, GD / 2 - 0.7));
  gh.add(box(ML + 0.2, 0.5, GD + 0.2, RUBBLE, 0, GH, 0), box(ML + 0.3, 0.3, 0.2, RED, 0, GH - 0.9, GD / 2 + 0.05));
  gh.add(box(5.4, 2.6, GD - 0.4, RUBBLE, -ML / 2 + 2.7, GH + 0.5, 0), box(2.4, 1.3, 2.6, RUBBLE, -ML / 2 + 1.6, GH + 3.1, -1));
  d.add(onCourt(gh, -1, GD));
  // The walls that join the gumbad to the two halls at the court's south end, each with an arch.
  for (const s of [-1, 1]) d.add(at(arcadeSkin(CW / 2 - S / 2 + 1.5, 4.4, [[0, 0, 1.6, 3]], 0.9, RUBBLE, { trim: RED, fill: 'room' }), s * (S / 2 + (CW / 2 - S / 2 + 1.5) / 2), y0, S / 2 - 3.5));
  f.add(mergeByMaterial(d));
  addDetails(f, g, { P, S, WALL, FW, FH, CW, CD, ML, MD, MH, GD, GH, DR, DH, z0, z1 });
  // From the north, a little to the east, as from the Sheesh Gumbad: the stair, the gumbad across
  // the court, the mosque's front on the right and the guest house on the left.
  return { group: g, focus: f, view: [-0.36, 0.15, 1], zoom: 0.55 };
}
