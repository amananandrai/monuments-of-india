import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, lathe } from '../helpers.js';
import { mergeByMaterial, mouldings, frieze, bracketGeo, placeAll } from '../parts/components.js';
import { doorFrame, steps } from '../parts/doorways.js';
import { carvedPillar } from '../parts/temples.js';
import { figure } from '../parts/sculpture.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/bhojeshwar-temple.js';

// The Bhojeshwar temple at Bhojpur (11th century, never finished), from photographs and the ASI's
// plans: a plain square sanctum of buff sandstone on a platform 35 m long, 25 m wide and 4 m high.
// Its walls rise sheer, about 13 m, uncarved but for their mouldings; on the north, south and east
// they each carry a balcony on great brackets, and the west face, the front (here +z), opens in a
// tall doorway whose jambs are carved with river goddesses and attendants. Inside, four pillars
// 12 m high carry a corbelled ceiling, and the linga, 2.3 m high, stands on a pedestal of three
// tiers 6.6 m square, 7.5 m in all. The roof is a low stepped cap over the corbelled ceiling,
// added to keep out the rain. Behind the temple runs the earthen ramp used to raise its stones.
export const SAND = mat('#c9ad85', 0.9), SAND_DK = mat('#a68a66', 0.92), LINGA = mat('#3a3633', 0.5);
export const PH = 4, PW = 25, PL = 35, TW = 20, WH = 13.2, WT = 2.2;

// The linga on its pedestal: three square tiers stepping in, a moulded yoni over them with its spout
// towards the north, and the rounded shaft.
function linga() {
  const g = new THREE.Group();
  g.add(box(6.6, 1.5, 6.6, SAND), box(5.4, 1.5, 5.4, SAND_DK, 0, 1.5), box(4.2, 1.3, 4.2, SAND, 0, 3));
  g.add(mouldings(6.6, 6.6, [[1.2, 0.3, 0.12, SAND_DK]], SAND), mouldings(5.4, 5.4, [[2.7, 0.3, 0.12, SAND]], SAND_DK));
  g.add(cyl(1.9, 1.9, 0.6, LINGA, 0, 4.3, 0, 40), box(1.1, 0.35, 2.4, LINGA, 0, 4.55, 2.6));
  g.add(at(lathe([[0, 0], [0.95, 0], [0.95, 1.6], [0.88, 1.95], [0.65, 2.18], [0.35, 2.28], [0, 2.3]], LINGA, 40), 0, 4.9, 0));
  return g;
}

export function buildBhojeshwar() {
  const S = SAND, Sd = SAND_DK, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The platform with a moulded edge, and a flight of steps up the middle of its front.
  f.add(box(PW, PH, PL, Sd), mouldings(PW, PL, [[0, 0.5, 0.25, S], [PH - 0.7, 0.45, 0.15, S]], Sd));
  f.add(at(steps(8, PH, 14, S, 0.45), 0, 0, PL / 2 + 0.01));
  for (const s of [-1, 1]) f.add(box(1.2, PH, 6.3, Sd, s * 4.6, 0, PL / 2 + 3.15));
  // The sanctum: four walls round a hollow square, set back on the platform towards its rear,
  // a doorway through the front wall.
  const cz = -3, y0 = PH, half = TW / 2, inner = TW - 2 * WT, DW = 4.4, DH = 10.6;
  const walls = new THREE.Group();
  walls.add(box(TW, WH, WT, S, 0, y0, cz - half + WT / 2));
  for (const s of [-1, 1]) walls.add(box(WT, WH, TW - 2 * WT, S, s * (half - WT / 2), y0, cz));
  const side = (TW - DW) / 2;
  for (const s of [-1, 1]) walls.add(box(side, WH, WT, S, s * (DW / 2 + side / 2), y0, cz + half - WT / 2));
  walls.add(box(DW, WH - DH, WT, S, 0, y0 + DH, cz + half - WT / 2));
  // The base mouldings of the walls (vedibandha) and the cornice.
  walls.add(at(mouldings(TW, TW, [[0, 0.6, 0.3, Sd], [0.6, 0.5, 0.18, S], [1.1, 0.35, 0.1, frieze(S)], [WH - 1.2, 0.5, 0.2, Sd], [WH - 0.7, 0.7, 0.35, S]], S), 0, y0, cz));
  f.add(mergeByMaterial(walls));
  // The floor and the corbelled ceiling inside, the four great pillars, and the linga.
  const inside = new THREE.Group();
  inside.add(box(inner, 0.2, inner, Sd, 0, y0, cz));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) inside.add(at(carvedPillar(12, S), sx * 4.6, y0 + 0.2, cz + sz * 4.6));
  for (let k = 0; k < 5; k++) inside.add(box(inner - k * 2.4, 0.9, inner - k * 2.4, k % 2 ? S : Sd, 0, y0 + 12.2 + k * 0.9 - 0.01 * k, cz));
  inside.add(at(linga(), 0, y0 + 0.2, cz));
  f.add(inside);
  // The doorway's frame: stepped jambs, carved alternately, and the river goddesses at their feet.
  const door = new THREE.Group();
  door.add(at(doorFrame(DW, DH, { bands: 4, bw: 0.45, depth: 1.1, d0: 0.4, m: S }), 0, y0, cz + half));
  for (const s of [-1, 1]) door.add(at(figure(2.6, Sd, 'standing'), s * (DW / 2 + 0.55), y0 + 0.3, cz + half + 1.15), at(figure(1.8, Sd, 'chauri'), s * (DW / 2 + 1.4), y0 + 0.3, cz + half + 1.15));
  door.add(box(DW, 0.35, 1.2, Sd, 0, y0, cz + half + 0.5));
  f.add(mergeByMaterial(door));
  // The balconies on the north, south and east walls: a slab on five great brackets, a seat-back
  // parapet, and a pair of pillars carrying a little roof.
  const balc = new THREE.Group(), by = y0 + 5.2;
  for (const a of [Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const b = new THREE.Group();
    b.add(box(6.8, 0.6, 2.4, S, 0, 0, 1.2), box(6.8, 1.1, 0.3, Sd, 0, 0.6, 2.25));
    b.add(placeAll(bracketGeo(1.6, 2.2, 0.5), [-2.8, -1.4, 0, 1.4, 2.8].map((x) => [x, 0, 0]), Sd));
    for (const s of [-1, 1]) b.add(at(carvedPillar(3.2, S), s * 2.9, 0.6, 1.8));
    b.add(box(7.6, 0.45, 3, S, 0, 3.8, 1.3), box(6.6, 0.6, 2.4, Sd, 0, 4.25, 1.1));
    const o = onFace(at(b, 0, by, 0), a, half);
    o.position.z += cz;
    balc.add(o);
  }
  f.add(mergeByMaterial(balc));
  // The roof: a stepped cap of slabs over the ceiling, flat on top.
  const roof = new THREE.Group();
  for (let k = 0; k < 3; k++) roof.add(box(TW + 0.4 - k * 3, 0.8, TW + 0.4 - k * 3, k % 2 ? Sd : S, 0, y0 + WH + k * 0.8, cz));
  f.add(mergeByMaterial(roof));
  addDetails(f, g, { cz, half, y0 });
  // From the north-west, so the doorway and the north balcony both show, the ramp behind.
  return { group: g, focus: f, view: [0.85, 0.35, 1], zoom: detail.low ? 0.85 : 0.9 };
}
