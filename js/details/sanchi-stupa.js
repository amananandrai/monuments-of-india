import * as THREE from 'three';
import { M, mat, box, cyl, onFace, FACES } from '../helpers.js';
import { medallion, idol, mergeByMaterial } from './components.js';
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

// The Great Stupa at Sanchi: the stump of the Ashokan pillar by the south gateway (its lion capital
// is now in the site museum), the trees of the hilltop, and the ASI board.
const STONE = mat('#b8a88e', 0.85);
export function addDetails(f, g) {
  architecture(f);
  f.add(box(2.6, 0.6, 2.6, STONE, 8, 0, -30), cyl(0.5, 0.55, 3.2, STONE, 8, 0.6, -30, 16), box(1.2, 0.8, 0.9, STONE, 9.6, 0, -31.5).rotateZ(0.2));
  g.add(trees(scatter(30, [-43, 43, -43, 43], { seed: 4, gap: 10 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 30 && r < 43; }), { kind: 'neem', seed: 4 }));
  g.add(asiBoard('Buddhist Monuments at Sanchi', 6, 34, 0, { line2: 'WORLD HERITAGE SITE' }));
}
