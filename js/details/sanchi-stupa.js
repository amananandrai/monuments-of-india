import { mat, box, cyl } from '../helpers.js';
import { trees, people, MONKS, asiBoard, scatter, around } from './realism.js';

// The Great Stupa at Sanchi: the stump of the Ashokan pillar by the south gateway (its lion
// capital is now in the site museum), monks and pilgrims walking the path round the stupa inside
// the railing, the trees of the hilltop, and the ASI board.
const STONE = mat('#b8a88e', 0.85);
export function addDetails(f, g) {
  f.add(box(2.6, 0.6, 2.6, STONE, 8, 0, -30), cyl(0.5, 0.55, 3.2, STONE, 8, 0.6, -30, 16), box(1.2, 0.8, 0.9, STONE, 9.6, 0, -31.5).rotateZ(0.2));
  f.add(people(around(22, 20.2, 0, 0, 0.2), { seed: 3, palette: [...MONKS, '#f4f1ea', '#2f5d9a'] }));
  g.add(trees(scatter(30, [-43, 43, -43, 43], { seed: 4, gap: 10 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 30 && r < 43; }), { kind: 'neem', seed: 4 }));
  g.add(people(scatter(12, [-40, 40, -40, 40], { seed: 5 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 27 && r < 40; }), { seed: 5 }));
  g.add(asiBoard('Buddhist Monuments at Sanchi', 6, 34, 0, { line2: 'WORLD HERITAGE SITE' }));
}
