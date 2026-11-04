import { trees, shrubs, people, lampPosts, asiBoard, scatter, along } from './realism.js';

// Golconda: babul and neem trees on the plain round the hill and scrub among its boulders,
// visitors climbing to the Bala Hissar and gathered at the Fateh Darwaza, lamps along the road in
// (for the evening sound-and-light show), and the ASI board.
export function addDetails(f, g) {
  const plain = scatter(40, [-240, 240, -240, 240], { seed: 3, gap: 16 }).filter(([x, z]) => Math.hypot(x, z) > 125);
  g.add(trees(plain, { kind: 'neem', seed: 3 }));
  const slope = scatter(40, [-95, 95, -95, 95], { seed: 4, gap: 6 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 34 && r < 96 && ![30, 64].some((w) => Math.abs(r - w) < 5); });
  // Each bush sits on the cone of the hill, 60 m high and 110 m in radius.
  g.add(shrubs(slope.map(([x, z]) => [x, z, 2.2, 60 * (1 - Math.hypot(x, z) / 110) - 0.3]), { dry: true, seed: 5 }));
  const climbers = [];
  for (let k = 0; k < 18; k++) { const r = 100 - k * 4.5, a = Math.PI / 2 + Math.sin(k * 0.7) * 0.25; climbers.push([Math.cos(a) * r, Math.sin(a) * r, 60 * (1 - r / 110) + 0.2]); }
  f.add(people(climbers, { seed: 6 }));
  f.add(people(scatter(20, [-14, 14, 124, 150], { seed: 7 }), { seed: 7 }));
  g.add(lampPosts([...along(6, [-7, 128], [-7, 200]), ...along(6, [7, 128], [7, 200])]));
  g.add(asiBoard('Golconda Fort', 14, 150, 0));
}
