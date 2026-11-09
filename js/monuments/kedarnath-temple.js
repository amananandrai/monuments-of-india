import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, group, rng, hipRoof, kalash, flag } from '../helpers.js';
import { templeDoorway, templePorch, grandStair } from '../details/doorways.js';
import { statue } from '../details/sculpture.js';
import { mergeByMaterial } from '../details/components.js';
import { nandi } from '../details/animals.js';
import { mountainRing } from '../details/terrain.js';
import { addDetails } from '../details/kedarnath-temple.js';
import { townHouses } from '../details/realism.js';

const STONE = mat('#8e8a82', 0.9);
const STONE_DARK = mat('#6f6b64', 0.9);
const SLOPE = mat('#6b7356', 0.95, 0, { flatShading: true });
const ROCK = mat('#7d7a74', 0.95, 0, { flatShading: true });

// The tower over the sanctum: near-straight sides, built of n horizontal courses of stone on the
// cross-shaped plan, each with a thin dark ledge at its head, narrowing to half the width at the
// top, then a ribbed amalaka and a gilt kalash. w wide, h high, its foot at y = 0.
function coursedTower(w, h, n, m, md) {
  const g = new THREE.Group(), ch = h / n, prof = (k) => 1 - 0.5 * k;
  for (let i = 0; i < n; i++) {
    const wt = w * prof(i / n), y = i * ch;
    g.add(box(wt * 0.84, ch, wt * 0.84, m, 0, y, 0), box(wt, ch * 0.82, wt * 0.62, m, 0, y, 0), box(wt * 0.62, ch * 0.82, wt, m, 0, y, 0));
    g.add(box(wt * 1.02, ch * 0.16, wt * 0.66, md, 0, y + ch * 0.82, 0), box(wt * 0.66, ch * 0.16, wt * 1.02, md, 0, y + ch * 0.82, 0), box(wt * 0.88, ch * 0.16, wt * 0.88, md, 0, y + ch * 0.82, 0));
  }
  const top = w * prof(1);
  g.add(box(top * 0.7, ch * 0.6, top * 0.7, md, 0, h, 0));
  const ar = top * 0.55, ay = h + ch * 0.6, am = mesh(new THREE.SphereGeometry(ar, 24, 8), m, 0, ay + ar * 0.4, 0);
  am.scale.y = 0.4;
  g.add(am, at(kalash(top * 0.5), 0, ay + ar * 0.8, 0));
  g.userData.top = ay + ar * 0.8 + top * 0.5 * 1.12;
  return g;
}

export function buildKedarnath() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(9);
  g.add(f);
  // The glacial valley: Mandakini river, meadow and the Kedarnath massif behind
  g.add(box(240, 0.2, 240, SLOPE), box(14, 0.4, 260, M.river, 70, 0, 0));
  // The Kedar peaks: a ring of rock walls under snow (js/details/terrain.js).
  g.add(mountainRing({ inner: 420, outer: 760, h: 250, vary: 70, snow: 165, rock: ['#7d7a74', '#6e6b66', '#8a867f'], cover: '#6f7550', steep: 0.82, aspect: 1.2 }));

  // Pilgrim lodges along the approach, facing the path, under pitched roofs of painted sheet iron
  // (js/details/realism.js, townHouses).
  const lodges = [];
  for (let i = 0; i < 18; i++) {
    const side = R() < 0.5 ? -1 : 1, x = side * (18 + R() * 25), z = 20 + R() * 70, w = 6 + R() * 4, h = 4 + R() * 4, d = 5 + R() * 3;
    lodges.push([x, z, w, d, Math.max(1, Math.round(h / 3.2)), side * -Math.PI / 2 + (R() - 0.5) * 0.3]);
  }
  g.add(townHouses(lodges, { seed: 9, roof: 'pitched', paint: ['#c9b9a0', '#d8cdb8', '#b8ad9a', '#e6dccb', '#a9b6bf'] }));
  // Temple: grey stone sanctum with its curved tower, and the hall in front under a sloping roof
  f.add(box(22, 2, 34, STONE_DARK, 0, 0, 0));
  f.add(box(12, 9, 12, STONE, 0, 2, -9), box(12.8, 0.6, 12.8, STONE_DARK, 0, 11, -9));
  const t = coursedTower(11, 13, 9, STONE, STONE_DARK);
  f.add(at(t, 0, 11.6, -9), at(flag(4, M.saffron), 0, 11.6 + t.userData.top - 0.6, -9));
  f.add(box(14, 8, 14, STONE, 0, 2, 5), at(hipRoof(16, 16, 5, STONE_DARK), 0, 10, 5), at(kalash(1.4), 0, 15, 5));
  // The hall's doorway in a stone porch, facing the Nandi
  f.add(mergeByMaterial(group(at(templeDoorway(2, 4, { m: STONE }), 0, 2, 12), at(templePorch(7.6, 3.2, 6.4, STONE, STONE_DARK), 0, 2, 12))));
  // A broad grey stair of ten rises from the meadow to the porch, and the Nandi at its foot.
  const st = grandStair(2, 12, STONE_DARK, STONE, { n: 10, tread: 0.42, landing: 0, cheek: 0.45 });
  f.add(at(st, 0, 0, 17));
  const nz = 17 + st.userData.run + 4.5;
  f.add(box(4, 1, 6, STONE_DARK, 0, 0, nz), at(nandi(mat('#3b3936', 0.7), 0.7), 0, 1, nz).rotateY(Math.PI));
  // Bhim Shila: the boulder that shielded the temple in 2013
  const boulder = mesh(new THREE.IcosahedronGeometry(5, 1), ROCK, 0, 3.6, -24);
  boulder.scale.set(1.5, 0.75, 1);
  f.add(boulder);
  // Behind the temple, the samadhi of Adi Shankaracharya: a round sunken court with a low parapet
  // and a seated image. On the ridge to the south-east, the small open shrine of Bhairavanath,
  // guardian of the valley, on its own rise. Both stand outside the home view's frame.
  g.add(cyl(7, 7.4, 0.5, STONE_DARK, 0, 0, -42, 32), cyl(5.6, 5.6, 0.12, STONE, 0, 0.5, -42, 32));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    if (Math.abs(Math.sin(a / 2)) < 0.15) continue;
    const pc = box(2.6, 0.9, 0.5, STONE, Math.sin(a) * 6.4, 0.5, -42 + Math.cos(a) * 6.4);
    pc.rotation.y = a;
    g.add(pc);
  }
  g.add(at(statue(3.2, mat('#3b3936', 0.6), 'seated', STONE_DARK), 0, 0.62, -42));
  const bh = new THREE.Group(), mound = mesh(new THREE.SphereGeometry(9, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), SLOPE);
  mound.scale.y = 0.4;
  bh.add(mound, box(7, 0.5, 7, STONE_DARK, 0, 3.4, 0), box(4, 2.6, 4, STONE, 0, 3.9, 0), at(hipRoof(5, 5, 1.8, STONE_DARK), 0, 6.5, 0), at(kalash(0.6), 0, 8.2, 0));
  bh.add(at(templeDoorway(0.9, 1.8, { m: STONE, guardians: false, hood: false }), 0, 3.9, 2));
  for (const [x, z] of [[-3, 3], [3, 3], [3, -3]]) bh.add(at(flag(4, M.saffron), x, 3.9, z));
  g.add(at(bh, 34, 0, -30).rotateY(-0.9));
  addDetails(f, g);
  // Clear mountain air: the peaks stay sharp behind the temple.
  return { group: g, focus: f, view: [0.6, 0.3, 1.25], fog: 14 };
}
