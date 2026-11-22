import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mat, mesh, sheet, inst, unitBox, surface, rng, M } from '../helpers.js';
import { heightField, fbm, smooth, rough } from '../parts/terrain.js';
import { trees, shrubs, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';
import { ROOT, STONE, DECKS, deckY } from '../monuments/living-root-bridge-nongriat.js';

const ROCK = surface(mat('#8b887d', 0.9, 0, { flatShading: true }), 'none'), MOSS = surface(mat('#55703f', 0.95, 0, { flatShading: true }), 'none');
const POOL = surface(mat('#2f7f86', 0.08, 0, { envMapIntensity: 1 }), 'water');
POOL.userData.wave = [0.8, 0.6, 0.03];

// The gorge of the Umshiang below Nongriat: the stream running over boulders between steep banks,
// a clear blue-green pool under the bridges, and the forest of the East Khasi Hills rising on both
// sides. groundY is the height of the banks; the stream bed is about a metre under the water.
const cx = (z) => 3 * Math.sin(z * 0.018) + 2 * Math.sin(z * 0.047 + 1);
export function groundY(x, z) {
  const d = Math.abs(x - cx(z));
  return -1.2 + 5.7 * smooth(6.5, 13.5, d) + Math.max(0, d - 14) * 0.45 + smooth(30, 200, d) * 70 * fbm(x, z, { scale: 0.006, octaves: 4 }) + rough(x, z, 0.4, 2);
}

// The figs on the banks: a fluted trunk, its buttress roots spreading over the ground, and aerial
// roots running out from it along the decks and down into the bank.
function figs(f) {
  const R = rng(17), trunks = [], roots = [];
  for (const s of [-1, 1]) {
    const tx = s * 16.5, tz = -1.5, gy = groundY(tx, tz) - 0.3;
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
    // Roots hanging from the upper deck's ends into the bank, and down the trunk.
    for (let k = 0; k < 6; k++) {
      const x = s * (DECKS[1].X - R() * 3), z = (R() - 0.5) * 1.2, y0 = deckY(DECKS[1], Math.abs(x)) - 0.1, gy2 = groundY(x, z);
      if (gy2 < y0 - 0.5) roots.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x, y0, z), new THREE.Vector3(x + s * 0.4, (y0 + gy2) / 2, z * 1.2), new THREE.Vector3(x + s * 0.8, gy2 - 0.2, z)]), 8, 0.06 + R() * 0.05, 5, false));
    }
  }
  f.add(mesh(mergeGeometries(trunks), ROOT), mesh(mergeGeometries(roots), ROOT));
}

export function addDetails(f, g) {
  figs(f);
  // The fig crowns over the trunks.
  g.add(trees([[16.5, -1.5, 26, groundY(16.5, -1.5) + 4], [-16.5, -1.5, 25, groundY(-16.5, -1.5) + 4]], { kind: 'banyan', seed: 5 }));
  // The stone stairs up each bank from the lower deck's end to the upper's.
  const steps = [];
  for (const s of [-1, 1]) for (let k = 0; k < 16; k++) {
    const x = s * (13.6 + k * 0.42), y = DECKS[0].Y + (k + 1) * ((DECKS[1].Y - DECKS[0].Y) / 16);
    steps.push([x, Math.min(groundY(x, 1.8), y) - 1, 1.8, 0.5, y - Math.min(groundY(x, 1.8), y) + 1, 1.3, 0]);
  }
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) { const y = DECKS[1].Y; steps.push([s * (13.2 + 0.3 * k), y - 0.4, 1.8 - k * 0.5, 0.6, 0.4, 0.6, 0]); }
  g.add(inst(unitBox(), steps, STONE));
  // The banks and the forest slopes above them.
  g.add(heightField(1200, 1200, detail.low ? 140 : 220, groundY, { rock: ['#7d7a6f', '#8b887d', '#6e6b61'], cover: '#4c6a37', steep: 0.68, band: 9 }));
  // The stream: water along the bed, and the pool under the bridges.
  g.add(sheet(16, 1200, M.river, 0, -0.2, 0));
  const pool = new THREE.Mesh(new THREE.CircleGeometry(9, 32).rotateX(-Math.PI / 2), POOL);
  pool.position.set(cx(6), -0.15, 6);
  pool.scale.set(1, 1, 1.6);
  g.add(pool);
  // Boulders in the stream and on the banks, some mossy.
  const R = rng(9), rocks = [], mossy = [], geo = new THREE.DodecahedronGeometry(1, 0);
  for (let k = 0; k < (detail.low ? 70 : 160); k++) {
    const z = -260 + R() * 520, x = cx(z) + (R() - 0.5) * 18, s = 0.4 + R() * R() * 2.6, y = groundY(x, z);
    if (Math.abs(z - 6) < 10 && Math.abs(x - cx(6)) < 7) continue;
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
