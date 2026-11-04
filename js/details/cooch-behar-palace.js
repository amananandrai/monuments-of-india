import { trees, shrubs, lampPosts, asiBoard, scatter, along } from './realism.js';

// The Cooch Behar Palace: lotus leaves on the pond, palms and flowering shrubs in the gardens, and
// lamps along the drive.
export function addDetails(f, g) {
  const pads = scatter(26, [-96, -44, 68, 92], { seed: 3, gap: 1.6 });
  g.add(shrubs(pads.map(([x, z]) => [x, z, 1.4]), { y: 0.4, flowers: '#4f8a3a', seed: 3 }));
  g.add(trees(scatter(26, [-145, 145, -80, 165], { seed: 4, gap: 14, avoid: [[-70, 70, -25, 40], [-102, -38, 62, 98], [-8, 8, 20, 145]] }), { kind: 'palm', seed: 4 }));
  g.add(trees([...along(6, [-12, 50], [-12, 135]), ...along(6, [12, 50], [12, 135])], { kind: 'ashoka', seed: 5 }));
  g.add(shrubs(scatter(20, [-60, 60, 34, 60], { seed: 6, gap: 5, avoid: [[-16, 16, 30, 70]] }).map(([x, z]) => [x, z, 1.6]), { flowers: '#d0306f', seed: 6 }));
  g.add(lampPosts([...along(6, [-6, 35], [-6, 135]), ...along(6, [6, 35], [6, 135])]));
  g.add(asiBoard('Cooch Behar Palace', 9, 138, 0));
}
