import * as THREE from 'three';
import { M, box, cyl, at, onFace, FACES, chhatri } from '../helpers.js';
import { steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { GILT, sikhDome, arcadeStorey, parapetDomes } from '../parts/sikh.js';
import { addDetails } from '../details/takht-sri-hazur-sahib.js';

// Takht Sachkhand Sri Hazur Sahib, Nanded, built 1832–1837 for Maharaja Ranjit Singh over the place
// where Guru Gobind Singh died. From photographs: a square shrine of two storeys in the middle of a
// marble court, on a plinth reached by steps; the lower storey of white marble opens in five arches
// a side, the middle one a doorway; the upper storey, smaller, is sheathed in gilded copper and
// arcaded with screens; small gilt domes line the parapets and a gilt kiosk stands at each corner of
// the roof; over all, a ribbed gilt dome in a cup of lotus petals, with a kalash and an umbrella.
export function buildTakhtSriHazurSahib() {
  const g = new THREE.Group(), f = new THREE.Group(), W = M.marble, G = GILT;
  g.add(f);
  // P: the plinth; H1: the marble storey (20 m square); H2: the gilded storey (16.4 m square).
  const P = 1.6, H1 = 8.5, H2 = 6.5, w1 = 20, w2 = 16.4;
  f.add(box(26, P, 26, W, 0, 0, 0), box(26.6, 0.25, 26.6, M.marbleShade, 0, P - 0.25, 0));
  for (const a of FACES) f.add(onFace(at(steps(8, P, 5, W), 0, 0, 0), a, 13));
  f.add(at(arcadeStorey(w1, H1, 5, W, { trim: G, fill: 'room', centre: 'door', sill: 0.3, ah: 6.2 }), 0, P, 0));
  // The roof of the marble storey, a terrace round the gilded storey with its parapet of domes.
  const y1 = P + H1;
  f.add(box(w1 + 0.4, 0.5, w1 + 0.4, W, 0, y1, 0), box(w1 + 0.2, 0.7, w1 + 0.2, W, 0, y1 + 0.5, 0));
  f.add(parapetDomes(w1 + 0.2, y1 + 1.2, 7, G, 0.32));
  f.add(at(arcadeStorey(w2, H2, 5, G, { trim: G, fill: 'jali', sill: 0.5, ah: 4.6, dp: 0.6 }), 0, y1 + 0.5, 0));
  const y2 = y1 + 0.5 + H2;
  f.add(box(w2 + 1.2, 0.5, w2 + 1.2, G, 0, y2, 0), box(w2 + 0.4, 0.8, w2 + 0.4, G, 0, y2 + 0.5, 0));
  f.add(parapetDomes(w2 + 0.4, y2 + 1.3, 6, G, 0.36));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(at(chhatri(1.5, 4.6, G), sx * (w2 / 2 - 1.2), y2 + 0.5, sz * (w2 / 2 - 1.2)), at(chhatri(1.1, 3.6, W, G), sx * (w1 / 2 - 0.9), y1 + 1.2, sz * (w1 / 2 - 0.9)));
  // The drum and the great dome.
  const dy = y2 + 1.3, R = 4.8;
  f.add(cyl(R * 0.92, R * 0.92, 2.6, G, 0, dy, 0, 32), cyl(R * 1.02, R * 1.02, 0.3, G, 0, dy + 2.6, 0, 32));
  const dome = sikhDome(R, G);
  f.add(at(dome, 0, dy + 2.9, 0));
  mergeByMaterial(f);
  addDetails(f, g, { P, H1, H2 });
  // From the south-east across the court, the gateway to the right.
  return { group: g, focus: f, view: [0.75, 0.3, 1], zoom: 0.85, batch: true };
}
