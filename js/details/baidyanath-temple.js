import { trees, lampPosts, along, cityAround } from './realism.js';
import { detail } from '../detail.js';

// Baidyanath Dham at Deoghar: trees in the corners of the court (each shrine carries its own
// saffron flag, from nagaraTemple), and lamps along the outer path.
export function addDetails(f, g) {
  f.add(trees([[-44, 44], [44, 44]], { kind: 'banyan', seed: 4, h: 12 }), trees([[-44, -45], [44, -45]], { kind: 'neem', seed: 5 }));
  g.add(lampPosts([...along(6, [-60, -60], [-60, 60]), ...along(6, [60, -60], [60, 60])]));
  // Deoghar's lanes press close round the temple court, the street to its east gate kept open.
  // Plain houses, for the budget (js/detail.js); on phones two rows, every other plot built.
  g.add(cityAround([-52, 52, -52, 52], { rows: detail.low ? 2 : 3, every: detail.low ? 2 : 1, fine: false, gap: 12, seed: 95, keep: [[-10, 10, 52, 400]] }));
}
