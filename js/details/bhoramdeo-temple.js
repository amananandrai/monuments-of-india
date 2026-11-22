import * as THREE from 'three';
import { M, mat, mesh, box, at, onFace, sheet } from '../helpers.js';
import { mouldings, frieze, templeNiche, idol, medallion, mergeByMaterial } from '../parts/components.js';
import { figureFrieze } from '../parts/sculpture.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { trees, shrubs, benches, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';

// Bhoramdeo's stone, weathered almost black; and the taper of its spire.
export const STONE = mat('#6a6259', 0.93);
export const SHADE = mat('#4c4640', 0.95);
export const PROF = (t) => 1 - 0.62 * Math.pow(t, 1.35);

// Bhoramdeo, finer detail. From photographs: the platform's face is a stack of mouldings; the
// base of the walls carries a band of elephants and a band of rosettes; carved bands frame the
// two rows of figures; the middle of each face of the sanctum holds an image in a niche; the
// porches have sloping seat-backs between their pillars; ribbed stones mark the corners of the
// spire, and a medallion sits in the gable over the vestibule. Dimensions follow
// js/monuments/bhoramdeo-temple.js: platform 20 x 31 and P high; base B and wall WH; the sanctum
// 7.2 square (arms to 8) at z = sz, the vestibule 5 x 3.2 at z = -3, the hall 11 square at z = mz.
function architecture(f, { P, B, WH, sz, mz, TW, TH }) {
  const d = new THREE.Group(), S = STONE, Sd = SHADE, Y = P + B + WH;
  d.add(mouldings(20, 31, [[0.1, 0.35, 0.14, S], [0.55, 0.4, 0.06, frieze(S)]], Sd));
  const base = [[0, 0.3, 0.22, Sd], [0.3, 0.4, 0.1, frieze(S)], [0.7, 0.3, 0.2, Sd], [B + 0.45, 0.2, 0.07, Sd], [B + 2.4, 0.25, 0.09, Sd], [B + 4.1, 0.4, 0.06, frieze(S)]];
  const up = (k) => base.map(([y, h, p, c]) => [P + y + k * 0.01, h, p, c]);
  d.add(at(mouldings(8, 4.4, up(0), S), 0, 0, sz), at(mouldings(4.4, 8, up(1), S), 0, 0, sz), at(mouldings(7.2, 7.2, up(2), S), 0, 0, sz));
  d.add(at(mouldings(5, 3.18, up(3), S), 0, 0, -3), at(mouldings(11, 11, up(4), S), 0, 0, mz));
  // The images on the sanctum's west, north and south faces, over the two rows of figures.
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) {
    const n = onFace(at(templeNiche(1.1, 2.1, S, { figure: idol(1.8, Sd) }), 0, P + B + 0.7, 0), a, 4.03);
    n.position.z += sz;
    d.add(n);
  }
  // Seat-backs (kakshasana) on the open sides of each porch.
  for (const a of [0, Math.PI / 2, -Math.PI / 2]) {
    const p = onFace(at(new THREE.Group(), 0, P + B, 0), a, 5.5);
    p.position.z += mz;
    for (const s of [-1, 1]) {
      const seat = box(0.16, 0.9, 1.7, Sd, s * 2.2, 0, 1.25);
      seat.rotation.z = -s * 0.3;
      p.add(seat, box(0.5, 0.25, 2, S, s * 2.05, 0, 1.2));
    }
    d.add(p);
  }
  // Ribbed stones on the spire's corners, and the medallion of its gable.
  const am = new THREE.SphereGeometry(1, 12, 5), sy = Y + 0.3;
  for (let k = 1; k <= 4; k++) {
    const t = k / 5, wt = TW * PROF(t), r = wt * 0.085;
    for (const sx of [-1, 1]) for (const zz of [-1, 1]) { const o = mesh(am, S, sx * wt * 0.42, sy + t * TH, sz + zz * wt * 0.42); o.scale.set(r, r * 0.42, r); d.add(o); }
  }
  d.add(at(medallion(0.6, S), 0, sy + 4 * 0.4 * 1.55 + 0.8, -3.34));
  f.add(mergeByMaterial(d));
  // Elephants in procession along the base of the hall and the sanctum.
  if (!detail.low) for (const a of [Math.PI / 2, -Math.PI / 2]) for (const [cz, dist, len, lat] of [[mz, 5.5, 2.4, -4.1], [mz, 5.5, 2.4, 4.1], [sz, 4, 4, 0]]) {
    const e = onFace(at(figureFrieze(len, 0.42, S, { pitch: 0.6, kinds: ['elephant'], proud: 0.1 }), 0, P + 1.02, 0), a, dist + 0.23, lat);
    e.position.z += cz;
    f.add(e);
  }
}

