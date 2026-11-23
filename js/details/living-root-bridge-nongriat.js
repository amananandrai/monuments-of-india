import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mat, mesh, box, sheet, inst, unitBox, surface, rng, M } from '../helpers.js';
import { heightField, fbm, smooth, rough } from '../parts/terrain.js';
import { trees, shrubs, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';
import { ROOT, ROOT_PALE, ROOT_MOSS, STONE, DECKS, deckY } from '../monuments/living-root-bridge-nongriat.js';

const ROCK = surface(mat('#8b887d', 0.9, 0, { flatShading: true }), 'none'), MOSS = surface(mat('#55703f', 0.95, 0, { flatShading: true }), 'none');
const POOL = surface(mat('#2f7f86', 0.08, 0, { envMapIntensity: 1 }), 'water');
POOL.userData.wave = [0.8, 0.6, 0.03];
const UPPER = surface(mat('#3d6f68', 0.08, 0, { envMapIntensity: 1 }), 'water'), FOAM = mat('#e8f0ee', 0.5);
UPPER.userData.wave = [0.6, 1.2, 0.04];
const BAMBOO = surface(mat('#b3a468', 0.7), 'carved'), ARECA = surface(mat('#9a9486', 0.9), 'carved'), YOUNG = surface(mat('#8f5b3c', 0.85), 'carved');
// The fig trunks: the great tree at the east end, close against the decks, and a lesser one west.
const FIGS = [[13.4, -1.9], [-15.5, -1.5]];
// The sill of rock just upstream of the bridges, where the stream drops into the pool.
const SILL = -4.2;

// The gorge of the Umshiang below Nongriat: the stream running over boulders between steep banks,
// a clear blue-green pool under the bridges, and the forest of the East Khasi Hills rising on both
// sides; just upstream of them the stream comes down a low cascade over a sill of rock. groundY
// is the height of the banks; the stream bed is about a metre under the water.
const cx = (z) => 3 * Math.sin(z * 0.018) + 2 * Math.sin(z * 0.047 + 1);
export function groundY(x, z) {
  const d = Math.abs(x - cx(z));
  return -1.2 + 0.75 * (1 - smooth(SILL - 1.2, SILL + 0.8, z)) + 5.7 * smooth(6.5, 12, d) + Math.max(0, d - 14) * 0.45 + smooth(30, 200, d) * 70 * fbm(x, z, { scale: 0.006, octaves: 4 }) + rough(x, z, 0.4, 2);
}

// The figs on the banks: a fluted trunk, its buttress roots spreading over the ground, and aerial
// roots running out from it along the decks and down into the bank.
function figs(f) {
  const R = rng(17), trunks = [], roots = [], thin = [];
  for (const [tx, tz] of FIGS) {
    const s = Math.sign(tx), gy = groundY(tx, tz) - 0.3;
    // The trunk: several stems fused, as an old fig's is.
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * 6.28, ox = Math.cos(a) * 0.55, oz = Math.sin(a) * 0.55;
      const pts = [new THREE.Vector3(tx + ox * 1.8, gy, tz + oz * 1.8), new THREE.Vector3(tx + ox, gy + 4, tz + oz), new THREE.Vector3(tx + ox * 0.8, gy + 10, tz + oz * 0.8), new THREE.Vector3(tx + ox * 1.3, gy + 17, tz + oz * 1.3)];
      trunks.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.55 + 0.1 * R(), 8, false));
    }
    // Buttress roots over the bank.
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * 6.28 + R(), L = 3 + R() * 3, ex = tx + Math.cos(a) * L, ez = tz + Math.sin(a) * L;
      roots.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(tx + Math.cos(a) * 0.8, gy + 2.2, tz + Math.sin(a) * 0.8), new THREE.Vector3(tx + Math.cos(a) * L * 0.55, gy + 0.6, tz + Math.sin(a) * L * 0.55), new THREE.Vector3(ex, groundY(ex, ez) - 0.25, ez)]), 10, 0.25 + R() * 0.15, 6, false));
    }
    // The roots that make each deck's end, springing from the trunk.
    for (const dk of DECKS) for (let k = 0; k < (detail.low ? 5 : 9); k++) {
      const h = Math.min(dk.Y + 1.5, gy + 2 + R() * (dk.Y - gy + 1)), a = R() * 6.28;
      const end = new THREE.Vector3(s * (dk.X - 1.5 - R() * 2), deckY(dk, dk.X - 2) - 0.1, (R() - 0.5) * dk.w);
      const mid = new THREE.Vector3(s * (dk.X + 1.2), (h + end.y) / 2 + 0.3, tz * 0.4 + end.z * 0.6);
      roots.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(tx + Math.cos(a) * 0.7, h, tz + Math.sin(a) * 0.7), mid, end]), 12, 0.1 + R() * 0.1, 6, false));
    }
    // Curtains of aerial roots hanging from both decks near the banks, down to the ground or the
    // water: thin ones in dozens, and a few grown as thick as a wrist.
    for (const [j, dk] of DECKS.entries()) for (let k = 0; k < (detail.low ? 8 : j ? 22 : 16); k++) {
      const x = s * (dk.X - R() * (j ? 6.5 : 4.5)), z = (R() < 0.5 ? -1 : 1) * (dk.w / 2 + R() * 0.25), y0 = deckY(dk, Math.abs(x)) - 0.2, gy2 = Math.max(groundY(x, z), -0.6);
      if (gy2 < y0 - 0.5) (k % 4 ? thin : roots).push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x, y0, z), new THREE.Vector3(x + (R() - 0.5) * 0.5, (y0 + gy2) / 2, z * 1.15), new THREE.Vector3(x + (R() - 0.5) * 0.9, gy2 - 0.2, z + (R() - 0.5) * 0.5)]), 8, k % 4 ? 0.02 + R() * 0.02 : 0.05 + R() * 0.05, 5, false));
    }
  }
  f.add(mesh(mergeGeometries(trunks), ROOT), mesh(mergeGeometries(roots), ROOT), mesh(mergeGeometries(thin), ROOT_PALE));
}

