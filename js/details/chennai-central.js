import * as THREE from 'three';
import { M, mat, mesh, box, at, onFace, sheet, inst, unitBox, rng, surface, FACES } from '../helpers.js';
import { mergeByMaterial, clockFace } from '../parts/components.js';
import { GLASS, cutSlab } from '../parts/colonial.js';
import { track, train, overhead, platform } from '../parts/transport.js';
import { trees, lampPosts, along, scatter, cityAround, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { BANK, W, D, H, BRICK, WHITE, TILE } from '../monuments/chennai-central.js';

// Chennai Central, finer detail and the setting. The front faces south (+z here) over its
// forecourt onto Poonamallee High Road; the Buckingham Canal passes under the road and along the
// station's west side (-x). Behind the main block the concourse opens onto the platforms, which
// run north (-z) under pitched trainsheds and then out into the open. The site group `s` stands
// BANK above the canal's water; heights below are above the forecourt.
const SHEET = surface(mat('#7f8a8f', 0.6, 0.3), 'none'), IRON = surface(mat('#4a4f52', 0.6, 0.5), 'none');
const BALLAST = mat('#625b53', 0.97), SLAB = mat('#bdb6a8', 0.9), YELLOW = surface(mat('#e7c23a', 0.7), 'none');

// Six platform islands 20 m apart: the twelve main-line platforms. The suburban terminal's
// platforms lie further west, beyond the canal, and are not shown.
const ISLANDS = [-50, -30, -10, 10, 30, 50], TRACKS = [], Z0 = -42, SHED = 210, OPEN = 260;
for (const x of ISLANDS) TRACKS.push(x - 7.1, x + 7.1);

function architecture(f) {
  const d = new THREE.Group(), tz = D / 2 - 3.2;
  // The four clock faces, a flagstaff on the cap, and dormers and chimneys along the tiled roof.
  const faces = at(new THREE.Group(), 0, 0, tz);
  for (const a of FACES) faces.add(onFace(at(clockFace(2, 10, 10), 0, 32.35, 0), a, 4.68));
  f.add(faces);
  d.add(box(0.12, 4.5, 0.12, IRON, 0, 40.8, tz));
  const gable = new THREE.Shape();
  gable.moveTo(-1.5, 0); gable.lineTo(1.5, 0); gable.lineTo(0, 2); gable.closePath();
  for (const sx of [-1, 1]) for (const k of [0, 1, 2, 3]) {
    const x = sx * (14 + k * 9), dm = at(new THREE.Group(), x, H + 0.5, D / 2 - 4.6);
    dm.add(box(2.4, 1.7, 3.6, BRICK, 0, 0, 0), mesh(new THREE.ExtrudeGeometry(gable, { depth: 3.9, bevelEnabled: false }).translate(0, 1.7, -1.9), TILE));
    dm.add(box(1.2, 1.2, 0.06, GLASS, 0, 0.3, 1.83), box(1.5, 0.14, 0.1, WHITE, 0, 1.5, 1.85));
    d.add(dm);
  }
  for (const x of [-34, -12, 12, 34]) d.add(box(1.5, 3.4, 1.1, BRICK, x, H + 5.2, 0), box(1.8, 0.3, 1.4, WHITE, x, H + 8.6, 0));
  f.add(mergeByMaterial(d));
}

// The concourse and trainsheds behind the main block: three pitched roofs of sheet iron, each
// over two islands and their four tracks, on iron columns; glazed gable screens at the far end.
function trainSheds() {
  const g = new THREE.Group(), zm = Z0 - SHED / 2, eave = 8.6, ridge = 14, half = 20, run = Math.hypot(half, ridge - eave), tilt = Math.atan2(ridge - eave, half), cols = [], ties = [];
  for (const cx of [-40, 0, 40]) {
    for (const sx of [-1, 1]) {
      const slab = box(run + 0.4, 0.22, SHED, SHEET, 0, 0, 0);
      slab.position.set(cx + sx * half / 2, (eave + ridge) / 2, zm);
      slab.rotation.z = -sx * tilt;
      g.add(slab);
    }
    g.add(box(4, 1.2, SHED - 6, IRON, cx, ridge - 0.5, zm), box(5.2, 0.2, SHED - 4, SHEET, cx, ridge + 0.7, zm));
    const tri = new THREE.Shape();
    tri.moveTo(-half, 0); tri.lineTo(half, 0); tri.lineTo(0, ridge - eave); tri.closePath();
    g.add(mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.2, bevelEnabled: false }), GLASS, cx, eave, Z0 - SHED - 0.1));
    g.add(box(2 * half, 1.5, 0.36, IRON, cx, eave - 1.5, Z0 - SHED));
    for (let k = -4; k <= 4; k++) g.add(box(0.22, (ridge - eave) * (1 - Math.abs(k) / 5), 0.3, IRON, cx + k * 4, eave, Z0 - SHED - 0.12));
    for (let z = Z0 - 6; z > Z0 - SHED + 1; z -= 12) {
      for (const x of [cx - 10, cx + 10]) cols.push([x, 1.3, z, 0.34, eave + 2.4, 0.34]);
      ties.push([cx, eave - 0.2, z, 2 * half, 0.3, 0.2]);
    }
  }
  for (let z = Z0 - 6; z > Z0 - SHED + 1; z -= 12) for (let x = -60; x <= 60; x += 40) cols.push([x, 0, z, 0.5, eave, 0.5]);
  g.add(inst(unitBox(), cols, IRON), inst(unitBox(), ties, IRON));
  // Brick side walls with white copings, and the concourse hall between the block and the buffers.
  for (const sx of [-1, 1]) g.add(box(0.8, eave, SHED - Z0 - D / 2, BRICK, sx * 60.6, 0, (Z0 - SHED - D / 2) / 2), box(1.0, 0.45, SHED - Z0 - D / 2, WHITE, sx * 60.6, eave, (Z0 - SHED - D / 2) / 2));
  g.add(box(120, 0.5, -Z0 - D / 2 + 4, SHEET, 0, 11.6, (Z0 - D / 2) / 2 - 1), box(96, 1.8, 12, GLASS, 0, 12.1, (Z0 - D / 2) / 2 - 1), box(98, 0.4, 13, SHEET, 0, 13.9, (Z0 - D / 2) / 2 - 1));
  return g;
}

