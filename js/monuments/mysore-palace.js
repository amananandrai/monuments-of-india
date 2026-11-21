import * as THREE from 'three';
import { M, V, mat, surface, box, cyl, mesh, lathe, at, onFace, ONION, onionDome, finial, chhatri, bulbPoints, ribbed } from '../helpers.js';
import { mergeByMaterial, jharokha } from '../parts/components.js';
import { arcadeSkin } from '../parts/mughal.js';
import { addDetails } from '../details/mysore-palace.js';
import { detail } from '../detail.js';

// The Mysore Palace (Amba Vilas, Henry Irwin, 1897–1912), after photographs of its main front: a
// long, low face some 125 m across and three storeys high, cream above and grey granite below. A row
// of small arches runs along the ground floor; over it the Durbar Hall opens to the front in a
// great arcade of wide, cusped arches on paired columns, the central arch the widest; above that a
// gallery of small arched windows runs under the cornice and a balustraded parapet. The central bay
// stands forward and rises above the parapet into a gable framed by a broad red horseshoe hood
// (Gajalakshmi sits in it), with a red-domed kiosk either side; behind it, set back over the roof,
// the five-storey tower climbs to the gilded dome and its spire, 44 m up. Over the roof to either
// side a grey dome stands on a square kiosk. At each end a pair of tall square towers in pink-brown
// granite, their faces stacked with oriel windows under red hoods, carry crimson onion domes.
// Everything faces +z; the front of the arcade is at z = 24.

// The arcade's bays: [centre x, width, height] of each arch, the sill of all at y 4.8.
// (Measured off a frontal photograph: the ground storey is low, about a sixth of the front's
// height, and the great arches stand tall above it on slender columns.)
export const BAYS = [[-37, 9, 8.1], [-26.2, 9, 8.1], [-15.4, 9, 8.1], [-8, 4.4, 7.9], [0, 10.4, 8.6], [8, 4.4, 7.9], [15.4, 9, 8.1], [26.2, 9, 8.1], [37, 9, 8.1]];
export const FZ = 24, ARC_SILL = 4.8;
const CREAM = surface(mat('#ecd9a2', 0.82), 'carved'), TAN = surface(mat('#cda98c', 0.85), 'carved'), RED = surface(mat('#a3202a', 0.5), 'carved');
const DOMEGREY = mat('#82786b', 0.45, 0.35), L = M.lime;
// The central tower's stone, a darker golden buff than the fronts.
const TOWERM = surface(mat('#c2a274', 0.82), 'carved');
// The palace's domes as photographed: nearly a ball, a little drawn up at the crown, with fine
// ribs. Of unit radius at its widest and 1.6 high.
const BULB = [[0.74, 0], [0.93, 0.18], [1.0, 0.52], [0.95, 0.86], [0.76, 1.16], [0.46, 1.4], [0.16, 1.54], [0, 1.6]];
const bulb = (r, m, ribs = 16) => ribbed(lathe(BULB.map(([a, c]) => [a * r, c * r]), m, 40), ribs, 0.025);
export const PALACE = { CREAM, TAN, RED };
// The end towers, [x, z, turn, width]: at each end of the front an inner and an outer tower, and
// behind the outer one a third that faces sideways, so each side of the palace shows two domes.
export const END_TOWERS = [-1, 1].flatMap((s) => [[s * 46.1, 19.5, 0, 8.4], [s * 60.8, 19.5, 0, 7.6], [s * 60.1, 3.6, s * Math.PI / 2, 7.6]]);

