import * as THREE from 'three';
import { mat, mesh, box, cyl, lathe, at, onFace, FACES, archWall, planSolid } from '../helpers.js';
import { iwan, arcadeSkin, cellRow, pierced } from '../parts/mughal.js';
import { petalRing, bracketGeo, placeAll, alongFace, merlons, jali, mergeByMaterial } from '../parts/components.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/ibrahim-rauza.js';

// The dark grey-brown basalt of Bijapur, a lighter stone for the carved trim, and the buff plaster
// that still covers the mosque's front and dome.
export const STONE = mat('#86796a', 0.9);
export const SHADE = mat('#6e6356', 0.92);
export const TRIM = mat('#a89a86', 0.86);
export const STUCCO = mat('#c2b294', 0.88);

// The finial of a Bijapur dome: a stack of discs and bulbs drawn out into a spike, h high.
export function spike(h, m = SHADE) {
  return lathe([[0.1, 0], [0.2, 0.05], [0.07, 0.13], [0.22, 0.24], [0.24, 0.31], [0.07, 0.42], [0.14, 0.52], [0.05, 0.62], [0.03, 0.8], [0, 1]].map(([r, y]) => [r * h * 0.6, y * h]), m, 8);
}
// A Bijapur dome of radius R: three-quarters of a sphere, drawn in at the foot where it sits in
// its cup of petals. About 1.56 R high, standing on y = 0.
export function bulb(R, m, seg = 16) {
  const pts = [], n = Math.max(6, Math.round(seg / 2));
  for (let k = 0; k <= n; k++) { const t = -0.6 + (k / n) * (Math.PI / 2 + 0.6); pts.push([Math.max(0, R * Math.cos(t)), R * (Math.sin(t) + Math.sin(0.6))]); }
  return lathe(pts, m, seg);
}

// A slender Adil Shahi minaret: an octagonal shaft in stages, each under a collar of leaves, and
// a ball dome in a cup of petals with its spike. Stands on y = 0; h is to the top of the dome.
export function minar(h, r, m = STONE, { dome = r * 1.25, stages = 3 } = {}) {
  const g = new THREE.Group(), y = h - dome * 1.9, sh = y / stages, c = r * 0.5;
  for (let i = 0; i < stages; i++) {
    const rr = r * (1 - 0.05 * i);
    g.add(cyl(rr, rr * 1.03, sh, m, 0, i * sh, 0, 8), cyl(rr * 1.5, rr * 1.05, c, TRIM, 0, (i + 1) * sh - c * 1.5, 0, 8), cyl(rr * 1.25, rr * 1.5, c * 0.5, TRIM, 0, (i + 1) * sh - c * 0.5, 0, 8));
  }
  g.add(cyl(r * 0.8, r * 0.85, dome * 0.4, m, 0, y, 0, 8));
  if (dome > 0.6) g.add(at(petalRing(dome * 0.8, 10, dome * 0.9, dome * 0.56, 0.5, TRIM, 0.3), 0, y + dome * 0.3, 0));
  else g.add(cyl(dome * 1.05, dome * 0.7, dome * 0.5, TRIM, 0, y + dome * 0.15, 0, 8));
  g.add(at(bulb(dome, m, dome > 0.6 ? 16 : 8), 0, y + dome * 0.34, 0), at(spike(dome * 1.5), 0, y + dome * 1.88, 0));
  return g;
}

// A parapet turret: a square post through the pierced parapet, a bracketed cap and a small domed
// kiosk with its spike. Stands on the roof (y = 0), about 3.9 s high.
function turret(s = 1, m = STONE) {
  const g = new THREE.Group();
  g.add(box(0.8 * s, 2.1 * s, 0.8 * s, m), box(1.15 * s, 0.16 * s, 1.15 * s, TRIM, 0, 2.1 * s), box(0.62 * s, 0.5 * s, 0.62 * s, m, 0, 2.26 * s));
  g.add(box(0.85 * s, 0.1 * s, 0.85 * s, TRIM, 0, 2.76 * s), at(bulb(0.4 * s, m, 8), 0, 2.84 * s, 0), at(spike(0.55 * s), 0, 3.44 * s, 0));
  return g;
}

// A block w0 × d0 at the top spreading to w1 × d1 at the foot, h high: the deep eave that runs
// unbroken round a Bijapur building, and the battered bases of its turrets.
function taperBox(w0, d0, w1, d1, h, m, y = 0) {
  const geo = new THREE.BoxGeometry(w0, h, d0), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setXYZ(i, (p.getX(i) * w1) / w0, p.getY(i), (p.getZ(i) * d1) / d0);
  geo.computeVertexNormals();
  return mesh(geo, m, 0, y + h / 2, 0);
}

