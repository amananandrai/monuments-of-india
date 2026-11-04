import * as THREE from 'three';
import { mat, box, at, ellipseWall } from '../helpers.js';
import { idol, frieze, jali, chhajja, templeNiche, bracketGeo, placeAll, mergeByMaterial } from './components.js';
import { figure } from './sculpture.js';
import { trees, shrubs, asiBoard, along } from './realism.js';

// Rani ki Vav, finer detail. From photographs: every niche in the stepwell's side walls holds a
// sculpted figure (Vishnu's avatars, apsaras and nagakanyas among the 500 there); carved bands run
// between the tiers of niches; and the pillars of the pavilions spanning the trench carry bracket
// capitals under each beam. Dimensions follow js/monuments/rani-ki-vav.js: the trench 20 wide and 27
// deep, its walls at x = ±10, niches 3.2 apart in rows 4 apart from y = 3.
const SAND = mat('#c8a57c', 0.9), SAND_DARK = mat('#a3825d', 0.9);
function architecture(f) {
  const d = new THREE.Group(), D = 27, W = 20, L = 64, z0 = L / 2;
  for (let row = 0; row < 6; row++) {
    const y = 3 + row * 4;
    if (y > D - 3) continue;
    for (const s of [-1, 1]) {
      for (let k = 0; k < 18; k++) {
        const o = idol(2.1, SAND);
        o.position.set(s * (W / 2 - 0.32), y + 0.12, z0 - 3 - k * 3.2);
        o.rotation.y = -s * Math.PI / 2;
        d.add(o);
      }
      d.add(box(0.1, 0.6, L - 6, frieze(SAND), s * (W / 2 - 0.04), y + 2.8, z0 - 3 - 8.5 * 3.2 + 0));
    }
  }
  const br = [];
  for (const lv of [0.3, 0.55, 0.8]) {
    const z = z0 - lv * (L - 12), floor = D * (1 - lv);
    for (let y = floor + 4; y < D; y += 4) for (const x of [-8, -3, 3, 8]) for (const dz of [-3, 3]) for (const a of [0, Math.PI]) br.push([x, y, z + dz + (a ? -0.45 : 0.45), a]);
  }
  d.add(placeAll(bracketGeo(0.8, 0.6, 0.5), br, SAND_DARK));
  mergeByMaterial(d);
  f.add(d);
}

// The richer layer, after photographs of the stepwell (it is carved over every surface):
// - the side walls read as galleries: a pilaster between every pair of niches and a sloping ledge
//   (chhajja) over each tier, so the tiers of sculpture stand in a framework of columns and eaves;
// - each storey of the pavilions that span the trench has bracket capitals under its beam and a
//   carved band round each pillar, and the beams' faces are carved;
// - the end wall over the well is the great sculpture wall, seven tiers of niches with figures
//   (Vishnu's avatars among them) between pilasters and ledges;
// - inside the well shaft, galleries ring the wall on brackets, one every storey.
// Dimensions follow js/monuments/rani-ki-vav.js: the trench 20 wide, 27 deep and 64 long.
function galleries(f) {
  const d = new THREE.Group(), D = 27, W = 20, L = 64, z0 = L / 2, z1 = -L / 2;
  for (let row = 0; row < 6; row++) {
    const y = 3 + row * 4;
    if (y > D - 3) continue;
    for (const s of [-1, 1]) {
      const wall = at(new THREE.Group(), s * (W / 2), 0, 0);
      wall.rotation.y = -s * Math.PI / 2;
      // In the wall's frame: x runs along the trench (z) and +z points into it.
      for (let k = 0; k <= 18; k++) wall.add(box(0.36, 3.3, 0.34, SAND, s * (z0 - 3 - k * 3.2 + 1.6), y - 0.3, 0.17));
      wall.add(at(chhajja(L - 6, 0.7, 0.3, 0.1, SAND_DARK), s * (z0 - 3 - 8.5 * 3.2), y + 3.55, 0.01));
      d.add(wall);
    }
  }
  const br = [];
  for (const lv of [0.3, 0.55, 0.8]) {
    const z = z0 - lv * (L - 12), floor = D * (1 - lv);
    for (let y = floor + 4; y < D; y += 4) {
      for (const sz of [-1, 1]) d.add(box(W - 0.2, 0.5, 0.06, frieze(SAND), 0, y + 0.15, z + sz * 3.53));
      for (const x of [-8, -3, 3, 8]) for (const dz of [-3, 3]) {
        d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.45, 10), frieze(SAND)).translateX(x).translateY(y - 2).translateZ(z + dz));
        for (const a of [Math.PI / 2, -Math.PI / 2]) br.push([x + Math.sin(a) * 0.45, y, z + dz, a]);
      }
    }
  }
  d.add(placeAll(bracketGeo(0.8, 0.6, 0.5), br, SAND_DARK));
  // The sculpture wall at the far end (its face at z = z1 + 0.01, facing +z, 20 wide, 27 high).
  const ew = at(new THREE.Group(), 0, 0, z1);
  for (let t = 0; t < 7; t++) {
    const y = 0.6 + t * 3.7, n = 7;
    for (let k = 0; k < n; k++) ew.add(at(templeNiche(1.5, 2.6, SAND, { figure: figure(2.3, SAND, k % 3 === 1 ? 'dancer' : 'standing'), crown: t % 2 === 0 }), -W / 2 + 1.4 + k * ((W - 2.8) / (n - 1)), y, 0.01));
    ew.add(box(W - 0.2, 0.3, 0.5, SAND_DARK, 0, y + 3.25, 0.25));
  }
  d.add(ew);
  // Galleries round the inside of the well (radius 5.5 at z1 + 6).
  const wl = at(new THREE.Group(), 0, 0, z1 + 6), wb = [];
  for (let y = 4; y < D; y += 4) {
    wl.add(ellipseWall(5.2, 5.2, 0, Math.PI * 2, 0.6, y, y + 0.35, SAND_DARK), ellipseWall(4.95, 4.95, 0, Math.PI * 2, 0.12, y + 0.35, y + 1.2, jali(SAND)));
    for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2; wb.push([Math.sin(a) * 5.45, y, Math.cos(a) * 5.45, a + Math.PI]); }
  }
  wl.add(placeAll(bracketGeo(0.9, 0.5, 0.3), wb, SAND));
  d.add(wl);
  mergeByMaterial(d);
  f.add(d);
}


// Rani ki Vav at Patan: the lawns and neem trees round the well, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  galleries(f);
  const D = 27;
  g.add(trees([...along(7, [-40, -45], [-40, 45]), ...along(7, [40, -45], [40, 45])], { kind: 'neem', seed: 6, y: D }));
  g.add(shrubs([...along(10, [-22, -36], [-22, 36]), ...along(10, [22, -36], [22, 36])].map(([x, z]) => [x, z, 1]), { y: D, seed: 7 }));
  g.add(asiBoard('Rani-ki-Vav, Patan', 14, 44, 0, { y: D, line2: 'WORLD HERITAGE SITE' }));
}
