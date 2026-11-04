import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, hemi, finial, inst, unitBox, surface, ellipseWall } from '../helpers.js';
import { elephant } from '../details/animals.js';
import { fortGate } from '../details/forts.js';
import { addDetails } from '../details/gwalior-fort.js';

const SAND = mat('#c9b08a', 0.9);
const SAND_DARK = mat('#a68d68', 0.9);
const CLIFF = mat('#8f7a5c', 0.95, 0, { flatShading: true });
const TILES = [mat('#2f6fa8', 0.5), mat('#3c9a6a', 0.5), mat('#e3b23c', 0.5)].map((m) => surface(m, 'tiles'));
const TILE_YELLOW = mat('#f0c64a', 0.45), TILE_GREEN = mat('#2f8a52', 0.45);
// A flat picture about 1 m across (y from 0 to 1, facing +z), for the glazed tiles.
function motif(kind) {
  const sh = new THREE.Shape();
  if (kind === 'duck') {
    sh.moveTo(-0.45, 0.35); sh.quadraticCurveTo(-0.2, 0.05, 0.25, 0.15); sh.quadraticCurveTo(0.4, 0.25, 0.3, 0.45);
    sh.lineTo(0.3, 0.62); sh.quadraticCurveTo(0.35, 0.8, 0.5, 0.72); sh.lineTo(0.48, 0.66); sh.quadraticCurveTo(0.4, 0.66, 0.42, 0.56);
    sh.quadraticCurveTo(0.45, 0.4, 0.2, 0.45); sh.quadraticCurveTo(-0.1, 0.55, -0.45, 0.35);
  } else if (kind === 'elephant') {
    sh.moveTo(-0.45, 0.05); sh.lineTo(-0.35, 0.05); sh.lineTo(-0.33, 0.3); sh.lineTo(0.15, 0.3); sh.lineTo(0.17, 0.05); sh.lineTo(0.27, 0.05);
    sh.lineTo(0.3, 0.4); sh.quadraticCurveTo(0.45, 0.45, 0.42, 0.2); sh.lineTo(0.48, 0.05); sh.lineTo(0.5, 0.25); sh.quadraticCurveTo(0.55, 0.65, 0.3, 0.7);
    sh.quadraticCurveTo(-0.1, 0.85, -0.4, 0.62); sh.quadraticCurveTo(-0.52, 0.4, -0.45, 0.05);
  } else {
    sh.moveTo(-0.04, 0); sh.lineTo(0.04, 0); sh.lineTo(0.04, 0.5);
    for (const [a, b, c, d] of [[0.45, 0.85, 0.3, 0.55], [0.4, 0.4, 0.08, 0.5]]) { sh.quadraticCurveTo(a, b, c, d); }
    sh.lineTo(0.06, 0.62); sh.quadraticCurveTo(0.2, 1.0, 0.0, 0.98); sh.quadraticCurveTo(-0.2, 1.0, -0.06, 0.62);
    sh.lineTo(-0.08, 0.5); sh.quadraticCurveTo(-0.4, 0.4, -0.3, 0.55); sh.quadraticCurveTo(-0.45, 0.85, -0.04, 0.5); sh.closePath();
  }
  return new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false, curveSegments: 5 }).translate(0, 0, 0);
}

export function buildGwaliorFort() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The sandstone plateau (Gopachal) the fort sits on
  const H = 36;
  const mesa = mesh(new THREE.CylinderGeometry(1, 1.12, 1, 10).translate(0, 0.5, 0), CLIFF);
  mesa.scale.set(150, H, 70);
  g.add(mesa, box(260, 0.2, 200, M.grass, 0, 0, 40));
  // Man Mandir palace along the cliff edge: round towers, domed cupolas and bands of glazed tiles
  const p = new THREE.Group();
  f.add(p);
  const z = 62, len = 120, towers = 7, tiles = [];
  p.add(box(len, 18, 10, SAND, 0, H - 2, z - 5), box(len + 0.6, 1, 10.6, SAND_DARK, 0, H + 16, z - 5));
  for (let k = 0; k < towers; k++) {
    const x = -len / 2 + (k / (towers - 1)) * len;
    p.add(cyl(4.2, 4.6, 22, SAND, x, H - 2, z, 20), cyl(4.8, 4.8, 0.8, SAND_DARK, x, H + 20, z, 20));
    for (let c = 0; c < 6; c++) {
      const a = (c / 6) * Math.PI * 2;
      p.add(cyl(0.25, 0.25, 3, SAND, x + Math.cos(a) * 3.4, H + 20.8, z + Math.sin(a) * 3.4, 6));
    }
    p.add(at(hemi(4, SAND, 20), x, H + 23.8, z), at(finial(2.4), x, H + 27.6, z));
  }
  for (const [y, row] of [[H + 6, 0], [H + 10, 1], [H + 13.6, 2]]) {
    for (let x = -len / 2 + 2; x < len / 2 - 1; x += 2.6) tiles.push([x, y, z + 0.1, 1.8, 1.6, 0.3, row]);
  }
  [0, 1, 2].forEach((row) => p.add(inst(unitBox(), tiles.filter((t) => t[6] === row).map((t) => t.slice(0, 6)), TILES[row])));
  // The pictures in the tiles: a row of ducks in yellow on the blue band, elephants on the green,
  // and banana trees in green on the yellow, each set just proud of its tile.
  const pics = [motif('duck'), motif('elephant'), motif('banana')], picM = [TILE_YELLOW, TILE_YELLOW, TILE_GREEN];
  [0, 1, 2].forEach((row) => p.add(inst(pics[row], tiles.filter((t) => t[6] === row).map(([x, y]) => [x, y + 0.2, z + 0.26, 1.2, 1.2, 1]), picM[row])));
  // Ramparts round the rest of the plateau's edge
  // The ring of walls round the plateau, one continuous wall, open where the palace front stands
  // It stops at the Hathi Pol, the elephant gate at the east end of the palace front.
  f.add(ellipseWall(147, 67, 2.054, 0.998 + Math.PI * 2, 2.6, H - 1, H + 5, SAND));
  const ga = 1.04, hp = new THREE.Group();
  hp.add(fortGate(13, 18, 8, 4.5, 8.5, { m: SAND, trim: SAND_DARK, towers: { r: 3.6, h: 22, cap: 'dome', seg: 20 } }));
  for (const x of [-8.6, 8.6]) hp.add(at(elephant(SAND_DARK, 0.9), x, 0, 6.5));
  hp.position.set(147 * Math.cos(ga) * 0.985, H, 67 * Math.sin(ga) * 0.985);
  hp.rotation.y = Math.atan2(Math.cos(ga) / 147, Math.sin(ga) / 67);
  f.add(hp);
  addDetails(p, g);
  return { group: g, focus: p, view: [0.45, 0.2, 1.25] };
}
