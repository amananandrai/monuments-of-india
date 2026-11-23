import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { M, mat, at, onFace, box, cyl, sheet, lathe, starPrism, planBand, inst } from '../helpers.js';
import { frieze, carved, jali, idol, mergeByMaterial } from '../parts/components.js';
import { figureGeo } from '../parts/sculpture.js';
import { trees, shrubs, asiBoard, lampPosts, along, scatter, benches } from '../parts/realism.js';
import { alongX } from '../monuments/hoysaleswara-temple.js';
import { detail } from '../detail.js';

// Halebidu's soapstone (chloritic schist), grey-green and darkening where it is sheltered.
export const SOAP = mat('#7f7c6c', 0.85);
export const SOAP_DARK = mat('#5f5d51', 0.88);

// J: the platform's height; F: the halls' floor above it, at the top of the eight bands; WH: the
// walls' height above the platform. xs: the two shrines' axes (north is +x: the temple faces east,
// +z); sz: their sanctums' centres; hz: the line of the joined halls. PROF: the halls' plan along x,
// as [x, half-depth] (steppedPlan): the two square halls, each with a bay on its front, joined by a
// narrower link. NH: the two Nandi halls east of the doors, on the same platform: the southern one
// the larger, with the Surya shrine (SU) built on to its east side.
export const DIMS = {
  J: 1.6, F: 2.3, WH: 6.4, xs: [-13, 13], sz: -10.5, hz: 2,
  PROF: [[-23, 6], [-19.5, 8.5], [-6.5, 6], [-3, 4.5], [3, 6], [6.5, 8.5], [19.5, 6], [23, 0]],
  NH: [{ x: -13, z: 24.4, w: 15.4, d: 16.2, big: true }, { x: 13, z: 23.8, w: 8.6, d: 8.4 }],
  SU: { x: -13, z: 35, w: 6, d: 5 },
};

/* ---------- small carvings, as unit geometries for instancing ---------- */

// Blocks [w, h, d, x, y, z, tilt] merged and fitted to the unit box (x and z from -0.5 to 0.5, y from
// 0 to 1): the animals of the bands in profile, walking towards +x, a few blocks each (they stand
// 30 cm high).
function blocks(list) {
  const geo = mergeGeometries(list.map(([w, h, d, x, y, z = 0, rz = 0]) => new THREE.BoxGeometry(w, h, d).rotateZ(rz).translate(x, y, z)));
  geo.computeBoundingBox();
  const b = geo.boundingBox, s = b.getSize(new THREE.Vector3());
  return geo.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2).scale(1 / s.x, 1 / s.y, 1 / s.z);
}
const GEO = {}, geo = (k, make) => GEO[k] || (GEO[k] = make());
const CARVINGS = {
  // An elephant: body, head, ear, hanging trunk, two pairs of legs.
  elephant: () => blocks([[2.2, 1.3, 1, 0, 1.55], [0.95, 1.05, 0.9, 1.4, 1.75], [0.5, 0.75, 1.1, 1.0, 1.75], [0.3, 1.35, 0.45, 1.92, 0.8, 0, 0.12], [0.5, 1, 1, -0.7, 0.5], [0.5, 1, 1, 0.6, 0.5]]),
  // A lion: lean body, a great maned head, a tail curled up over the back.
  lion: () => blocks([[1.8, 0.75, 0.9, 0, 1.05], [0.95, 1.15, 1, 1.15, 1.35], [0.32, 0.8, 0.9, -0.65, 0.4], [0.32, 0.8, 0.9, 0.7, 0.4], [0.16, 1.0, 0.35, -1.0, 1.55, 0, 0.5]]),
  // A horseman: the horse with its arched neck, and the rider upright on its back.
  horse: () => blocks([[1.9, 0.7, 0.9, 0, 1.25], [0.45, 1.0, 0.7, 0.95, 1.75, 0, -0.5], [0.7, 0.34, 0.7, 1.45, 2.2, 0, -0.4], [0.24, 0.95, 0.9, -0.7, 0.47], [0.24, 0.95, 0.9, 0.72, 0.47], [0.5, 0.9, 1, -0.05, 2.0], [0.4, 0.4, 1, -0.05, 2.65]]),
  // A makara: a heavy body, gaping jaws, the tail thrown up in a curl of foliage.
  makara: () => blocks([[1.6, 0.9, 1, 0, 0.7], [0.9, 0.25, 1, 1.1, 1.08, 0, 0.5], [0.8, 0.2, 1, 1.1, 0.48, 0, -0.2], [0.5, 1.2, 1, -1.0, 1.2, 0, 0.5]]),
  // A hamsa (goose): body, curved neck, head and beak, a tail of plumes.
  hamsa: () => blocks([[1.1, 0.6, 1, 0, 0.65, 0, 0.2], [0.2, 0.8, 0.6, 0.55, 1.22, 0, -0.2], [0.46, 0.22, 0.6, 0.8, 1.62], [0.6, 0.3, 0.8, -0.75, 0.98, 0, 0.6], [0.14, 0.4, 0.5, 0, 0.2]]),
  // A small figure of the epic scenes: legs, body, head, an arm lifted (with a bow or a sword).
  epic: () => blocks([[0.45, 0.9, 1, 0, 0.45], [0.6, 0.7, 1, 0, 1.25], [0.34, 0.34, 0.9, 0, 1.8], [0.15, 0.75, 0.6, 0.42, 1.65, 0, -0.6]]),
  // The canopy over a wall image: a pointed arch of foliage and, on it, a little tiered tower.
  canopy: () => blocks([[0.6, 0.13, 1, -0.24, 0.16, 0, 0.5], [0.6, 0.13, 1, 0.24, 0.16, 0, -0.5], [0.74, 0.17, 1, 0, 0.47], [0.52, 0.17, 0.9, 0, 0.64], [0.32, 0.17, 0.8, 0, 0.81], [0.14, 0.15, 0.5, 0, 0.97]]),
};
// A lathe-turned Hoysala pillar, 1 high and 1 across: a square foot, then bell, discs and bulbs
// turned on the lathe, under a wide capital.
export const turnedPillarGeo = () => geo('pillar', () => lathe([[0.42, 0], [0.42, 0.13], [0.26, 0.15], [0.26, 0.3], [0.36, 0.34], [0.36, 0.4], [0.22, 0.45], [0.25, 0.6], [0.4, 0.66], [0.4, 0.7], [0.26, 0.74], [0.31, 0.84], [0.5, 0.9], [0.5, 0.94], [0.3, 0.96], [0.3, 1], [0, 1]], SOAP, detail.low ? 6 : 10).geometry);

