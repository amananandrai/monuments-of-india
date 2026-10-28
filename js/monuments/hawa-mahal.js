import * as THREE from 'three';
import { M, mat, mesh, box, at, hemi, finial, surface, inst, unitBox, unitHemi } from '../helpers.js';

// The jali in each window. Its holes are cut in the shader, so it stays opaque (a transparent
// material would lose its surface) and casts no shadow; the stone screen around it does.
const JALI = surface(mat('#d98a73', 0.85, 0, { side: THREE.DoubleSide }), 'lattice');

// A stone screen w × h, `depth` thick and centred on z = 0, with an arched window cut for each hole.
function screenWall(w, h, holes, depth, m) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.closePath();
  for (const hole of holes) {
    const p = new THREE.Path();
    p.moveTo(hole.x - hole.hw, hole.y);
    p.lineTo(hole.x - hole.hw, hole.y + hole.hh);
    p.absarc(hole.x, hole.y + hole.hh, hole.hw, Math.PI, 0, true);
    p.lineTo(hole.x + hole.hw, hole.y);
    p.closePath();
    s.holes.push(p);
  }
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 });
  geo.translate(0, 0, -depth / 2);
  return mesh(geo, m);
}

const windows = (w, h, spacing) => {
  const n = Math.max(3, Math.round(w / spacing));
  return Array.from({ length: n }, (_, i) => ({ x: -w / 2 + (i + 0.5) * (w / n), y: h * 0.18, hw: 0.34, hh: h * 0.34 }));
};

// The palace is a screen one room deep: a pierced front with a jharokha canopy on every window,
// a back screen with fewer windows, and the floor, roof and ends that close the room.
const T = 0.55, D = 1.6;

export function buildHawaMahal() {
  const P = M.hawa, L = M.hawaLight, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(100, 0.2, 14, M.asphalt, 0, 0, 12), box(100, 0.3, 4, M.path, 0, 0, 3.5));
  const floors = [[46, 3.6], [46, 3.0], [30, 3.0], [20, 3.0], [11, 3.0]];
  const domes = [], posts = [];
  let y = 0;
  floors.forEach(([w, h], fi) => {
    const front = windows(w, h, 1.5);
    f.add(at(screenWall(w, h, front, T, P), 0, y, 0));
    f.add(at(screenWall(w, h, windows(w, h, 3), T, P), 0, y, -D));
    // The jali sits inside the window openings, clear of both faces of the stone.
    const jali = box(w, h * 0.7, 0.04, JALI, 0, y + h * 0.12, -0.08);
    jali.castShadow = false;
    f.add(jali);
    // The room's ends and roof sit between the screens and stop 2 cm short of their ends, so no faces meet.
    for (const s of [-1, 1]) f.add(box(T, h, D - T, P, s * (w / 2 - T / 2 - 0.02), y, -D / 2));
    f.add(box(w - 0.04, 0.2, D - T, P, 0, y + h - 0.36, -D / 2));
    for (const hole of front) {
      domes.push([hole.x, y + h * 0.72, 0.35, 0.84, 0.84, 0.84]);
      for (const s of [-1, 1]) posts.push([hole.x + s * 0.4, y + 0.15, 0.35, 0.08, h * 0.55, 0.7]);
    }
    f.add(box(w + 0.3, 0.16, 1.6, M.lime, 0, y + h - 0.14, 0.2));
    const next = floors[fi + 1];
    if (next && next[0] < w) for (const s of [-1, 1]) f.add(box((w - next[0]) / 2, 0.8, D + T, L, s * (w + next[0]) / 4, y + h, -D / 2));
    y += h;
  });
  f.add(inst(unitHemi(10), domes, L), inst(unitBox(), posts, P));
  f.add(box(3.4, 1.4, 2.1, P, 0, y, -D / 2), at(hemi(1.1, L, 16), 0, y + 1.4, -D / 2), at(finial(2), 0, y + 2.5, -D / 2));
  for (const x of [-3.8, 3.8]) f.add(box(2, 0.9, 2, P, x, y, -D / 2), at(hemi(0.9, L, 12), x, y + 0.9, -D / 2), at(finial(1.3), x, y + 1.75, -D / 2));
  return { group: g, focus: f, view: [0.4, 0.2, 1.2] };
}
