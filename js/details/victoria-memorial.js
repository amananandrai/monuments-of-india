import * as THREE from 'three';
import { M, box, at, onFace, FACES } from '../helpers.js';
import { rosette, windowFrame, mergeByMaterial } from './components.js';
import { corinthianCapital, entablature, figure } from './sculpture.js';
import { allegory, hold } from './figures.js';
import { detail } from '../detail.js';
import { balustrade, GLASS } from './colonial.js';
import { trees, shrubs, lampPosts, scatter, along } from './realism.js';

// The Victoria Memorial, finer detail. From photographs: a balustrade runs along the roof of the
// main block between the corner pavilions; each pavilion opens in a tall arched window on its two
// outer faces and is ringed by a balustrade under its cupola; the columns round the drum stand on
// bases and carry Corinthian capitals; carved roundels are set between the upper windows.
// Dimensions follow js/monuments/victoria-memorial.js: terrace b = 3.5, the block 84 × 56 and 18 high.
function architecture(f) {
  const d = new THREE.Group(), b = 3.5, Mb = M.marble, Sh = M.marbleShade;
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) < 0.5, dist = long ? 28 : 42, span = long ? 62 : 34;
    if (a === 0) for (const x of [-22.5, 22.5]) d.add(at(balustrade(17, 1.4, Mb, { t: 0.5 }), x, b + 19.2, 28.6));
    else d.add(onFace(at(balustrade(span - 1, 1.4, Mb, { t: 0.5 }), 0, b + 19.2, 0), a, dist + 0.6));
    for (let k = -2; k <= 2; k++) {
      const lat = (k + 0.5 * Math.sign(k || 1)) * (long ? 9 : 6);
      if (Math.abs(lat) > (long ? 26 : 16) || (a === 0 && Math.abs(lat) < 14)) continue;
      d.add(onFace(at(rosette(0.6, Sh, 10), 0, b + 10.4, 0), a, dist + 0.02, lat));
    }
  }
  for (const x of [-38, 38]) for (const z of [-24, 24]) {
    const t = at(new THREE.Group(), x, b, z);
    for (const a of [Math.atan2(Math.sign(x), 0), Math.atan2(0, Math.sign(z))]) t.add(onFace(at(windowFrame(3.2, 9, Sh, { shape: 'round', back: GLASS, frame: 0.4 }), 0, 4, 0), a, 7.01));
    for (const a of FACES) t.add(onFace(at(balustrade(13, 1, Mb, { t: 0.45 }), 0, 23, 0), a, 7.2));
    d.add(t);
  }
  const top = b + 19.2;
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2, x = Math.cos(a) * 15.6, z = Math.sin(a) * 15.6;
    d.add(box(1.4, 0.45, 1.4, Sh, x, top + 0.05, z), at(corinthianCapital(0.52, Mb), x, top + 7.25, z));
  }
  mergeByMaterial(d);
  f.add(d);
}

// An allegorical statue in marble on its pedestal, h tall overall, facing +z: a woman in classical
// drapery (js/details/figures.js), standing or seated, holding her attributes ([side, kind, opts]
// for hold()). On phones, a robed figure from the light kit.
function allegoryStatue(h, key, opts, held = [], { seat = false } = {}) {
  const g = new THREE.Group(), Mb = M.marble, Sh = M.marbleShade, ph = h * 0.16;
  g.add(box(h * 0.36, ph * 0.18, h * 0.36, Mb), box(h * 0.3, ph * 0.66, h * 0.3, Mb, 0, ph * 0.18), box(h * 0.36, ph * 0.16, h * 0.36, Mb, 0, ph * 0.84));
  const fh = h - ph;
  if (detail.low) return g.add(at(figure(fh, Sh, 'robed'), 0, ph, 0));
  const fig = allegory(key, opts, Sh, opts.seated ? 0.024 : 0.03), s = new THREE.Group();
  s.add(fig.mesh);
  for (const [side, kind, o] of held) hold(s, fig, side, kind, Sh, o);
  s.scale.setScalar(fh / (opts.seated ? 1.62 : 1.76));
  s.position.y = ph;
  return g.add(s);
}

