import * as THREE from 'three';
import { M, mat, box, cyl, at, sheet, hemi, finial } from '../helpers.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { merlons, jali, mergeByMaterial } from '../parts/components.js';
import { trees, lampPosts, benches, along, cityAround, stalls } from '../parts/realism.js';
import { detail } from '../detail.js';

// The granite of the Mecca Masjid, weathered to a warm grey, and the lime plaster of its trim.
export const STONE = mat('#8e8273', 0.92);
export const TRIM = mat('#c9bfae', 0.85);
const MARBLE = M.marble;

// The Mecca Masjid, finer detail and setting. From photographs: merlons along the parapet; the court
// in front, paved and walled, with the long pool for ablutions in the middle and the famous stone
// benches beside it; on the south side of the court, next to the hall, the enclosure of the tombs of
// the Nizams, an arcade of marble graves under a flat roof with small domed turrets at its corners;
// the gate on the court's east side, onto the street that runs to the Charminar; and the old city
// all round. Dimensions follow js/monuments/mecca-masjid-hyderabad.js: the hall HW wide, HD deep and
// HH high on a plinth P high, its front at z = 0.
function architecture(f, { P, HW, HH }) {
  const d = new THREE.Group();
  d.add(at(merlons(HW + 0.8, 0.8, 1, 0.35, TRIM, 0.4), 0, P + HH + 0.5, 0.05));
  // The court: 110 wide, from the hall's front to the gate 80 m east, paved and walled.
  const CZ = 80, CW = 110;
  d.add(box(CW, 0.3, CZ, M.path, 0, 0, CZ / 2));
  for (const s of [-1, 1]) d.add(box(1.2, 4, CZ, STONE, s * (CW / 2 + 0.6), 0, CZ / 2), box(1.5, 0.3, CZ, TRIM, s * (CW / 2 + 0.6), 4, CZ / 2));
  for (const s of [-1, 1]) d.add(box(CW / 2 - 8, 4, 1.2, STONE, s * (CW / 4 + 4), 0, CZ + 0.6), box(CW / 2 - 8, 0.3, 1.5, TRIM, s * (CW / 4 + 4), 4, CZ + 0.6));
  // The gate: an arch through a block with two small domed turrets.
  const gate = new THREE.Group();
  gate.add(at(arcadeSkin(16, 10, [[0, 0, 6, 8]], 6, STONE, { trim: TRIM, fill: 'none' }), 0, 0, -3));
  gate.add(box(16.4, 0.6, 6.4, TRIM, 0, 10, 0));
  for (const x of [-7.4, 7.4]) gate.add(cyl(0.9, 1, 3, TRIM, x, 10.6, 2.6, 8), at(hemi(1, TRIM, 16), x, 13.6, 2.6), at(finial(1.4, TRIM), x, 14.5, 2.6));
  d.add(at(gate, 0, 0, CZ + 0.6));
  // The pool for ablutions, its kerb of granite, and stone benches either side.
  d.add(box(26, 0.6, 12, STONE, 0, 0.3, 34), box(24.6, 0.05, 10.6, M.recess, 0, 0.3, 34));
  for (const x of [-16.5, 16.5]) d.add(box(4.8, 0.5, 1.1, STONE, x, 0.3, 30.5), box(4.8, 0.5, 1.1, STONE, x, 0.3, 37.5));
  // The tombs of the Nizams: an enclosure 34 x 10 along the south side of the court, beside the
  // hall, an arcade of seven arches opening onto the court, marble graves under it.
  const tomb = new THREE.Group(), TL = 34, TD = 10, TH = 6;
  tomb.add(box(TL, TH, TD - 1.2, STONE, 0, 0.3, -0.6), box(TL + 0.4, 0.5, TD + 0.4, TRIM, 0, TH + 0.3, 0));
  tomb.add(at(arcadeSkin(TL, TH, cellRow(7, TL / 7, 0, 3.4, 4.6), 1.2, STONE, { trim: MARBLE, fill: 'room' }), 0, 0.3, TD / 2 - 1.2));
  tomb.add(at(merlons(TL, 0.6, 0.8, 0.3, TRIM, 0.35), 0, TH + 0.8, TD / 2 - 0.2));
  for (const x of [-TL / 2, TL / 2]) for (const z of [-TD / 2, TD / 2]) tomb.add(cyl(0.7, 0.8, TH + 2.4, TRIM, x, 0.3, z, 8), at(hemi(0.85, MARBLE, 16), x, TH + 2.7, z), at(finial(1.2, M.gold), x, TH + 3.5, z));
  for (let k = 0; k < 6; k++) tomb.add(box(1.2, 0.8, 2.6, MARBLE, -TL / 2 + 3 + k * 5.6, 0.3, TD / 2 + 1.6), box(0.7, 0.35, 2.1, MARBLE, -TL / 2 + 3 + k * 5.6, 1.1, TD / 2 + 1.6));
  // Pierced marble screens close the enclosure's other three sides.
  tomb.add(box(TL, 2.6, 0.12, jali(MARBLE), 0, 0.3, -TD / 2 - 0.1));
  const t = at(tomb, 42, 0, 24);
  t.rotation.y = -Math.PI / 2;
  d.add(t);
  f.add(mergeByMaterial(d));
  f.add(sheet(24.6, 10.6, M.water, 0, 0.92, 34));
}

export function addDetails(f, g, dims) {
  architecture(f, dims);
  g.add(box(700, 0.2, 700, M.path, 0, -0.2, 0));
  g.add(trees([[-40, 60], [40, 66], [-46, 20], [-30, 74]], { kind: 'neem', seed: 2 }));
  g.add(benches(along(5, [-45, 52], [-45, 70]).map(([x, z]) => [x, z, Math.PI / 2])));
  g.add(lampPosts([[-50, 8], [50, 8], [-50, 76], [50, 76], [-12, 78], [12, 78]]));
  // The street east of the gate, towards the Charminar, with its stalls of bangles and pearls.
  g.add(box(30, 0.06, 300, M.asphalt, 0, 0, 96).rotateY(Math.PI / 2));
  g.add(stalls([...along(10, [-120, 88], [-14, 88]), ...along(10, [14, 88], [120, 88])].map(([x, z]) => [x, z, Math.PI])));
  g.add(cityAround([-62, 62, -62, 84], { rows: detail.low ? 2 : 3, every: detail.low ? 2 : 1, gap: 8, seed: 17, fine: !detail.low,
    paint: ['#efe6d2', '#e3d3b2', '#d9c7a6', '#f1e9d8', '#cfd8d4', '#e8d0b8', '#c9d6a3'], keep: [[-150, 150, 84, 104]] }));
}
