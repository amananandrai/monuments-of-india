import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, onFace, FACES, inst, unitBox, rise, archPanel } from '../helpers.js';
import { merlons, chhajja, carved, frieze, archCurve, archRing, medallion, jharokha, bracketGeo, mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, benches, asiBoard, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';
import { RED, PLASTER, ASHLAR, BLACK, onCourt } from '../monuments/bara-gumbad.js';

// The incised and painted stucco of the mosque: Quranic script, and scrollwork of leaves and flowers.
const STUCCO = mat('#d6cbb2', 0.88), TILE = mat('#2f6d94', 0.35), SCRIPT = () => carved(STUCCO, 'calligraphy'), FOLIAGE = () => frieze(STUCCO);

// The spandrels of an arch aw wide and ah to its crown: a slab w wide from the springing up to y1
// with the arch cut out of it, t thick (z = 0 to t).
function spandrels(aw, ah, w, y1, t, m) {
  const r = aw / 2, s = ah - rise(r, true), sh = new THREE.Shape();
  sh.moveTo(-w / 2, s); sh.lineTo(-w / 2, y1); sh.lineTo(w / 2, y1); sh.lineTo(w / 2, s);
  archCurve(r, s, true).reverse().forEach((p) => sh.lineTo(p.x, p.y));
  return mesh(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), m);
}

// A small roof turret h high: a shaft, a moulding and a pointed cap.
const turret = (h, r, m) => lathe([[r * 1.15, 0], [r, h * 0.7], [r * 1.4, h * 0.73], [r * 1.4, h * 0.8], [r * 0.9, h * 0.86], [0, h]], m, 8);

// A tapering minaret h high and r across at its foot, as at the mosque's back corners: a plain
// battered stage, a ring of little arched niches, a second plain stage, a stage of flutes
// alternately round and angular (the Qutb Minar's, on a small scale), and a short top under a
// moulded cap with a crest.
function minar(h, r, m) {
  const g = new THREE.Group(), R = (t) => r * (1 - 0.52 * t), ring = (t, k = 1.14, hh = 0.28) => g.add(cyl(R(t) * k, R(t) * k * 1.04, hh, m, 0, h * t, 0, 20));
  g.add(lathe([[R(0), 0], [R(0.3), h * 0.3], [R(0.3) * 0.98, h * 0.34], [R(0.62), h * 0.62]], m, 20));
  ring(0.3, 1.16, 0.3); ring(0.6);
  g.add(cyl(R(0.34) * 1.06, R(0.3) * 1.06, h * 0.045, frieze(m), 0, h * 0.325, 0, 20));
  // The fluted stage: twelve flutes, round and angular by turns.
  const n = 12, step = (Math.PI * 2) / n, r0 = R(0.63) * 1.04, rc = r0 * 0.78, sh = new THREE.Shape(), fh = h * 0.2;
  for (let k = 0; k < n; k++) for (const [t, q] of k % 2 ? [[0, r0], [1, rc]] : [[-0.6, rc + (r0 - rc) * 0.8], [0, r0], [0.6, rc + (r0 - rc) * 0.8], [1, rc]]) {
    const a = (k + t / 2) * step;
    if (!k && t <= -0.6) sh.moveTo(Math.sin(a) * q, Math.cos(a) * q); else sh.lineTo(Math.sin(a) * q, Math.cos(a) * q);
  }
  const geo = new THREE.ExtrudeGeometry(sh, { depth: fh, bevelEnabled: false }).rotateX(-Math.PI / 2), p = geo.attributes.position, k1 = R(0.83) / R(0.63);
  for (let i = 0; i < p.count; i++) { const s = 1 + (k1 - 1) * (p.getY(i) / fh); p.setXYZ(i, p.getX(i) * s, p.getY(i), p.getZ(i) * s); }
  geo.computeVertexNormals();
  g.add(at(mesh(geo, m), 0, h * 0.63, 0));
  ring(0.83, 1.2, 0.3);
  g.add(lathe([[R(0.86) * 0.9, h * 0.86], [R(1) * 0.9, h * 0.96], [R(1) * 1.2, h * 0.965], [R(1) * 1.2, h * 0.985], [R(1) * 0.7, h * 0.99], [0, h * 1.03]], m, 16));
  return g;
}