// The Maikal hills: a forested range rising behind the temple (west) and curving round to the
// north and south, the valley floor left level for the temple and its lake.
function hillY(x, z) {
  const back = smooth(90, 420, -z + 0.25 * Math.abs(x)), side = smooth(230, 560, Math.abs(x) - 0.35 * z) * smooth(260, 40, z);
  const t = Math.max(back, side * 0.8);
  return t * (55 + 70 * ridged(x, z, { scale: 0.0035, octaves: 4 }) + 30 * fbm(x, z, { scale: 0.006, octaves: 3 })) - 0.6;
}

// Bhoramdeo, in its valley in Kabirdham: the garden round the platform, the lake before the
// temple, and sal forest running up into the Maikal hills behind.
export function addDetails(f, g, dims) {
  architecture(f, dims);
  g.add(box(300, 0.2, 330, M.grass, 0, 0, 30));
  g.add(heightField(1700, 1300, detail.low ? 110 : 170, hillY, { cz: -330, rock: ['#6d6a58', '#77735f'], cover: '#4a6638', steep: 0.72, band: 26 }));
  // Paths from the lake to the east stair and round the platform.
  g.add(box(4, 0.06, 26, M.path, 0, 0.2, 31), box(30, 0.06, 3, M.path, 0, 0.2, 45.5));
  // The lake, east and north-east of the temple, behind a low stone bank with steps down to the water.
  g.add(sheet(250, 130, M.lake, 0, 0.26, 114), sheet(150, 78, M.lake, 110, 0.26, 10));
  const bank = new THREE.Group();
  bank.add(box(160, 0.5, 2, SHADE, -46, 0, 48), box(2, 0.5, 80, SHADE, 34, 0, 9), box(152, 0.5, 2, SHADE, 110, 0, -30));
  for (let k = 0; k < 3; k++) bank.add(box(16, 0.38 - k * 0.12, 1, STONE, 0, 0, 49.5 + k));
  g.add(mergeByMaterial(bank));
  // The forest: sal on the valley floor round the garden and up the lower slopes.
  const floor = scatter(detail.low ? 50 : 90, [-150, 150, -120, 44], { seed: 4, gap: 9, avoid: [[-26, 26, -28, 44], [-80, 0, 0, 60], [30, 190, -34, 52]] });
  g.add(trees(floor, { kind: 'sal', seed: 4 }));
  const slope = scatter(detail.low ? 110 : 340, [-420, 420, -420, 160], { seed: 8, gap: 10 }).filter(([x, z]) => { const y = hillY(x, z); return y > 1.5 && y < 95; }).map(([x, z]) => [x, z, 13, hillY(x, z) - 0.4]);
  g.add(trees(slope, { kind: 'sal', seed: 9 }), trees(slope.filter((_, k) => k % 3 === 0).map(([x, z]) => [x + 7, z + 5, 11, hillY(x + 7, z + 5) - 0.4]), { kind: 'teak', seed: 10 }));
  g.add(trees([[19, 32], [-24, -10], [23, -12]], { kind: 'mango', seed: 3 }), trees([[-30, -34], [28, -42]], { kind: 'peepal', seed: 5, h: 12 }));
  g.add(shrubs([...along(7, [-13, 18], [-13, 44]), ...along(7, [13, 18], [13, 44])].map(([x, z]) => [x, z, 1]), { seed: 4, flowers: '#d0306f' }));
  g.add(benches([[-6, 46.8], [6, 46.8]]));
}
