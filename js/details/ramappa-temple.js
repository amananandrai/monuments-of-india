import { trees, shrubs, people, asiBoard, scatter, along } from './realism.js';

// The Ramappa temple at Palampet: visitors on the star-shaped platform and in the walled garden,
// trees and flower beds in the garden and round the wall, and the ASI board (it was made a World
// Heritage Site in 2021).
export function addDetails(f, g) {
  f.add(people(scatter(18, [-20, 20, -22, 18], { seed: 3, avoid: [[-11, 11, -16, 16]] }).map(([x, z]) => [x, z, 3]), { seed: 3 }));
  f.add(people(scatter(14, [-36, 36, -36, 36], { seed: 4, avoid: [[-24, 24, -26, 34]] }), { seed: 4 }));
  f.add(shrubs(scatter(16, [-36, 36, 18, 36], { seed: 5, gap: 5, avoid: [[-6, 6, 14, 38]] }).map(([x, z]) => [x, z, 1.4]), { flowers: '#d0306f', seed: 5 }));
  g.add(trees([...scatter(20, [-52, 52, -52, 52], { seed: 6, gap: 12 }).filter(([x, z]) => Math.max(Math.abs(x), Math.abs(z)) > 43)], { kind: 'neem', seed: 6 }));
  g.add(asiBoard('Rudreswara (Ramappa) Temple', 6, 44, 0, { line2: 'WORLD HERITAGE SITE' }));
}