// The gumbad's faces. From photographs: in the back of each great arch a doorway of red sandstone
// whose lintel rests on carved brackets, in a frame cut with script, and over it a window in a red
// frame above a band of red and grey-blue stones; the arch's spandrels are black slate edged in
// red; every recess either side stands in a red frame. A band of red and black squares runs under
// the parapet, merlons crest the walls, the frames and the drum, and small turrets stand at the
// corners. Dimensions follow js/monuments/bara-gumbad.js.
function gumbad(d, { P, S, WALL, FW, FH, DR, DH }) {
  const squares = [], AW = 4.4, AH = 9.8, y0 = P;
  for (const a of FACES) {
    const face = new THREE.Group();
    // The spandrels in slate, and the red line round them.
    const sp = AH + 0.2 - rise(AW / 2 + 0.25, true);
    face.add(at(spandrels(AW + 0.5, AH + 0.2, 5.6, AH + 0.75, 0.05, BLACK), 0, 0, 1.1), box(5.9, 0.15, 0.07, RED, 0, AH + 0.75, 1.135));
    for (const s of [-1, 1]) face.add(box(0.15, AH + 0.75 - sp, 0.07, RED, s * 2.875, sp, 1.135));
    // The doorway in the back of the arch: jambs, brackets stepping in under the lintel, the
    // frame of script, the band of coloured stones and the window.
    const back = new THREE.Group(), SC = carved(RED, 'calligraphy');
    back.add(box(2.1, 3.7, 0.05, M.recess, 0, 0, 0.03));
    for (const s of [-1, 1]) back.add(box(0.55, 3.7, 0.3, RED, s * 1.32, 0, 0.15), box(0.35, 0.35, 0.34, RED, s * 0.875, 3.0, 0.17), box(0.7, 0.35, 0.34, RED, s * 0.7, 3.35, 0.17), box(0.3, 4.9, 0.08, SC, s * 1.75, 0, 0.3));
    back.add(box(3.2, 0.95, 0.36, RED, 0, 3.7, 0.18), box(3.8, 0.3, 0.08, SC, 0, 4.65, 0.3), box(3.8, 0.35, 0.12, BLACK, 0, 5.0, 0.06), box(4.0, 0.14, 0.16, RED, 0, 5.35, 0.08));
    back.add(box(2.0, 2.3, 0.14, RED, 0, 5.7, 0.07), at(archPanel(0.9, 1.55, true, M.recess, 0.04), 0, 5.95, 0.12), at(archRing(0.9, 1.55, true, 0.16, 0.06, ASHLAR), 0, 5.95, 0.14));
    face.add(at(back, 0, 0, 0.06));
    // The merlons and the turrets on the frame.
    face.add(at(merlons(FW - 0.8, 0.5, 0.65, 0.3, ASHLAR, 0.2), 0, FH, 0.75));
    for (const s of [-1, 1]) face.add(at(turret(1.7, 0.2, ASHLAR), s * (FW / 2 - 0.25), FH, 0.8));
    d.add(onFace(at(face, 0, y0, 0), a, S / 2 - 0.5));
    for (const s of [-1, 1]) {
      const lat = s * (FW / 2 + (S - FW) / 4);
      // The red frame round each recess, and the merlons on the wall.
      for (const x of [-1.45, 1.45]) for (const [sill, ah] of [[1.1, 3.3], [6.7, 3.1]]) {
        const fr = new THREE.Group();
        for (const e of [-1, 1]) fr.add(box(0.18, ah + 0.5, 0.06, RED, e * 1.02, -0.2, 0.03));
        fr.add(box(2.22, 0.18, 0.06, RED, 0, ah + 0.12, 0.03));
        d.add(onFace(at(fr, 0, y0 + sill, 0), a, S / 2, lat - s * 0.25 + x));
      }
      d.add(onFace(at(merlons((S - FW) / 2 - 0.3, 0.55, 0.75, 0.3, ASHLAR, 0.2), 0, y0 + WALL, 0), a, S / 2 - 0.2, lat));
      // The band of red and black squares under the cornice.
      for (let k = 0; k < 9; k++) { const o = onFace(new THREE.Object3D(), a, S / 2, lat + (k - 4) * 0.62); squares.push([o.position.x, y0 + WALL - 0.75, o.position.z, 0.34, 0.4, 0.1, a]); }
    }
  }
  d.add(inst(unitBox(), squares.filter((_, k) => k % 2 === 0), RED), inst(unitBox(), squares.filter((_, k) => k % 2), BLACK));
  for (const x of [-1, 1]) for (const z of [-1, 1]) d.add(at(turret(2.2, 0.26, ASHLAR), x * (S / 2 - 0.3), y0 + WALL, z * (S / 2 - 0.3)));
  // The drum: a recess on every side, a crest of merlons round its top.
  const dy = y0 + WALL, ap = DR * Math.cos(Math.PI / 16);
  for (let k = 0; k < 16; k++) {
    const a = (k + 0.5) * Math.PI / 8;
    d.add(onFace(at(merlons(2.9, 0.5, 0.7, 0.25, ASHLAR, 0.2), 0, dy + DH, 0), a, ap - 0.35));
    d.add(onFace(at(archPanel(0.8, 1.5, true, PLASTER, 0.04), 0, dy + 1.3, 0), a, ap - 0.01), onFace(at(archRing(0.8, 1.5, true, 0.14, 0.07, RED), 0, dy + 1.3, 0), a, ap));
  }
}

