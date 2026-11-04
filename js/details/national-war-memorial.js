import { people, lampPosts, around, scatter } from './realism.js';

// The National War Memorial in Delhi: the ceremonial guard at the Amar Jawan Jyoti, visitors
// walking the concentric circles of the Tyag Chakra and the Veerta Chakra, and lamps round the
// outer path.
export function addDetails(f, g) {
  f.add(people([[0, 6.5], [0, -6.5], [6.5, 0], [-6.5, 0]], { seed: 3, palette: ['#4d5a3a', '#1f2d3d', '#f4f1ea'], y: 0.9 }));
  f.add(people([...scatter(40, [-80, 80, -80, 80], { seed: 4 }).filter(([x, z]) => { const r = Math.hypot(x, z); return (r > 22 && r < 40) || (r > 46 && r < 57) || (r > 78 && r < 82); })], { seed: 4, y: 0.3 }));
  g.add(lampPosts(around(24, 86)));
}