function railway() {
  const g = new THREE.Group(), L = SHED + OPEN, y = 0.3, rails = [], R = rng(73), fine = !detail.low;
  g.add(box(134, y, L + 420, BALLAST, 0, 0, Z0 - (L + 420) / 2));
  for (const x of ISLANDS) {
    g.add(box(9, 1.05, SHED, SLAB, x, y, Z0 - SHED / 2));
    for (const sx of [-1, 1]) g.add(box(0.5, 0.06, SHED, YELLOW, x + sx * 4, y + 1.02, Z0 - SHED / 2));
    const p = at(platform(OPEN, 9), x, y, Z0 - SHED - OPEN / 2);
    p.rotation.y = Math.PI / 2;
    g.add(p);
  }
  const stops = [];
  TRACKS.forEach((x, i) => {
    stops.push([x, y, Z0 - 1.5, 2.6, 1.5, 0.5]);
    for (const sx of [-0.838, 0.838]) rails.push([x + sx, y + 0.1, Z0 - 2 - SHED / 2, 0.07, 0.42, SHED], [x + sx, y + 0.1, Z0 - 2 - SHED - (fine ? OPEN + 200 : 330), 0.07, 0.42, fine ? 400 : 660]);
    if (fine) {
      const t = at(track(OPEN, { ballast: false }), x, y, Z0 - 2 - SHED - OPEN / 2);
      t.rotation.y = Math.PI / 2;
      g.add(t);
    }
    if (fine || i % 2 === 0) {
      const o = at(overhead(OPEN + 380, { span: 54, side: i % 2 ? 1 : -1 }), x, y, Z0 - 12 - SHED - (OPEN + 380) / 2);
      o.rotation.y = Math.PI / 2;
      g.add(o);
    }
  });
  g.add(inst(unitBox(), stops, mat('#b3262e', 0.7)), inst(unitBox(), rails, IRON));
  // Trains at the platforms: expresses for the north and west behind their locomotives, a
  // Shatabdi-liveried rake, and Vande Bharat sets.
  const liveries = ['blue', 'vande', 'red', 'blue', 'orange', 'green', 'red'];
  let n = 0;
  TRACKS.forEach((x, i) => {
    if (i % (fine ? 2 : 3) === 1) return;
    const livery = liveries[n++ % liveries.length], cars = ['vande', 'orange'].includes(livery) ? 8 : 9 + Math.floor(R() * 4);
    const tr = train(detail.low ? Math.min(cars, 8) : cars, { livery, locoColour: R() < 0.5 ? '#c23b2e' : '#e8e2cf' });
    tr.rotation.y = Math.PI / 2;
    g.add(at(tr, x, y + 0.52, Z0 - 8 - R() * 30 - tr.userData.length / 2));
  });
  return g;
}

