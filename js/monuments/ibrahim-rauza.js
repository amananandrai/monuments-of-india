import * as THREE from 'three';
import { mat, box, cyl, at, onFace, FACES, archWall } from '../helpers.js';
import { iwan, arcadeSkin, cellRow } from '../parts/mughal.js';
import { lotusDome, crescentFinial, chhajja, bracketGeo, placeAll, alongFace, mergeByMaterial } from '../parts/components.js';
import { addDetails } from '../details/ibrahim-rauza.js';

// The dark grey-brown basalt of Bijapur, and a lighter stone for the carved trim.
export const STONE = mat('#86796a', 0.9);
export const SHADE = mat('#6e6356', 0.92);
export const TRIM = mat('#a89a86', 0.86);

// A slender Adil Shahi minaret: an octagonal shaft in stages ringed by mouldings, a small balcony
// on brackets, and a bulbous dome in a cup of petals with its finial. Stands on y = 0.
export function minar(h, r, m = STONE, { dome = r * 1.25 } = {}) {
  const g = new THREE.Group(), stages = 3, sh = (h - dome * 2.2) / stages;
  for (let i = 0; i < stages; i++) {
    const rr = r * (1 - 0.06 * i);
    g.add(cyl(rr, rr * 1.04, sh, m, 0, i * sh, 0, 8), cyl(rr * 1.22, rr * 1.22, 0.22, TRIM, 0, (i + 1) * sh - 0.22, 0, 8));
  }
  const y = stages * sh;
  g.add(cyl(r * 1.6, r * 1.1, 0.4, TRIM, 0, y, 0, 12), cyl(r * 0.85, r * 0.85, dome * 0.35, m, 0, y + 0.4, 0, 8));
  g.add(at(lotusDome(dome, m, { ribs: 12, petals: 12, petalM: TRIM }), 0, y + 0.4 + dome * 0.35, 0), at(crescentFinial(dome * 1.3), 0, y + 0.4 + dome * 2.22, 0));
  return g;
}

// Ibrahim Rauza (1626–1627), the tomb of Ibrahim Adil Shah II at Bijapur, with its mosque. Both
// stand on a plinth about 120 x 50 m inside a walled garden some 137 m square, facing each other
// across a tank: the tomb on the east, the mosque on the west. The tomb is a square of 16 m under
// a bulbous dome on a raised storey, wrapped in a verandah of seven arches a side, its parapet
// bristling with small minarets and a taller one at each corner. The mosque's front is five arches
// under a deep eave on brackets, with a minaret at each corner and a dome over its middle.
// +x is east: the tomb at x = TX, the mosque at x = MX; the garden's gateway on its north side is
// at +z.
export const PH = 1.6, TX = 30, MX = -32, VS = 27, VH = 10;
function tomb() {
  const g = new THREE.Group();
  // The verandah round the tomb, its arcades, eave and parapet.
  g.add(box(VS, VH, VS, STONE), box(VS + 0.4, 0.5, VS + 0.4, TRIM, 0, VH - 2.4), box(VS + 0.2, 1.4, VS + 0.2, STONE, 0, VH));
  for (const a of FACES) {
    g.add(onFace(at(arcadeSkin(VS - 3, VH - 3, cellRow(7, (VS - 3) / 7, 0, 2.5, 6), 0.9, STONE, { trim: TRIM, fill: 'room' }), 0, 0, 0), a, VS / 2));
    g.add(onFace(at(chhajja(VS - 1, 1.6, 0.6, 0.18, SHADE), 0, VH - 1.6, 0), a, VS / 2 - 0.5));
    g.add(placeAll(bracketGeo(1.2, 1.2, 0.4), alongFace(a, VS / 2, VS - 2, 14, VH - 2.9), TRIM));
  }
  // The small minarets along the parapet, and a tall one at each corner of the verandah.
  for (const a of FACES) for (let k = 1; k < 6; k++) g.add(onFace(at(minar(4.4, 0.32, STONE, { dome: 0.45 }), -VS / 2 + (k * VS) / 6, VH + 1.4, 0), a, VS / 2 - 0.5));
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(at(minar(14, 0.95), x * (VS / 2 - 0.5), VH, z * (VS / 2 - 0.5)));
  // The tomb's upper storey above the verandah: arched faces, a pierced parapet with small
  // minarets at its corners, and the drum under the great bulbous dome.
  const UH = 6.5, U = 16, y1 = VH + 1.4;
  g.add(box(U, UH, U, STONE, 0, y1), box(U + 0.6, 0.4, U + 0.6, TRIM, 0, y1 + UH - 0.4), box(U + 0.2, 1.2, U + 0.2, STONE, 0, y1 + UH));
  for (const a of FACES) for (const lat of [-4.6, 0, 4.6]) g.add(onFace(at(iwan(2.6, 4.2, { m: STONE, trim: TRIM, shade: SHADE, depth: 0.5, frame: 0.4, top: 0.4, fill: 'jali', band: false, cells: false }), 0, y1 + 0.8, 0), a, U / 2, lat));
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(at(minar(7, 0.55), x * (U / 2 - 0.3), y1 + UH + 1.2, z * (U / 2 - 0.3)));
  const dy = y1 + UH + 1.2;
  g.add(cyl(6.2, 6.4, 1.6, STONE, 0, dy, 0, 32), cyl(6.7, 6.7, 0.3, TRIM, 0, dy + 1.6, 0, 32));
  g.add(at(lotusDome(6.0, STONE, { ribs: 20, petals: 20, petalM: TRIM }), 0, dy + 1.9, 0), at(crescentFinial(4.4), 0, dy + 1.9 + 6 * 1.86, 0));
  return g;
}