export function buildMysorePalace() {
  const S = M.mysore, g = new THREE.Group(), f = new THREE.Group(), b = 1;
  g.add(f);
  const bulbs = [];
  const line = (a, c, step = 0.9) => {
    const n = Math.max(1, Math.round(a.distanceTo(c) / step));
    for (let i = 0; i <= n; i++) bulbs.push(a.clone().lerp(c, i / n));
  };
  const rect = (x0, x1, y, z0, z1) => {
    line(V(x0, y, z0), V(x1, y, z0)); line(V(x1, y, z0), V(x1, y, z1));
    line(V(x1, y, z1), V(x0, y, z1)); line(V(x0, y, z1), V(x0, y, z0));
  };
  const verticals = (x0, x1, z0, z1, y0, y1) => { for (const x of [x0, x1]) for (const z of [z0, z1]) line(V(x, y0, z), V(x, y1, z)); };
  // A round arch's outline in bulbs: its sides from the sill to the springing, then the half circle.
  const arch = (aw, ah, x, y, z) => {
    const r = aw / 2, s = ah - r;
    for (const sd of [-1, 1]) line(V(x + sd * r, y + 0.3, z), V(x + sd * r, y + s, z));
    for (let k = 1; k < 14; k++) { const a = Math.PI - (k / 14) * Math.PI; bulbs.push(V(x + Math.cos(a) * r, y + s + Math.sin(a) * r, z)); }
  };
  const dome = (cx, cy, cz, r) => {
    for (let m = 0; m < 12; m++) {
      const a = (m / 12) * Math.PI * 2;
      for (let i = 0; i < ONION.length - 1; i++) for (let t = 0; t < 1; t += 0.34) {
        const pr = ONION[i][0] + (ONION[i + 1][0] - ONION[i][0]) * t, py = ONION[i][1] + (ONION[i + 1][1] - ONION[i][1]) * t;
        bulbs.push(V(cx + Math.cos(a) * pr * r * 1.02, cy + py * r, cz + Math.sin(a) * pr * r * 1.02));
      }
    }
  };
  // The lawns and the red-brick approach (js/details/mysore-palace.js adds its railings and lamps).
  g.add(box(260, 0.15, 150, M.grass, 0, 0, 80), box(16, 0.2, 108, mat('#9a5646', 0.9), 0, 0, 80));
  f.add(box(130, b, 50, S, 0, 0, 1.5));

  /* The main range, 83.6 wide, from z = -20 to the front. */
  const W = 83.6, H = 16.4;
  f.add(box(W - 4, H, 37.6, CREAM, 0, b, 0.8));
  // The front: the ground floor's arches, the Durbar Hall's arcade over them and the gallery's
  // windows above that, all cut in one skin 2.4 deep; the central bay is built forward of it.
  const cells = [];
  for (let k = 0; k < 32; k++) { const cx = (k - 15.5) * 2.62; if (Math.abs(cx) > 3) cells.push([cx, 0.4, 1.9, 3.0, 'room']); }
  cells.push([0, 0.4, 4, 3.2, 'door']);
  for (const [cx, w, h] of BAYS) cells.push([cx, ARC_SILL - b, w, h, 'room']);
  for (const s of [-1, 1]) for (let i = 0; i < 16; i++) cells.push([s * (12.6 + i * 1.9), 12.8, 1.25, 3.0, 'room']);
  f.add(at(arcadeSkin(W, H, cells, 2.4, CREAM, { trim: L, pointed: false }), 0, b, FZ - 2.4));
  // The storey bands: the ground floor's top, the gallery's sill, the cornice under the parapet.
  f.add(box(W + 0.4, 0.45, 0.5, L, 0, ARC_SILL - 0.35, FZ + 0.05), box(W + 0.4, 0.5, 0.7, L, 0, 13.2, FZ + 0.1), box(W + 1, 0.6, 45, L, 0, b + H, 1.3), box(W - 3, 0.3, 40, mat('#b9ae95', 0.9), 0, b + H + 0.6, -0.5));
  // The back and the ends of the range: two storeys of arched windows between pilaster bays.
  const back = [], ends = [];
  for (let k = -6; k <= 6; k++) back.push([k * 6.4, 1, 3.4, 6.4, 'room'], [k * 6.4, 9.2, 3, 5, 'jali']);
  for (let k = -2; k <= 2; k++) ends.push([k * 6, 1, 3.2, 6.4, 'room'], [k * 6, 9.2, 2.8, 5, 'jali']);
  f.add(at(arcadeSkin(W - 4, H, back, 2, CREAM, { trim: L, fill: 'room', pointed: false }), 0, b, -18).rotateY(Math.PI));
  for (const s of [-1, 1]) f.add(at(arcadeSkin(32, H, ends, 2, CREAM, { trim: L, fill: 'room', pointed: false }), s * (W / 2 - 2), b, -2.2).rotateY(s * Math.PI / 2));
  for (const [cx, w, h] of BAYS) arch(w, h, cx, ARC_SILL, FZ + 0.4);
  rect(-W / 2 - 0.5, W / 2 + 0.5, b + H + 0.65, -21.2, FZ + 0.3);

  /* The central bay: forward of the range, five arched windows over the great arch, and the gable
     in its red hood, with a red-domed kiosk either side. */
  f.add(box(22, 8.6, 0.6, CREAM, 0, 13.2, FZ), at(arcadeSkin(22, 8.6, [-7.6, -3.8, 0, 3.8, 7.6].map((x) => [x, 0.6, x ? 2.5 : 2.8, x ? 4.3 : 4.7]), 1.0, CREAM, { trim: L, pointed: false, fill: 'room' }), 0, 13.2, FZ + 0.6));
  f.add(box(22.6, 0.5, 2.2, L, 0, 21.8, FZ + 0.6));
  // The tympanum, a half disc, and the hood round it: a broad red band, a little more than a half
  // circle, standing forward of it.
  const half = (r0, r1, t, ext = 0) => {
    const sh = new THREE.Shape();
    sh.absarc(0, 0, r1, -ext, Math.PI + ext, false);
    if (r0 > 0) sh.absarc(0, 0, r0, Math.PI + ext, -ext, true); else sh.lineTo(0, 0);
    return new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 32 });
  };
  // (The hood is a low, broad arch, not a half circle: flattened to two-thirds of its height.)
  const tymp = mesh(half(0, 4.0, 0.4), CREAM, 0, 22.3, FZ + 0.6), hood = mesh(half(4.0, 5.3, 1.7, 0.12), RED, 0, 22.3, FZ + 0.6);
  tymp.scale.y = hood.scale.y = 0.68;
  f.add(tymp, hood, box(11.4, 0.5, 2.2, L, 0, 21.8, FZ + 0.7));
  for (const s of [-1, 1]) {
    f.add(box(3.6, 3.4, 3.6, CREAM, s * 8.6, 22.3, FZ + 0.4), at(onionDome(1.65, RED), s * 8.6, 26.1, FZ + 0.4), at(finial(1.6), s * 8.6, 26.1 + 1.65 * 1.78, FZ + 0.4));
    f.add(box(4, 0.4, 4, L, s * 8.6, 25.7, FZ + 0.4));
    dome(s * 8.6, 26.1, FZ + 0.4, 1.65);
  }

  /* The central tower, set back over the roof: two tiers of arched openings on every face, gilt
     domelets on the corners of the lower, an octagonal drum, the gilded dome and its spire. */
  const tz = 12, tower = new THREE.Group();
  // A face w wide and h high of a square block, with rows [sill, width, height, count] of arches.
  const face = (w, h, rows, d = 0.7, m = CREAM) => arcadeSkin(w, h, rows.flatMap(([y, aw, ah, n]) => Array.from({ length: n }, (_, i) => [(i - (n - 1) / 2) * (w / n), y, aw, ah, 'room'])), d, m, { trim: L, pointed: false });
  tower.add(box(9.6, 10, 9.6, TOWERM, 0, 18, 0), box(6.8, 5, 6.8, TOWERM, 0, 28, 0));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) tower.add(onFace(at(face(11, 10, [[0.8, 2, 3.6, 3], [5.5, 2, 3.6, 3]], 0.7, TOWERM), 0, 18, 0), a, 4.8), onFace(at(face(8, 5, [[0.8, 1.8, 3.4, 3]], 0.6, TOWERM), 0, 28, 0), a, 3.4));
  for (const y of [22.8, 27.6]) tower.add(box(11.6, 0.5, 11.6, L, 0, y, 0));
  tower.add(box(8.6, 0.5, 8.6, L, 0, 32.8, 0));
  // An octagonal turret up each corner of the lower stage, under a small ribbed dome of grey metal.
  for (const x of [-4.9, 4.9]) for (const z of [-4.9, 4.9]) tower.add(cyl(1.0, 1.1, 11.2, TOWERM, x, 18, z, 8), cyl(1.25, 1.25, 0.3, L, x, 29.2, z, 8), at(bulb(1.2, DOMEGREY, 8), x, 29.5, z), at(finial(1.2, DOMEGREY), x, 29.5 + 1.2 * 1.6, z));
  // A third, narrower stage, then the drum and the gilded dome: nearly a ball, with a small open
  // lantern on its crown under a dome of its own and the spire. The tower tapers in steps to 44 m.
  tower.add(box(5.2, 2.8, 5.2, TOWERM, 0, 33.3, 0), box(5.9, 0.35, 5.9, L, 0, 36.1, 0));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) tower.add(onFace(at(face(5.2, 2.8, [[0.4, 1.1, 2.0, 2]], 0.4, TOWERM), 0, 33.3, 0), a, 2.6));
  // The gilded dome is in two tiers: the great dome, and on its crown an open lantern of eight
  // posts carrying a second, smaller dome, with the spire on that.
  tower.add(cyl(2.2, 2.4, 0.7, TOWERM, 0, 36.45, 0, 8), at(bulb(2.5, M.gild), 0, 37.15, 0));
  tower.add(cyl(1.25, 1.35, 0.2, M.gild, 0, 40.95, 0, 16), cyl(1.3, 1.2, 0.18, M.gild, 0, 42.45, 0, 16));
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; tower.add(cyl(0.09, 0.09, 1.3, M.gild, Math.sin(a) * 1.02, 41.15, Math.cos(a) * 1.02, 6)); }
  tower.add(at(bulb(1.12, M.gild, 8), 0, 42.6, 0), at(finial(1.5), 0, 42.6 + 1.12 * 1.6, 0));
  f.add(at(mergeByMaterial(tower), 0, 0, tz));
  verticals(-5.5, 5.5, tz - 5.5, tz + 5.5, 18, 28);
  dome(0, 37.15, tz, 2.5);
  dome(0, 42.6, tz, 1.1);

  /* The two grey domes over the roof: a square kiosk with arched windows, a drum, and a ribbed dome
     of weathered metal with a small lantern. */
  const greyDome = lathe([[3.0, 0], [3.15, 0.8], [3.0, 2.0], [2.45, 3.2], [1.5, 4.1], [0.5, 4.6], [0, 4.7]], DOMEGREY, 40);
  for (const s of [-1, 1]) {
    const x = s * 28.6, z = 19, k = new THREE.Group();
    k.add(box(6.4, 4.2, 6.4, CREAM, 0, 17.9, 0), box(7, 0.4, 7, L, 0, 22.1, 0));
    for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) k.add(onFace(at(face(7, 4.2, [[0.5, 1.4, 3, 3]], 0.3), 0, 17.9, 0), a, 3.2));
    k.add(cyl(2.9, 2.9, 1.1, CREAM, 0, 22.5, 0, 24), at(ribbed(greyDome.clone(), 16, 0.05), 0, 23.6, 0), cyl(0.35, 0.5, 1.2, DOMEGREY, 0, 28.2, 0, 8), at(finial(1.8, DOMEGREY), 0, 29.4, 0));
    // Each stands on a lower stage of its own, so the dome rises clear of the roofline.
    f.add(at(mergeByMaterial(k), x, 3, z), box(7.4, 3, 7.4, CREAM, x, 17.9, z), box(7.9, 0.35, 7.9, L, x, 20.55, z));
    dome(x, 26.6, z, 3.0);
    // Small kiosks with red domes on the parapet.
    for (const kx of [s * 21.3, s * 33.4]) f.add(at(chhatri(0.65, 2.0, CREAM, RED), kx, 18.5, FZ - 0.6));
  }

  /* The end pavilions: on each side an inner and an outer tower in pink-brown granite, between
     them a lower range with a tall arch on the ground floor, and a third tower behind the outer one. */
  // One end tower, w wide and 9 deep, its front towards +z, standing on y = 0.
  const endTower = (w) => {
    const t = new THREE.Group();
    t.add(box(w, 23.6, 9, TAN, 0, 0, 0));
    // The front: two arched windows on the ground floor, three under the cornice; the bands.
    t.add(at(arcadeSkin(w, 23.6, [[-w / 4, 1, 1.7, 3.6, 'room'], [w / 4, 1, 1.7, 3.6, 'room'], [-w * 0.3, 18.6, 1.4, 3.0, 'room'], [0, 18.6, 1.4, 3.0, 'room'], [w * 0.3, 18.6, 1.4, 3.0, 'room']], 0.6, TAN, { trim: L, pointed: false }), 0, 0, 4.5));
    for (const y of [6.0, 17.4, 23.4]) t.add(box(w + 0.5, 0.45, 9.5, L, 0, y, 0));
    // The oriels stacked up the middle of the face, the top one under a red hood.
    // (On desktops the three-storey bay of windows under its red hood takes their place:
    // js/details/mysore-palace.js.)
    if (detail.low) for (const [y, red] of [[7.4, false], [10.8, false], [14.2, true]]) t.add(at(jharokha(3.2, 2.6, CREAM, { d: 1.0, trim: L, roof: red ? 'dome' : 'bangla', roofM: red ? RED : TAN }), 0, y, 5.1));
    // The top, as photographed: over the eave a cream attic with a white cornice, two red posts
    // with gilt caps at each corner, a cream drum, and the crimson dome, nearly a ball, with its
    // gilt finial.
    t.add(box(w - 0.6, 1.9, 8.0, CREAM, 0, 23.85, 0), box(w - 0.2, 0.3, 8.4, L, 0, 25.75, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const k of detail.low ? [0] : [0, 1]) {
      const px = sx * (w / 2 - 0.55 - k * 0.75), pz = sz * (3.75 - (1 - k) * 0.0);
      t.add(cyl(0.13, 0.17, 1.5, RED, px, 26.05, pz, 6), cyl(0.2, 0.05, 0.45, M.gild, px, 27.55, pz, 6));
    }
    t.add(cyl(2.25, 2.35, 0.7, CREAM, 0, 26.05, 0, 20), at(bulb(2.75, RED), 0, 26.75, 0), at(finial(2.2), 0, 26.75 + 2.75 * 1.6, 0));
    return mergeByMaterial(t);
  };
  for (const [x, z, ry, w] of END_TOWERS) {
    const t = at(endTower(w), x, b, z);
    t.rotation.y = ry;
    f.add(t);
    dome(x, b + 26.75, z, 2.7);
    if (!ry) { verticals(x - w / 2, x + w / 2, 15, 24, b, b + 23.6); rect(x - w / 2 - 0.1, x + w / 2 + 0.1, b + 24.9, 14.9, 24.1); }
  }
  for (const s of [-1, 1]) {
    // The side range from the corner tower back to the tower behind it.
    f.add(box(7.6, 19.2, 7.6, TAN, s * 60.6, b, 11.3), box(8, 0.5, 7.6, L, s * 60.6, b + 19.2, 11.3));
    const cx = s * 53.65, r = new THREE.Group();
    r.add(box(6.8, 19.2, 7.6, TAN, 0, 0, 0), at(arcadeSkin(6.8, 19.2, [[0, 0.5, 4.4, 9.4, 'room'], [-1.6, 12.6, 1.3, 3, 'room'], [0, 12.6, 1.3, 3, 'room'], [1.6, 12.6, 1.3, 3, 'room']], 0.6, CREAM, { trim: L, pointed: false }), 0, 0, 3.8), box(7.2, 0.5, 8.2, L, 0, 19.2, 0));
    f.add(at(mergeByMaterial(r), cx, b, 19.6));
    arch(4.4, 9.4, cx, b + 0.5, 24.1);
  }
  f.add(bulbPoints(bulbs));
  addDetails(f, g);
  // The home view: the front from down the drive, as the best-known photographs take it.
  return { group: g, focus: f, view: [0.28, 0.16, 1.2], zoom: 0.62 };
}
