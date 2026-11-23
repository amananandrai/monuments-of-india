import * as THREE from 'three';
import { M, mat, mesh, box, at, surface, chamferPrism } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { addDetails } from '../details/iim-ahmedabad.js';

// Kahn's brick, laid by hand in the local manner, and the bare concrete of his tie beams and slabs.
// Sources: the photographs of the Louis Kahn Plaza on Wikimedia Commons (File:Louis Kahn Plaza,
// IIM Ahmedabad.jpg and others in its category), and the institute's pages on the campus
// (iima.ac.in/the-institute/campus, archives.iima.ac.in on Louis Kahn and the IIMA campus).
export const BRICK = surface(mat('#9b5a3d', 0.93), 'brick');
export const CONC = mat('#b8b1a5', 0.9);
const ROOF = mat('#8d8478', 0.95);

// The campus's measures, shared with js/details/iim-ahmedabad.js. From photographs and plans: the
// Louis Kahn Plaza (PW wide, PL long) is a lawn open to the south and closed at the north by the
// library (MH high); the classroom block lines its west side and the faculty block its east (both
// CW deep and CH high). The dormitories stand to the south-east and south-west, turned at 45°.
export const P = { PW: 38, PL: 70, MW: 84, MD: 22, MH: 17, CW: 16, CH: 15, TH: 1.6 };

// A brick wall w × h and t thick (its face at z = 0, on y = 0, centred on x), cut right through
// with Kahn's openings: circles [x, y, r], round arches ['arch', x, y0, r, spring], rectangles
// ['rect', x, y0, w, h] and segmental arches ['seg', x, y0, w, h]. Behind each opening is the dark
// of the room; an exposed concrete tie beam crosses each arch at its springing and lies as the
// lintel of each rectangle, under a flat brick arch (lintel: false leaves the rectangles bare).
export function cutWall(w, h, t, holes, { lintel = true } = {}) {
  const g = new THREE.Group(), s = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(w / 2, h), new THREE.Vector2(-w / 2, h)]);
  for (const hole of holes) {
    const p = new THREE.Path(), [kind, x, y0, a, b] = hole;
    if (kind === 'arch') {
      p.moveTo(x + a, y0); p.lineTo(x + a, b); p.absarc(x, b, a, 0, Math.PI, false); p.lineTo(x - a, y0); p.closePath();
      g.add(box(2 * a + 0.5, 0.4, t + 0.1, CONC, x, b - 0.4, -t / 2), box(2 * a, b + a - y0, 0.06, M.recess, x, y0, -t + 0.06));
    } else if (kind === 'rect') {
      p.moveTo(x - a / 2, y0); p.lineTo(x + a / 2, y0); p.lineTo(x + a / 2, y0 + b); p.lineTo(x - a / 2, y0 + b); p.closePath();
      g.add(box(a, b, 0.06, M.recess, x, y0, -t + 0.06));
      if (lintel) g.add(box(a + 0.7, 0.3, t + 0.1, CONC, x, y0 + b, -t / 2));
    } else if (kind === 'seg') {
      const f = a * 0.2, rho = (a * a / 4 + f * f) / (2 * f), a0 = Math.asin(a / 2 / rho), top = y0 + b;
      p.moveTo(x + a / 2, y0); p.lineTo(x + a / 2, top - f); p.absarc(x, top - rho, rho, Math.PI / 2 - a0, Math.PI / 2 + a0, false); p.lineTo(x - a / 2, y0); p.closePath();
      g.add(box(a + 0.5, 0.35, t + 0.1, CONC, x, top - f - 0.35, -t / 2), box(a, b, 0.06, M.recess, x, y0, -t + 0.06));
    } else {
      const [cx, cy, r] = hole;
      p.absarc(cx, cy, r, 0, Math.PI * 2, false);
      g.add(box(2 * r, 2 * r, 0.06, M.recess, cx, cy - r, -t + 0.06));
    }
    s.holes.push(p);
  }
  g.add(mesh(new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 20 }).translate(0, 0, -t), BRICK));
  return g;
}

