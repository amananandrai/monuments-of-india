import * as THREE from 'three';
import { M, box, cyl, at, onionDome, inst, unitBox } from '../helpers.js';
import { gopuram, wallWithGaps, dravidaVimana } from '../details/temples.js';
import { addDetails } from '../details/meenakshi-temple.js';
import { detail } from '../detail.js';

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
    const t = gopuram(30, 18, h, 11, seed, undefined, detail.low ? { pitch: 2.4, kuduEvery: 3, cheap: true } : { pitch: 1.6, kuduEvery: 1 });
    t.position.set(x, 0, z);
    t.rotation.y = rot;
    g.add(t);
  }
  for (const [x, z, h, rot, seed] of [[0, 62, 30, 0, 5], [0, -62, 27, 0, 6], [55, 0, 32, Math.PI / 2, 7], [-55, 0, 26, Math.PI / 2, 8]]) {
    const t = gopuram(18, 11, h, 7, seed, undefined, detail.low ? { pitch: 2.6, kuduEvery: 4, cheap: true } : { pitch: 2.0, kuduEvery: 2 });
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
      const t = gopuram(12, 7, h, 5, 9 + k + (cx > 0 ? 0 : 3), undefined, detail.low ? { pitch: 2.8, kuduEvery: 4, cheap: true } : { pitch: 2.1, kuduEvery: 3 });
      t.position.set(cx + sx * hw, 0, cz + sz * hw);
      t.rotation.y = sx ? Math.PI / 2 : 0;
      g.add(t);
    });
  }
  // Gilded vimanas over the two main shrines: square storeys with their miniature shrines, an
  // octagonal cap and a kalash. The gopurams stay the tall masses; these are small and gold.
  for (const [x, z, s] of [[12, -20, 1], [-28, 28, 0.8]]) {
    const v = new THREE.Group();
    v.add(box(12, 6, 12, S), box(12.6, 0.5, 12.6, M.gildDeep, 0, 6, 0));
    v.add(at(dravidaVimana(10.5, 4, 2.3, M.gild, M.gildDeep, { kalashM: M.gild, kalashScale: 0.75, taper: 0.5 }), 0, 6.5, 0));
    v.position.set(x, 0, z);
    v.scale.setScalar(s);
    g.add(v);
  }
  g.add(box(44, 7, 32, Gr, 22, 0, 30), box(34, 7, 40, Gr, -22, 0, -28));
  // Golden Lotus Tank inside its cloister: a paved walk round the inside of the cloister wall, and
  // from it flights of steps down to the water on all four sides, a ring of treads stepping in as
  // they fall. The gilt lotus stands on its pillar in the middle of the water.
  const TX = -86, TZ = 10, WALK = 2, WATER = 0.45, NS = 8, TR = 0.5, rise = (WALK - WATER - 0.15) / NS;
  for (const s of [-1, 1]) g.add(box(44, 4.5 + WALK, 3, S, TX, 0, TZ + s * 24.5), box(3, 4.5 + WALK, 52, S, TX + s * 22, 0, TZ));
  const ring = (ox, oz, ix, iz, h, m) => {
    for (const s of [-1, 1]) g.add(box(ox, h, (oz - iz) / 2, m, TX, 0, TZ + s * (oz + iz) / 4), box((ox - ix) / 2, h, iz, m, TX + s * (ox + ix) / 4, 0, TZ));
  };
  let ox = 41, oz = 46, ix = 35, iz = 40;
  ring(ox, oz, ix, iz, WALK, Gr);
  for (let k = 1; k <= NS; k++) {
    ox = ix; oz = iz; ix -= 2 * TR; iz -= 2 * TR;
    ring(ox, oz, ix, iz, WALK - k * rise, Gr);
  }
  g.add(box(ix + 0.02, 0.15, iz + 0.02, Gr, TX, 0, TZ), box(ix, WATER - 0.15, iz, M.water, TX, 0.15, TZ));
  g.add(cyl(0.15, 0.15, 3, M.gild, TX, WATER, TZ, 6), at(onionDome(1, M.gild), TX, WATER + 3, TZ));
  // The Thousand Pillar Hall: a forest of square granite pillars (a grid of them here, not all 985)
  // under a flat roof on a low plinth, a solid back wall, its front open.
  const pil = [];
  for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) pil.push([66.5 + i * 2.8, 1, 68.5 + j * 2.8, 0.7, 5.6, 0.7]);
  g.add(box(42, 1, 42, Gr, 82, 0, 84), box(42, 0.8, 42, Gr, 82, 6.6, 84), box(42, 7.4, 1, Gr, 82, 0, 104.5), inst(unitBox(), pil, Gr));
  // Roofed corridors (prakaram) round the inside of the outer wall, 10 m wide, open at the four
  // gopurams: a flat granite roof on two rows of square pillars, the inner row on the court.
  const cor = [], roofs = [];
  for (const s of [-1, 1]) {
    for (const [a, b] of [[-114, -16], [16, 114]]) {
      roofs.push([(a + b) / 2, 7, s * 123, b - a, 0.7, 10]);
      for (let x = a + 1; x < b; x += 4) cor.push([x, 0, s * 118.6, 0.8, 7, 0.8], [x, 0, s * 123.8, 0.8, 7, 0.8]);
    }
    for (const [a, b] of [[-118, -16], [16, 118]]) {
      roofs.push([s * 113, 7, (a + b) / 2, 10, 0.7, b - a]);
      for (let z = a + 1; z < b; z += 4) cor.push([s * 108.6, 0, z, 0.8, 7, 0.8], [s * 113.8, 0, z, 0.8, 7, 0.8]);
    }
  }
  g.add(inst(unitBox(), cor, Gr), inst(unitBox(), roofs, Gr));
  addDetails(g, g);
  // Framed on the monument itself, closer than its grounds would set.
  // Hundreds of separate parts: merged into a few draw calls once built (js/batch.js).
  // The home view matches the best-known photograph: the south gopuram towering over the street.
  return { group: g, view: [0.35, 0.15, 1], zoom: 0.3, target: [0, 25, 130], batch: true };
}