// What crowns every wall here, on a block w × d whose roof is at y: the eave on its rows of
// brackets, a cornice, and a parapet of pierced panels under a cresting, between turrets standing
// at `posts` ([[lats along the ±z faces], [lats along the ±x faces]]).
function crown(w, d, y, posts, { eave = 2, m = STONE, s = 1 } = {}) {
  const g = new THREE.Group();
  g.add(taperBox(w + 0.3, d + 0.3, w + 2 * eave, d + 2 * eave, 0.5, SHADE, y - 0.85), box(w + 0.5, 0.5, d + 0.5, TRIM, 0, y - 0.35, 0), box(w + 0.3, 0.3, d + 0.3, m, 0, y - 1.15, 0));
  FACES.forEach((a, i) => {
    const len = i % 2 ? d : w, dist = (i % 2 ? w : d) / 2;
    g.add(placeAll(bracketGeo(1.5, eave * 0.75, 0.4), alongFace(a, dist + 0.12, len, Math.round(len / 1.05), y - 0.86), TRIM));
    g.add(onFace(box(len, 0.35, 0.5, m, 0, y + 0.15, 0), a, dist - 0.2), onFace(box(len - 0.6, 0.95, 0.16, jali(TRIM), 0, y + 0.5, 0), a, dist - 0.2), onFace(box(len, 0.15, 0.55, TRIM, 0, y + 1.45, 0), a, dist - 0.2));
    if (!detail.low) g.add(onFace(at(merlons(len - 1, 0.5, 0.42, 0.14, TRIM, 0.2), 0, y + 1.6, 0), a, dist - 0.2));
    for (const lat of posts[i % 2]) g.add(onFace(at(turret(s, m), 0, y + 0.15, 0), a, dist - 0.2, lat));
  });
  return g;
}

// Ibrahim Rauza (1626–1627), the tomb of Ibrahim Adil Shah II at Bijapur, with its mosque. Both
// stand on a plinth about 110 x 46 m, its sides a basement arcade, inside a walled garden some
// 137 m square, and face each other across a sunken tank: the tomb on the east, the mosque on the
// west. The tomb chamber, some 13 m square inside, stands in a double verandah about 35 m square:
// seven arches a side between massive corner piers (wide end arches, a narrow one next to each,
// three between), then a row of carved pillars, then the chamber's wall of doors and inscribed
// windows. A deep eave on brackets runs round it; over it a pierced parapet between domed turrets,
// a minaret at each corner, and the chamber rising as an upper storey to a ball dome in a ring of
// petals. The mosque's front is five arches in buff plaster under the same eave and parapet, with
// a minaret at each corner and a dome over the bay before the mihrab.
// The gateway on the garden's north side is at +z, so +x is west: the tomb at x = TX, the mosque
// at x = MX.
export const PH = 2.7, PW = 104, PD = 46, TX = -29, MX = 27, VS = 34, VH = 9.6, U = 15.6, CP = 3.2;
// The seven arches of a side of the verandah: [centre along the face, width, crown height].
export const BAYS = (() => {
  const ws = [3.8, 2, 3.3, 3.3, 3.3, 2, 3.8], hs = [7, 6.5, 6.8, 6.8, 6.8, 6.5, 7], len = VS - 2 * CP, p = (len - ws.reduce((a, b) => a + b)) / 8, out = [];
  let x = -len / 2 + p;
  ws.forEach((w, i) => { out.push([x + w / 2, w, hs[i]]); x += w + p; });
  return out;
})();
// The piers between the arches (and at the corner piers' edges), where the parapet's turrets stand.
export const PIERS = [...BAYS.map(([cx, w]) => cx - w / 2 - 0.38), BAYS[6][0] + BAYS[6][1] / 2 + 0.38];

