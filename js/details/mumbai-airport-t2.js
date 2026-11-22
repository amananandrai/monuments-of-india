import * as THREE from 'three';
import { M, mat, mesh, box, rng, inst, unitBox, unitCyl, surface, photo, mown } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, scatter, along, townHouses, houseRow } from '../parts/realism.js';
import { airliner, jetBridge } from '../parts/transport.js';
import { detail } from '../detail.js';

// Mumbai Terminal 2, finer detail and setting. Under the roof: the coffers, a diagonal lattice of
// ribs across the whole ceiling, with the coloured glass "eyes" of the peacock's feather set in
// rings round every column head, and on top of the roof the rings of small skylights over them.
// The hall's glass hangs in a cable net; its fittings draw a grid of verticals and horizontals
// over all four fronts (drawn broad enough to hold steady from the forecourt).
// Before the front, the elevated departures road on its own small flared columns, with a ramp
// curling down at either end and the arrivals road beneath. Behind and to the sides, the apron:
// airliners nose-in on the stands along the piers, each on its boarding bridge and lead-in line;
// floodlight masts; a taxiway and the runway. In front, lawns and palms along the approach roads,
// and the houses and hotel towers of Sahar beyond.
const ROOF_Y = 42.5, DECK_Y = 11, COLS_X = [-160, -96, -32, 32, 96, 160], COLS_Z = [84, 50, 16, -18, -52];
const PIERS = [[150, -86, 0.72, 340, 1], [-150, -86, Math.PI - 0.72, 340, -1], [196, -30, -0.25, 190, -1], [-196, -30, Math.PI + 0.25, 190, 1]];
const WHITE = surface(mat('#f1f1ee', 0.55), 'none'), RIB = surface(mat('#d9dad6', 0.6), 'none'), NET = surface(mat('#e6e8e8', 0.4, 0.4), 'none');
const EYE = surface(mat('#1d8f93', 0.2, 0.3, { emissive: '#0a3a3c' }), 'none'), SKY = surface(mat('#3d5361', 0.2, 0.5), 'none');
const CONCRETE = photo(mat('#c9c6be', 0.9), 'concrete'), APRON = mat('#b3b1ab', 0.95), GLASS_DARK = surface(mat('#2c3d49', 0.15, 0.6), 'none');
const YELLOW = surface(mat('#e3b520', 0.7), 'none'), PAINT = surface(mat('#eeeae0', 0.7), 'none'), MAST = surface(mat('#8f979c', 0.6, 0.5), 'none');
const front = (x, inset = 0) => 104 - inset + 16 * (1 - (x / (214 - inset)) ** 2);
const under = (x, z, inset = 9) => Math.abs(x) < 214 - inset && z > -108 + inset && z < front(x, inset);

function ceiling(f) {
  // The lattice: ribs on both diagonals, 5.5 m apart, each cut to the roof's plan.
  const ribs = [], step = detail.low ? 11 : 5.5, c = Math.SQRT1_2;
  for (const s of [-1, 1]) for (let o = -330; o <= 330; o += step) {
    // The line x - s z = o * sqrt 2, walked along its length t.
    let a = null, b = null;
    for (let t = -340; t <= 340; t += 1.5) { const x = o * c + t * c, z = s * (t * c - o * c); if (under(x, z)) { if (a === null) a = t; b = t; } }
    if (a === null || b - a < 4) continue;
    const t = (a + b) / 2;
    ribs.push([o * c + t * c, ROOF_Y - 0.42, s * (t * c - o * c), b - a, 0.5, 0.2, -s * Math.PI / 4]);
  }
  const lattice = inst(unitBox(), ribs, RIB);
  lattice.castShadow = false;
  f.add(lattice);
  // Eyes in the ceiling round each column head, and skylights on the roof over them.
  const eyes = [], lights = [];
  for (const cx of COLS_X) for (const cz of COLS_Z) {
    for (const [r, n] of detail.low ? [[19.5, 18]] : [[18.6, 22], [22, 26]]) for (let k = 0; k < n; k++) {
      const a = ((k + (r > 20 ? 0.5 : 0)) / n) * Math.PI * 2, x = cx + r * Math.cos(a), z = cz + r * Math.sin(a);
      if (under(x, z, 11)) eyes.push([x, ROOF_Y - 0.3, z, 1.5, 0.28, 1.5]);
    }
    for (const [r, n] of detail.low ? [[6, 8], [12, 14]] : [[4, 8], [7.5, 14], [11, 20], [14.5, 26]]) for (let k = 0; k < n; k++) {
      const a = ((k + r) / n) * Math.PI * 2;
      lights.push([cx + r * Math.cos(a), ROOF_Y + 3.46, cz + r * Math.sin(a), 1.5, 0.3, 1.5]);
    }
  }
  const e = inst(unitCyl(8), eyes, EYE), l = inst(unitCyl(8), lights, SKY);
  e.castShadow = l.castShadow = false;
  f.add(e, l);
}

