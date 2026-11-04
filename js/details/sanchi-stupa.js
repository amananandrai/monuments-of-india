import * as THREE from 'three';
import { M, mat, box, cyl, onFace, FACES } from '../helpers.js';
import { medallion, idol, frieze, mergeByMaterial } from './components.js';
import { instances, elephantGeo, horseGeo } from './sculpture.js';
import { steps } from './doorways.js';
import { trees, asiBoard, scatter } from './realism.js';

// The Great Stupa at Sanchi, finer detail. From photographs: the posts of the ground railing
// (vedika) carry lotus medallions; a double stairway climbs from the south to the walkway on the
// drum; and the gateways (toranas) have bracket figures of yakshis leaning out from their pillars
// under the lowest architrave. Dimensions follow js/monuments/sanchi-stupa.js: the drum r = 18.3
// and 4.3 high, the railing r = 22 with 120 posts, the gateways at 23.4.
function architecture(f) {
  const d = new THREE.Group(), S = M.sanchi;
  for (let k = 0; k < 120; k++) {
    const a = (k / 120) * Math.PI * 2, x = Math.cos(a) * 22, z = Math.sin(a) * 22, ry = Math.atan2(x, z);
    for (const [y, s] of [[1.15, 1], [2.25, 0.8]]) { const o = medallion(0.22 * s, S); o.position.set(x + Math.sin(ry) * 0.26, y, z + Math.cos(ry) * 0.26); o.rotation.y = ry; d.add(o); }
  }
  for (const s of [-1, 1]) {
    const st = steps(2.4, 4.3, 10, S, 0.34);
    st.position.set(s * 3.2, 0, -18.35);
    st.rotation.y = Math.PI;
    d.add(st);
  }
  for (const a of FACES) for (const x of [-2.4, 2.4]) {
    const y = idol(2, S);
    y.position.set(x + Math.sign(x) * 0.65, 5.3, 0.2);
    y.rotation.z = -Math.sign(x) * 0.5;
    const t = new THREE.Group();
    t.add(y);
    d.add(onFace(t, a, 23.4));
  }
  mergeByMaterial(d);
  f.add(d);
}

// The gateways (toranas) carved as they are, after photographs and descriptions of the Great Stupa:
// - the capitals of the pillars are elephants (here one each way on each pillar) carrying the
//   architraves;
// - the three architraves are carved on both faces with processions and Jataka scenes, and roll up
//   at their ends in spirals; elephants and horses with riders stand between them;
// - the pillars are carved in panels on every face;
// - the Dharma wheel at the top has its spokes, and a triratna (the three jewels: a trident on a
//   wheel) stands on each of the side posts.
// The drum's walkway is closed by a railing of posts and rails. Dimensions follow helpers.torana
// (pillars at x = ±2.4, 6.5 high; architraves 8.6 long at 7.9, 9.6 and 11.3; the wheel at 12.6)
// and js/monuments/sanchi-stupa.js (gateways at 23.4; the drum r = 18.3, 4.3 high).
function gateways(f) {
  const d = new THREE.Group(), S = M.sanchi, eles = [], beasts = [];
  for (const a of FACES) {
    const t = onFace(new THREE.Group(), a, 23.4);
    for (const x of [-2.4, 2.4]) {
      for (const sz of [-1, 1]) {
        t.add(box(0.7, 5.6, 0.02, frieze(S), x, 0.6, sz * 0.46));
        t.add(box(0.02, 5.6, 0.7, frieze(S), x + sz * 0.46, 0.6, 0));
      }
    }
    for (let k = 0; k < 3; k++) {
      const y = 7.9 + k * 1.7;
      for (const sz of [-1, 1]) t.add(box(7.6, 0.4, 0.03, frieze(S), 0, y + 0.07, sz * 0.31));
      for (const x of [-4.4, 4.4]) for (const sz of [-1, 1]) {
        const sp = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 4, 16, Math.PI * 1.6), S);
        sp.position.set(x, y + 0.27, sz * 0.33);
        t.add(sp, new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 4, 12), S).translateX(x).translateY(y + 0.27).translateZ(sz * 0.34));
      }
    }
    for (let k = 0; k < 8; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.3, 0.08), S); sp.position.set(0, 12.6, 0); sp.rotation.z = (k / 8) * Math.PI; t.add(sp); }
    t.add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.2, 10).rotateX(Math.PI / 2), S).translateY(12.6));
    for (const x of [-2.4, 2.4]) {
      t.add(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 5, 14), S).translateX(x).translateY(13.4));
      for (const px of [-0.25, 0, 0.25]) t.add(box(0.08, px ? 0.45 : 0.6, 0.08, S, x + px, 13.6, 0));
    }
    t.updateMatrixWorld(true);
    const put = (list, x, y, z, sx, sy, sz, turn) => { const p = new THREE.Vector3(x, y, z).applyMatrix4(t.matrixWorld); list.push([p.x, p.y, p.z, sx, sy, sz, t.rotation.y + turn]); };
    for (const x of [-2.4, 2.4]) for (const sz of [-1, 1]) put(eles, x, 6.55, sz * 0.95, 1.5, 1.3, 0.8, sz > 0 ? 0 : Math.PI);
    for (const y of [8.45, 10.15]) for (const x of [-3.4, -0.75, 0.75, 3.4]) put(beasts, x, y, 0, 1.0, 0.95, 0.4, x < 0 ? 0 : Math.PI);
    d.add(t);
  }
  // The railing round the walkway on top of the drum.
  for (let k = 0; k < 90; k++) { const a = (k / 90) * Math.PI * 2; d.add(box(0.2, 1.0, 0.2, S, Math.cos(a) * 18.15, 4.3, Math.sin(a) * 18.15)); }
  for (const y of [4.75, 5.15]) d.add(new THREE.Mesh(new THREE.TorusGeometry(18.15, 0.07, 4, 90).rotateX(Math.PI / 2), S).translateY(y));
  mergeByMaterial(d);
  f.add(d, instances(elephantGeo(), eles, S), instances(horseGeo(), beasts.map(([x, y, z, sx, sy, sz, r]) => [x, y, z, sx, sy, sz, r + Math.PI / 2]), S));
}


// The Great Stupa at Sanchi: the stump of the Ashokan pillar by the south gateway (its lion capital
// is now in the site museum), the trees of the hilltop, and the ASI board.
const STONE = mat('#b8a88e', 0.85);
export function addDetails(f, g) {
  architecture(f);
  gateways(f);
  f.add(box(2.6, 0.6, 2.6, STONE, 8, 0, -30), cyl(0.5, 0.55, 3.2, STONE, 8, 0.6, -30, 16), box(1.2, 0.8, 0.9, STONE, 9.6, 0, -31.5).rotateZ(0.2));
  g.add(trees(scatter(30, [-43, 43, -43, 43], { seed: 4, gap: 10 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 30 && r < 43 && !(z > 0 && Math.abs(x) < 16); }), { kind: 'neem', seed: 4 }));
  g.add(asiBoard('Buddhist Monuments at Sanchi', 6, 34, 0, { line2: 'WORLD HERITAGE SITE' }));
}
