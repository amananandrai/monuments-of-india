import { trees, shrubs, asiBoard, scatter } from './realism.js';

// Ajanta: the teak and scrub forest over the plateau and down in the valley of the Waghora, and the
// ASI board.
export function addDetails(f, g) {
  const R = 70, H = 40, a0 = -0.15 * Math.PI, a1 = 1.15 * Math.PI;
  // The forest on top of the cliff, set back from its edge
  const top = [];
  for (let k = 0; k < 70; k++) {
    const t = a0 + ((k + 0.5) / 70) * (a1 - a0), x = Math.cos(t) * R, z = -Math.sin(t) * R * 0.8, l = Math.hypot(x, z), d = 6 + ((k * 37) % 45);
    top.push([x + (x / l) * d, z + (z / l) * d]);
  }
  g.add(trees(top, { kind: 'mango', seed: 7, y: H + 3, h: 9 }));
  g.add(shrubs(top.map(([x, z], k) => [x + Math.sin(k) * 4, z + Math.cos(k) * 4, 2.4]), { y: H + 3, dry: true, seed: 8 }));
  // The valley floor inside the horseshoe, either side of the river
  const valley = scatter(26, [-50, 50, -40, 140], { seed: 9, gap: 9, avoid: [[-11, 11, -60, 200]] }).filter(([x, z]) => z > 10 || Math.hypot(x, z / 0.8) < 48);
  g.add(trees(valley, { kind: 'neem', seed: 10, y: 0.2 }));
  g.add(asiBoard('Ajanta Caves', 16, 70, -Math.PI / 2, { line2: 'WORLD HERITAGE SITE' }));
}
