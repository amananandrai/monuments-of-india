import { M, box } from '../helpers.js';
import { trees, people, asiBoard, fountains, scatter, along } from './realism.js';
import { deer } from './animals.js';

// Akbar's Tomb at Sikandra: the deer park in its great garden (herds of chital graze the lawns),
// the water channel and fountains down the causeway from the gate, the trees lining it, and
// visitors.
export function addDetails(f, g) {
  g.add(box(1.6, 0.27, 84, M.water, 0, 0, 94), fountains(along(6, [0, 60], [0, 128]), { y: 0.27, h: 1.8 }));
  for (const x of [-8.5, 8.5]) f.add(trees(along(8, [x, 60], [x, 130]), { kind: 'ashoka', seed: x > 0 ? 3 : 4 }));
  f.add(trees(scatter(18, [-105, 105, -100, 185], { seed: 5, gap: 14, avoid: [[-60, 60, -60, 60], [-12, 12, 50, 160], [-30, 30, 125, 160]] }), { kind: 'neem', seed: 5 }));
  const herd = scatter(16, [-95, 95, -90, 180], { seed: 6, gap: 4, avoid: [[-58, 58, -58, 58], [-12, 12, 40, 160], [-30, 30, 125, 160]] });
  f.add(deer(herd.map(([x, z], i) => [x, z, i * 1.9])));
  f.add(people([...scatter(12, [-5, 5, 60, 140], { seed: 7 }), ...scatter(10, [-30, 30, 52, 58], { seed: 8 })], { seed: 7 }));
  f.add(asiBoard("Akbar's Tomb, Sikandra", 9, 158, 0));
}
