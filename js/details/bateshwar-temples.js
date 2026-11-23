import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, sheet, inst, unitBox, photo } from '../helpers.js';
import { mergeByMaterial, mouldings, templeNiche, frieze } from '../parts/components.js';
import { carvedPillar, chandrashala } from '../parts/temples.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { figure, figureFrieze } from '../parts/sculpture.js';
import { trees, shrubs, scatter, asiBoard } from '../parts/realism.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { detail } from '../detail.js';
import { NEW, OLD, ROWS, LIFT, TANK, STREET, BHUTESHWAR, VISHNU, CARVED_SHRINES } from '../monuments/bateshwar-temples.js';

// Bateshwar, carving and setting. On the Bhuteshwar temple: the door with Ganga and Yamuna at the
// foot of its jambs and the nine planets on its lintel, Lakulisa, the marriage of Shiva and
// Parvati (Kalyanasundara) and a dancing Shiva in the wall niches, a frieze of elephant riders,
// musicians and couples round the plinth, and on the front of the spire the medallion with
// Nataraja under a kirtimukha. The Vishnu temple beside it. The same carving, smaller, on the
// larger spired shrines. Then the terraces the rows of shrines stand on, held by walls of rough
// stone; stacks of loose, numbered stones still to be set up; the tank cut in the rock at the foot
// of the slope, with the paved street of shrines that leads to it; and the scrub-covered ravines of
// the Chambal round about, with babul and dhok. Terraces follow ROWS in the monument file.
const WALL = photo(mat('#8a7a63', 0.95), 'rubble');
const EARTH = mat('#a89270', 0.95);
const PAVE = photo(mat('#b39c7c', 0.93), 'sandstone');

// Ravines and low hills round the site, which is levelled (LIFT above the open land, so that the
// tank can be sunk in it) and cut down for the tank. The cut is a cell of the grid wider than the
// tank, and the slope up from it lies under the site's own ground.
function landY(x, z) {
  if (Math.abs(x) < TANK.w / 2 + 10.5 && Math.abs(z - TANK.z) < TANK.d / 2 + 10.5) return LIFT - 3.4;
  const away = Math.max(Math.abs(x) - 80, z < 0 ? -z - 60 : z - 72), out = smooth(0, 90, away);
  return LIFT * (1 - smooth(0, 60, away)) + out * (14 + 22 * ridged(x, z, { scale: 0.008, octaves: 4 })) + (z < -60 ? smooth(-60, -140, z) * 16 : 0) + 1.2 * fbm(x, z, { scale: 0.02, octaves: 3 }) * smooth(-6, 20, away) - 0.5;
}

// The images in the wall niches, h tall: Lakulisa seated with his club; Shiva taking Parvati's
// hand (Kalyanasundara); Shiva dancing.
function image(kind, h, m) {
  const g = new THREE.Group();
  if (kind === 'lakulisa') g.add(box(h * 0.62, h * 0.18, h * 0.3, m), at(figure(h * 0.8, m, 'seated'), 0, h * 0.18, 0), box(h * 0.05, h * 0.62, h * 0.05, m, h * 0.3, h * 0.2, h * 0.1));
  else if (kind === 'kalyanasundara') g.add(at(figure(h, m, 'standing'), -h * 0.14, 0, 0), at(figure(h * 0.82, m, 'standing'), h * 0.2, 0, 0.02));
  else g.add(at(figure(h, m, 'dancer'), 0, 0, 0));
  return g;
}
// The medallion on the front of a spire: a horseshoe arch of radius r with Nataraja dancing in it
// and the lion face (kirtimukha) at its crown, on a stepped pediment. Its foot at y = 0, facing +z.
function medallion(r, m) {
  const g = new THREE.Group();
  g.add(box(r * 3.4, r * 1.3, r * 0.6, m, 0, 0, -r * 0.3), box(r * 2.6, r * 1.5, r * 0.5, m, 0, r * 1.3, -r * 0.25), box(r * 1.2, r * 0.5, r * 0.4, m, 0, r * 2.8, -r * 0.2));
  g.add(at(chandrashala(r, m, r * 0.3, M.recess), 0, r * 1.5, 0.01), at(figure(r * 1.45, m, 'dancer'), 0, r * 0.7, 0.08));
  const face = mesh(new THREE.SphereGeometry(r * 0.3, 8, 6), m, 0, r * 2.72, r * 0.16);
  face.scale.set(1.3, 1, 0.6);
  g.add(face);
  return g;
}
// The carving of one spired shrine `s` across (unit sizes as shrineGeo, or the dimensions given):
// the bands round the door with the river goddesses at their feet and the nine planets on the
// lintel, an image in a niche on each of the other three walls, and the medallion on the spire.
function dress(s, m, { doorW = 0.34 * s, doorY = 0.28 * s, doorH = 0.62 * s, doorZ = 0.722 * s, wallR = 0.55 * s, nicheY = 0.42 * s, nicheH = 0.4 * s, spireY = 1.2 * s, spireZ = 0.6 * s, medR = 0.17 * s, door = true, medal = true } = {}) {
  const g = new THREE.Group(), bw = doorW * 0.2;
  if (door) {
    for (const k of [-1, 1]) g.add(box(bw, doorH, 0.05, frieze(m), k * (doorW / 2 + bw / 2), doorY, doorZ + 0.025), at(figure(doorH * 0.36, m, 'standing'), k * (doorW / 2 + bw / 2), doorY, doorZ + 0.07));
    g.add(at(figureFrieze(doorW + 2 * bw, bw * 1.1, m, { pitch: (doorW + 2 * bw) / 9.01, kinds: ['seated'], back: M.recess, proud: 0.05 }), 0, doorY + doorH + bw * 0.12, doorZ));
  }
  ['lakulisa', 'kalyanasundara', 'nataraja'].forEach((kind, i) => {
    const a = [Math.PI, Math.PI / 2, -Math.PI / 2][i], n = templeNiche(nicheH * 0.56, nicheH, m, { figure: image(kind, nicheH * 0.9, OLD) });
    n.rotation.y = a;
    g.add(at(n, Math.sin(a) * (wallR + 0.01), nicheY, Math.cos(a) * (wallR + 0.01)));
  });
  if (medal) g.add(at(medallion(medR, m), 0, spireY, spireZ));
  return g;
}

