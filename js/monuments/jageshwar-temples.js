import * as THREE from 'three';
import { box, at, shikhara, nagaraProfile } from '../helpers.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { spireCanopy } from '../parts/temples.js';
import { addDetails, STONE, SHADE, TIMBER, porch } from '../details/jageshwar-temples.js';

// Jageshwar, in a valley of deodars in the Kumaon hills: a walled court of some 125 stone temples
// built between the 7th and 12th centuries. The two greatest stand in it: the Mahamrityunjaya,
// the largest and oldest, its tall curved spire about 17 m high, and the Jageshwar (Jyotirlinga)
// temple, with a pillared porch before it; most of the rest are small rekha shrines crowded round
// them. Many spires carry a square timber canopy (chhatra) over the amalaka, against the snow.
// Front is +z: the court is entered from the stream, the Jata Ganga, on the south-east.
export function buildJageshwar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The Mahamrityunjaya, at x = mx: walls 8 m square on a moulded plinth, its spire 11 m high,
  // and a hall before it with a sloping stone-slab roof.
  const mx = -9, mz = -6, MW = 8, MH = 4.6, MT = 10.8;
  const t = new THREE.Group();
  t.add(box(MW + 1.4, 0.8, MW + 1.4, SHADE, 0, 0, 0));
  t.add(box(MW, MH, MW, STONE, 0, 0.8, 0), box(MW + 0.6, MH, MW * 0.5, STONE, 0, 0.8, 0), box(MW * 0.5, MH, MW + 0.6, STONE, 0, 0.8, 0));
  t.add(box(MW + 1.2, 0.3, MW + 1.2, SHADE, 0, 0.8 + MH - 0.3, 0));
  const sp = shikhara(MW + 0.4, MT, STONE, nagaraProfile, 22, STONE, 0.5);
  t.add(at(sp, 0, 0.8 + MH, 0));
  const top = 0.8 + MH + sp.userData.top;
  t.add(at(spireCanopy(MW * 0.55, STONE, TIMBER), 0, top - 1.3, 0));
  // Its hall (mandapa): 7 m wide, open at the front between pillars, under a gabled slab roof.
  t.add(at(porch(7, 6, 3.4), 0, 0.8, MW / 2 + 3));
  t.add(at(steps(2.6, 0.8, 3, SHADE), 0, 0, MW / 2 + 6.4));
  f.add(at(t, mx, 0, mz));
  // The Jageshwar temple, east of it: smaller (walls 6.4 m square), its spire under a canopy, and
  // a long pillared porch before the door, guarded by two tall door-keepers.
  const jx = 9, jz = -3, JW = 6.4, JH = 3.8, JT = 7.6;
  const j = new THREE.Group();
  j.add(box(JW + 1.2, 0.7, JW + 1.2, SHADE, 0, 0, 0), box(JW, JH, JW, STONE, 0, 0.7, 0), box(JW + 0.5, JH, JW * 0.5, STONE, 0, 0.7, 0), box(JW * 0.5, JH, JW + 0.5, STONE, 0, 0.7, 0));
  j.add(box(JW + 1, 0.28, JW + 1, SHADE, 0, 0.7 + JH - 0.28, 0));
  const js = shikhara(JW + 0.2, JT, STONE, nagaraProfile, 18, STONE, 0.5);
  j.add(at(js, 0, 0.7 + JH, 0), at(spireCanopy(JW * 0.55, STONE, TIMBER), 0, 0.7 + JH + js.userData.top - 1.1, 0));
  j.add(at(porch(5.6, 8, 3.2), 0, 0.7, JW / 2 + 4), at(steps(2.4, 0.7, 3, SHADE), 0, 0, JW / 2 + 8.4));
  f.add(at(j, jx, 0, jz));
  // Doors into the two sanctums, behind their halls.
  const doors = new THREE.Group();
  doors.add(at(templeDoorway(1.2, 2.4, { m: STONE, guardians: false, hood: false }), mx, 0.8, mz + MW / 2 + 0.05));
  doors.add(at(templeDoorway(1.1, 2.2, { m: STONE, guardians: true, guardianH: 1.6, hood: false }), jx, 0.7, jz + JW / 2 + 0.05));
  f.add(mergeByMaterial(doors));
  addDetails(f, g, { mx, mz, jx, jz });
  // From the south-west, over the crowd of small shrines, the two great spires side by side.
  return { group: g, focus: f, view: [-0.5, 0.34, 1], zoom: 0.62 };
}
