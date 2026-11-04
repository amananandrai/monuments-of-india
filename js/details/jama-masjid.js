import { people, stalls, scatter, along } from './realism.js';

// The Jama Masjid in Old Delhi: the faithful and visitors in the great courtyard and round the
// ablution tank, crowds climbing the steps to the east gate, and the stalls of the bazaar that
// crowds its foot.
export function addDetails(f, g) {
  const P = 6;
  f.add(people(scatter(80, [-46, 46, -26, 46], { seed: 3, avoid: [[-9, 9, 2, 14]] }).map(([x, z]) => [x, z, P]), { seed: 3, palette: ['#f4f1ea', '#f7f7f7', '#1f2d3d', '#2f5d9a', '#6b5a48', '#e26a9c', '#3c8a5a'] }));
  const climb = [];
  for (let k = 0; k < 6; k++) for (const x of [-12, -5, 3, 10]) climb.push([x + Math.sin(k * 3 + x), 59.5 + k * 3, P - k]);
  f.add(people(climb, { seed: 4, face: Math.PI }));
  g.add(stalls([...along(8, [-80, 80], [-25, 80]).map(([x, z]) => [x, z, 0]), ...along(8, [25, 80], [80, 80]).map(([x, z]) => [x, z, 0])]));
  g.add(people(scatter(50, [-90, 90, 72, 95], { seed: 5 }), { seed: 5 }));
}
