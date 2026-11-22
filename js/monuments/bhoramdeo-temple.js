import * as THREE from 'three';
import { M, flat, mesh, box, at, onFace, kalash, bell, shikhara, pidaRoof, flag } from '../helpers.js';
import { bhumijaRows, carvedPillar } from '../parts/temples.js';
import { templeDoorway, steps, grandStair } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { figureRow, instances, miniSpireGeo } from '../parts/sculpture.js';
import { addDetails, STONE, SHADE, PROF } from '../details/bhoramdeo-temple.js';

// Bhoramdeo, a Nagara temple of the 11th century, about 18 m long and 12 m wide on a platform
// 1.5 m high. It faces east (+z): a square hall (mandapa) entered through open porches on the
// east, north (+x) and south, a vestibule (antarala), and the sanctum under a curved spire whose
// faces are filled with rows of miniature spires.
export function buildBhoramdeo() {
  const S = STONE, Sd = SHADE, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // P: the platform; B: the moulded base of the walls; WH: the carved wall.
  const P = 1.5, B = 1, WH = 4.6, Y = P + B + WH, sz = -8, mz = 4;
  f.add(box(20, P, 31, Sd, 0, 0, 0), box(20.5, 0.25, 31.5, S, 0, P - 0.25, 0));
  f.add(at(grandStair(P, 5, Sd, S, { n: 7, landing: 0, cheek: 0.6 }), 0, 0, 15.75));
  for (const s of [-1, 1]) f.add(at(grandStair(P, 4, Sd, S, { n: 7, landing: 0, cheek: 0.6 }), s * 10.25, 0, mz).rotateY(s * Math.PI / 2));
  // Sanctum (on a stepped plan), vestibule and hall.
  f.add(box(7.2, B + WH, 7.2, S, 0, P, sz), box(8, B + WH, 4.4, S, 0, P, sz), box(4.4, B + WH, 8, S, 0, P, sz));
  f.add(box(5, B + WH, 3.2, S, 0, P, -3), box(11, B + WH, 11, S, 0, P, mz));
  // The eave over the walls.
  f.add(box(7.9, 0.3, 7.9, Sd, 0, Y, sz), box(8.7, 0.3, 5, Sd, 0, Y, sz), box(5, 0.3, 8.7, Sd, 0, Y, sz), box(5.6, 0.3, 3.2, Sd, 0, Y, -3), box(11.9, 0.3, 11.9, Sd, 0, Y, mz));
  // The spire: a middle band up each face, and eight rows of miniature spires in the quarters
  // between. Its kalasha is lost: it ends in the amalaka.
  const TW = 7.4, TH = 9.8, sy = Y + 0.3;
  const tower = shikhara(TW, TH, S, PROF, 16, S, 0.22);
  f.add(at(tower, 0, sy, sz), at(instances(miniSpireGeo(), bhumijaRows(TW, TH, PROF, 8), S), 0, sy, sz));
  f.add(at(flag(2.6, M.saffron), 0, sy + tower.userData.top - 0.3, sz));
  // The gable over the vestibule (sukanasa), against the spire's east face.
  const suk = pidaRoof(5, 2.2, 4, 0.4, S, Sd);
  f.add(at(suk, 0, sy, -3.2), box(1.8, 1.6, 0.5, Sd, 0, sy + suk.userData.top, -3.6));
  // The hall's roof: a low pyramid of slabs under a bell and a ribbed stone.
  const roof = pidaRoof(11.4, 4.2, 6, 0.3, S, Sd), ry = sy + roof.userData.top;
  f.add(at(roof, 0, sy, mz), at(bell(1.5, S), 0, ry, mz));
  const am = mesh(new THREE.SphereGeometry(1, 20, 8), flat(S), 0, ry + 1.85, mz);
  am.scale.y = 0.4;
  f.add(am, at(kalash(0.7, S), 0, ry + 2.2, mz));
  // The three porches: each a floor at the height of the base, two carved pillars in front and
  // two against the wall, a beam, a slab with a deep eave, and a doorway into the hall behind.
  const porch = () => {
    const p = new THREE.Group(), ph = 3.3;
    p.add(box(4.6, B, 2.9, Sd, 0, 0, 1.45));
    for (const x of [-1.8, 1.8]) p.add(at(carvedPillar(ph, S), x, B, 2.3), box(0.6, ph, 0.4, S, x, B, 0.2));
    p.add(box(4.6, 0.4, 0.7, Sd, 0, B + ph, 2.3));
    for (const x of [-1.8, 1.8]) p.add(box(0.6, 0.4, 2.6, Sd, x, B + ph, 1.3));
    p.add(box(5.6, 0.25, 3.5, S, 0, B + ph + 0.4, 1.75), box(4.6, 0.3, 2.9, Sd, 0, B + ph + 0.65, 1.45), box(3.4, 0.3, 2.2, S, 0, B + ph + 0.95, 1.1));
    p.add(at(templeDoorway(1.2, 2.5, { m: S, guardians: false, hood: false }), 0, B, 0.02), at(steps(3, B, 4, Sd), 0, 0, 2.9));
    return p;
  };
  const porches = new THREE.Group();
  for (const a of [0, Math.PI / 2, -Math.PI / 2]) { const p = onFace(at(porch(), 0, P, 0), a, 5.5); p.position.z += mz; porches.add(p); }
  f.add(mergeByMaterial(porches));
  // The bands of carved figures: two rows round the sanctum, on the vestibule and on the hall's
  // walls either side of each porch.
  const figs = [], row = (cz, a, dist, l0, l1) => {
    const n = Math.max(1, Math.round((l1 - l0) / 0.62));
    for (let k = 0; k < n; k++) for (const [y, h] of [[P + B + 0.75, 1.45], [P + B + 2.75, 1.2]]) {
      const l = l0 + (k + 0.5) * ((l1 - l0) / n);
      figs.push([Math.sin(a) * dist + Math.cos(a) * l, y, cz + Math.cos(a) * dist - Math.sin(a) * l, 0.5, h, 0.3, a]);
    }
  };
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) { row(sz, a, 4.02, -2, 2); row(sz, a, 3.62, -3.5, -2.3); row(sz, a, 3.62, 2.3, 3.5); }
  for (const a of [Math.PI / 2, -Math.PI / 2]) row(-3, a, 2.52, -1.4, 1.4);
  for (const a of [0, Math.PI / 2, -Math.PI / 2]) { row(mz, a, 5.52, -5.3, -2.9); row(mz, a, 5.52, 2.9, 5.3); }
  row(mz, Math.PI, 5.52, -5.3, -2.9);
  row(mz, Math.PI, 5.52, 2.9, 5.3);
  f.add(figureRow(figs, Sd, { poses: ['standing', 'dancer', 'mirror', 'musician', 'standing', 'chauri', 'thorn'], outward: false }));
  addDetails(f, g, { P, B, WH, sz, mz, TW, TH });
  // From the south-east, with the hills behind.
  return { group: g, focus: f, view: [-0.85, 0.24, 1], zoom: 0.8 };
}
