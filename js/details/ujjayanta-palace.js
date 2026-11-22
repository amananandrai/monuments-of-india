import * as THREE from 'three';
import { M, mat, box, cyl, at, inst, unitBox, mown } from '../helpers.js';
import { keystone, mergeByMaterial } from '../parts/components.js';
import { urn } from '../parts/sculpture.js';
import { balustrade } from '../parts/colonial.js';
import { detail } from '../detail.js';
import { trees, shrubs, lampPosts, fountains, benches, scatter, along, around } from '../parts/realism.js';
import { UJ, WHITE, SHADE } from '../monuments/ujjayanta-palace.js';

// Ujjayanta Palace, finer detail. From photographs: flat pilasters between the arches of both
// verandahs, with moulded heads; a band between the floors; a balustrade along every roof, urns
// on its piers; a keystone in each arch; and a balustrade round the roof of the carriage porch.
// Dimensions follow js/monuments/ujjayanta-palace.js (UJ).
function architecture(f) {
  const d = new THREE.Group(), { W, D, FZ, b, F, H, CW, CZ, PX, PW, PZ } = UJ, top = b + H, pil = [], caps = [];
  const mid = (x) => Math.abs(x) < CW / 2 + 0.5 || Math.abs(Math.abs(x) - PX) < PW / 2 + 0.5;
  for (let k = 0; k <= 26; k++) {
    const x = -W / 2 + k * (W / 26);
    if (mid(x)) continue;
    for (const y of [b, b + F + 0.3]) { pil.push([x, y, FZ + 0.12, 0.7, F - 0.5, 0.26]); caps.push([x, y + F - 0.95, FZ + 0.16, 0.95, 0.35, 0.36]); }
  }
  // The band between the floors and the balustrade over the cornice, along each stretch of wing.
  for (const s of [-1, 1]) {
    const x0 = CW / 2, x1 = PX - PW / 2, cx = s * (x0 + x1) / 2, len = x1 - x0;
    d.add(box(len, 0.45, 0.4, SHADE, cx, b + F - 0.1, FZ + 0.1));
    d.add(at(balustrade(len - 0.4, 1.1, WHITE, { t: 0.42 }), cx, top + 0.6, FZ + 0.15));
    for (let k = 1; k < 4; k++) d.add(box(0.7, 1.3, 0.7, WHITE, s * (x0 + (k * len) / 4), top + 0.6, FZ + 0.15), at(urn(1.0, WHITE), s * (x0 + (k * len) / 4), top + 1.9, FZ + 0.15));
    // The end pavilion: bands, corner piers and a balustrade on three sides.
    const yd = top + 1.6 + 0.6;
    d.add(box(PW + 0.3, 0.45, 0.4, SHADE, s * PX, b + F - 0.1, PZ + 0.1));
    d.add(at(balustrade(PW - 0.6, 1.0, WHITE, { t: 0.4 }), s * PX, yd, PZ + 0.1));
    for (const x of [-PW / 2, PW / 2]) {
      d.add(box(0.9, H + 1.6, 0.3, WHITE, s * PX + x * 0.94, b, PZ + 0.14), box(0.8, 1.2, 0.8, WHITE, s * PX + x * 0.96, yd, PZ + 0.1), at(urn(0.9, WHITE), s * PX + x * 0.96, yd + 1.2, PZ + 0.1));
      const sb = balustrade(PZ + D / 2 - 1, 1.0, WHITE, { t: 0.4 }); sb.rotation.y = Math.PI / 2;
      d.add(at(sb, s * PX + x * 1.02, yd, (PZ - D / 2) / 2));
    }
    for (const x of [-3.7, 0, 3.7]) for (const y of [b + 0.5 + 4.0, b + F + 0.6 + 3.9]) d.add(at(keystone(0.34, 0.6, 0.14, SHADE, 0.2), s * PX + x, y - 0.1, PZ));
  }
  d.add(inst(unitBox(), pil, WHITE), inst(unitBox(), caps, SHADE));
  // Keystones along the wings (on desktops).
  if (!detail.low) for (let k = 0; k < 26; k++) {
    const x = -W / 2 + (k + 0.5) * (W / 26);
    if (Math.abs(x) < CW / 2 || Math.abs(Math.abs(x) - PX) < PW / 2) continue;
    for (const y of [b + 0.5 + 4.0, b + F + 0.6 + 3.9]) d.add(at(keystone(0.34, 0.6, 0.14, SHADE, 0.2), x, y - 0.1, FZ));
  }
  // The central block: its band, corner piers, the balustrade over its cornice and round the porch.
  d.add(box(CW + 0.3, 0.45, 0.4, SHADE, 0, b + F - 0.1, CZ + 0.1));
  for (const s of [-1, 1]) {
    d.add(box(1.0, H + 0.2, 0.3, WHITE, s * (CW / 2 - 0.55), b, CZ + 0.14));
    d.add(at(balustrade(2.6, 1.0, WHITE, { t: 0.4 }), s * 9.4, top + 0.9, CZ + 0.1), at(urn(0.9, WHITE), s * 10.6, top + 1.9, CZ + 0.1));
    const sb = balustrade(7.4, 1.0, WHITE, { t: 0.4 }); sb.rotation.y = Math.PI / 2;
    d.add(at(sb, s * 5.7, 0.45 + 6.7, CZ + 3.9));
  }
  d.add(at(balustrade(11.4, 1.0, WHITE, { t: 0.4 }), 0, 0.45 + 6.7, CZ + 7.6));
  // Steps up from the drive to the plinth either side of the porch, and a flag staff over the dome's porch.
  f.add(mergeByMaterial(d));
}

