import * as THREE from 'three';
import { M, mat, mesh, box, at, onFace, strut, flag, doubleSided, surface, photo } from '../helpers.js';
import { mergeByMaterial, railing, windowFrame } from '../parts/components.js';
import { interior } from '../parts/doorways.js';
import { addDetails, Y0 } from '../details/hemkund-sahib.js';

// The pale metal sheeting of the roof, the dark rubble of the ground floor, the whitewashed upper
// floor and tiled buttresses, the yellow fascia boards and the red-oxide steel of the trusses.
export const SHEET = surface(mat('#e2e5e6', 0.5, 0.3), 'none'), RUBBLE = photo(mat('#6a655f', 0.95), 'rubble');
const WHITE = surface(mat('#f1f0ea', 0.6), 'tiles'), FASCIA = mat('#e2b62c', 0.7), STEEL = mat('#6d3028', 0.7, 0.3), DARK = mat('#3a3838', 0.8);

// The five sides: side i faces TURN * i round from +z, and the corners stand halfway between.
const N = 5, TURN = (Math.PI * 2) / N;
const P3 = (r, a, y) => new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r);

// A sheet of flat triangles through the given points ([a, b, c] each).
function facets(tris, m) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat().flatMap((v) => [v.x, v.y, v.z]), 3));
  geo.computeVertexNormals();
  return mesh(geo, m);
}