/* ---------- the walls ---------- */

// The eight bands from the bottom: [y above the platform, height, how far it stands out, the
// carving and its pitch along the wall]. Elephants (strength), lions (courage), a scroll, horsemen
// (speed), a scroll, scenes of the epics, makaras, and hamsas.
const BANDS = [[0.04, 0.34, 0.16, 'elephant', 0.56], [0.4, 0.26, 0.13, 'lion', 0.5], [0.68, 0.2, 0.15], [0.9, 0.28, 0.12, 'horse', 0.56], [1.2, 0.2, 0.14], [1.42, 0.34, 0.1, 'epic', 0.3], [1.78, 0.26, 0.13, 'makara', 0.62], [2.06, 0.22, 0.11, 'hamsa', 0.42]];
const POSES = ['standing', 'dancer', 'standing', 'mirror', 'chauri', 'standing', 'musician', 'thorn'];

// The straight runs of a plan ([x, z] points, either way round): the middle of each, its length and
// the angle its outer face looks (0 = +z, as onFace).
function runs(pts) {
  const n = pts.length, turn = Math.sign(pts.reduce((s, [x, z], i) => s + x * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * z, 0));
  return pts.map(([x, z], i) => {
    const [x1, z1] = pts[(i + 1) % n], len = Math.hypot(x1 - x, z1 - z);
    return { x: (x + x1) / 2, z: (z + z1) / 2, len, a: Math.atan2(turn * (z1 - z), -turn * (x1 - x)) };
  });
}
const inside = (x, z, pts) => pts.reduce((c, [xa, za], i) => { const [xb, zb] = pts[(i + 1) % pts.length]; return (za > z) !== (zb > z) && x < xa + ((z - za) / (zb - za)) * (xb - xa) ? !c : c; }, false);
export const starPts = (cx, cz, n, rO, rI) => Array.from({ length: n * 2 }, (_, i) => { const a = (i / n) * Math.PI, r = i % 2 ? rI : rO; return [cx + Math.cos(a) * r, cz - Math.sin(a) * r]; });

