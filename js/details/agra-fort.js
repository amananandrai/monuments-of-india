import { M, mat, box, at, curvedBand } from '../helpers.js';
import { trees, shrubs, lampPosts, asiBoard, fountains, along } from './realism.js';

// Agra Fort: the moat that still rings the land walls (dry and grassed, with a little water in its
// bed), the causeway over it to the Amar Singh Gate and the road up to it, lit by heritage lamps,
// and the Anguri Bagh, the formal garden of square beds and fountains below the Khas Mahal.
const MOAT = mat('#5f7a45', 0.95);
export function addDetails(f, g) {
  const R = 125, arc = [];
  for (let k = 0; k <= 60; k++) { const t = (k / 60) * Math.PI; arc.push([Math.cos(t) * R, Math.sin(t) * R, Math.cos(t), Math.sin(t)]); }
  g.add(curvedBand(arc, 12, 26, 0.02, 0.3, MOAT), curvedBand(arc, 17, 21, 0.04, 0.34, M.river));
  // The causeway across the moat to the gate, and the road beyond
  const ta = Math.PI * 0.72, c = Math.cos(ta), s = Math.sin(ta), ry = Math.PI / 2 - ta;
  g.add(at(box(9, 0.6, 30, M.path), c * 148, 0, s * 148).rotateY(ry));
  f.add(lampPosts(along(6, [c * 140 - s * 6, s * 140 + c * 6], [c * 175 - s * 6, s * 175 + c * 6]).concat(along(6, [c * 140 + s * 6, s * 140 - c * 6], [c * 175 + s * 6, s * 175 - c * 6]))));
  f.add(asiBoard('Agra Fort', c * 160 + s * 9, s * 160 - c * 9, ry + Math.PI));
  // Anguri Bagh: four lawns with clipped hedges round a marble fountain, below the Khas Mahal
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(box(14, 0.3, 10, M.grass, -10 + x * 8.5, 0, 33 + z * 6.5));
  f.add(box(3, 0.5, 3, M.marble, -10, 0, 33), fountains([[-10, 33], [-10, 22], [-10, 44]], { y: 0.5, h: 1.6 }));
  f.add(shrubs([...along(10, [-27, 25], [-27, 41]), ...along(10, [7, 25], [7, 41])].map(([x, z]) => [x, z, 0.9]), { y: 0.3 }));
  // Shade trees in the inner courts
  f.add(trees([[-60, 40], [-75, 70], [60, 40], [72, 72], [-40, 95], [40, 95], [-90, 45], [90, 45]], { kind: 'neem', seed: 4 }));
  f.add(trees(along(6, [-30, 82], [30, 82]), { kind: 'ashoka', seed: 5 }));
}
