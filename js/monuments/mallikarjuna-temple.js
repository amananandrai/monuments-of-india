import * as THREE from 'three';
import { M, mat, mesh, box, at, onFace, rng, pidaRoof, hemi, kalash } from '../helpers.js';
import { figureFrieze } from '../details/sculpture.js';
import { gopuram, wallWithGaps } from '../details/temples.js';
import { addDetails } from '../details/mallikarjuna-temple.js';

const CREAM = ['#efe7d6', '#e2d3b7', '#d6c5a4', '#f4efe4'];
const WALL = mat('#b9a586', 0.9);
const HILL = mat('#557040', 0.95, 0, { flatShading: true });

export function buildMallikarjuna() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(47);
  g.add(f);
  // Srisailam hill in the Nallamala forest
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, d = 480 + R() * 80, h = 60 + R() * 60;
    g.add(mesh(new THREE.ConeGeometry(h * 1.2, h, 9).translate(0, h / 2, 0), HILL, Math.cos(a) * d, 0, Math.sin(a) * d));
  }
  g.add(box(220, 0.2, 220, M.path));
  // High enclosure walls carved with friezes, and a gopuram on each side
  const W = 100, D = 120;
  for (const s of [-1, 1]) f.add(wallWithGaps('x', W, 9, 3, WALL, [[0, s > 0 ? 21 : 17]], 0, s * D / 2), wallWithGaps('z', D, 9, 3, WALL, [[0, 17]], s * W / 2, 0));
  // The outer face of the walls is carved in long bands of relief: processions of elephants and
  // horses below, scenes of Shiva's devotees, dancers and musicians above, between the gopurams.
  const carve = new THREE.Group(), WC = mat('#a8946f', 0.9);
  for (const [a, dist, len, gw] of [[0, D / 2 + 1.5, W, 22], [Math.PI, D / 2 + 1.5, W, 18], [Math.PI / 2, W / 2 + 1.5, D, 18], [-Math.PI / 2, W / 2 + 1.5, D, 18]]) {
    const x0 = gw / 2 + 0.8, x1 = len / 2 - 1.8, seg = x1 - x0;
    for (const side of [-1, 1]) for (const [y, kinds] of [[1.2, ['elephant', 'horse', 'elephant', 'standing']], [4.6, ['standing', 'dancer', 'musician', 'seated']]]) {
      carve.add(onFace(at(figureFrieze(seg, 2.2, WC, { pitch: 2.1, kinds }), 0, y, 0), a, dist, side * (x0 + seg / 2)));
    }
  }
  f.add(carve);
  f.add(at(gopuram(22, 12, 34, 9, 5, CREAM), 0, 0, D / 2), at(gopuram(18, 10, 26, 7, 6, CREAM), 0, 0, -D / 2));
  for (const s of [-1, 1]) f.add(at(gopuram(18, 10, 26, 7, 7 + s, CREAM).rotateY(Math.PI / 2), s * W / 2, 0, 0));
  // The shrine of Mallikarjuna under its gilded vimana, and Bhramaramba's shrine behind
  for (const [z, w, sc] of [[0, 14, 1], [-30, 10, 0.75]]) {
    const r = pidaRoof(w, w * 0.45, 4, 1, M.gild, M.gildDeep);
    f.add(box(w * 1.1, 8 * sc, w * 1.1, mat('#e9e0cc', 0.85), 0, 0, z), at(r, 0, 8 * sc, z), at(hemi(w * 0.24, M.gild, 20), 0, 8 * sc + r.userData.top, z), at(kalash(w * 0.15), 0, 8 * sc + r.userData.top + w * 0.24, z));
  }
  f.add(box(22, 6, 18, mat('#e9e0cc', 0.85), 0, 0, 20));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.75, 0.38, 1.2] };
}
