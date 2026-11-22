import * as THREE from 'three';
import { V, mat, mesh, box, cyl, at, strut, inst, unitBox, unitCyl, surface, photo } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { track, train } from '../parts/transport.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/new-pamban-bridge.js';

// The New Pamban Bridge: 2.07 km of railway across the Palk Strait, from Mandapam on the mainland
// (+x) to Pamban island (-x). The model looks at it from the open sea (+z), so the bridge of 1914
// and the road bridge lie behind it (js/details/new-pamban-bridge.js). Ninety-nine spans of 18.3 m
// plate girders stand on concrete piers built wide enough for a second line; over the channel one
// 72.5 m through truss hangs between two towers and rises 17 m for ships. It is shown down, a train
// crossing. The sea is at y = 0, the rails at 7.4 m.
export const SPAN = 18.3, LIFT = 72.5, HALF = 1035, PIER_TOP = 5.0, GIRDER = 1.7, RAIL_Y = PIER_TOP + 0.2 + GIRDER;
export const TOWER_X = LIFT / 2 + 4.2, TRACK_Z = 0;
// Where the piers of the plate-girder spans stand, outward from the towers to both shores.
export const pierXs = () => {
  const xs = [];
  for (let x = TOWER_X + 4.2 + SPAN; x <= HALF + 1; x += SPAN) xs.push(x, -x);
  return xs;
};

const CONCRETE = photo(mat('#bdb9b0', 0.9), 'concrete');
const STEEL = surface(mat('#a9b0b4', 0.5, 0.45), 'none'), STEEL_DARK = surface(mat('#7d868c', 0.55, 0.45), 'none');
const ROPE = surface(mat('#3c4043', 0.5, 0.6), 'none'), CABIN = surface(mat('#e9ebec', 0.5, 0.1), 'none');
const GLAZE = surface(mat('#22303a', 0.15, 0.6), 'none'), DECK = surface(mat('#8b9094', 0.7, 0.3), 'none');
// The shallow sea over the sand of the strait: blue-green, not the deep blue of open water.
const SHALLOWS = surface(mat('#2a8f96', 0.06, 0, { envMapIntensity: 1 }), 'water');
SHALLOWS.userData.wave = [6, 0.5, 0.05];
SHALLOWS.userData.reflect = true;

// The lift span: a Warren through truss with verticals, ten panels long, 10 m deep and 10.6 m
// between its trusses, with floor beams under the track and lateral bracing overhead. Its origin
// is the middle of the span at the level of the bottom chords' underside.
function liftSpan() {
  const g = new THREE.Group(), n = 10, p = LIFT / n, H = 10, W = 5.3, x0 = -LIFT / 2;
  for (const s of [-1, 1]) {
    const z = s * W;
    g.add(box(LIFT, 0.9, 0.7, STEEL, 0, 0, z), box(LIFT - 2 * p, 0.8, 0.7, STEEL, 0, H - 0.8, z));
    // End posts rake in to the top chord; diagonals alternate; a vertical at every panel point.
    for (let k = 0; k < n; k++) {
      const a = x0 + k * p, b = a + p, up = k % 2 === 0;
      if (k === 0) g.add(strut(V(a, 0.5, z), V(b, H - 0.4, z), 0.7, STEEL));
      else if (k === n - 1) g.add(strut(V(a, H - 0.4, z), V(b, 0.5, z), 0.7, STEEL));
      else g.add(strut(V(a, up ? 0.5 : H - 0.4, z), V(b, up ? H - 0.4 : 0.5, z), 0.5, STEEL));
      if (k > 0) g.add(box(0.45, H - 1.6, 0.45, STEEL, a, 0.85, z));
    }
  }
  // Floor beams and stringers; top struts and their crossed laterals; a portal frame at each end.
  for (let k = 0; k <= n; k++) g.add(box(0.5, 0.8, 2 * W, STEEL_DARK, x0 + k * p, 0.02, 0));
  for (const z of [-0.9, 0.9]) g.add(box(LIFT, 0.5, 0.3, STEEL_DARK, 0, 0.3, TRACK_Z + z));
  for (let k = 1; k < n; k++) {
    g.add(box(0.4, 0.5, 2 * W, STEEL, x0 + k * p, H - 0.55, 0));
    if (k < n - 1 && !detail.low) for (const s of [-1, 1]) g.add(strut(V(x0 + k * p, H - 0.3, -s * W), V(x0 + (k + 1) * p, H - 0.3, s * W), 0.22, STEEL));
  }
  for (const e of [-1, 1]) for (const s of [-1, 1]) g.add(strut(V(e * (LIFT / 2 - p), H - 0.6, s * W), V(e * (LIFT / 2 - p * 0.55), H * 0.55, s * (W - 2.2)), 0.3, STEEL));
  // A walkway of grating each side of the track, and the lifting girders the ropes take hold of.
  g.add(box(LIFT, 0.06, 2 * W - 1, DECK, 0, 0.82, 0));
  for (const e of [-1, 1]) g.add(box(1.2, 1.6, 2 * W + 2.4, STEEL_DARK, e * (LIFT / 2 + 0.3), 0, 0));
  return mergeByMaterial(g);
}