function hall(f) {
  // The cable net on the four glass fronts of the hall (400 m by 160 m, centred on z = -16).
  const net = [], H = ROOF_Y - DECK_Y - 0.4, sx = 8, sy = 6.2;
  for (const s of [-1, 1]) {
    for (let x = -200; x <= 200.01; x += sx) net.push([x, DECK_Y, -16 + s * 80.08, 0.4, H, 0.3]);
    for (let z = -96; z <= 64.01; z += sx) net.push([s * 200.08, DECK_Y, z, 0.3, H, 0.4]);
    for (let y = DECK_Y + sy; y < ROOF_Y - 1; y += sy) net.push([0, y, -16 + s * 80.08, 400, 0.3, 0.2], [s * 200.08, y, -16, 0.2, 0.3, 160]);
  }
  const n = inst(unitBox(), net, NET);
  n.castShadow = false;
  f.add(n);
  // The doors off the kerb: glazed vestibules in white frames, one between each pair of columns.
  const d = new THREE.Group();
  for (let x = -128; x <= 128; x += 64) d.add(box(18, 5.2, 4, WHITE, x, DECK_Y, 66), box(16.8, 4.2, 4.1, GLASS_DARK, x, DECK_Y, 66.02));
  // A roof-top plant deck, set well back.
  d.add(box(240, 2.2, 60, RIB, 0, ROOF_Y + 3.4, -40));
  f.add(mergeByMaterial(d));
}

// The departures road: a deck 36 m wide along the front, its ramps curling down to the ground at
// either end, on flared columns; the arrivals road and its kerb underneath.
function roads(f, g) {
  const d = new THREE.Group(), z0 = 64, z1 = 101, zc = (z0 + z1) / 2, W = z1 - z0, X = 262;
  d.add(box(2 * X, 1.3, W, CONCRETE, 0, DECK_Y - 1.3, zc), box(2 * X, 0.05, 25, M.asphalt, 0, DECK_Y, zc + 4.5), box(2 * X, 1.0, 0.4, WHITE, 0, DECK_Y, z1 - 0.2));
  // Each ramp: a quarter turn of 150 m radius towards the front, falling all the way.
  const posts = [];
  for (const s of [-1, 1]) {
    const pts = [], n = 10, R = 150;
    for (let k = 0; k <= n; k++) { const a = (k / n) * Math.PI / 2; pts.push(new THREE.Vector3(s * (X + R * Math.sin(a)), DECK_Y - 0.65 - (DECK_Y - 0.4) * (k / n) ** 1.2, zc + R * (1 - Math.cos(a)))); }
    for (let k = 0; k < n; k++) {
      const a = pts[k], b = pts[k + 1], seg = mesh(new THREE.BoxGeometry(22, 1.3, a.distanceTo(b) + 1.2), CONCRETE);
      seg.position.copy(a).add(b).multiplyScalar(0.5);
      seg.lookAt(b);
      const top = mesh(new THREE.BoxGeometry(18, 0.06, a.distanceTo(b) + 1.2), M.asphalt);
      top.position.copy(seg.position).setY(seg.position.y + 0.68);
      top.lookAt(b.clone().setY(b.y + 0.68));
      d.add(seg, top);
      if (a.y > 2.5) posts.push([a.x, 0, a.z, 2.2, a.y - 0.6, 2.2]);
    }
  }
  f.add(mergeByMaterial(d));
  f.add(inst(unitCyl(12), posts, CONCRETE));
  // Under the deck: a pier under each of the great columns, and between them rows of smaller
  // columns that flare into the deck as the great ones do into the roof.
  const big = COLS_X.map((x) => [x, 0, 84, 4.4, DECK_Y - 1.3, 4.4]);
  f.add(inst(unitCyl(16), big, CONCRETE));
  const prof = [[0.75, 0], [0.7, 5.2], [1.0, 7], [1.9, 8.5], [3.6, DECK_Y - 1.3]].map(([r, y]) => new THREE.Vector2(r, y));
  const small = [];
  for (let x = -256; x <= 256; x += 16) for (const z of [68, 97]) small.push([x, 0, z, 1, 1, 1]);
  f.add(inst(new THREE.LatheGeometry(new THREE.SplineCurve(prof).getPoints(10), detail.low ? 10 : 16), small, WHITE));
  // Lane lines on the deck, and the arrivals road below with its kerb.
  const lines = [];
  for (const z of [zc - 4, zc + 0.5, zc + 5, zc + 9.5, zc + 14]) for (let x = -X + 4; x < X; x += detail.low ? 24 : 12) lines.push([x, DECK_Y + 0.05, z, 4.5, 0.06, 0.2]);
  const lm = inst(unitBox(), lines, PAINT);
  lm.castShadow = false;
  f.add(lm);
  g.add(box(700, 0.06, 26, M.asphalt, 0, 0.3, 84), box(560, 0.25, 4, CONCRETE, 0, 0.3, 68));
}