// f: the temples; g: the site's own ground (both at the level of its paving); land: the open land.
export function addDetails(f, g, { R, P, BW, BH, land }) {
  // The Bhuteshwar temple's carving.
  const b = new THREE.Group(), fr = { kinds: ['elephant', 'musician', 'standing', 'dancer', 'standing'], pitch: 0.5 };
  b.add(at(templeDoorway(1.1, 2.1, { m: NEW, bands: 3, bw: 0.2, guardianH: 0.9, hood: false, open: 0.6 }), 0, P, BW / 2 + 0.31));
  b.add(dress(BW, NEW, { door: false, wallR: BW / 2 + 0.3, nicheY: P + 0.9, nicheH: 1.7, spireY: P + BH + 0.2, spireZ: BW / 2 + 0.25, medR: 0.62 }));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) {
    const fz = figureFrieze(BW + 1.6, 0.5, NEW, fr);
    fz.rotation.y = a;
    b.add(at(fz, Math.sin(a) * (BW / 2 + 1.01), 0.3, Math.cos(a) * (BW / 2 + 1.01)));
  }
  for (const s of [-1, 1]) b.add(at(figureFrieze(4, 0.5, NEW, fr), s * 4.1, 0.3, 8.21));
  f.add(at(mergeByMaterial(b), BHUTESHWAR[0], 0, BHUTESHWAR[1]));
  // The Vishnu temple beside it, of the same size: a sanctum 2.03 m square inside, its tower gone,
  // with the river goddesses on its door; before it an open hall on a high moulded plinth, short
  // pillars standing on a carved seat-back (kakshasana) round its edge and four taller ones in the
  // middle lifting the flat roof a step higher.
  const v = new THREE.Group(), VP = 1.5, VW = 4.6, VH = 3.1;
  v.add(box(8.6, VP, 13, OLD, 0, 0, 3.2), mouldings(8.62, 13.02, [[0, 0.22, 0.16, OLD], [0.22, 0.16, 0.08, NEW], [VP - 0.2, 0.2, 0.12, NEW]], NEW).translateZ(3.2));
  v.add(box(VW, VH, VW, NEW, 0, VP, 0), box(VW + 0.6, VH, VW * 0.5, NEW, 0, VP, 0), box(VW * 0.5, VH, VW + 0.6, NEW, 0, VP, 0));
  v.add(mouldings(VW + 0.61, VW + 0.61, [[VP, 0.26, 0.12, OLD], [VP + VH - 0.26, 0.26, 0.14, OLD]], NEW), box(VW + 0.3, 0.3, VW + 0.3, OLD, 0, VP + VH, 0), box(2.6, 0.4, 2, OLD, -0.6, VP + VH + 0.3, -0.5));
  v.add(at(templeDoorway(1.1, 2.1, { m: NEW, bands: 3, bw: 0.2, guardianH: 0.9, hood: false, open: 0.6 }), 0, VP, VW / 2 + 0.31));
  v.add(dress(VW, NEW, { door: false, wallR: VW / 2 + 0.3, nicheY: VP + 0.8, nicheH: 1.6, medal: false }));
  const seat = frieze(NEW), z0 = 2.7, z1 = 9.5, hw = 4;
  for (const s of [-1, 1]) {
    v.add(box(0.4, 0.9, z1 - z0, seat, s * hw, VP, (z0 + z1) / 2), box(0.6, 0.12, z1 - z0 + 0.2, NEW, s * hw, VP + 0.9, (z0 + z1) / 2));
    v.add(box(hw - 1.3, 0.9, 0.4, seat, s * (hw + 1.3) / 2, VP, z1 - 0.2), box(hw - 1.2, 0.12, 0.6, NEW, s * (hw + 1.3) / 2, VP + 0.9, z1 - 0.2));
    for (const z of [3.2, 5.2, 7.2, 9.2]) v.add(cyl(0.2, 0.24, 1.3, NEW, s * hw, VP + 1.02, z, 8), box(0.62, 0.28, 0.62, NEW, s * hw, VP + 2.32, z));
    v.add(cyl(0.2, 0.24, 1.3, NEW, s * 1.5, VP + 1.02, z1 - 0.2, 8), box(0.62, 0.28, 0.62, NEW, s * 1.5, VP + 2.32, z1 - 0.2));
    for (const z of [4.6, 7.4]) v.add(at(carvedPillar(3.3, NEW), s * 1.5, VP, z));
    const fz = figureFrieze(12.4, 0.5, NEW, fr);
    fz.rotation.y = s * Math.PI / 2;
    v.add(at(fz, s * 4.32, 0.55, 3.2), at(figureFrieze(2.4, 0.5, NEW, fr), s * 2.95, 0.55, 9.72));
  }
  v.add(box(9, 0.3, 7.6, NEW, 0, VP + 2.6, 6.1), box(9.5, 0.14, 8.1, OLD, 0, VP + 2.9, 6.1), box(4.4, 0.34, 4.4, NEW, 0, VP + 3.3, 6), box(5, 0.14, 5, OLD, 0, VP + 3.64, 6));
  v.add(at(steps(3, VP, 6, OLD), 0, 0, 9.7));
  f.add(at(mergeByMaterial(v), VISHNU[0], 0, VISHNU[1]));
  // The larger spired shrines: their doors, niches and medallions.
  const cs = new THREE.Group();
  if (!detail.low) for (const [x, y, z, s, turn] of CARVED_SHRINES) { const c = at(dress(s, NEW), x, y, z); c.rotation.y = turn; cs.add(c); }
  f.add(mergeByMaterial(cs));

  const t = new THREE.Group();
  // The terraces, each a platform of earth faced in front with a stone wall.
  ROWS.forEach(([z0, y], r) => {
    if (!r) return;
    t.add(box(140, y - 0.05, 14, EARTH, 0, 0, z0 - 3), box(140, y + 0.05, 0.8, WALL, 0, 0, z0 + 4.2));
  });
  const [zl, yl] = ROWS[ROWS.length - 1];
  t.add(box(140, yl, 40, EARTH, 0, 0, zl - 30));
  // Stairs up the middle of the terraces.
  ROWS.forEach(([z0, y], r) => {
    if (!r) return;
    for (let k = 0; k < 11; k++) t.add(box(3, (k + 1) * 0.2, 0.36, WALL, -10, y - 2.2, z0 + 8.2 - k * 0.36));
  });
  g.add(mergeByMaterial(t));
  // Loose stones: stacked in rows on the terraces and heaped in the gaps, waiting to be set up.
  const stones = [], n = detail.low ? 110 : 260;
  for (let k = 0; k < n; k++) {
    const row = ROWS[Math.floor(R() * ROWS.length)], s = 0.4 + R() * 0.7;
    const x = (R() - 0.5) * 128, z = row[0] - 0.4 - R() * 1.6;
    if (row === ROWS[0] && x > -15 && x < 22) continue;
    stones.push([x, row[1], z, s * 1.4, s * 0.5, s * 0.8, R() * 0.4]);
  }
  for (let k = 0; k < (detail.low ? 50 : 120); k++) { const x = 70 + R() * 18, z = -40 + R() * 60, s = 0.4 + R() * 0.6; stones.push([x, 0, z, s * 1.4, s * 0.5, s * 0.8, R() * 3]); }
  // Fallen slabs between the tank and the Bhuteshwar hall.
  for (let k = 0; k < 16; k++) { const s = 0.5 + R() * 0.7; stones.push([-2 + R() * 9, 0, 14.5 + R() * 4, s * 1.5, s * 0.4, s, R() * 3]); }
  g.add(inst(unitBox(), stones, OLD));
  // The ground and the ravines; the bare levelled ground of the site at the foot of the terraces.
  land.add(heightField(1500, 1500, detail.low ? 100 : 150, landY, { rock: ['#9b7f62', '#8d735a', '#a88d6e'], cover: '#8b8a52', steep: 0.74, band: 10 }));
  const { z: tz, w: tw, d: td } = TANK, tank = new THREE.Group();
  for (const [w, d, x, z] of [[156, tz - td / 2 + 3, 0, (tz - td / 2 - 5) / 2], [156, 24, 0, tz + td / 2 + 13], [78 - tw / 2 - 1, td + 2, -(78 + tw / 2 + 1) / 2, tz], [78 - tw / 2 - 1, td + 2, (78 + tw / 2 + 1) / 2, tz]]) g.add(box(w, 0.7, d, EARTH, x, -0.68, z));
  // The tank at the foot, cut down into the rock: 30 m by 22, its sides in steps of stone, its
  // water low and green; a ledge of the living rock left standing along its western side.
  for (let k = 0; k < 7; k++) {
    const i = k * 0.55, y = -k * 0.35;
    tank.add(box(tw - 2 * i, 0.35, 0.55, OLD, 0, y - 0.35, tz - td / 2 + i + 0.27), box(tw - 2 * i, 0.35, 0.55, OLD, 0, y - 0.35, tz + td / 2 - i - 0.27));
    for (const s of [-1, 1]) tank.add(box(0.55, 0.35, td - 2 * i, OLD, s * (tw / 2 - i - 0.27), y - 0.35, tz));
  }
  for (const s of [-1, 1]) tank.add(box(tw + 4, 0.14, 2, PAVE, 0, -0.1, tz + s * (td / 2 + 1)), box(2, 0.14, td, PAVE, s * (tw / 2 + 1), -0.1, tz));
  for (const [x, z, w, h, d, ry] of [[-19.5, 36, 3.4, 1.6, 9, 0.08], [-20.6, 30, 2.6, 1, 5, -0.2], [-18.6, 42, 3, 0.8, 4, 0.3], [-8, 46.8, 9, 0.9, 2.6, 0.06], [3, 47.4, 7, 0.5, 2.2, -0.08]]) {
    const o = box(w, h, d, WALL, x, -0.2, z);
    o.rotation.y = ry;
    tank.add(o);
  }
  g.add(mergeByMaterial(tank), sheet(tw - 7.4, td - 7.4, M.water, 0, -2.2, tz), box(tw - 7.6, 0.3, td - 7.6, M.bank, 0, -2.75, tz));
  // The street to the tank between its two rows of shrines, and the paving before the temples.
  g.add(box(STREET.x1 - STREET.x0 + 4, 0.1, 4.4, PAVE, (STREET.x0 + STREET.x1) / 2, -0.04, STREET.z), box(34, 0.1, 8.5, PAVE, 4, -0.04, 17.4));
  g.add(asiBoard('Bateshwar Group of Temples', 66, 39, -0.3));
  // Babul, dhok and neem on the slopes and in the ravines.
  const keep = [[-82, 82, -62, 74]];
  land.add(trees(scatter(detail.low ? 30 : 60, [-260, 260, -260, 240], { seed: 3, gap: 14, avoid: keep }).map(([x, z]) => [x, z, null, landY(x, z)]), { kind: 'babul', seed: 3 }));
  land.add(trees(scatter(detail.low ? 25 : 50, [-260, 260, -260, 240], { seed: 7, gap: 14, avoid: keep }).map(([x, z]) => [x, z, null, landY(x, z)]), { kind: 'dhok', seed: 7 }));
  g.add(trees([[-30, 30], [-13.5, 9], [-60, 50], [60, 52]], { kind: 'neem', seed: 4 }));
  land.add(shrubs(scatter(60, [-150, 150, -120, 120], { seed: 5, gap: 6, avoid: keep }).map(([x, z]) => [x, z, 1, landY(x, z)]), { seed: 5, dry: true }));
}