// How a bridge is grown, shown on the young third strand above the upper deck: halved trunks of
// areca (betel-nut) palm laid end to end as a trough across the stream, young roots led along
// them, the whole carried on bamboo uprights lashed to the railings; and bamboo poles tied along
// both sides as handrails.
function training(f) {
  const dk = DECKS[1], g = new THREE.Group(), R = rng(31), young = [], cane = [];
  const pole = (a, b, r) => cane.push(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(...a), new THREE.Vector3(...b)), 1, r, 5, false));
  const ty = (x) => deckY(dk, x) + 2.3 + 0.15 * Math.sin(x * 0.6), tz = (x) => 0.25 * Math.sin(x * 0.35);
  for (let k = 0; k < 6; k++) {
    const x0 = -dk.X + 0.3 + k * (2 * dk.X - 0.6) / 6, x1 = x0 + (2 * dk.X - 0.6) / 6 + 0.3, L = Math.hypot(x1 - x0, ty(x1) - ty(x0));
    const half = mesh(new THREE.CylinderGeometry(0.11, 0.1, L, 8, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(Math.PI / 2), ARECA, (x0 + x1) / 2, (ty(x0) + ty(x1)) / 2 - 0.06, (tz(x0) + tz(x1)) / 2);
    half.rotation.z = Math.atan2(ty(x1) - ty(x0), x1 - x0);
    g.add(half);
  }
  for (let k = 0; k < 4; k++) {
    const pts = [], ph = R() * 6;
    for (let i = 0; i <= 24; i++) { const x = -dk.X - 1 + (i / 24) * (2 * dk.X + 2); pts.push(new THREE.Vector3(x, ty(Math.max(-dk.X, Math.min(dk.X, x))) + 0.02 * Math.sin(i + ph) - Math.max(0, Math.abs(x) - dk.X) * 1.2, tz(x) + 0.04 * Math.cos(i * 1.3 + ph))); }
    young.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.018 + R() * 0.012, 4, false));
  }
  for (let x = -dk.X + 1.5; x < dk.X - 1; x += 3.1) for (const side of [-1, 1]) {
    pole([x, deckY(dk, x) - 0.1, side * (dk.w / 2 + 0.2)], [x + 0.15 * side, ty(x) + 0.35, tz(x) + side * 0.08], 0.035);
  }
  for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
    const x0 = -dk.X + k * (2 * dk.X / 3) - 0.4, x1 = x0 + 2 * dk.X / 3 + 0.9, z = side * (dk.w / 2 + 0.28);
    pole([x0, deckY(dk, Math.max(-dk.X, x0)) + 1.25 + 0.1 * (k % 2), z], [x1, deckY(dk, Math.min(dk.X, x1)) + 1.3 - 0.08 * (k % 2), z + 0.05 * side], 0.03);
  }
  g.add(mesh(mergeGeometries(young), YOUNG), mesh(mergeGeometries(cane), BAMBOO));
  f.add(g);
}