// The liveries on the apron: Air India (red tail and engines), IndiGo (navy tail, belly and
// engines), Akasa Air (orange tail, purple engines) and Air India Express (orange tail, teal engines).
const LIVERY = {
  ai: { tail: '#c8102e', body: '#f4f1ea', engine: '#c8102e' },
  indigo: { tail: '#101f6e', belly: '#101f6e', engine: '#101f6e' },
  akasa: { tail: '#ff6a13', engine: '#4b2c83' },
  aix: { tail: '#f0611a', engine: '#17a39b' },
};
// Stands along each pier: [pier, side (+1 is the wedge between a long pier and a short one), distance
// out along the pier, size, livery].
const STANDS = [
  ...[0, 1].flatMap((p) => [[p, 1, 178, 'narrow', 'indigo'], [p, 1, 232, 'narrow', p ? 'akasa' : 'aix'], [p, 1, 298, 'wide', 'ai'],
    [p, -1, 52, 'narrow', p ? 'indigo' : 'akasa'], [p, -1, 104, 'narrow', 'ai'], [p, -1, 168, 'wide', 'ai'], [p, -1, 240, 'wide', p ? 'ai' : 'indigo'], [p, -1, 304, 'narrow', 'indigo']]),
  ...[2, 3].flatMap((p) => [[p, 1, 112, 'narrow', p === 2 ? 'aix' : 'indigo'], [p, 1, 166, 'narrow', p === 2 ? 'indigo' : 'akasa']]),
];

function apron(f, g) {
  const lines = new THREE.Group(), masts = [], heads = [];
  for (const [x, z, a, len, wedge] of PIERS) {
    const s = new THREE.Group();
    s.position.set(x, 0, z);
    s.rotation.y = a;
    for (const [, sd, u, size, key] of STANDS.filter((st) => PIERS[st[0]][0] === x && PIERS[st[0]][1] === z)) {
      // `wedge` says which side of this pier (local +z or -z) the wedge is on.
      const side = sd * wedge, wide = size === 'wide', L = wide ? 57 : 37.6, R = wide ? 2.9 : 1.98, nose = 17 + 12;
      const lv = LIVERY[key], plane = airliner({ size: wide && key === 'indigo' ? 'narrow' : size, ...lv });
      plane.position.set(u, 0.3, side * (nose + L / 2));
      plane.rotation.y = side * Math.PI / 2;
      // The bridge: from its rotunda at the pier's wall to the port door behind the flight deck.
      const door = [u - side * (R + 1.6), side * (nose + (wide ? 9 : 6))], root = [u - side * 15, side * 19.4];
      const dx = door[0] - root[0], dz = door[1] - root[1], br = jetBridge(Math.hypot(dx, dz) - 2.6, { h: wide ? 4.9 : 3.6 });
      br.position.set(root[0], 0.3, root[1]);
      br.rotation.y = Math.atan2(-dz, dx);
      s.add(plane, br, box(2.6, 4, 3, WHITE, root[0], wide ? 5 : 3.8, side * 17.6));
      const lead = box(0.3, 0.02, L + 34, YELLOW, u, 0.31, side * (nose + (L + 34) / 2 - 4));
      lines.add(lead);
      lead.castShadow = false;
      s.add(lead);
    }
    f.add(s);
    // Floodlight masts along both sides of the pier, clear of the stands.
    s.updateMatrixWorld(true);
    for (let u = 30; u < len; u += 110) for (const sd of [-1, 1]) {
      const p = new THREE.Vector3(u + 27, 0, sd * 23).applyMatrix4(s.matrixWorld);
      masts.push([p.x, 0.3, p.z, 0.5, 30, 0.5]);
      heads.push([p.x, 30.3, p.z, 3.4, 1.2, 0.5, a]);
    }
  }
  g.add(inst(unitCyl(8), masts, MAST), inst(unitBox(), heads, MAST));
  // The paved field: apron and taxiways as one slab, the runway behind with its markings.
  g.add(box(2600, 0.3, 1500, APRON, 0, 0, -500));
  g.add(box(2500, 0.05, 60, M.asphalt, 0, 0.3, -900), box(2400, 0.02, 0.9, PAINT, 0, 0.36, -900));
  const marks = [];
  for (const e of [-1, 1]) for (let k = -4; k <= 4; k++) marks.push([e * 1170, 0.36, -900 + k * 5.6, 45, 0.02, 2]);
  for (let x = -1050; x <= 1050; x += 75) marks.push([x, 0.36, -900, 30, 0.02, 0.9]);
  const taxi = [[0, 0.31, -760, 2400, 0.02, 0.35], [0, 0.31, -640, 2400, 0.02, 0.35]];
  const mk = inst(unitBox(), marks, PAINT), tx = inst(unitBox(), taxi, YELLOW);
  mk.castShadow = tx.castShadow = false;
  g.add(mk, tx);
}