// Carve the walls standing on a plan, from y0: the animals and scenes of the eight bands on every
// run (desktops), and above them, on the runs `images` accepts, the large images of the gods, each
// on its pedestal under a canopy, two or three to a facet. skip(x, z): no carving there (a door,
// another wall). The lists fill `out`, one per carving, to be instanced once for the whole temple.
function carveWalls(pts, y0, out, { skip = () => false, images = () => true, bands = true } = {}) {
  const put = (k, row) => (out[k] || (out[k] = [])).push(row);
  for (const r of runs(pts)) {
    const ca = Math.cos(r.a), sa = Math.sin(r.a), spot = (t, o) => [r.x + ca * t + sa * o, r.z - sa * t + ca * o];
    if (bands && !detail.low) for (const [y, h, p, kind, pitch] of BANDS) {
      if (!kind) continue;
      const n = Math.floor((r.len - 0.1) / pitch);
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5 - n / 2) * pitch, [x, z] = spot(t, p + 0.02);
        if (!skip(...spot(t, 0.4))) put(kind, [x, y0 + y + 0.03, z, pitch * (kind === 'epic' ? 0.55 : 0.84), h - 0.06, 0.09, r.a]);
      }
    }
    if (!images(r)) continue;
    const pitch = detail.low ? 1.5 : 0.76, n = Math.max(1, Math.floor((r.len - 0.1) / pitch));
    if (r.len < 0.6) continue;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5 - n / 2) * Math.min(pitch, r.len / n), [x, z] = spot(t, 0.14);
      if (skip(...spot(t, 0.5))) continue;
      const i = (out.count = (out.count || 0) + 1);
      put('pose:' + POSES[i % POSES.length], [x, y0 + DIMS.F + 0.28, z, 0.52, 1.5, 0.3, r.a]);
      put('box', [x, y0 + DIMS.F + 0.04, z, 0.6, 0.24, 0.34, r.a]);
      put('canopy', [x, y0 + DIMS.F + 1.74, z, 0.7, 0.62, 0.3, r.a]);
    }
  }
}

