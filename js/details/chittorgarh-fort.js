import { mat, box, at, chhatri } from '../helpers.js';
import { trees, shrubs, asiBoard, scatter } from './realism.js';

// Chittorgarh: the Kirti Stambh, the older Jain tower of fame, near the east end of the plateau;
// dry scrub and khejri trees over the plateau; and the ASI board.
const STONE = mat('#c8b28c', 0.9), RUIN = mat('#a8916d', 0.95);
export function addDetails(f, g) {
  const H = 40, ks = [110, -12];
  let y = H;
  f.add(box(9, 2, 9, STONE, ks[0], y, ks[1]));
  y += 2;
  for (let i = 0; i < 6; i++) { const w = 6.2 - i * 0.3; f.add(box(w, 3.1, w, STONE, ks[0], y, ks[1]), box(w + 1, 0.3, w + 1, RUIN, ks[0], y + 2.8, ks[1])); y += 3.1; }
  f.add(at(chhatri(2.4, 4.5, STONE), ks[0], y, ks[1]));
  const plateau = scatter(60, [-140, 140, -40, 40], { seed: 3, gap: 7 }).filter(([x, z]) => (x / 140) ** 2 + (z / 40) ** 2 < 0.9 && Math.hypot(x - 20, z) > 12 && Math.hypot(x - 70, z - 8) > 20 && !(x > -70 && x < -10 && z > -22 && z < 22));
  g.add(trees(plateau.slice(0, 24), { kind: 'mango', seed: 4, y: H, h: 7 }), shrubs(plateau.slice(24).map(([x, z]) => [x, z, 2]), { y: H, dry: true, seed: 5 }));
  g.add(asiBoard('Chittorgarh Fort', 14, 70, 0, { line2: 'HILL FORTS OF RAJASTHAN' }));
}