// Gurdwara Hemkund Sahib, at about 4,600 m at the edge of Hemkund lake in the Garhwal Himalaya; the
// present building, of the 1960s, was designed to shed the snow. From photographs (Commons,
// Hemkunt-003 and -006, and one of the steel frame going up): a pentagon in plan under one
// continuous folded roof of pale metal sheeting, a low pyramid whose five faces break forward as
// big gabled prows, the valleys between them running down almost to the first floor. Under each
// prow the steel trusses show, with a yellow fascia along the gable. Below are two storeys: a
// ground floor of dark rubble with the door in the middle of the lake front (+z), and a white upper
// floor set back behind a railed balcony under the eaves. White-tiled stepped buttresses stand at
// the corners, where the roof comes down, and at the apex is only a small dark box with a flag.
export function buildHemkundSahib() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  f.position.y = Y0;
  // Apex, the gable peaks (out over the middle of each side) and the low corners between them.
  const AY = 15.5, RP = 19.5, PY = 11.2, RL = 20, LY = 5.4;
  // The ground floor (apothem A1, to the balcony at H1) and the upper floor set back (apothem A2).
  const A1 = 12.5, H1 = 4.2, A2 = 9.6, C = Math.cos(TURN / 2), side = (a) => 2 * a * Math.tan(TURN / 2);
  const apex = P3(0, 0, AY), roof = [], wall = [], base = [];
  // The roof's height over a point r out along a side's middle line, and along a corner's.
  const ridgeY = (r) => AY - (AY - PY) * (r / RP), valleyY = (r) => AY - (AY - LY) * (r / RL);
  for (let i = 0; i < N; i++) {
    const a = i * TURN, pk = P3(RP, a, PY), lo = P3(RL, a + TURN / 2, LY), lo0 = P3(RL, a - TURN / 2, LY);
    roof.push([apex, lo0, pk], [apex, pk, lo]);
    // The gable's yellow fascia, the ridge of the prow, and the valley gutter.
    f.add(strut(pk.clone().setY(PY - 0.22), lo.clone().setY(LY - 0.22), 0.4, FASCIA), strut(pk.clone().setY(PY - 0.22), lo0.clone().setY(LY - 0.22), 0.4, FASCIA));
    f.add(strut(apex, pk, 0.22, SHEET), strut(apex.clone().setY(AY - 0.1), lo.clone().setY(LY - 0.1), 0.2, DARK));
    // The truss under each half of the prow: a top chord under the sheeting, a flatter bottom chord
    // from the corner to a point under the peak, and a zigzag of web members between them.
    const q = P3(RP - 1.6, a, PY - 2.3), tie = P3(A2, a, PY - 2.3);
    for (const l of [lo, lo0]) {
      const t0 = pk.clone().setY(PY - 0.5), t1 = l.clone().setY(LY - 0.45);
      f.add(strut(t0, t1, 0.16, STEEL), strut(q, t1, 0.16, STEEL));
      for (let k = 0; k < 7; k++) f.add(strut(t0.clone().lerp(t1, (k + (k % 2)) / 8), q.clone().lerp(t1, (k + 1 - (k % 2)) / 8), 0.1, STEEL));
      // A second truss a bay inside it, and purlins between the two.
      const s0 = P3(RP - 5, a, ridgeY(RP - 5) - 0.4), s1 = t1.clone().lerp(apex, 0.26).setY(valleyY(RL * 0.74) - 0.45);
      f.add(strut(s0, s1, 0.14, STEEL));
      for (const k of [0.15, 0.4, 0.65, 0.9]) f.add(strut(t0.clone().lerp(t1, k), s0.clone().lerp(s1, k), 0.09, STEEL));
    }
    f.add(strut(q, pk.clone().setY(PY - 0.5), 0.14, STEEL), strut(q, tie, 0.14, STEEL));
    // The upper floor's wall on this side, white, its head cut to the pitch of the roof above.
    const r2 = A2 / C, c0 = P3(r2, a - TURN / 2, H1), c1 = P3(r2, a + TURN / 2, H1), y2 = valleyY(r2) - 0.25, top = P3(A2, a, ridgeY(A2) - 0.2);
    const e0 = c0.clone().setY(y2), e1 = c1.clone().setY(y2);
    wall.push([c0, c1, e1], [c0, e1, e0], [e0, e1, top]);
    // The ground floor's wall of rubble, and the balcony floor over it.
    const r1 = A1 / C, b0 = P3(r1, a - TURN / 2, 0), b1 = P3(r1, a + TURN / 2, 0), u0 = b0.clone().setY(H1), u1 = b1.clone().setY(H1), mid = P3(0, 0, H1);
    base.push([b0, b1, u1], [b0, u1, u0], [mid, u0, u1]);
    f.add(onFace(box(side(A1) + 0.5, 0.3, 0.6, M.concrete, 0, H1 - 0.1, 0), a, A1 + 0.05));
    f.add(onFace(at(railing(side(A1) - 0.3, 1.05, 0.14, M.concrete, 2.2, DARK), 0, H1 + 0.2, 0), a, A1 - 0.1));
    // Upper floor: a painted board in the middle of the wall between dark windows, and a door onto
    // the balcony at either end.
    const up = new THREE.Group();
    up.add(box(3.2, 1.5, 0.08, mat('#3d6fa8', 0.6), 0, 2.5, 0.05), box(3.5, 0.14, 0.12, FASCIA, 0, 4.0, 0.05));
    for (const s of [-1, 1]) up.add(at(windowFrame(1.3, 1.5, WHITE, { shape: 'flat' }), s * 2.6, 2.5, 0), at(windowFrame(1.2, 2.2, WHITE, { shape: 'flat' }), s * 5.2, 0.05, 0));
    f.add(onFace(at(up, 0, H1, 0), a, A2 + 0.01));
    // Ground floor: the door on the lake front under a white lintel, small square windows elsewhere.
    const dn = new THREE.Group();
    if (i === 0) dn.add(at(interior(2.6, 2.7), 0, 0.2, 0.03), box(3.4, 0.4, 0.2, WHITE, 0, 2.9, 0.08), box(1.5, 2.6, 0.12, WHITE, 2.3, 0.2, 0.08), box(3.6, 0.2, 1.6, M.concrete, 0, 0, 0.8));
    else for (const x of [-1.5, 1.5]) dn.add(at(windowFrame(1, 1.1, M.concrete, { shape: 'flat' }), x, 1.9, 0));
    for (const x of [-5.4, 5.4]) dn.add(at(windowFrame(1, 1.1, M.concrete, { shape: 'flat' }), x, 1.9, 0));
    f.add(onFace(dn, a, A1 + 0.01));
    // The buttress at the corner, stepped down to either side and faced with white tiles, and the
    // pier on it that takes the foot of the roof.
    const ab = a + TURN / 2, bt = new THREE.Group();
    [9.6, 7.8, 6, 4.2, 2.4].forEach((w, k) => bt.add(box(w, 0.86 + (k ? 0 : 0.3), 3 - k * 0.18, WHITE, 0, k ? k * 0.86 + 0.3 : 0, 0)));
    bt.add(box(1.1, 1.2, 1.1, M.concrete, 0, 4.4, 0.9));
    f.add(onFace(bt, ab, 18.3));
  }
  f.add(facets(roof, doubleSided(SHEET)), facets(wall, WHITE), facets(base, RUBBLE));
  // The apex: a small dark box with a pole and a saffron flag.
  f.add(box(1.3, 1.5, 1.3, DARK, 0, AY - 0.35, 0), box(1.6, 0.14, 1.6, DARK, 0, AY + 1.15, 0), at(flag(2.2, M.saffron, M.steel), 0, AY + 1.29, 0));
  mergeByMaterial(f);
  addDetails(f, g, { PY, LY, RP, RL, A2, P3, TURN });
  // From across the corner of the lake, the door front and one flank, the peaks behind.
  return { group: g, focus: f, view: [0.45, 0.14, 1], zoom: 0.9 };
}
