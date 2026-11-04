// Research prototype for docs/realistic-statues-research.md, not used by the site yet. Each figure
// returns { f, lo, hi }: its distance function and a bounding box; mesh it with
// surfaceNets(f, lo, hi, h) from sdf.js (h = 0.08 for the animals, 0.2 for the Shiva).
import { ellipsoid as E, cone, chain, blend, mirrorX, smin, smax } from './sdf.js';
const flatBase = (f) => (x, y, z) => smax(f(x, y, z), -y, 0.04);

// An Indian elephant, facing +z, standing at y = 0, about 3.6 m to the top of its head.
export function elephantSDF() {
  const body = blend([
    [E([0, 2.3, 0], [1.12, 1.12, 1.75]), 0],
    [E([0, 1.95, 0.1], [1.02, 0.9, 1.4]), 0.4],
    [E([0, 2.3, -1.15], [1.0, 1.05, 0.9]), 0.45],
    [E([0, 2.5, 0.95], [1.02, 1.1, 0.9]), 0.45],
    [E([0, 2.75, 1.55], [0.82, 0.85, 0.6]), 0.4],
    [E([0, 2.85, 1.95], [0.78, 0.92, 0.72]), 0.35],
    [mirrorX(E([0.3, 3.5, 1.85], [0.38, 0.36, 0.42])), 0.25],
    [chain([[0, 2.7, 2.5, 0.38], [0, 2.15, 2.85, 0.3], [0, 1.5, 2.95, 0.22], [0, 0.9, 2.9, 0.17], [0, 0.45, 2.75, 0.13], [0, 0.32, 2.52, 0.11]], 0.15), 0.3],
    [mirrorX(E([0.95, 2.72, 1.45], [0.14, 0.8, 0.66])), 0.1],
    [mirrorX(cone([0.62, 2.0, 1.0], [0.6, 0.15, 1.12], 0.44, 0.38)), 0.35],
    [mirrorX(cone([0.62, 2.0, -1.1], [0.6, 0.15, -1.15], 0.48, 0.38)), 0.35],
    [mirrorX(E([0.6, 0.16, 1.15], [0.43, 0.2, 0.43])), 0.12],
    [mirrorX(E([0.6, 0.16, -1.15], [0.43, 0.2, 0.43])), 0.12],
    [chain([[0, 2.6, -1.95, 0.08], [0, 2.0, -2.12, 0.06], [0, 1.3, -2.08, 0.05]], 0.1), 0.12],
    [mirrorX(chain([[0.3, 2.35, 2.35, 0.14], [0.37, 2.0, 2.75, 0.1], [0.32, 1.98, 3.15, 0.05]], 0.03)), 0.06],
  ]);
  // Eye sockets.
  const eye = mirrorX(E([0.7, 2.95, 2.2], [0.1, 0.08, 0.1]));
  const f = flatBase((x, y, z) => smin(body(x, y, z), eye(x, y, z), 0.05));
  return { f, lo: [-1.6, -0.05, -2.4], hi: [1.6, 4.05, 3.4] };
}

// A recumbent Nandi, facing +z, lying at y = 0, about 3.4 m to the tips of its horns: folded legs,
// hump, dewlap, raised head with horns, and a garland of bells round the neck.
export function nandiSDF() {
  const garland = [];
  for (let k = 0; k <= 24; k++) {
    const a = (k / 24) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    garland.push([s * 0.72, 1.85 - c * 0.45, 1.55 + c * 0.3, 0.075]);
  }
  const bells = [];
  for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) bells.push(E([Math.sin(a) * 0.72, 1.85 - Math.cos(a) * 0.45 - 0.12, 1.55 + Math.cos(a) * 0.3 + 0.03], [0.1, 0.13, 0.1]));
  const body = blend([
    [E([0, 1.15, -0.3], [1.12, 0.98, 1.9]), 0],
    [E([0, 1.25, 0.95], [1.02, 1.05, 1.0]), 0.5],
    [E([0, 2.05, 0.85], [0.55, 0.5, 0.62]), 0.45],
    [E([0, 0.4, 0], [1.3, 0.42, 2.05]), 0.35],
    [mirrorX(chain([[0.7, 0.7, 1.4, 0.32], [0.78, 0.32, 1.9, 0.24], [0.6, 0.2, 2.3, 0.2]], 0.2)), 0.2],
    [mirrorX(E([0.58, 0.15, 2.38], [0.22, 0.15, 0.2])), 0.08],
    [mirrorX(E([0.92, 0.85, -1.3], [0.45, 0.72, 0.85])), 0.35],
    [mirrorX(chain([[1.05, 0.3, -0.75, 0.22], [1.02, 0.2, -0.1, 0.17]], 0.15)), 0.15],
    [chain([[0, 1.9, 1.2, 0.6], [0, 2.2, 1.8, 0.45]], 0.3), 0.4],
    [chain([[0, 2.5, 1.95, 0.42], [0, 1.78, 2.5, 0.3]], 0.2), 0.25],
    [E([0, 1.62, 2.55], [0.3, 0.24, 0.26]), 0.15],
    [E([0, 1.45, 1.8], [0.17, 0.55, 0.5]), 0.25],
    [mirrorX(chain([[0.2, 2.75, 1.88, 0.11], [0.45, 3.0, 1.78, 0.08], [0.5, 3.32, 1.88, 0.04]], 0.05)), 0.05],
    [mirrorX(E([0.5, 2.45, 1.82], [0.3, 0.09, 0.14])), 0.08],
    [chain([[0, 1.4, -2.1, 0.09], [0.5, 0.35, -1.9, 0.07], [0.95, 0.2, -1.0, 0.06]], 0.08), 0.08],
    [chain(garland, 0.03), 0.03],
    ...bells.map((b) => [b, 0.02]),
  ]);
  const eye = mirrorX(E([0.38, 2.28, 2.3], [0.08, 0.06, 0.08]));
  const f = flatBase((x, y, z) => smax(body(x, y, z), -eye(x, y, z), 0.03));
  return { f, lo: [-1.6, -0.05, -2.5], hi: [1.6, 3.5, 3.0] };
}

