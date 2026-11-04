import { trees, lampPosts, asiBoard, fountains, scatter, along } from './realism.js';

// Bibi ka Maqbara at Aurangabad: fountains down the long water channel from the gateway, cypress
// rows either side of it, and shade trees in the lawns.
export function addDetails(f, g) {
  g.add(fountains(along(10, [0, 45], [0, 145]), { y: 0.4, h: 2 }));
  for (const x of [-9, 9]) g.add(trees(along(12, [x, 44], [x, 146]), { kind: 'cypress', seed: x > 0 ? 3 : 4, h: 8 }));
  g.add(trees(scatter(22, [-88, 88, -78, 175], { seed: 5, gap: 13, avoid: [[-42, 42, -42, 42], [-16, 16, 36, 165]] }), { kind: 'neem', seed: 5 }));
  g.add(lampPosts([...along(5, [-6, 60], [-6, 140]), ...along(5, [6, 60], [6, 140])]));
  g.add(asiBoard('Bibi ka Maqbara', 9, 170, 0));
}