// A raked brick buttress: a fin t thick leaning against a wall at z = 0, `run` out at its foot.
export function fin(h, run, t) {
  const s = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(run, 0), new THREE.Vector2(run * 0.12, h), new THREE.Vector2(0, h)]);
  return mesh(new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }).translate(0, 0, -t / 2).rotateY(-Math.PI / 2), BRICK);
}

// A dormitory: a brick block about 15 m high, its front a wall of great circles over arches
// before the loggia and tea room, a stair tower against one side, raked fins against the other.
export function dorm() {
  const d = new THREE.Group(), W = 15, H = 15.5;
  d.add(box(W, H, W, BRICK, 0, 0, -W / 2 - 0.9));
  d.add(cutWall(W, H, 0.8, [[-3.8, 11, 2.6], [3.8, 11, 2.6], ['arch', -3.8, 0, 2.4, 4.4], ['arch', 3.8, 0, 2.4, 4.4]]));
  d.add(box(W + 0.1, 0.4, 0.9, CONC, 0, 7.4, -0.45), box(W - 1, 0.1, W - 0.4, ROOF, 0, H - 0.04, -W / 2 - 0.5));
  d.add(box(4.6, H + 3, 4.6, BRICK, W / 2 + 2.3, 0, -W / 2 - 3));
  for (const z of [-4, -12]) d.add(at(fin(H * 0.7, 2, 0.6), -W / 2, 0, z).rotateY(-Math.PI / 2));
  return d;
}