// The great seated Shiva at Nageshwar, in the same pose and at the same size as the figure built
// from separate primitives in nageshwar-temple.js: one skin from the hips to the neck, with the
// chest, belly, shoulders, elbows and knees modelled. The head, hair and serpent stay as meshes.
export function shivaSDF() {
  const legs = mirrorX(blend([
    [cone([2.6, 6.6, 0], [6.2, 5.8, 3.2], 2.3, 1.9), 0],
    [E([5.9, 6.0, 3.1], [1.9, 1.7, 1.8]), 0.8],
  ]));
  // The crossed shins, each passing in front of the other ankle, and the soles turned up.
  const shins = blend([
    [cone([6.2, 5.6, 3.4], [-3.6, 5.4, 4.6], 1.7, 1.25), 0],
    [cone([-6.2, 5.6, 3.6], [3.6, 5.2, 5.0], 1.7, 1.25), 0],
    [E([-4.2, 6.4, 4.5], [1.1, 0.7, 2.0]), 0.5],
    [E([4.2, 6.2, 4.9], [1.1, 0.7, 2.0]), 0.5],
  ]);
  const body = blend([
    [E([0, 6.6, 0.4], [5.0, 2.3, 3.8]), 0],
    [legs, 1.2],
    [shins, 0.6],
    [E([0, 9.4, 0], [3.6, 2.6, 2.7]), 1.6],
    [E([0, 10.6, 1.4], [3.0, 2.6, 1.6]), 1.2],
    [E([0, 13.6, 0.1], [4.9, 3.0, 3.2]), 1.6],
    [mirrorX(E([2.0, 14.6, 1.9], [2.4, 1.15, 0.95])), 1.3],
    [E([0, 15.9, -0.2], [5.0, 1.5, 2.7]), 1.2],
    [mirrorX(E([4.6, 16.0, 0], [1.75, 1.6, 1.6])), 0.9],
    [cone([0, 16.8, 0], [0, 19.6, 0.2], 1.35, 1.2), 0.8],
    // Right arm raised in blessing, left resting on the knee
    [cone([4.9, 15.6, 0.2], [6.6, 12.4, 1.6], 1.2, 0.95), 0.7],
    [cone([6.6, 12.4, 1.6], [6.9, 15.8, 3.4], 0.95, 0.72), 0.4],
    [E([6.9, 16.8, 3.7], [0.55, 1.45, 1.05]), 0.35],
    [chain([[6.9, 17.8, 3.15, 0.22], [6.9, 19.0, 3.25, 0.2]], 0.1), 0.15],
    [chain([[6.9, 17.9, 3.55, 0.22], [6.9, 19.2, 3.65, 0.2]], 0.1), 0.15],
    [chain([[6.9, 17.9, 3.95, 0.22], [6.9, 19.1, 4.05, 0.2]], 0.1), 0.15],
    [chain([[6.9, 17.7, 4.3, 0.2], [6.9, 18.8, 4.4, 0.18]], 0.1), 0.15],
    [chain([[6.95, 16.4, 4.5, 0.22], [7.0, 17.3, 5.1, 0.18]], 0.1), 0.2],
    [cone([-4.9, 15.6, 0.2], [-6.4, 12.2, 1.4], 1.2, 0.95), 0.7],
    [cone([-6.4, 12.2, 1.4], [-6.2, 8.4, 3.6], 0.95, 0.75), 0.4],
    [E([-6.1, 7.7, 4.2], [1.05, 0.65, 1.6]), 0.4],
  ]);
  const navel = E([0, 10.2, 2.95], [0.25, 0.3, 0.3]);
  const f = (x, y, z) => smax(smax(body(x, y, z), -navel(x, y, z), 0.15), 3.6 - y, 0.2);
  return { f, lo: [-9.5, 3.4, -4.5], hi: [9.5, 20.4, 7.6] };
}