// The grounds, after photographs and the plan of the place: the drive runs straight in from the
// south gate between two great rectangular lakes; between the lakes and the palace lies the garden
// in the Mughal manner, quartered by paved walks, with a round fountain basin on the axis and one
// in each half; palms and mango trees along the lakes, lamps down the drive.
export function addDetails(f, g) {
  architecture(f);
  const PATH = M.path, KERB = mat('#d8d3c6', 0.85), BED = mat('#557a3c', 0.95);
  g.add(mown(box(330, 0.15, 330, M.grass, 0, 0, 95)));
  g.add(box(12, 0.22, 250, PATH, 0, 0, 148), box(150, 0.22, 7, PATH, 0, 0, 27), box(150, 0.21, 5, PATH, 0, 0, 58));
  for (const s of [-1, 1]) g.add(box(5, 0.21, 30, PATH, s * 38, 0, 42.5), box(5, 0.21, 26, PATH, s * 73, 0, 42.5));
  // The lakes, in stone kerbs, their water a little below the lawns.
  for (const s of [-1, 1]) g.add(box(104, 0.3, 134, KERB, s * 62, 0, 133), box(100, 0.36, 130, M.lake, s * 62, 0, 133));
  // Fountain basins: one on the axis before the porch, one in each half of the garden.
  const jets = [];
  for (const [x, z, r] of [[0, 42, 6], [-20, 42, 3.6], [20, 42, 3.6], [-56, 42, 4.5], [56, 42, 4.5]]) {
    g.add(cyl(r + 0.5, r + 0.5, 0.55, KERB, x, 0, z, 32), cyl(r, r, 0.6, M.water, x, 0, z, 32), cyl(0.5, 0.7, 1.3, KERB, x, 0, z, 12), cyl(r * 0.3, 0.3, 0.2, KERB, x, 1.3, z, 16));
    jets.push([x, z], ...around(r > 4 ? 8 : 6, r * 0.6, x, z));
  }
  g.add(fountains(jets.filter((_, i) => i % 7 === 0 || !detail.low), { y: 0.6, h: 2.6 }), fountains([[0, 42]], { y: 1.5, h: 4 }));
  // Fountains down the middle of each lake.
  g.add(fountains([-62, 62].flatMap((x) => [[x, 100], [x, 133], [x, 166]]), { y: 0.36, h: 7 }));
  // Flower beds along the walks.
  for (const s of [-1, 1]) for (const z of [33, 51]) g.add(box(22, 0.3, 4, BED, s * 21, 0, z), box(22, 0.3, 4, BED, s * 55.5, 0, z));
  g.add(shrubs([-1, 1].flatMap((s) => [33, 51].flatMap((z) => [...along(6, [s * 12, z], [s * 30, z]), ...along(6, [s * 46.5, z], [s * 64.5, z])])).map(([x, z]) => [x, z, 1.0]), { flowers: '#d0306f', seed: 4 }));
  g.add(shrubs([...along(14, [-70, 62.5], [-8, 62.5]), ...along(14, [8, 62.5], [70, 62.5])].map(([x, z]) => [x, z, 1.1]), { seed: 9 }));
  // Royal palms down the drive, mango and jamun round the lakes and behind the palace.
  g.add(trees([...along(8, [-9.5, 72], [-9.5, 196]), ...along(8, [9.5, 72], [9.5, 196])], { kind: 'palm', seed: 3, h: 11 }));
  g.add(trees([...along(7, [-118, 70], [-118, 196]), ...along(7, [118, 70], [118, 196]), ...along(9, [-110, 204], [-14, 204]), ...along(9, [14, 204], [110, 204])], { kind: 'mango', seed: 12 }));
  g.add(trees(scatter(26, [-150, 150, -75, -34], { seed: 31, gap: 11 }), { kind: 'jamun', seed: 31 }));
  g.add(trees([[-78, 18], [78, 18], [-96, 40], [96, 40], [-88, -8], [88, -8]], { kind: 'palm', seed: 8, h: 12 }));
  g.add(lampPosts([...along(10, [-7.2, 64], [-7.2, 200]), ...along(10, [7.2, 64], [7.2, 200]), ...along(6, [-66, 30.8], [-14, 30.8]), ...along(6, [14, 30.8], [66, 30.8])]));
  g.add(benches([[-30, 55], [30, 55], [-50, 55], [50, 55]]));
}