// The forecourt, Poonamallee High Road and the canal. The road runs east-west before the station
// and crosses the Buckingham Canal on a low masonry bridge of three arches, west of the forecourt.
const CX = -112, CW = 26;
function setting(s, g) {
  s.add(box(560, 0.12, 22, M.asphalt, 0, 0, 62), box(150, 0.14, 38, M.path, 0, 0, 31), box(560, 0.2, 5, M.path, 0, 0, 48.5), box(560, 0.2, 6, M.path, 0, 0, 76));
  // Cars and autos' place in the forecourt, and the traffic on the road: buses, taxis, lorries.
  s.add(traffic([[24, 1], [29, -1]], -60, 60, { y: 0.14, gap: 9, seed: 3, taxis: 0.3, buses: 0, trucks: 0 }));
  s.add(traffic([[53.5, 1], [57, 1], [60.5, 1], [64, -1], [67.5, -1], [71, -1]], -275, 275, { y: 0.12, gap: 19, seed: 8, taxis: 0.12, buses: 0.22, trucks: 0.05 }));
  // The forecourt's railing on its dwarf wall, with brick gate piers, and the lamps and trees.
  const d = new THREE.Group(), posts = [];
  for (const sx of [-1, 1]) {
    d.add(box(58, 0.7, 0.5, BRICK, sx * 44, 0.2, 49), box(58, 0.12, 0.6, WHITE, sx * 44, 0.9, 49), box(58, 0.07, 0.07, IRON, sx * 44, 2.0, 49));
    for (const x of [15, 73]) d.add(box(1.3, 3.2, 1.3, BRICK, sx * x, 0.2, 49), box(1.6, 0.3, 1.6, WHITE, sx * x, 3.4, 49), box(0.9, 0.5, 0.9, WHITE, sx * x, 3.7, 49));
    for (let x = 16.5; x < 72.5; x += 0.9) posts.push([sx * x, 1.0, 49, 0.05, 1.15, 0.05]);
  }
  s.add(mergeByMaterial(d), inst(unitBox(), posts, IRON));
  s.add(lampPosts([...along(14, [-260, 50.5], [260, 50.5]).filter(([x]) => Math.abs(x - CX) > CW / 2 + 2), ...along(14, [-260, 74.5], [260, 74.5]).filter(([x]) => Math.abs(x - CX) > CW / 2 + 2), [-30, 38], [30, 38]], { h: 6, y: 0.2 }));
  s.add(trees([[-62, 40], [-48, 43], [-34, 44], [34, 44], [48, 43], [62, 40], [-66, 22], [66, 22]], { kind: 'neem', seed: 3, h: 10, y: 0.14 }));
  s.add(trees(along(12, [-250, 77], [250, 77]).filter(([x]) => Math.abs(x - CX) > CW / 2 + 6), { kind: 'tamarind', seed: 9, h: 11, y: 0.2 }));
  // The canal between masonry walls, and the bridge: three segmental arches under the road, with
  // a white parapet and lamp piers.
  const STONE = mat('#a59a88', 0.9), c = new THREE.Group();
  for (const sx of [-1, 1]) c.add(box(1.4, BANK + 0.5, 1700, STONE, CX + sx * (CW / 2 + 0.7), 0, -200));
  for (const sz of [-1, 1]) {
    const face = cutSlab(CW, BANK + 0.1, [[-8.2, 0, 6.6, BANK - 0.5, 'segment'], [0, 0, 6.6, BANK - 0.5, 'segment'], [8.2, 0, 6.6, BANK - 0.5, 'segment']], 1.0, STONE);
    c.add(at(face, CX, 0, sz > 0 ? 78.6 : 47.4 - 1.0));
    c.add(box(CW + 3, 1.0, 0.5, WHITE, CX, BANK + 0.2, sz > 0 ? 79.3 : 46.7), box(CW + 3.4, 0.16, 0.7, WHITE, CX, BANK + 1.2, sz > 0 ? 79.3 : 46.7));
    for (const sx of [-1, 1]) c.add(box(1.1, 2.0, 1.1, WHITE, CX + sx * (CW / 2 + 1.4), BANK + 0.2, sz > 0 ? 79.3 : 46.7));
  }
  for (const x of [-4.1, 4.1]) c.add(box(1.6, BANK - 0.1, 30.2, STONE, CX + x, 0, 63));
  c.add(box(CW, 0.5, 30.2, STONE, CX, BANK - 0.4, 63));
  g.add(mergeByMaterial(c));
  g.add(sheet(CW, 1700, M.water, CX, 0.12, -200));
}