// The mosque. From photographs: each arch of its east front is cut back in three orders, every one
// covered in incised stucco script, and the spandrels over them are a field of flowers and leaves
// round two roundels; the piers between are dressed stone banded in red with small red niches. A
// row of brackets carried the eave; merlons crest the roof and the domes' drums. An oriel window
// of red sandstone on brackets, under a stepped stone roof, stands out from each end wall, and
// tapering minarets rise at the back corners and either side of the mihrab bay.
function mosque(d, { ML, MD, MH }) {
  const m = new THREE.Group(), zf = MD / 2, AW = 3.5, AH = 5.3, sill = 0.4, brackets = [];
  for (let k = -2; k <= 2; k++) {
    const x = k * 4.8;
    m.add(at(spandrels(AW + 0.3, AH + 0.12, 4.3, AH + 1.0, 0.05, FOLIAGE()), x, sill, zf));
    m.add(at(archRing(AW, AH, true, 0.34, 0.09, SCRIPT(), false), x, sill, zf));
    // The inner orders, each a step back and a step narrower.
    for (const [j, zz] of [[1, 0.32], [2, 0.62]]) m.add(at(archRing(AW - j * 0.62, AH - j * 0.43, true, 0.31, 0.3, j === 1 ? SCRIPT() : STUCCO), x, sill, zf - zz - 0.3));
    m.add(box(4.3, 0.22, 0.05, SCRIPT(), x, sill + AH + 1.0, zf + 0.025));
    if (!detail.low) for (const s of [-1, 1]) m.add(at(medallion(0.36, STUCCO), x + s * 1.5, sill + AH + 0.35, zf + 0.05));
  }
  // The piers: red bands and niches; the red band over the front, the brackets and the eave.
  for (let k = -2.5; k <= 2.5; k++) {
    const x = Math.max(-ML / 2 + 0.3, Math.min(ML / 2 - 0.3, k * 4.8)), w = Math.abs(k) > 2 ? 0.5 : 0.42;
    for (const y of [2.3, 3.9, 5.5]) m.add(box(w, 0.2, 0.05, RED, x, y, zf + 0.025), box(0.3, 0.42, 0.06, RED, x, y + 0.55, zf + 0.03));
  }
  m.add(box(ML, 0.25, 0.08, RED, 0, MH - 0.45, zf + 0.04));
  // Glazed tiles set in the band, blue against the red.
  const tiles = [];
  for (let x = -ML / 2 + 1.2; x < ML / 2 - 1; x += 1.2) tiles.push([x, MH - 0.41, zf + 0.06, 0.3, 0.17, 0.06]);
  m.add(inst(unitBox(), tiles, TILE));
  for (let x = -ML / 2 + 0.6; x <= ML / 2 - 0.5; x += 1.2) brackets.push([x, MH - 0.05, zf]);
  const bg = bracketGeo(0.5, 0.6, 0.16);
  for (const [x, y, z] of brackets) m.add(mesh(bg, ASHLAR, x, y, z));
  m.add(at(chhajja(ML + 0.4, 0.9, 0.3, 0.1, ASHLAR), 0, MH + 0.1, zf));
  // The crest of merlons round the roof and on the drums of the domes.
  for (const [a, len, dist] of [[0, ML, MD / 2], [Math.PI, ML, MD / 2], [Math.PI / 2, MD, ML / 2], [-Math.PI / 2, MD, ML / 2]]) m.add(onFace(at(merlons(len - 0.4, 0.45, 0.6, 0.25, ASHLAR, 0.2), 0, MH + 0.7, 0), a, dist - 0.1));
  for (const x of [-4.8, 0, 4.8]) for (let k = 0; k < 16; k++) { const o = onFace(at(merlons(0.85, 0.34, 0.45, 0.18, ASHLAR, 0.2), 0, MH + 2.0, 0), (k + 0.5) * Math.PI / 8, 2.15); o.position.x += x; o.position.z -= 0.3; m.add(o); }
  // The oriels on the end walls, and the minarets.
  for (const s of [-1, 1]) {
    const o = new THREE.Group();
    o.add(jharokha(1.7, 2.3, RED, { d: 1.1, roof: 'flat', trim: RED }));
    for (const [w, y] of [[1.7, 2.55], [1.25, 2.85], [0.8, 3.15]]) o.add(box(w, 0.3, w * 0.62, ASHLAR, 0, y, w * 0.31));
    m.add(onFace(at(o, 0, 2.9, 0), s * Math.PI / 2, ML / 2, s * 0.6));
    m.add(at(minar(MH + 2.9, 1.15, ASHLAR), s * (ML / 2 - 0.2), 0, -MD / 2 + 0.2), at(minar(MH + 2.9, 0.9, ASHLAR), s * 2.5, 0, -MD / 2 - 0.9));
  }
  d.add(onCourt(m, 1, MD));
}