// Hoysaleswara, finer detail. From photographs and the plan in the Mysore Archaeological Reports:
// - the lower walls are wrapped in eight bands of carving running unbroken round every bay and star
//   point: from the bottom, elephants, lions, a scroll, horsemen, a scroll, scenes of the epics,
//   makaras and hamsas (geese);
// - over them, on the shrines and the western walls of the halls, the large images: about 340 gods
//   and goddesses, each under its own canopy, on every facet of the wall;
// - on the eastern walls of the halls, closed in under Narasimha I, a carved seat-back and pierced
//   stone screens between lathe-turned pillars up to the eave;
// - on the three outer sides of each star a projecting two-storeyed niche like a small shrine, and
//   a small star-shaped turret of images where the two halls meet, east and west.
function architecture(f) {
  const { J, F, WH, xs, sz, hz, PROF, SU } = DIMS, S = SOAP, Sd = SOAP_DARK, d = new THREE.Group(), out = {};
  const hall = alongX(PROF, { cut: 0.9, notches: 3 }, hz);
  const doors = [[xs[0], hz + 8.5], [xs[1], hz + 8.5], [-23, hz], [23, hz]], nearDoor = (x, z) => doors.some(([dx, dz]) => Math.hypot(x - dx, z - dz) < 3);
  const stars = [...xs.map((x) => [x, sz, 16, 6.4, 5.4]), [0, hz + 4.5, 10, 1.9, 1.5], [0, hz - 4.5, 10, 1.5, 1.15]];
  const inStar = (x, z) => stars.some(([cx, cz, , rO]) => Math.hypot(x - cx, z - cz) < rO - 0.75);
  // The halls: the bands; the screens on the east and the images on the west.
  BANDS.forEach(([y, h, p], k) => d.add(planBand(hall, J + y, h, p, frieze(k % 2 ? Sd : S))));
  const east = (r) => Math.cos(r.a) > 0.5 || (Math.abs(Math.sin(r.a)) > 0.5 && r.z > hz + 0.5), pillars = [];
  const panel = (r, y, h, t, m) => { const o = onFace(box(r.len, h, t, m, 0, y, 0), r.a, t / 2); o.position.x += r.x; o.position.z += r.z; return o; };
  for (const r of runs(hall)) {
    if (!east(r)) { d.add(panel(r, J + F + 0.02, 2.1, 0.05, carved(Sd, 'reliefs'))); continue; }
    d.add(panel(r, J + F + 0.02, 0.8, 0.16, carved(S, 'reliefs')), panel(r, J + F + 0.84, 2.5, 0.04, jali(S)));
    const n = Math.max(1, Math.round(r.len / 1.7));
    if (r.len > 1.6) for (let k = 0; k <= n; k++) {
      const t = (k / n - 0.5) * (r.len - 0.5), x = r.x + Math.cos(r.a) * t + Math.sin(r.a) * 0.12, z = r.z - Math.sin(r.a) * t + Math.cos(r.a) * 0.12;
      if (!nearDoor(x, z) && !inStar(x, z)) pillars.push([x, J + F + 0.84, z, 0.5, 2.5, 0.5, r.a]);
    }
  }
  carveWalls(hall, J, out, { skip: (x, z) => nearDoor(x, z) || inStar(x, z), images: (r) => !east(r) });
  // The stars: the shrines, and the two turrets at the halls' joint.
  for (const [cx, cz, n, rO, rI] of stars) {
    const small = rO < 3, pts = starPts(cx, cz, n, rO, rI);
    if (small) d.add(at(starPrism(n, rO, rI, WH, S), cx, J, cz), at(starPrism(n, rO + 0.35, rI + 0.35, 0.4, Sd), cx, J + WH - 0.5, cz));
    BANDS.forEach(([y, h, p], k) => d.add(at(starPrism(n, rO + p, rI + p, h, frieze(k % 2 ? Sd : S)), cx, J + y, cz)));
    d.add(at(starPrism(n, rO + 0.04, rI + 0.04, 2.1, carved(Sd, 'reliefs')), cx, J + F + 0.02, cz));
    d.add(at(starPrism(n, rO + 0.3, rI + 0.3, 0.22, Sd), cx, J + F + 2.4, cz), at(starPrism(n, rO + 0.05, rI + 0.05, 1.2, carved(S, 'reliefs')), cx, J + F + 2.62, cz));
    // The projecting niches on the shrine's three outer sides: a doorway to nothing under a tower.
    const niches = small ? [] : [Math.PI, Math.PI / 2, -Math.PI / 2];
    for (const a of niches) {
      const o = new THREE.Group();
      o.add(box(2.6, F, 1.9, Sd), box(2.3, WH - F, 1.6, S, 0, F, -0.1), box(1, 1.9, 0.06, M.recess, 0, F + 0.3, 0.72));
      for (const s of [-1, 1]) o.add(cyl(0.14, 0.17, 2, S, s * 0.78, F + 0.2, 0.82, 8));
      o.add(box(2.7, 0.2, 2, Sd, 0, F + 2.3, -0.05), box(1.8, 0.5, 1.5, S, 0, WH, -0.1), box(1.2, 0.45, 1.1, Sd, 0, WH + 0.5, -0.1), box(0.7, 0.4, 0.7, S, 0, WH + 0.95, -0.1));
      const p = onFace(o, a, rO - 0.2);
      p.position.x += cx; p.position.y = J; p.position.z += cz;
      d.add(p);
    }
    const nearNiche = (x, z) => niches.some((a) => Math.hypot(x - cx - Math.sin(a) * rO, z - cz - Math.cos(a) * rO) < 1.75);
    carveWalls(pts, J, out, { skip: (x, z) => inside(x, z, hall) || nearNiche(x, z) });
  }
  // The Surya shrine's three outer walls.
  const su = [[SU.x - SU.w / 2, SU.z - SU.d / 2], [SU.x + SU.w / 2, SU.z - SU.d / 2], [SU.x + SU.w / 2, SU.z + SU.d / 2], [SU.x - SU.w / 2, SU.z + SU.d / 2]];
  BANDS.forEach(([y, h, p], k) => d.add(planBand(su, J + y, h, p, frieze(k % 2 ? Sd : S))));
  d.add(planBand(su, J + F + 0.02, 2.1, 0.04, carved(Sd, 'reliefs')));
  carveWalls(su, J, out, { skip: (x, z) => z < SU.z - SU.d / 2 + 0.3 });
  f.add(mergeByMaterial(d));
  f.add(inst(turnedPillarGeo(), pillars, S));
  for (const [k, list] of Object.entries(out)) {
    if (k === 'count') continue;
    const g = k === 'box' ? new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0) : k.startsWith('pose:') ? figureGeo(k.slice(5)) : geo(k, CARVINGS[k]);
    f.add(inst(g, list, k === 'box' || k === 'canopy' || k === 'epic' ? Sd : S));
  }
}

