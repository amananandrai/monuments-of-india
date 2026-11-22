import * as THREE from 'three';
import { M, mat, mesh, box, at, surface } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { addDetails } from '../details/iim-ahmedabad.js';

// Kahn's brick, laid by hand in the local manner, and the bare concrete of his tie beams and slabs.
export const BRICK = surface(mat('#9b5a3d', 0.93), 'brick');
export const CONC = mat('#b8b1a5', 0.9);

// The campus's measures, shared with js/details/iim-ahmedabad.js. From photographs and plans: the
// Louis Kahn Plaza (PW wide, PL long) runs south from the main building, which holds the library
// and the faculty offices behind a brick screen cut with great circles; classroom wings line the
// plaza either side, their faces deep arches tied by concrete beams. The dormitories stand to the
// south-east, turned at 45°, each a brick block cut with circles over its stair and loggia.
export const P = { PW: 38, PL: 70, MW: 84, MD: 22, MH: 19, CW: 16, CH: 13 };

// A brick wall w wide, h high and t thick, its face at z = 0 facing +z, pierced by `holes`: circles
// [x, y, r] and arches ['arch', x, y0, r, spring] (a round head of radius r on straight sides).
export function piercedWall(w, h, t, holes, m) {
  const s = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(w / 2, h), new THREE.Vector2(-w / 2, h)]);
  for (const hole of holes) {
    const p = new THREE.Path();
    if (hole[0] === 'arch') {
      const [, x, y0, r, spring] = hole;
      p.moveTo(x + r, y0); p.lineTo(x + r, spring); p.absarc(x, spring, r, 0, Math.PI, false); p.lineTo(x - r, y0); p.closePath();
    } else {
      const [x, y, r] = hole;
      p.absarc(x, y, r, 0, Math.PI * 2, false);
    }
    s.holes.push(p);
  }
  return mesh(new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 20 }).translate(0, 0, -t), m);
}

// Concrete ties across the openings: a beam across each circle's lower chord, and one across each
// arch at its springing; and a dark recess behind each opening.
function ties(holes, t, d) {
  for (const hole of holes) {
    if (hole[0] === 'arch') {
      const [, x, y0, r, spring] = hole;
      d.add(box(2 * r + 0.3, 0.5, t + 0.1, CONC, x, spring - 0.5, -t / 2), box(2 * r, spring + r - y0, 0.1, M.recess, x, y0, -t - 1.6));
    } else {
      const [x, y, r] = hole;
      d.add(box(r * 1.74, 0.45, t + 0.1, CONC, x, y - r * 0.5 - 0.22, -t / 2), box(2 * r, 2 * r, 0.1, M.recess, x, y - r, -t - 1.6));
    }
  }
}

// A dormitory: a brick block about 15 m high, its corner cut back into a loggia behind a wall of
// circles, a stair tower against one side.
export function dorm() {
  const d = new THREE.Group(), W = 15, H = 15.5;
  d.add(box(W, H, W, BRICK, 0, 0, -W / 2 - 1.6));
  const holes = [[-3.8, 11, 2.6], [3.8, 11, 2.6], ['arch', -3.8, 0, 2.4, 4.4], ['arch', 3.8, 0, 2.4, 4.4]];
  d.add(at(piercedWall(W, H, 0.7, holes, BRICK), 0, 0, 0));
  ties(holes, 0.7, d);
  for (const y of [7.4, H - 0.4]) d.add(box(W + 0.2, 0.4, 0.75, CONC, 0, y, -0.35));
  d.add(box(4.6, H + 3, 4.6, BRICK, W / 2 + 2.3, 0, -W / 2 - 3), box(5, 0.4, 5, CONC, W / 2 + 2.3, H + 3, -W / 2 - 3));
  return d;
}

export function buildIimAhmedabad() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  const { PW, PL, MW, MD, MH, CW, CH } = P;
  // The main building at the plaza's north end: the block, and the brick screen standing before it,
  // cut with a row of great circles over a row of arches.
  d.add(box(MW, MH, MD, BRICK, 0, 0, -MD / 2 - 3));
  const main = [];
  for (let k = -3; k <= 3; k++) main.push([k * 11.5, MH - 5, 4], ['arch', k * 11.5, 0, 3.4, 4.8]);
  d.add(at(piercedWall(MW, MH, 1, main, BRICK), 0, 0, 0));
  ties(main, 1, d);
  d.add(box(MW + 0.4, 0.4, 0.3, CONC, 0, 9.3, 0.15), box(MW + 0.6, 0.7, MD + 4.4, CONC, 0, MH, -MD / 2 - 1.6));
  // The classroom wings down either side of the plaza, their faces deep arches.
  for (const s of [-1, 1]) {
    const w = new THREE.Group(), arches = [];
    w.add(box(PL, CH, CW, BRICK, 0, 0, -CW / 2 - 2));
    for (let k = 0; k < 6; k++) arches.push(['arch', -PL / 2 + 6 + k * 11.6, 0, 3.6, 5.6]);
    for (let k = 0; k < 5; k++) arches.push([-PL / 2 + 11.8 + k * 11.6, 9.6, 1.7]);
    w.add(at(piercedWall(PL, CH, 0.8, arches, BRICK), 0, 0, 0));
    ties(arches, 0.8, w);
    w.add(box(PL + 0.4, 0.6, CW + 2.6, CONC, 0, CH, -CW / 2 - 1.2));
    w.rotation.y = -s * Math.PI / 2;
    w.position.set(s * PW / 2, 0, PL / 2 + 1);
    d.add(w);
  }
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From the south, down the length of the plaza to the main building's circles.
  return { group: g, focus: f, view: [0.35, 0.3, 1], zoom: 0.85 };
}