function tomb() {
  const g = new THREE.Group(), half = VS / 2, T = 1.3, RY = VH + 0.15;
  // The outer arcade between the corner piers, which stand a little proud with moulded feet.
  for (const a of FACES) g.add(onFace(pierced(VS - 2 * CP, VH, BAYS.map(([cx, w, h]) => [cx, 0, w, h]), T, STONE), a, half - T));
  for (const x of [-1, 1]) for (const z of [-1, 1]) {
    const px = x * (half - CP / 2), pz = z * (half - CP / 2);
    g.add(box(CP + 0.3, VH, CP + 0.3, STONE, px, 0, pz), taperBox(CP + 0.5, CP + 0.5, CP + 0.9, CP + 0.9, 0.7, TRIM, 0).translateX(px).translateZ(pz));
    for (const y of [2.6, 5.4, 7.6]) g.add(box(CP + 0.5, 0.3, CP + 0.5, TRIM, px, y, pz));
  }
  // The chamber, rising through the verandah's roof as the upper storey.
  const UH = 4.6;
  g.add(box(U, RY + UH, U, STONE));
  // The verandah's eave, parapet and turrets, and a minaret on each corner pier.
  g.add(crown(VS, VS, RY, [PIERS, PIERS]));
  for (const x of [-1, 1]) for (const z of [-1, 1]) {
    const px = x * (half - 1.5), pz = z * (half - 1.5);
    g.add(box(2.3, 2.4, 2.3, STONE, px, RY, pz), box(2.6, 0.3, 2.6, TRIM, px, RY + 2.4, pz), at(minar(9.4, 0.82), px, RY + 2.7, pz));
  }
  // The upper storey's own eave and parapet, its turrets and corner minarets.
  const y2 = RY + UH, ups = [-4.4, -1.5, 1.5, 4.4];
  g.add(crown(U, U, y2, [ups, ups], { eave: 1.1, s: 0.8 }));
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(at(minar(6.4, 0.5), x * (U / 2 - 0.5), y2 + 0.15, z * (U / 2 - 0.5)));
  // A last low terrace with a turret at each corner and side, the drum, and the ball dome rising
  // out of its ring of tall petals.
  const y3 = y2 + 1.2, R = 5.4;
  g.add(box(12, 1.2, 12, STONE, 0, y2, 0), box(12.3, 0.2, 12.3, TRIM, 0, y3, 0));
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]) g.add(at(turret(0.75), x * 5.5, y3, z * 5.5));
  g.add(cyl(R * 0.84, R * 0.9, 0.9, STONE, 0, y3, 0, 32), at(petalRing(R * 0.84, 24, 2.7, 1.25, 0.34, TRIM, 0.3), 0, y3 + 0.7, 0));
  g.add(at(bulb(R, STONE, 40), 0, y3 + 0.9, 0), at(spike(4), 0, y3 + 0.9 + R * 1.55, 0));
  return g;
}

// The mosque, facing +z here (turned to face the tomb): W across its front, D deep.
export const MW = 32, MD = 24, MH = 9.9;
function mosque() {
  const g = new THREE.Group(), W = MW, D = MD, H = MH, T = 1.4, RY = H + 0.15, len = W - 2 * CP;
  // The front of five equal arches in plaster between stone corner piers, a second row of arches
  // a bay behind it, and the body of the prayer hall.
  const five = cellRow(5, len / 5, 0, 3.5, 6.7);
  g.add(at(pierced(len, H, five, T, STUCCO), 0, 0, D / 2 - T), at(pierced(len, H, five, 1, SHADE), 0, 0, D / 2 - 7));
  g.add(box(W, H, D - 7.5, STONE, 0, 0, -3.75), box(len + 0.1, 0.3, 7.5, SHADE, 0, H - 0.3, D / 2 - 3.75));
  for (const x of [-1, 1]) {
    g.add(box(CP + 0.3, H, CP + 0.3, STONE, x * (W / 2 - CP / 2), 0, D / 2 - CP / 2), box(T, H, 7.6, STONE, x * (W / 2 - T / 2), 0, D / 2 - 3.8));
    for (const y of [2.6, 5.4, 7.6]) g.add(box(CP + 0.5, 0.3, CP + 0.5, TRIM, x * (W / 2 - CP / 2), y, D / 2 - CP / 2));
  }
  // The mihrab's bay standing out of the back wall.
  g.add(box(6, H + 0.1, 2.4, STONE, 0, 0, -D / 2 - 1.2));
  // Eave, parapet and turrets; a minaret at each corner.
  const fr = five.map(([cx]) => cx + len / 10).slice(0, 4), front = [-len / 2 - 0.2, ...fr, len / 2 + 0.2], side = [-9, -4.5, 0, 4.5, 9];
  g.add(crown(W, D, RY, [front, side]));
  for (const x of [-1, 1]) for (const z of [-1, 1]) {
    const px = x * (W / 2 - 1.5), pz = z * (D / 2 - 1.5);
    g.add(box(2.3, 2.4, 2.3, STONE, px, RY, pz), box(2.6, 0.3, 2.6, TRIM, px, RY + 2.4, pz), at(minar(9.8, 0.8), px, RY + 2.7, pz));
  }
  // The dome before the mihrab, on a square terrace with corner turrets, in its ring of petals.
  const R = 4.1, dz = -D / 2 + 7.5, y3 = RY + 2.2;
  g.add(box(10.5, 2.2, 10.5, STONE, 0, RY, dz), box(10.8, 0.2, 10.8, TRIM, 0, y3, dz));
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(at(turret(0.8), x * 4.8, y3, dz + z * 4.8));
  g.add(cyl(R * 0.84, R * 0.9, 1.2, STUCCO, 0, y3, dz, 28), at(petalRing(R * 0.84, 20, 2.4, 1.1, 0.34, STUCCO, 0.3), 0, y3 + 1, dz));
  g.add(at(bulb(R, STUCCO, 32), 0, y3 + 1.2, dz), at(spike(3), 0, y3 + 1.2 + R * 1.55, dz));
  return g;
}