// A lift tower: four box legs braced into a lattice, open below for the train, with a head frame,
// two pairs of rope sheaves and a machinery house on top, and the counterweight hanging inside (at
// the top of its travel, since the span is down). `dir` is +1 for the tower at +x: the span is on
// its -dir side.
function tower(dir) {
  const g = new THREE.Group(), H = 36, ax = 3.2, az = 7.2, y0 = RAIL_Y - 1.2, top = y0 + H;
  const corner = (sx, sz, y) => V(sx * ax, y, sz * az);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(1.0, H, 1.0, STEEL, sx * ax, y0, sz * az));
  // Side faces (towards the sea and towards the old bridge): bays of crossed bracing all the way up.
  const bays = 6, bh = H / bays;
  for (let k = 0; k <= bays; k++) {
    const y = y0 + k * bh;
    for (const sz of [-1, 1]) g.add(box(2 * ax, 0.45, 0.45, STEEL, 0, y - 0.22, sz * az));
    // Across the track the portal stays open for 11 m above the rails.
    if (y > RAIL_Y + 10) for (const sx of [-1, 1]) g.add(box(0.45, 0.45, 2 * az, STEEL, sx * ax, y - 0.22, 0));
  }
  for (let k = 0; k < bays; k++) {
    const a = y0 + k * bh, b = a + bh;
    for (const sz of [-1, 1]) g.add(strut(corner(-1, sz, a), corner(1, sz, b), 0.3, STEEL), strut(corner(1, sz, a), corner(-1, sz, b), 0.3, STEEL));
    if (a > RAIL_Y + 10) for (const sx of [-1, 1]) g.add(strut(corner(sx, -1, a), corner(sx, 1, b), 0.3, STEEL), strut(corner(sx, 1, a), corner(sx, -1, b), 0.3, STEEL));
  }
  // The head frame, the sheaves on their bearings (two each side, their axles across the track) and
  // the machinery house between them.
  g.add(box(2 * ax + 3, 1.4, 2 * az + 2.4, STEEL_DARK, 0, top, 0));
  for (const sz of [-1, 1]) for (const dz of [-0.55, 0.55]) {
    const wheel = mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.4, 28).rotateX(Math.PI / 2), STEEL_DARK, 0, top + 3.9, sz * (az - 1.2) + dz);
    g.add(wheel, box(1.6, 2.6, 0.25, STEEL, 0, top + 1.4, sz * (az - 1.2) + dz * 2.1));
    // Ropes: down the span's side to the lifting girder, and down the far side to the counterweight.
    g.add(box(0.09, top + 3.9 - (RAIL_Y + 0.3), 0.09, ROPE, -dir * 2.3, RAIL_Y + 0.3, sz * (az - 1.2) + dz));
    g.add(box(0.09, 7.5, 0.09, ROPE, dir * 2.3, top - 3.6, sz * (az - 1.2) + dz));
  }
  g.add(box(5.2, 3.4, 7.4, CABIN, 0, top + 1.4, 0), box(5.6, 0.25, 7.8, STEEL_DARK, 0, top + 4.8, 0), box(5.24, 1.1, 5.4, GLAZE, 0, top + 2.8, 0));
  g.add(box(1.5, 9, 2 * az - 3.2, CONCRETE, dir * 2.3, top - 12.6, 0), box(1.7, 0.6, 2 * az - 1.6, STEEL_DARK, dir * 2.3, top - 3.6, 0));
  // A stair tower up the side away from the sea, and a gallery round the head.
  g.add(box(2.2, H, 2.2, STEEL_DARK, dir * (ax + 0.2), y0, -az - 1.9));
  for (const [w, d, x, z] of [[2 * ax + 5, 0.08, 0, az + 2.2], [2 * ax + 5, 0.08, 0, -az - 2.2], [0.08, 2 * az + 4.4, ax + 2.5, 0], [0.08, 2 * az + 4.4, -ax - 2.5, 0]]) g.add(box(w, 1.1, d, STEEL, x, top + 1.4, z));
  g.add(box(2 * ax + 5, 0.12, 2 * az + 4.4, DECK, 0, top + 1.28, 0));
  // The tower's pier: a broad concrete block on its pile cap.
  g.add(box(10, PIER_TOP + 1.2, 19, CONCRETE, 0, 0, 0), box(13, 2.2, 23, CONCRETE, 0, -0.8, 0));
  return mergeByMaterial(g);
}