export function addDetails(f, g, s) {
  architecture(f);
  s.add(trainSheds(), railway());
  // The ground either side of the canal.
  const e = CX + CW / 2, w = CX - CW / 2;
  g.add(box(900 - e, BANK, 1900, M.bank, (900 + e) / 2, 0, -200), box(w + 900, BANK, 1900, M.bank, (w - 900) / 2, 0, -200));
  // Across the canal, the suburban terminal (the Moore Market Complex): a plain modern block.
  const CREAM = mat('#ded6c4', 0.85);
  s.add(box(64, 15, 34, CREAM, -178, 0, 4), box(65, 0.6, 35, SLAB, -178, 15, 4), box(58, 1.6, 0.12, GLASS, -178, 5, 21.06), box(58, 1.6, 0.12, GLASS, -178, 10, 21.06));
  setting(s, g);
  // Park Town round the station: streets of offices and houses either side of the yard and across
  // the road, clear of the forecourt, the road, the canal and the tracks running north.
  s.add(cityAround([-74, 74, -900, 84], { rows: detail.low ? 1 : 2, gap: 9, depth: [12, 18], storeys: [2, 6], seed: 29, every: detail.low ? 2 : 1,
    paint: ['#e3d6bd', '#d9c2a0', '#c9b79a', '#e9e1d0', '#c6a98a', '#d2cdc2'],
    keep: [[-2000, 2000, 44, 82], [-2000, 2000, -3000, -700], [CX - CW / 2 - 3, CX + CW / 2 + 3, -3000, 3000], [74, 2000, -12, 46], [-2000, -74, -12, 46]] }));
  s.add(trees(scatter(14, [-240, 240, 8, 42], { seed: 14, gap: 16, avoid: [[-80, 80, 0, 50], [CX - 20, CX + 20, 0, 50]] }), { kind: 'neem', seed: 14, h: 9 }));
}
