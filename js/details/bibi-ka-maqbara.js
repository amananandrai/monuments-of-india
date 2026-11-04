import { trees, people, lampPosts, asiBoard, fountains, scatter, along } from './realism.js';

// Bibi ka Maqbara at Aurangabad: fountains down the long water channel from the gateway, cypress
// rows either side of it and shade trees in the lawns, visitors on the platform and the paths.
export function addDetails(f, g) {
  g.add(fountains(along(10, [0, 45], [0, 145]), { y: 0.4, h: 2 }));
  for (const x of [-9, 9]) g.add(trees(along(12, [x, 44], [x, 146]), { kind: 'cypress', seed: x > 0 ? 3 : 4, h: 8 }));
  g.add(trees(scatter(22, [-88, 88, -78, 175], { seed: 5, gap: 13, avoid: [[-42, 42, -42, 42], [-16, 16, 36, 165]] }), { kind: 'neem', seed: 5 }));
  f.add(people(scatter(24, [-34, 34, -34, 34], { seed: 6, avoid: [[-20, 20, -20, 20]] }).map(([x, z]) => [x, z, 5]), { seed: 6 }));
  g.add(people(scatter(16, [-4.5, 4.5, 50, 150], { seed: 7 }).map(([x, z]) => [x + (x > 0 ? 0.5 : -0.5) * 2, z]), { seed: 7 }));
  g.add(lampPosts([...along(5, [-6, 60], [-6, 140]), ...along(5, [6, 60], [6, 140])]));
  g.add(asiBoard('Bibi ka Maqbara', 9, 170, 0));
}