export function addDetails(f, g) {
  figs(f);
  training(f);
  // The fig crowns over the trunks.
  g.add(trees(FIGS.map(([x, z], k) => [x, z, 26 - k, groundY(x, z) + 4]), { kind: 'banyan', seed: 5 }));
  // The stone stairs up each bank from the lower deck's end to the upper's.
  const steps = [];
  for (const s of [-1, 1]) for (let k = 0; k < 16; k++) {
    const x = s * (DECKS[0].X + 0.6 + k * 0.42), y = DECKS[0].Y + (k + 1) * ((DECKS[1].Y - DECKS[0].Y) / 16);
    steps.push([x, Math.min(groundY(x, 1.8), y) - 1, 1.8, 0.5, y - Math.min(groundY(x, 1.8), y) + 1, 1.3, 0]);
  }
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) { const y = DECKS[1].Y; steps.push([s * (DECKS[1].X + 0.2 + 0.3 * k), y - 0.4, 1.8 - k * 0.5, 0.6, 0.4, 0.6, 0]); }
  g.add(inst(unitBox(), steps, STONE));
  // The banks and the forest slopes above them.
  g.add(heightField(1200, 1200, detail.low ? 140 : 220, groundY, { rock: ['#7d7a6f', '#8b887d', '#6e6b61'], cover: '#4c6a37', steep: 0.68, band: 9 }));
  // The stream: water along the bed, three quarters of a metre higher above the sill, the white
  // water coming down between its rocks, and the still pool under the bridges, held by a low weir.
  g.add(sheet(16, 1200, M.river, 0, -0.2, 0), sheet(16, 590, UPPER, 0, 0.55, SILL - 295.6));
  const pool = new THREE.Mesh(new THREE.CircleGeometry(9, 32).rotateX(-Math.PI / 2), POOL);
  pool.position.set(cx(8), -0.15, 8);
  pool.scale.set(1, 1, 1.6);
  g.add(pool);
  const fall = new THREE.Group(), F = rng(23), sill = [];
  for (let k = 0; k < 9; k++) {
    const x = cx(SILL) - 6.6 + k * 1.65 + F() * 0.5, s = 0.7 + F() * 0.7;
    sill.push([x, 0.1, SILL + (F() - 0.5) * 0.8, s * 1.1, s, s * 1.2, F() * 6]);
    if (k < 8) { const wd = 0.5 + F() * 0.5, sl = mesh(new THREE.PlaneGeometry(wd, 1.9, 1, 3), FOAM, x + 0.85, 0.2, SILL + 0.85); sl.rotation.x = -Math.PI / 2 + 0.42; fall.add(sl); }
  }
  for (let k = 0; k < 8; k++) fall.add(mesh(new THREE.CircleGeometry(0.5 + F() * 0.3, 8).rotateX(-Math.PI / 2), FOAM, cx(SILL) - 5.6 + k * 1.6, -0.17, SILL + 1.9 + F() * 0.3));
  fall.add(box(15, 1.2, 0.5, STONE, cx(23), -1.25, 23));
  g.add(fall, inst(new THREE.DodecahedronGeometry(1, 0), sill, ROCK));
  // Boulders in the stream and on the banks, some mossy.
  const R = rng(9), rocks = [], mossy = [], geo = new THREE.DodecahedronGeometry(1, 0);
  for (let k = 0; k < (detail.low ? 70 : 160); k++) {
    const z = -260 + R() * 520, x = cx(z) + (R() - 0.5) * 18, s = 0.4 + R() * R() * 2.6, y = groundY(x, z);
    if ((Math.abs(z - 8) < 12 && Math.abs(x - cx(8)) < 7) || Math.abs(z - SILL) < 2.5) continue;
    (R() < 0.35 && y > 0.5 ? mossy : rocks).push([x, Math.max(y, -0.9) + s * 0.25, z, s * (0.9 + R() * 0.4), s * 0.7, s * (0.9 + R() * 0.4), R() * 6]);
  }
  g.add(inst(geo, rocks, ROCK), inst(geo, mossy, MOSS));
  // The forest: broadleaf trees and betel-nut palms on the slopes, ferns and shrubs below them.
  const spots = [...scatter(detail.low ? 160 : 380, [-500, 500, -500, 500], { seed: 4, gap: 10 }), ...scatter(detail.low ? 60 : 160, [-90, 90, -160, 160], { seed: 14, gap: 6 })].filter(([x, z]) => Math.abs(x - cx(z)) > 15 && !(Math.abs(x) < 24 && Math.abs(z) < 10));
  const kinds = ['jamun', 'teak', 'peepal', 'mango', 'palm', 'sal'], T = rng(4);
  kinds.forEach((k, i) => g.add(trees(spots.filter((_, j) => j % kinds.length === i).map(([x, z]) => [x, z, (k === 'palm' ? 14 : 15) + T() * 8, groundY(x, z) - 0.2]), { kind: k, seed: 6 + i })));
  const ferns = scatter(detail.low ? 120 : 340, [-80, 80, -120, 120], { seed: 8, gap: 2.5 }).filter(([x, z]) => { const d = Math.abs(x - cx(z)); return d > 7 && !(Math.abs(x) < 14 && Math.abs(z) < 3); });
  g.add(shrubs(ferns.map(([x, z]) => [x, z, 1.1 + T() * 1.2, groundY(x, z) - 0.15]), { seed: 3 }));
}