export function buildIimAhmedabad() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  const { PW, PL, MW, MD, MH, CW, CH, TH } = P;
  // The library at the plaza's closed end. Its middle is recessed between two tall brick masses
  // with chamfered corners; in it a tall bay set further back holds one great dark circle in a
  // deep reveal under a concrete lintel, with an arched window and a lunette beside it.
  d.add(box(MW, MH, MD, BRICK, 0, 0, -MD / 2 - 3), box(MW - 1.2, 0.1, MD - 1.2, ROOF, 0, MH - 0.04, -MD / 2 - 3));
  for (const s of [-1, 1]) d.add(at(chamferPrism(4.5, 1.6, MH + 1.2, BRICK), s * (PW / 2 - 4.5), 0, 1.5));
  d.add(at(cutWall(10.4, MH, 1.2, [['arch', -0.6, 11, 2.3, 11.4], ['seg', -0.6, 5.6, 3.2, 3.2]]), -4.8, 0, 0), box(4, MH, 1.2, BRICK, 8, 0, -0.6));
  d.add(at(cutWall(5.6, MH, 1.2, [[0, 9.4, 2.3]]), 3.2, 0, -1.7), box(5.6, 0.7, 1.7, CONC, 3.2, MH - 1.9, -0.85), box(20, MH, 0.1, BRICK, 0, 0, -2.99));
  d.add(box(10.4, MH, 1.7, BRICK, -4.8, 0, -2.1), box(4, MH, 1.7, BRICK, 8, 0, -2.1));
  // The terrace before it, up broad full-width steps from the lawn, and on the terrace the low
  // front of the basement: a strip of small square openings.
  d.add(box(PW, TH, 13, BRICK, 0, 0, 3.5), at(steps(PW - 0.4, TH, 8, BRICK, 0.5), 0, 0, 10));
  const strip = [];
  for (let k = 0; k < 9; k++) strip.push(['rect', -8 + k * 2, 1.2, 1.1, 1.1]);
  d.add(at(cutWall(20, 3.2, 0.6, strip, { lintel: false }), 0, TH, 3.4), box(20, 3.2, 2.7, BRICK, 0, TH, 1.4), box(20.2, 0.25, 3.5, CONC, 0, TH + 3.2, 1.7));
  // A plain brick tower where the faculty block meets the library.
  d.add(box(7, CH + 3, 9, BRICK, PW / 2 + 1, 0, 10.5), box(6.2, 0.1, 8.2, ROOF, PW / 2 + 1, CH + 2.96, 10.5));
  // The two blocks down the sides of the plaza are not alike. West, the classrooms: a tall plain
  // wall, its windows stacked in bays, each under a white concrete lintel. East, the faculty
  // offices: deep rectangular voids and tall arched slots.
  for (const s of [-1, 1]) {
    const w = new THREE.Group(), holes = [], len = PL - 1.4;
    if (s < 0) {
      for (let k = 0; k < 8; k++) for (const [y, h] of [[1, 1.6], [4.6, 2.2], [8, 2.2], [11.2, 2.4]]) holes.push(['rect', -len / 2 + 6.5 + k * 8, y, 1.4, h]);
    } else {
      for (let k = 0; k < 6; k++) holes.push(['rect', -len / 2 + 7 + k * 11, 1, 2.2, 2.2], k % 2 ? ['arch', -len / 2 + 7 + k * 11, 6, 1.1, 10.6] : ['rect', -len / 2 + 7 + k * 11, 6.4, 2.6, 2.4]);
    }
    const t = s < 0 ? 0.5 : 0.9;
    w.add(cutWall(len, CH, t, holes), box(len, CH, CW - t, BRICK, 0, 0, -CW / 2 - t / 2), box(len - 1.2, 0.1, CW - 1.2, ROOF, 0, CH - 0.04, -CW / 2));
    // Raked brick buttresses against the outer wall.
    for (let k = 0; k < 6; k++) w.add(at(fin(CH * 0.66, 3.4, 1.1), -len / 2 + 8 + k * 10.5, 0, -CW).rotateY(Math.PI));
    w.rotation.y = -s * Math.PI / 2;
    w.position.set(s * PW / 2, 0, PL / 2 + 0.3);
    d.add(w);
  }
  // Their south ends. The classroom block ends in a grid of deep narrow brick slots, three storeys
  // by six; the faculty block in a wall cut by one huge circle, with deep square voids below it.
  const ze = PL + 1, cx = PW / 2 + CW / 2;
  d.add(box(CW - 9.2, CH, 1.4, BRICK, -cx + 4.6, 0, ze - 0.7), box(9.2, CH, 0.1, M.recess, -cx - 3.4, 0, ze - 1.35));
  for (let k = 0; k <= 6; k++) d.add(box(0.55, CH, 1.3, BRICK, -cx - 8 + 0.28 + k * 1.44, 0, ze - 0.65));
  for (const [y, h] of [[0, 2.6], [5.6, 1.1], [9.4, 1.1], [13.2, CH - 13.2]]) d.add(box(9.2, h, 1.32, BRICK, -cx - 3.4, y, ze - 0.66));
  for (const x of [1.5, 5]) d.add(box(1.5, 2.6, 0.06, M.recess, -cx + x, 0, ze + 0.03), box(2.2, 0.3, 0.2, CONC, -cx + x, 2.6, ze + 0.1));
  const end = [[3.8, 10.6, 3.3], ['rect', -5.6, 4.6, 2, 2], ['rect', -2.4, 4.6, 2, 2], ['rect', 1.6, 4.6, 1.7, 1.7], ['rect', 5.2, 4.6, 1.7, 1.7]];
  for (const x of [-5.6, -2.4, 1.6, 5.2]) end.push(['rect', x, 0.8, 2, 2.3]);
  d.add(at(cutWall(CW, CH, 1.4, end), cx, 0, ze));
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From the south, over the lawn of the plaza to the library's circle, the classrooms on the
  // left and the faculty block's great circle on the right.
  return { group: g, focus: f, view: [0.16, 0.13, 1], zoom: 0.55 };
}
