import * as THREE from 'three';
import { M, box, cyl, group, at, onionDome, hemi, kalash, pidaRoof } from '../helpers.js';
import { gopuram, wallWithGaps } from '../details/temples.js';
import { addDetails } from '../details/meenakshi-temple.js';

export function buildMeenakshi() {
  const S = M.stucco, Gr = M.granite, g = new THREE.Group();
  g.add(box(240, 0.3, 270, M.path));
  // The walls open where the gopurams stand, so each gate leads through.
  for (const s of [-1, 1]) g.add(wallWithGaps('x', 242, 8, 2.5, S, [[0, 29]], 0, s * 130), wallWithGaps('z', 260, 8, 2.5, S, [[0, 29]], s * 120, 0));
  for (const s of [-1, 1]) g.add(wallWithGaps('x', 112, 7, 2, S, [[0, 17]], 0, s * 62), wallWithGaps('z', 124, 7, 2, S, [[0, 17]], s * 55, 0));
  // Fourteen gopurams in all. The four outer ones (the southern one is the tallest) are packed
  // with figures, a kudu over every bay; four on the inner wall; and three on each shrine's own
  // enclosure.
  for (const [x, z, h, rot, seed] of [[0, 130, 52, 0, 1], [0, -130, 47, 0, 2], [120, 0, 49, Math.PI / 2, 3], [-120, 0, 48, Math.PI / 2, 4]]) {
    const t = gopuram(30, 18, h, 11, seed, undefined, { pitch: 1.6, kuduEvery: 1 });
    t.position.set(x, 0, z);
    t.rotation.y = rot;
    g.add(t);
  }
  for (const [x, z, h, rot, seed] of [[0, 62, 30, 0, 5], [0, -62, 27, 0, 6], [55, 0, 32, Math.PI / 2, 7], [-55, 0, 26, Math.PI / 2, 8]]) {
    const t = gopuram(18, 11, h, 7, seed, undefined, { pitch: 1.8, kuduEvery: 2 });
    t.position.set(x, 0, z);
    t.rotation.y = rot;
    g.add(t);
  }
  // The shrines' enclosures: Sundareswarar's round the larger vimana, Meenakshi's round the
  // smaller, each a low wall with three small gopurams.
  for (const [cx, cz, hw, gates] of [[12, -20, 15, [[0, 1, 17], [0, -1, 15], [1, 0, 14]]], [-28, 28, 13, [[0, 1, 16], [0, -1, 13], [1, 0, 14]]]]) {
    for (const s of [-1, 1]) {
      const gx = gates.some(([a, b]) => b === s), gz = gates.some(([a, b]) => a === s);
      g.add(wallWithGaps('x', hw * 2 + 1, 5, 1.2, S, gx ? [[cx, 11]] : [], cx, cz + s * hw));
      g.add(wallWithGaps('z', hw * 2 + 1, 5, 1.2, S, gz ? [[cz, 11]] : [], cx + s * hw, cz));
    }
    gates.forEach(([sx, sz, h], k) => {
      const t = gopuram(12, 7, h, 5, 9 + k + (cx > 0 ? 0 : 3));
      t.position.set(cx + sx * hw, 0, cz + sz * hw);
      t.rotation.y = sx ? Math.PI / 2 : 0;
      g.add(t);
    });
  }
  // Gilded vimanas over the two main shrines
  for (const [x, z, s] of [[12, -20, 1], [-28, 28, 0.8]]) {
    const v = new THREE.Group();
    v.add(box(12, 6, 12, S));
    const r = pidaRoof(10, 4.5, 4, 0.9, M.gild, M.gildDeep);
    v.add(at(r, 0, 6, 0), at(hemi(2.6, M.gild, 16), 0, 6 + r.userData.top, 0), at(kalash(1.6), 0, 8.4 + r.userData.top, 0));
    v.position.set(x, 0, z);
    v.scale.setScalar(s);
    g.add(v);
  }
  g.add(box(44, 7, 32, Gr, 22, 0, 30), box(34, 7, 40, Gr, -22, 0, -28));
  // Golden Lotus Tank with its cloister, and the Thousand Pillar Hall
  g.add(box(40, 0.8, 46, Gr, -86, 0, 10), box(32, 0.9, 38, M.water, -86, 0, 10));
  for (const s of [-1, 1]) g.add(box(44, 4.5, 3, S, -86, 0, 10 + s * 24.5), box(3, 4.5, 52, S, -86 + s * 22, 0, 10));
  g.add(cyl(0.15, 0.15, 3, M.gild, -86, 0.9, 10, 6), at(onionDome(1, M.gild), -86, 3.9, 10));
  g.add(box(40, 7, 40, Gr, 82, 0, 84));
  addDetails(g, g);
  // Framed on the monument itself, closer than its grounds would set.
  // Hundreds of separate parts: merged into a few draw calls once built (js/batch.js).
  return { group: g, view: [0.75, 0.42, 1.2], zoom: 0.62, budget: 500000, batch: true };
}
