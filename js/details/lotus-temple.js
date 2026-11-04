import { trees, shrubs, lampPosts } from './realism.js';

// The Bahá'í House of Worship (the Lotus Temple) in Delhi: clipped hedges and flower beds between
// the nine paths to the doors, trees round the edge of the grounds, and lamps.
export function addDetails(f, g) {
  const deg = Math.PI / 180, lamps = [], hedges = [];
  for (let k = 0; k < 9; k++) {
    const t = k * 40 * deg, s = Math.sin(t), c = Math.cos(t);
    for (const d of [48, 62, 76]) for (const o of [-3.6, 3.6]) lamps.push([s * d + c * o, c * d - s * o]);
    const t2 = t + 20 * deg;
    for (let d = 64; d < 82; d += 3) hedges.push([Math.sin(t2) * d, Math.cos(t2) * d, 1.6]);
  }
  g.add(lampPosts(lamps), shrubs(hedges, { flowers: '#d0306f', seed: 4 }));
  const ring = [];
  for (let k = 0; k < 36; k++) { const a = (k / 36) * Math.PI * 2 + 0.05; ring.push([Math.sin(a) * 82, Math.cos(a) * 82]); }
  g.add(trees(ring, { kind: 'ashoka', seed: 5 }));
}
