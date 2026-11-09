import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, hemi, rng, onFace, archPanel, guldasta, inst, unitBox, shikhara, nagaraProfile, flag } from '../helpers.js';
import { templeDoorway, steps } from '../details/doorways.js';
import { jharokha, mergeByMaterial } from '../details/components.js';
import { miniSpireGeo, instances, elephantGeo } from '../details/sculpture.js';
import { addDetails } from '../details/soniji-ki-nasiyan.js';

const RED = mat('#a94a3c', 0.85);
const RED_LIGHT = mat('#c26a5a', 0.85);
// The model city's gilt, lit by the hall's lamps: warmer and less mirror-like than open-air gold.
const GILT = mat('#e0b043', 0.45, 0.25, { emissive: '#4a3208' });

// The temple's street front, 34 wide and 20 deep, its face at z = 12 in line with the hall's,
// centred on x = -24.
function streetFront() {
  const g = new THREE.Group(), x0 = -24, z0 = 2, W = 34, D = 20, P = 1.2, F1 = 7, F2 = 6, front = z0 + D / 2;
  g.add(box(W + 2, P, D + 2, RED_LIGHT, x0, 0, z0));
  g.add(box(W, F1, D, RED, x0, P, z0), box(W + 1, 0.5, D + 1, RED_LIGHT, x0, P + F1, z0));
  const y2 = P + F1 + 0.5;
  g.add(box(W, F2, D, RED, x0, y2, z0), box(W + 1, 0.5, D + 1, RED_LIGHT, x0, y2 + F2, z0));
  const yr = y2 + F2 + 0.5;
  // The parapet round the roof, and a guldasta on each corner.
  for (const s of [-1, 1]) g.add(box(W, 0.9, 0.4, RED, x0, yr, z0 + s * (D / 2 - 0.2)), box(0.4, 0.9, D - 0.8, RED, x0 + s * (W / 2 - 0.2), yr, z0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(guldasta(3.2, 0.4, RED), x0 + sx * (W / 2 - 0.3), yr, z0 + sz * (D / 2 - 0.3)));
  // Below, the doorway with two arched panels either side; above, a row of five jharokhas.
  const d = new THREE.Group();
  d.add(at(templeDoorway(2.2, 4.2, { m: RED, bands: 3, guardians: false }), x0, P, front));
  for (const k of [-12, -6, 6, 12]) d.add(onFace(at(archPanel(3, 4.6, true, M.recess, 0.25), 0, P + 0.6, 0), 0, front, x0 + k));
  for (const k of [-12, -6, 0, 6, 12]) d.add(at(jharokha(2.8, 3.4, RED, { trim: RED_LIGHT, roofM: RED_LIGHT }), x0 + k, y2 + 1, front));
  g.add(mergeByMaterial(d));
  g.add(at(steps(7, P, 3, RED_LIGHT, 0.4), x0, 0, front + 1));
  // The small spire over the sanctum, set back from the street on a low cell.
  g.add(box(6, 2.4, 6, RED, x0, yr, z0 - 3));
  const sp = shikhara(5.4, 7, RED, nagaraProfile, 12);
  g.add(at(sp, x0, yr + 2.4, z0 - 3), at(flag(3, M.saffron), x0, yr + 2.4 + sp.userData.top - 0.4, z0 - 3));
  return g;
}

export function buildSonijiKiNasiyan() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(79);
  g.add(f);
  g.add(box(140, 0.2, 120, M.path));
  // The Siddhakoot Chaityalaya, the temple itself, on the street beside the hall: a two-storey red
  // sandstone front on a plinth, a doorway between arched panels below, jharokhas above, a cornice
  // over each storey and a parapet, and only a small spire on its roof.
  f.add(streetFront());
  // The Swarna Nagari hall: a two-storey red building, its upper gallery open on a gilded model city
  f.add(box(40, 7, 24, RED, 20, 0, 0), box(40.6, 0.6, 24.6, RED_LIGHT, 20, 7, 0));
  for (let k = 0; k < 6; k++) f.add(onFace(at(archPanel(3.6, 5, true, M.recess, 0.25), 0, 0.6, 0), 0, 12, 20 - 17.5 + k * 7));
  const cols = [];
  for (let k = 0; k <= 10; k++) cols.push([1 + k * 3.8, 7.6, 11.4, 0.6, 7, 0.6]);
  f.add(inst(unitBox(), cols, RED), box(40.6, 1, 24.6, RED_LIGHT, 20, 14.6, 0), box(40, 0.6, 24, RED, 20, 7.6, 0));
  const town = [], tops = [];
  for (let i = 0; i < 60; i++) {
    const x = 3 + R() * 34, z = -9 + R() * 18, w = 0.8 + R() * 1.4, h = 0.8 + R() * 2.4;
    town.push([x, 8.2, z, w, h, w]);
    tops.push([x, 8.2 + h, z, w, w * 1.4, w]);
  }
  f.add(inst(unitBox(), town, GILT), inst(miniSpireGeo(), tops, GILT), cyl(1.4, 2.6, 4.6, GILT, 20, 8.2, 0, 16));
  // The gallery is closed behind and at the ends, painted red, so the gilded city is seen against it
  // through the open front; above the city hang the golden airships (vimanas) of the gods, on wires
  // from the ceiling, and a procession of gilded elephants crosses its square.
  f.add(box(40, 7, 0.6, RED, 20, 7.6, -11.7), box(0.6, 7, 22.8, RED, 0.3, 7.6, 0), box(0.6, 7, 22.8, RED, 39.7, 7.6, 0));
  for (let k = 0; k < 7; k++) {
    const x = 5 + k * 5, z = -6 + (k % 3) * 5, y = 11.6 + (k % 2) * 0.8;
    const ship = mesh(new THREE.SphereGeometry(1, 14, 8), GILT, x, y, z);
    ship.scale.set(1.5, 0.45, 0.7);
    f.add(ship, at(hemi(0.5, GILT, 10), x, y + 0.4, z), cyl(0.02, 0.02, 14.6 - y - 0.4, M.steel, x, y + 0.4, z, 4));
  }
  f.add(instances(elephantGeo(), Array.from({ length: 8 }, (_, k) => [8 + k * 2.2, 8.2, 6.5, 0.6, 0.9, 1.2, Math.PI / 2]), GILT));
  for (const x of [0, 40]) for (const z of [-12, 12]) f.add(at(guldasta(5, 0.5, RED), x, 15.6, z));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.45, 0.26, 1.25] };
}