// The Garuda stambha south of the temple (about 1220): a square pillar cut with a long Old Kannada
// inscription to Kuvara Lakshma, the bodyguard who took his own life with his wife and his men
// when Ballala II died; round its middle eight male figures, some with swords at their own necks;
// over them a round shaft, broken off.
function garudaStambha() {
  const g = new THREE.Group(), figs = [];
  g.add(box(2.6, 0.3, 2.6, SOAP_DARK), box(1.25, 0.25, 1.25, SOAP, 0, 0.3), box(1.05, 1.9, 1.05, carved(SOAP_DARK, 'frieze'), 0, 0.55), box(1.15, 0.12, 1.15, SOAP, 0, 2.45));
  g.add(box(0.95, 0.62, 0.95, SOAP_DARK, 0, 2.57), cyl(0.44, 0.47, 1.5, SOAP, 0, 3.19, 0, 14));
  const top = cyl(0.3, 0.44, 0.5, SOAP, 0.05, 4.6, 0, 7);
  top.rotation.z = 0.25;
  g.add(top);
  for (let k = 0; k < 8; k++) { const a = Math.floor(k / 2) * (Math.PI / 2), lat = k % 2 ? 0.24 : -0.24; figs.push([Math.sin(a) * 0.5 + Math.cos(a) * lat, 2.58, Math.cos(a) * 0.5 - Math.sin(a) * lat, 0.3, 0.6, 0.16, a]); }
  g.add(inst(figureGeo('standing'), figs.filter((_, k) => k % 2), SOAP), inst(figureGeo('dancer'), figs.filter((_, k) => !(k % 2)), SOAP));
  return g;
}

// Halebidu: the lawns of the temple's garden, entered today from the north; the Garuda pillar and
// the ASI museum of sculpture to the south; the great tank of Dorasamudra beyond the lawn to the
// east, which the temple faces; rain trees and palms, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  const { hz } = DIMS;
  g.add(box(420, 0.2, 420, M.grass, 0, -0.25, 0), box(96, 0.05, 96, mat('#7d9757', 0.95), 0, -0.1, hz + 12));
  // Paths: round the platform, and from the gate on the north to the north door.
  g.add(box(64, 0.06, 44, M.path, 0, 0, hz - 2), box(54, 0.06, 30, M.path, 0, 0, hz + 33), box(44, 0.06, 6, M.path, 54, 0, hz));
  g.add(at(garudaStambha(), -40, 0, hz + 4));
  // The site museum, a low building with a verandah, and its yard of sculpture.
  g.add(box(12, 4.5, 30, mat('#e8e0cf', 0.85), -78, 0, 10), box(14, 0.4, 32, mat('#8a3b2a', 0.8), -78, 4.5, 10));
  for (let k = 0; k < 8; k++) g.add(cyl(0.25, 0.25, 4.5, mat('#e8e0cf', 0.85), -71, 0, -3.5 + k * 3.9, 8));
  for (let k = 0; k < 10; k++) g.add(at(idol(1.6, SOAP_DARK), -64, 0.2, -4 + k * 3).rotateY(Math.PI / 2));
  // The tank of Dorasamudra, east of the temple, behind its bund.
  g.add(sheet(260, 150, M.lake, 0, 0.05, 160), box(260, 0.6, 2, SOAP_DARK, 0, 0, 84));
  g.add(trees([...along(7, [-45, -40], [-45, 46]), ...along(7, [45, -40], [45, 46]), ...scatter(16, [-180, 180, 58, 80], { seed: 4, gap: 12 })], { kind: 'palm', seed: 5 }));
  g.add(trees([...scatter(detail.low ? 6 : 14, [-180, -60, -70, 50], { seed: 6, gap: 16, avoid: [[-90, -58, -10, 30]] }), ...scatter(detail.low ? 6 : 14, [60, 180, -70, 50], { seed: 7, gap: 16, avoid: [[30, 80, -4, 8]] })], { kind: 'banyan', seed: 8 }));
  g.add(shrubs([...along(8, [-30, 54], [30, 54])], { size: 1, flowers: '#d9465a' }));
  g.add(benches([[-34, 44], [34, 30], [-34, 20], [34, 44]]));
  g.add(lampPosts([...along(4, [36, hz - 4], [72, hz - 4]), ...along(4, [36, hz + 4], [72, hz + 4])]));
  g.add(asiBoard('Hoysaleswara Temple, Halebidu', 60, hz + 8, 0, { line2: 'WORLD HERITAGE SITE' }));
}