function architecture(f, dims) {
  const d = new THREE.Group(), { P, S, CD, GD, GH, ML } = dims;
  gumbad(d, dims);
  mosque(d, dims);
  // The guest house's parapet, and the low platform in the middle of the court (a grave, perhaps).
  d.add(onCourt(new THREE.Group().add(at(merlons(ML - 6, 0.5, 0.6, 0.25, ASHLAR, 0.25), 2.6, GH + 0.5, GD / 2 - 0.2)), -1, GD));
  d.add(box(5.2, 0.45, 3.4, ASHLAR, 0, P, S / 2 + CD / 2), box(4.4, 0.25, 2.6, ASHLAR, 0, P + 0.45, S / 2 + CD / 2));
  f.add(mergeByMaterial(d));
}

// Lodhi Gardens: lawns all round, gravel paths, old trees (neem, peepal, jamun, palms), the Sheesh
// Gumbad's neighbours left out; the stair up to the court on its north; lamps, benches and the ASI
// board.
export function addDetails(f, g, dims) {
  architecture(f, dims);
  const lawn = mat('#5f8a43', 0.95), { z1 } = dims;
  g.add(box(320, 0.15, 320, lawn, 0, 0, 10));
  g.add(box(4, 0.06, 110, M.path, 0, 0.15, z1 + 62), box(150, 0.06, 4, M.path, 0, 0.15, z1 + 26), box(4, 0.06, 120, M.path, -44, 0.15, 0));
  const avoid = [[-28, 28, -22, z1 + 10], [-45, 30, z1, z1 + 75], [-80, 80, z1 + 23, z1 + 29], [-47, -41, -70, 70]];
  g.add(trees(scatter(26, [-140, 140, -130, 150], { seed: 5, gap: 16, avoid }), { kind: 'neem', seed: 5 }));
  g.add(trees(scatter(10, [-140, 140, -130, 150], { seed: 11, gap: 18, avoid }), { kind: 'peepal', seed: 11 }));
  g.add(trees(scatter(8, [-120, 120, -130, -50], { seed: 3, gap: 14 }), { kind: 'palm', seed: 3 }));
  g.add(shrubs(scatter(40, [-60, 60, -50, 80], { seed: 8, gap: 4, avoid: [[-27, 27, -20, z1 + 9], [-4, 4, z1, 110], [-70, 70, z1 + 23, z1 + 29]] }).map(([x, z]) => [x, z, 1.1]), { seed: 8 }));
  g.add(lampPosts([...along(5, [-4.5, z1 + 12], [-4.5, z1 + 82]), ...along(5, [4.5, z1 + 12], [4.5, z1 + 82])]));
  g.add(benches(along(4, [-20, z1 + 30], [20, z1 + 30]).map(([x, z]) => [x, z + 1.5, Math.PI])));
  g.add(asiBoard('Bara Gumbad', 13, z1 + 9, 0));
}