export function addDetails(f, g) {
  const R = rng(44);
  ceiling(f);
  hall(f);
  roads(f, g);
  apron(f, g);
  // The forecourt: lawns either side of the approach road, royal palms along it and round the
  // lawns, and flowering shrubs at the kerb.
  for (const s of [-1, 1]) g.add(mown(box(150, 0.25, 250, M.grass, s * 105, 0.3, 245)));
  g.add(box(44, 0.06, 420, M.asphalt, 0, 0.3, 310), box(640, 0.06, 20, M.asphalt, 0, 0.3, 386));
  const palms = [...along(12, [-26, 130], [-26, 360]), ...along(12, [26, 130], [26, 360]), ...along(9, [-176, 126], [-36, 126]), ...along(9, [36, 126], [176, 126])];
  g.add(trees(palms.map(([x, z]) => [x, z, 12 + R() * 3, 0.5]), { kind: 'palm', seed: 4 }));
  g.add(trees(scatter(detail.low ? 14 : 30, [-175, 175, 150, 365], { seed: 7, gap: 22, avoid: [[-34, 34, 100, 400]] }).map(([x, z]) => [x, z, 9 + R() * 4, 0.5]), { kind: 'neem', seed: 7 }));
  g.add(shrubs([...along(20, [-170, 136], [-40, 136]), ...along(20, [40, 136], [170, 136])].map(([x, z]) => [x, z, 1.3, 0.5]), { flowers: '#d0306f', seed: 3 }));
  // Sahar beyond the airport road: streets of houses, and the hotel towers that face the terminal.
  const Rh = rng(12), spots = [];
  for (const z of detail.low ? [430, 452] : [430, 452, 486, 508]) spots.push(...houseRow(Rh, 'x', z, detail.low ? -260 : -520, detail.low ? 260 : 520, z % 56 < 30 ? Math.PI : 0, { n: [2, 5] }).map((sp) => [...sp, 0.3]));
  g.add(townHouses(spots, { seed: 12, fine: false }));
  g.add(box(2600, 0.3, 560, mat('#a9a58f', 0.95), 0, 0, 530), box(1500, 0.06, 16, M.asphalt, 0, 0.3, 410));
  g.add(trees(scatter(detail.low ? 30 : 70, [-900, 900, 262, 398], { seed: 23, gap: 16, avoid: [[-190, 190, 240, 400]] }).map(([x, z]) => [x, z, 9 + R() * 5, 0.3]), { kind: 'banyan', seed: 23 }));
  const towers = [], glassT = [], wall = surface(mat('#cfcac0', 0.9), 'facade'), glassM = surface(mat('#8ea3b4', 0.35, 0.3), 'facade');
  for (let i = 0; i < 14; i++) { const t = [-600 + i * 92 + Rh() * 30, 0.3, 560 + Rh() * 120, 26 + Rh() * 18, 34 + Rh() * 50, 22 + Rh() * 10]; (Rh() < 0.6 ? towers : glassT).push(t); }
  g.add(inst(unitBox(), towers, wall), inst(unitBox(), glassT, glassM));
}