export function buildPambanBridge() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The sea: one sheet out past the haze, in tiles so its far corners keep their depth.
  const sea = mesh(new THREE.PlaneGeometry(18000, 18000, 45, 45).rotateX(-Math.PI / 2), SHALLOWS, 0, 0, 0);
  sea.castShadow = false;
  g.add(sea);
  // The lift span between its towers, down on its bearings.
  f.add(at(liftSpan(), 0, RAIL_Y - 1.2, 0));
  for (const dir of [-1, 1]) f.add(at(tower(dir), dir * TOWER_X, 0, 0));
  // The operator's control room beside the Pamban tower, on its own pier: two glazed floors.
  const room = new THREE.Group();
  room.add(box(7, PIER_TOP + 1.2, 7, CONCRETE, 0, 0, 0), box(8, 7.4, 8, CABIN, 0, PIER_TOP + 1.2, 0), box(8.04, 1.5, 6.6, GLAZE, 0, PIER_TOP + 2.6, 0), box(6.6, 1.5, 8.04, GLAZE, 0, PIER_TOP + 2.6, 0));
  room.add(box(8.04, 1.5, 6.6, GLAZE, 0, PIER_TOP + 6.0, 0), box(6.6, 1.5, 8.04, GLAZE, 0, PIER_TOP + 6.0, 0), box(9, 0.3, 9, STEEL_DARK, 0, PIER_TOP + 8.6, 0));
  f.add(at(mergeByMaterial(room), -TOWER_X - 2, 0, -15.5));
  // The plate-girder spans: every pier a rounded wall on a pile cap with a cap beam, wide enough
  // for two lines; the one line laid on the seaward side... kept on the centre line here, as built
  // through the lift span. Two girders a span, with flanges, stiffeners and cross frames, an
  // inspection walkway and handrail each side. The 200 m either side of the towers belong to the
  // framed view; the rest of the two kilometres is scenery.
  const near = (x) => Math.abs(x) < 260;
  const lists = { near: { piers: [], caps: [], piles: [], webs: [], flanges: [], ribs: [], frames: [], walks: [], rails: [], posts: [] }, far: { piers: [], caps: [], piles: [], webs: [], flanges: [], ribs: [], frames: [], walks: [], rails: [], posts: [] } };
  const xs = pierXs(), gy = PIER_TOP + 0.2;
  for (const x of xs) {
    const L = lists[near(x) ? 'near' : 'far'], s = Math.sign(x), cx = x - s * SPAN / 2, len = SPAN - 0.25;
    L.piers.push([x, 0, 0, 1.7, PIER_TOP - 0.9, 8.2]);
    L.caps.push([x, PIER_TOP - 0.9, 0, 2.3, 0.9, 10.4]);
    L.piles.push([x, -0.8, 0, 4.6, 2.0, 11.4]);
    for (const z of [-0.95, 0.95]) {
      L.webs.push([cx, gy, z, len, GIRDER, 0.04]);
      L.flanges.push([cx, gy, z, len, 0.06, 0.5], [cx, gy + GIRDER - 0.06, z, len, 0.06, 0.5]);
      if (!detail.low) for (let k = 0; k <= 10; k++) L.ribs.push([cx - len / 2 + 0.1 + k * (len - 0.2) / 10, gy + 0.06, z, 0.03, GIRDER - 0.12, 0.34]);
    }
    for (let k = 0; k <= 4; k++) L.frames.push([cx - len / 2 + 0.3 + k * (len - 0.6) / 4, gy + 0.3, 0, 0.12, GIRDER - 0.6, 1.9]);
    for (const z of [-2.35, 2.35]) {
      L.walks.push([cx, gy + GIRDER - 0.02, z, SPAN, 0.06, 1.2]);
      L.rails.push([cx, gy + GIRDER + 1.05, z + Math.sign(z) * 0.55, SPAN, 0.06, 0.06], [cx, gy + GIRDER + 0.55, z + Math.sign(z) * 0.55, SPAN, 0.04, 0.04]);
      if (!detail.low) for (let k = 0; k < 9; k++) L.posts.push([cx - SPAN / 2 + (k + 0.5) * SPAN / 9, gy + GIRDER, z + Math.sign(z) * 0.55, 0.06, 1.1, 0.06]);
    }
  }
  for (const [key, to] of [['near', f], ['far', g]]) {
    const L = lists[key];
    to.add(inst(unitCyl(16), L.piers.map(([x, y, z, a, b, c]) => [x, y, z, a, b, c]), CONCRETE), inst(unitBox(), L.caps, CONCRETE), inst(unitBox(), L.piles, CONCRETE));
    to.add(inst(unitBox(), L.webs, STEEL), inst(unitBox(), L.flanges, STEEL), inst(unitBox(), L.frames, STEEL_DARK), inst(unitBox(), L.walks, DECK), inst(unitBox(), L.rails, STEEL_DARK));
    if (L.ribs.length) { const r = inst(unitBox(), L.ribs, STEEL); r.castShadow = false; to.add(r); }
    if (L.posts.length) { const p = inst(unitBox(), L.posts, STEEL_DARK); p.castShadow = false; to.add(p); }
  }
  // The track from shore to shore, on the girders and through the truss, and the train: a blue
  // ICF express for Rameswaram behind its locomotive, half way across the lift span.
  g.add(at(track(2 * HALF + 60, { ballast: false }), 0, RAIL_Y - 0.42, TRACK_Z));
  f.add(at(train(detail.low ? 9 : 12, { livery: 'blue', locoColour: '#b8402f' }), -28, RAIL_Y + 0.1, TRACK_Z));
  addDetails(f, g);
  // The home view: low over the water from the seaward side, the towers and the train on the span.
  return { group: g, focus: f, view: [0.42, 0.11, 1], zoom: 0.62, target: [0, 17, 0] };
}