function mosque() {
  const g = new THREE.Group(), W = 34, D = 17, H = 11.5;
  g.add(box(W, H, D, STONE), box(W + 0.4, 0.5, D + 0.4, TRIM, 0, H - 2.5), box(W + 0.2, 1.2, D + 0.2, STONE, 0, H));
  // The front (+z here, turned to face east): five arches, the middle one wider.
  g.add(at(arcadeSkin(W - 4, H - 3.4, cellRow(5, (W - 4) / 5, 0, 4.4, 7.4), 1, STONE, { trim: TRIM, fill: 'room' }), 0, 0, D / 2));
  g.add(at(chhajja(W - 1, 2.4, 0.9, 0.2, SHADE), 0, H - 1.7, D / 2 - 0.4), placeAll(bracketGeo(1.8, 2, 0.5), alongFace(0, D / 2, W - 2, 16, H - 3.4), TRIM));
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(at(minar(19, 1.0), x * (W / 2 - 0.6), 0, z * (D / 2 - 0.6)));
  for (let k = 1; k < 8; k++) g.add(at(minar(3.6, 0.28, STONE, { dome: 0.4 }), -W / 2 + (k * W) / 8, H + 1.2, D / 2 - 0.4));
  g.add(cyl(3.6, 3.8, 1.4, STONE, 0, H + 1.2, 0, 24), at(lotusDome(3.4, STONE, { petalM: TRIM }), 0, H + 2.6, 0), at(crescentFinial(2.6), 0, H + 2.6 + 3.4 * 1.86, 0));
  return g;
}

export function buildIbrahimRauza() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The plinth, with steps up on its north and south sides.
  f.add(box(120, PH, 50, SHADE, 0, 0, 0), box(120.4, 0.25, 50.4, TRIM, 0, PH - 0.25, 0));
  f.add(mergeByMaterial(at(tomb(), TX, PH, 0)), mergeByMaterial(at(mosque(), MX, PH, 0).rotateY(Math.PI / 2)));
  // The garden's wall, 137 m square, and the gateway on its north side with two minarets.
  const wall = new THREE.Group(), L = 137, WH = 6;
  for (const a of FACES) {
    if (a === 0) for (const s of [-1, 1]) wall.add(onFace(box(L / 2 - 9, WH, 1.6, STONE, s * (L / 4 + 4.5), 0, 0), a, L / 2));
    else wall.add(onFace(box(L, WH, 1.6, STONE), a, L / 2));
  }
  const gate = new THREE.Group();
  gate.add(archWall(18, 15, 9, 5, 9, true, STONE), at(iwan(7, 11, { m: STONE, trim: TRIM, shade: SHADE, depth: 1.4, frame: 1.2, top: 1.4, fill: 'door', band: true }), 0, 0, 4.5));
  gate.add(box(18.4, 0.5, 9.4, TRIM, 0, 13), box(18.2, 1.2, 9.2, STONE, 0, 15));
  for (const s of [-1, 1]) gate.add(at(minar(22, 1.05), s * 9.6, 0, 3.6));
  wall.add(at(gate, 0, 0, L / 2));
  f.add(mergeByMaterial(wall));
  addDetails(f, g, { PH, TX, MX, L });
  // From the north-east, over the gateway: the tomb and, beyond the tank, the mosque.
  return { group: g, focus: f, view: [0.6, 0.36, 1], zoom: 0.5 };
}
