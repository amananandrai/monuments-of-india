import { trees } from './realism.js';

// Shikharji in the Parasnath hills: the forest that covers the hills up to the summit shrines.
export function addDetails(f, g) {
  const H = 90;
  // The forest on the ridge: the hill narrows from 160 × 96 at its foot to 100 × 60 at the top.
  const slope = [];
  for (let i = 0; i < 110; i++) {
    const t = 0.1 + ((i * 37) % 100) / 115, a = (i * 2.399) % (Math.PI * 2), rx = 160 - 60 * t, rz = 96 - 36 * t;
    slope.push([Math.cos(a) * rx * 0.98, Math.sin(a) * rz * 0.98, null, t * H - 0.5]);
  }
  g.add(trees(slope, { kind: 'mango', seed: 5, h: 10 }));
}
