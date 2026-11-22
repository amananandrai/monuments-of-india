import * as THREE from 'three';
import { M, mat, surface, box, cyl, at, flag, shikhara, nagaraProfile, inst, unitBox, bell } from '../helpers.js';
import { elephant } from '../parts/animals.js';
import { figure, figureFrieze, kuduGeo, instances } from '../parts/sculpture.js';
import { frieze, mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, stalls, asiBoard, scatter, lampPosts } from '../parts/realism.js';
import { ROCK_LIGHT, hillY } from '../monuments/karla-caves.js';
import { detail } from '../detail.js';

const DARK = surface(mat('#1e1a17', 0.95), 'none'), SAFFRON = surface(mat('#e08a2c', 0.8), 'none'), WHITE = surface(mat('#efe9dc', 0.85), 'none'), RED = surface(mat('#b8462e', 0.8), 'none');

// Karla, finer detail and setting. From photographs: on each side wall of the porch three
// elephants stand in high relief, life-size, their heads turned to the court, carrying on their
// backs a gallery carved with rows of little chaitya windows and railings; between the doorways
// of the screen stand pairs of donors, men and women, larger than life; the court is closed on the
// right by the shrine of Ekvira, painted saffron and white, with bells and flags; small monastery
// caves open in the rock either side; and the long stair from the village climbs the hillside,
// lined with stalls selling flowers and offerings, through scrub forest. Dimensions follow
// js/monuments/karla-caves.js: the porch vw wide, vh high, vd deep, the screen at z = sz.
export function addDetails(f, g, { vw, vh, vd, sz }) {
  // The elephants on the porch's side walls, facing across it.
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const e = elephant(ROCK_LIGHT, 0.82, { coarse: true });
    e.position.set(s * (vw / 2 - 0.55), 0, -1.4 - k * 2.4);
    e.rotation.y = -s * Math.PI / 2;
    f.add(e);
  }
  // Over the elephants: a ledge, then rows of little chaitya windows and railing friezes up the
  // side walls and across the face over the porch.
  const d = new THREE.Group(), kudus = [];
  for (const s of [-1, 1]) {
    d.add(box(0.5, 0.4, vd, ROCK_LIGHT, s * (vw / 2 - 0.25), 3.4, -vd / 2));
    for (let r = 0; r < 4; r++) {
      const y = 4.6 + r * 3.1;
      d.add(at(box(0.08, 0.7, vd - 0.4, frieze(ROCK_LIGHT), 0, 0, 0), s * (vw / 2 - 0.04), y - 0.9, -vd / 2));
      for (let k = 0; k < 4; k++) kudus.push([s * (vw / 2 - 0.05), y, -1.2 - k * 1.8, 0.9, 1.2, 0.9, -s * Math.PI / 2]);
    }
  }
  for (let r = 0; r < 3; r++) {
    const y = vh + 1.5 + r * 3.2;
    d.add(box(vw + 6, 0.6, 0.3, frieze(ROCK_LIGHT), 0, y - 0.9, 0.15));
    for (let k = 0; k < 9; k++) kudus.push([-((vw + 4) / 2) + (k + 0.5) * ((vw + 4) / 9), y, 0.1, 1.1, 1.4, 1, 0]);
  }
  d.add(instances(kuduGeo(), kudus, ROCK_LIGHT));
  // The pairs of donors between the doorways, on the screen's face.
  for (const x of [-6.7, 6.7]) for (const dx of [-0.6, 0.6]) d.add(at(figure(2.6, ROCK_LIGHT, dx < 0 ? 'standing' : 'chauri'), x + dx, 0.5, sz + 0.55));
  // A frieze of seated Buddhas over the doorways, under the gallery.
  d.add(at(figureFrieze(vw - 2, 1.1, ROCK_LIGHT, { kinds: ['seated'], pitch: 1.2 }), 0, 4.9, sz + 0.5));
  f.add(mergeByMaterial(d));
  // The Ekvira shrine, on the right of the court: a whitewashed shrine under a saffron spire, a
  // pillared porch, flags and a row of bells.
  const ek = new THREE.Group();
  ek.add(box(7, 4.2, 7, WHITE, 0, 0, 0), box(7.6, 0.4, 7.6, RED, 0, 4.2, 0));
  const sp = shikhara(6, 8, SAFFRON, nagaraProfile, 12, M.gold);
  ek.add(at(sp, 0, 4.6, 0), at(flag(3, M.flagSaffron), 0, 4.6 + sp.userData.top - 0.3, 0));
  ek.add(box(6, 0.3, 5, RED, 0, 3.4, 5.6));
  for (const x of [-2.6, 2.6]) for (const z of [3.8, 7.6]) ek.add(cyl(0.18, 0.18, 3.4, WHITE, x, 0, z, 8));
  for (let k = 0; k < 6; k++) ek.add(at(bell(0.18, M.gold), -1.8 + k * 0.72, 2.6, 7.7));
  f.add(at(ek, vw / 2 + 7, 0, 7).rotateY(-0.25));
  // Small monastery caves in the rock to the left: dark doorways and windows, a pillared veranda.
  const cv = [];
  for (const [x, w, h] of [[-15, 2.2, 3], [-19.5, 1.4, 1.6]]) cv.push([x, 0.2, 0.02, w, h, 0.05, 0]);
  f.add(inst(unitBox(), cv, DARK));
  // The stair from the village, down the hillside, and the stalls along it.
  const st = [], stallSpots = [];
  for (let k = 0; k < 90; k++) {
    const z = 25 + k * 1.5, x = 8 + Math.sin(k * 0.06) * 10, y = hillY(x, z);
    st.push([x, y - 0.5, z, 3.6, 0.8, 1.7, 0]);
    if (k % 6 === 3 && k > 8) stallSpots.push([x + 3.5, z, -Math.PI / 2, y]);
  }
  g.add(inst(unitBox(), st, ROCK_LIGHT));
  for (const [x, z, ry, y] of stallSpots) g.add(stalls([[x, z, ry]], { y: y - 0.2 }));
  g.add(lampPosts([[-12, 22], [12, 22]]));
  g.add(asiBoard('Karla Caves', 4, 20, -0.4));
  // Scrub forest on the hill: teak, mango and jamun, thick in the monsoon.
  const slope = scatter(140, [-400, 400, -260, 300], { seed: 3, gap: 12 }).filter(([x, z]) => !(Math.abs(x) < 46 && z > -60 && z < 26) && Math.abs(x - 8 - Math.sin((z - 25) / 1.5 * 0.06) * 10) > 7);
  const kinds = ['teak', 'mango', 'jamun'];
  for (let i = 0; i < 3; i++) g.add(trees(slope.filter((_, k) => k % 3 === i).map(([x, z]) => [x, z, null, hillY(x, z)]), { kind: kinds[i], seed: 3 + i }));
  g.add(shrubs(scatter(80, [-200, 200, -150, 200], { seed: 8, gap: 6 }).filter(([x, z]) => !(Math.abs(x) < 46 && z > -60 && z < 26)).map(([x, z]) => [x, z, null, hillY(x, z)])));
  void detail;
}