// The tank between the two, sunk into the plinth: TK square, at x = TKX.
export const TKX = 1.5, TK = 17;
export function buildIbrahimRauza() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The plinth, its sides a basement of arched cells, with the tank cut out of it.
  const pl = new THREE.Group(), iw = PW / 2 - 0.6, id = PD / 2 - 0.6, th = TK / 2;
  pl.add(planSolid([[-iw, -id], [iw, -id], [iw, id], [-iw, id]], [[[TKX - th, -th], [TKX + th, -th], [TKX + th, th], [TKX - th, th]]], PH - 0.3, SHADE, SHADE));
  const cells = (len, skip) => arcadeSkin(len, PH - 0.3, cellRow(Math.round(len / 3.7), len / Math.round(len / 3.7), 0, 2.4, 2, skip), 0.6, SHADE, { trim: TRIM, fill: 'room' });
  pl.add(at(cells(PW, [[-6, 6]]), 0, 0, id), at(cells(PW), 0, 0, -id).rotateY(Math.PI));
  for (const s of [-1, 1]) pl.add(at(cells(PD - 1.2), s * iw, 0, 0).rotateY(s * Math.PI / 2));
  // The paved top, laid as four slabs round the tank.
  const top = (w, d, x, z) => pl.add(box(w, 0.3, d, TRIM, x, PH - 0.3, z));
  top(PW + 0.4, PD / 2 + 0.2 - th, 0, (PD / 2 + 0.2 + th) / 2); top(PW + 0.4, PD / 2 + 0.2 - th, 0, -(PD / 2 + 0.2 + th) / 2);
  top(PW / 2 + 0.2 + TKX - th, TK, (TKX - th - PW / 2 - 0.2) / 2, 0); top(PW / 2 + 0.2 - TKX - th, TK, (TKX + th + PW / 2 + 0.2) / 2, 0);
  f.add(mergeByMaterial(pl));
  f.add(mergeByMaterial(at(tomb(), TX, PH, 0)), mergeByMaterial(at(mosque(), MX, PH, 0).rotateY(-Math.PI / 2)));
  // The garden's wall, 137 m square: a range of cells 5 m deep under a flat roof, and the gateway
  // in the middle of its north side, a square tower with a minaret at each front corner.
  const wall = new THREE.Group(), L = 137, WH = 5.2, WT = 5, GW = 13, GH = 13.4;
  for (const a of FACES) {
    if (a === 0) for (const s of [-1, 1]) wall.add(onFace(box((L - GW) / 2, WH, WT - 1.2, STONE), a, L / 2 - WT / 2, s * (L + GW) / 4));
    else wall.add(onFace(box(L - 2 * WT, WH, WT - 0.6, STONE), a, L / 2 - (WT - 0.6) / 2));
    if (a > 1) wall.add(onFace(box(WT, WH, WT, STONE), a, L / 2 - WT / 2, L / 2 - WT / 2));
  }
  const gate = new THREE.Group();
  gate.add(archWall(GW, GH, 9, 3.4, 5.4, true, STONE), at(iwan(6, 8.4, { m: STONE, trim: TRIM, shade: SHADE, depth: 1.2, frame: 1.1, top: 1, fill: 'door', band: true }), 0, 0, 4.5));
  gate.add(box(GW + 0.4, 0.4, 9.4, TRIM, 0, GH - 0.4), box(GW + 0.1, 1, 9.1, STONE, 0, GH));
  for (const s of [-1, 1]) gate.add(at(minar(22, 1.05, STONE, { stages: 5 }), s * (GW / 2 + 0.4), 0, 4.1), at(minar(5.6, 0.45), s * (GW / 2 - 0.5), GH + 1, -4));
  wall.add(at(gate, 0, 0, L / 2 - 2));
  f.add(mergeByMaterial(wall));
  addDetails(f, g, { PH, TX, MX, L, WH, WT, GW, GH });
  // From the north-east, inside the garden: the tomb, and beyond the tank the mosque.
  return { group: g, focus: f, view: [-0.8, 0.2, 1], zoom: 0.3, target: [-4, 7, 0] };
}