// The sculpture and finer parts, after photographs: a carved entablature under the cornice of the
// main block; robed statues on the corners of each pavilion's roof and along the roof balustrade;
// the four allegories of Art, Architecture, Justice and Charity round the great dome; over the
// north porch the group of Motherhood (a mother with an infant in her arm and a child at her
// knee), with Prudence (her mirror) and Learning (an open book) either side; ribs running up the
// great dome; round-arched windows in the drums of the four cupolas and round the lantern. (The
// allegories' poses and attributes are the traditional ones; the sources name the figures but do
// not describe them.)
function sculpture(f) {
  const d = new THREE.Group(), b = 3.5, Mb = M.marble, Sh = M.marbleShade, top = b + 19.2;
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) < 0.5;
    if (a === 0) for (const x of [-22.5, 22.5]) d.add(at(entablature(17, 1.5, Mb, { carvedFrieze: true, depth: 0.5 }), x, b + 16.5, 28));
    else d.add(onFace(at(entablature(long ? 62 : 34, 1.5, Mb, { carvedFrieze: true, depth: 0.5 }), 0, b + 16.5, 0), a, long ? 28 : 42));
  }
  const statues = new THREE.Group(), robes = [['robe-a', { right: 'down', left: 'chest' }], ['robe-b', { right: 'chest', left: 'down', free: -1 }]];
  let n = 0;
  for (const x of [-38, 38]) for (const z of [-24, 24]) {
    const t = at(new THREE.Group(), x, 0, z);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const [k, o] = robes[n++ % 2]; statues.add(at(allegoryStatue(3.2, k, o), x + sx * 6.3, b + 23, z + sz * 6.3).rotateY(Math.atan2(sx, sz))); }
    for (let k = 0; k < 8; k++) t.add(onFace(at(windowFrame(0.9, 2, Sh, { shape: 'round', back: GLASS, frame: 0.14 }), 0, b + 23.4, 0), ((k + 0.5) / 8) * Math.PI * 2, 4.62));
    d.add(t);
  }
  for (const x of [-29, -16, 16, 29]) { const [k, o] = robes[n++ % 2]; statues.add(at(allegoryStatue(3, k, o), x, b + 19.2, 28.1)); }
  // Round the dome, on the roof at its four diagonals, each facing out: Art with her palette and
  // brush, Architecture with a column and a square, Justice with her sword and scales, and Charity
  // seated with a child at her knee, her hand held out.
  const round = [
    [-1, 1, 'art', { right: 'forward', left: 'chest' }, [['r', 'brush', { axis: 'arm' }], ['l', 'palette', { axis: [0, 0, 1] }]]],
    [1, 1, 'architecture', { right: 'down', left: 'chest' }, [['r', 'square', { axis: [0, -1, 0.3] }], ['l', 'column', { offset: [0, 0.02, 0.02] }]]],
    [-1, -1, 'justice', { right: 'down', left: 'raised' }, [['r', 'sword', { axis: [0, 1, 0.15] }], ['l', 'scales', {}]]],
    [1, -1, 'charity', { seated: true, child: true, right: 'out', left: 'lap' }, []],
  ];
  for (const [sx, sz, k, o, held] of round) statues.add(at(allegoryStatue(o.seated ? 3.6 : 3.8, k, o, held), sx * 13.8, top, sz * 13.8).rotateY(Math.atan2(sx, sz)));
  statues.add(at(allegoryStatue(4.2, 'motherhood', { seated: true, child: true, baby: true, right: 'lap', left: 'cradle' }), 0, b + 16.1, 35.4));
  statues.add(at(allegoryStatue(3.4, 'prudence', { right: 'forward', left: 'down' }, [['r', 'mirror', { axis: [0, 0.6, 1] }]]), -4.5, b + 16.1, 35.4));
  statues.add(at(allegoryStatue(3.4, 'learning', { right: 'chest', left: 'chest', free: -1 }, [['r', 'book', { axis: [0, 1, 0.5], offset: [0.08, 0.02, 0.03] }]]), 4.5, b + 16.1, 35.4));
  f.add(statues);
  // Ribs up the dome, following its profile (the lathe from y = top + 10).
  const prof = [[14.4, 0], [14.3, 3], [13.2, 7], [10.6, 10.8], [6.8, 13.6], [2.6, 15]];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, pts = prof.map(([r, y]) => new THREE.Vector3(Math.sin(a) * (r + 0.1), top + 10 + y, Math.cos(a) * (r + 0.1)));
    d.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, 0.2, 4, false), Sh));
  }
  const lt = top + 10 + 14.9;
  for (let k = 0; k < 8; k++) d.add(onFace(at(windowFrame(0.7, 1.7, Sh, { shape: 'round', back: GLASS, frame: 0.12 }), 0, lt + 0.7, 0), ((k + 0.5) / 8) * Math.PI * 2, 2.5));
  mergeByMaterial(d);
  f.add(d);
}


// The Victoria Memorial at Kolkata: flower beds along the main walk, the trees of the 64-acre
// garden, and lamps along the walk.
export function addDetails(f, g) {
  architecture(f);
  sculpture(f);
  g.add(shrubs([...along(14, [-8, 48], [-8, 160]), ...along(14, [8, 48], [8, 160])].map(([x, z]) => [x, z, 1.2]), { flowers: '#d0306f', seed: 5 }));
  g.add(trees(scatter(40, [-115, 115, -85, 165], { seed: 6, gap: 16, avoid: [[-60, 60, -45, 45], [-36, 36, 60, 160], [-10, 10, 40, 170]] }), { kind: 'banyan', seed: 6 }));
  g.add(lampPosts([...along(8, [-5.5, 44], [-5.5, 165]), ...along(8, [5.5, 44], [5.5, 165])]));
}
