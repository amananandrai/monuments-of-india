import { trees, shrubs, asiBoard, scatter } from './realism.js';

// The Ramappa temple at Palampet: trees and flower beds in the walled garden and round the wall,
// and the ASI board (it was made a World Heritage Site in 2021).
export function addDetails(f, g) {
  f.add(shrubs(scatter(16, [-36, 36, 18, 36], { seed: 5, gap: 5, avoid: [[-6, 6, 14, 38]] }).map(([x, z]) => [x, z, 1.4]), { flowers: '#d0306f', seed: 5 }));
  g.add(trees([...scatter(20, [-52, 52, -52, 52], { seed: 6, gap: 12 }).filter(([x, z]) => Math.max(Math.abs(x), Math.abs(z)) > 43)], { kind: 'neem', seed: 6 }));
  g.add(asiBoard('Rudreswara (Ramappa) Temple', 6, 44, 0, { line2: 'WORLD HERITAGE SITE' }));
}
