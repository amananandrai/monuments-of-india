import { trees, lampPosts, along } from './realism.js';

// Baidyanath Dham at Deoghar: trees in the corners of the court (each shrine carries its own
// saffron flag, from nagaraTemple), and lamps along the outer path.
export function addDetails(f, g) {
  f.add(trees([[-44, 44], [44, 44]], { kind: 'banyan', seed: 4, h: 12 }), trees([[-44, -45], [44, -45]], { kind: 'neem', seed: 5 }));
  g.add(lampPosts([...along(6, [-60, -60], [-60, 60]), ...along(6, [60, -60], [60, 60])]));
}
