import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES, chhatri } from '../helpers.js';
import { chhajja, railing, panel, jali, bracketGeo, placeAll, alongFace, merlons, mergeByMaterial } from './components.js';
import { iwan } from './mughal.js';
import { trees, shrubs, boats, asiBoard, fountains, scatter, along } from './realism.js';

// Itmad-ud-Daulah, finer detail. From photographs: the walls between the arches are inlaid with
// panels of coloured stone; a deep eave on brackets runs round the tomb under a pierced marble
// parapet; the octagonal corner towers are banded and inlaid; the upper pavilion is screened with
// jali on all four sides. The garden is closed by a red sandstone wall with an octagonal tower
// and chhatri at each corner; in the middle of each side stands a red sandstone building with a
// great arch outlined in white marble: the gate on the east (here +z), the two false gates, and
// the pavilion over the river. Dimensions follow js/monuments/itmad-ud-daulah.js: base B = 3.5, the tomb
// 22 square and 8 high, towers r = 2 at the corners.
const INLAY_ = [mat('#b08560', 0.5), mat('#8a9c74', 0.5)];
function architecture(f) {
  const d = new THREE.Group(), B = 3.5, s = 11, Mb = M.marble, Sh = M.marbleShade;
  for (const a of FACES) {
    for (const lat of [-3, 3, -9.1, 9.1]) d.add(onFace(at(panel(1.5, 5.4, 0.16, Mb, INLAY_[Math.abs(lat) > 5 ? 1 : 0]), 0, B + 1, 0), a, s + 0.01, lat));
    d.add(onFace(at(chhajja(17.6, 1.3, 0.5, 0.12, Mb), 0, B + 8.05, 0), a, s));
    d.add(placeAll(bracketGeo(0.7, 1.0, 0.22), alongFace(a, s, 17, 9, B + 7.55), Sh));
    d.add(onFace(at(railing(17.4, 1.1, 0.22, Mb, 1.7), 0, B + 8.6, 0), a, s - 0.3));
  }
  for (const x of [-s, s]) for (const z of [-s, s]) {
    for (const y of [B + 4, B + 8.1]) d.add(cyl(2.12, 2.12, 0.3, Sh, x, y, z, 8));
    const t = at(new THREE.Group(), x, B, z);
    for (let k = 0; k < 8; k++) t.add(onFace(at(panel(0.9, 2.6, 0.1, Mb, INLAY_[k % 2]), 0, 0.8, 0), ((k + 0.5) / 8) * Math.PI * 2, 2.08 * Math.cos(Math.PI / 8) + 0.01));
    d.add(t);
  }
  // The upper pavilion (10 square, B + 8.6 to B + 13.1): screens on the three sides the builder
  // left plain.
  for (const a of [Math.PI / 2, Math.PI, -Math.PI / 2]) {
    d.add(onFace(box(6, 3, 0.04, M.recess, 0, B + 9.3), a, 5.02), onFace(box(5.96, 2.96, 0.06, jali(Mb), 0, B + 9.32), a, 5.09));
    d.add(onFace(at(panel(6.5, 3.5, 0.25, Sh, null), 0, B + 9.05, 0), a, 5.0));
  }
  mergeByMaterial(d);
  f.add(d);
  // The enclosure (150 m square, centred on z = 20), beside the framed group.
  const site = new THREE.Group(), Rd = M.red;
  for (const [x, z, w, dd] of [[0, 95, 150, 1.4], [0, -55, 150, 1.4], [75, 20, 1.4, 150], [-75, 20, 1.4, 150]]) site.add(box(w, 4.5, dd, Rd, x, 0, z));
  for (const x of [-75, 75]) for (const z of [-55, 95]) site.add(cyl(3, 3.3, 8, Rd, x, 0, z, 8), cyl(3.3, 3.3, 0.4, M.redLight, x, 5.6, z, 8), at(chhatri(2.6, 6, Rd, Mb), x, 8, z));
  for (const [x, z, a, h] of [[0, 95, 0, 13], [0, -55, Math.PI, 10], [75, 20, Math.PI / 2, 10], [-75, 20, -Math.PI / 2, 10]]) {
    const gate = at(new THREE.Group(), x, 0, z);
    gate.rotation.y = a;
    gate.add(box(24, h, 9, Rd), box(24.6, 0.6, 9.6, M.redLight, 0, h, 0));
    for (const zz of [1, -1]) {
      const front = iwan(8, h - 2.2, { m: Rd, trim: Mb, shade: M.redLight, depth: 1.4, frame: 0.9, top: 1 });
      front.position.z = zz * 4.5;
      if (zz < 0) front.rotation.y = Math.PI;
      gate.add(front);
      for (const sx of [-1, 1]) for (const y of [1, h * 0.5 + 0.4]) {
        const p = panel(4.4, h * 0.36, 0.16, Mb, M.recess);
        p.position.set(sx * 8.6, y, zz * 4.51);
        if (zz < 0) p.rotation.y = Math.PI;
        gate.add(p);
      }
      gate.add(at(merlons(23.4, 0.6, 0.8, 0.3, Rd, 0.5), 0, h + 0.6, zz * 4.2));
    }
    for (const sx of [-1, 1]) gate.add(at(chhatri(1.6, 4.2, Rd, Mb), sx * 10, h + 0.6, 0));
    site.add(gate);
  }
  f.parent.add(mergeByMaterial(site));
}

// Itmad-ud-Daulah, the "Baby Taj" on the Yamuna: fountains in the four water channels, hedges and
// trees in the garden squares, and boats on the river behind.
export function addDetails(f, g) {
  architecture(f);
  const jets = [];
  for (const s of [-1, 1]) jets.push(...along(3, [0, 20 + s * 32], [0, 20 + s * 66]), ...along(3, [s * 32, 20], [s * 66, 20]));
  g.add(fountains(jets, { y: 0.35, h: 1.5 }));
  const sq = scatter(28, [-70, 70, -50, 92], { seed: 3, gap: 11 }).filter(([x, z]) => Math.abs(x) > 6 && Math.abs(z - 20) > 6 && (Math.abs(x) > 28 || Math.abs(z) > 30));
  g.add(trees(sq, { kind: 'neem', seed: 3 }), shrubs([...along(10, [-4.5, 50], [-4.5, 92]), ...along(10, [4.5, 50], [4.5, 92])].map(([x, z]) => [x, z, 0.9]), { seed: 4 }));
  g.add(boats([[-120, -120, 0.3], [60, -140, 1.9], [150, -100, 2.6]], { y: 0.3, size: 1.6 }));
  g.add(asiBoard("Itimad-ud-Daulah's Tomb", 8, 92, 0));
}
