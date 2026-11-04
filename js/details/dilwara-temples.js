import * as THREE from 'three';
import { M, mesh, cyl, at, onFace } from '../helpers.js';
import { mouldings, frieze, templeNiche, idol, petalRing, bracketGeo, placeAll, mergeByMaterial } from './components.js';
import { trees, scatter } from './realism.js';
import { figure } from './sculpture.js';
import { DOME } from '../monuments/dilwara-temples.js';

// Dilwara, finer detail. Plain outside, the temples are carved all over within: here the main
// shrine's walls get their base mouldings, carved bands and a niche with an image on each outer
// face; the pillars of the Ranga Mandapa carry bracket capitals; and from the centre of its dome
// hangs the famous carved pendant (the lotus "kalpavriksha" pendant), a cluster of petals and
// drops seen through the open hall. Dimensions follow js/monuments/dilwara-temples.js.
function architecture(f) {
  const d = new THREE.Group(), Mb = M.marble, Sh = M.marbleShade;
  const s = at(new THREE.Group(), 0, 1.5, -16);
  s.add(mouldings(10, 10, [[0, 0.4, 0.25, Sh], [0.4, 0.35, 0.12, frieze(Mb)], [6.6, 0.5, 0.08, frieze(Mb)], [7.4, 0.6, 0.3, Sh]], Mb));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) s.add(onFace(at(templeNiche(1.6, 3, Mb, { figure: idol(2.6, Mb) }), 0, 1.6, 0), a, 5));
  d.add(s);
  const br = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const x = -6 + i * 4, z = 9 - 6 + j * 4;
    for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) br.push([x + Math.sin(a) * 0.45, 9, z + Math.cos(a) * 0.45, a]);
  }
  d.add(placeAll(bracketGeo(0.9, 0.8, 0.3), br, Mb));
  // The ceiling inside the dome: concentric rings of carving corbelled in towards the centre, each
  // a little higher, and round its foot sixteen brackets, each a dancing goddess (vidyadevi) leaning
  // out from the drum.
  const shellY = (r) => { for (let k = 1; k < DOME.length; k++) { const [r0, y0] = DOME[k - 1], [r1, y1] = DOME[k]; if (r <= r0 && r >= r1) return y0 + ((y1 - y0) * (r0 - r)) / (r0 - r1); } return 4; };
  for (const [r, t] of [[7.6, 0.32], [6.6, 0.28], [5.6, 0.26], [4.6, 0.24], [3.6, 0.22], [2.7, 0.2]]) {
    const ring = mesh(new THREE.TorusGeometry(r, t, 6, 48), Mb, 0, 10.2 + shellY(r) - t * 1.6, 9);
    ring.rotation.x = Math.PI / 2;
    d.add(ring);
    for (let k = 0; k < Math.round(r * 4); k++) { const a = (k / Math.round(r * 4)) * Math.PI * 2; d.add(at(mesh(new THREE.SphereGeometry(t * 0.8, 6, 4), Mb), Math.cos(a) * r, 10.2 + shellY(r) - t * 2.4, 9 + Math.sin(a) * r)); }
  }
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, o = figure(1.7, Mb, 'dancer');
    o.position.set(Math.sin(a) * 7.7, 8.5, 9 + Math.cos(a) * 7.7);
    o.rotation.set(0, a + Math.PI, 0);
    o.rotateX(-0.35);
    d.add(o);
  }
  // The pendant, hanging from the dome (which springs at y = 10.2).
  const p = at(new THREE.Group(), 0, 10.1, 9);
  for (const [y, r, n] of [[-0.2, 2.2, 16], [-0.8, 1.6, 12], [-1.4, 1.0, 10]]) p.add(at(petalRing(r, n, 1.0, 0.6, Math.PI - 0.5, Mb), 0, y, 0));
  p.add(cyl(0.3, 0.9, 1.6, Mb, 0, -1.6, 0, 12), at(mesh(new THREE.SphereGeometry(0.45, 12, 8), Mb), 0, -2.2, 0));
  d.add(p);
  mergeByMaterial(d);
  f.add(d);
}

// The Dilwara temples on Mount Abu: the mango and jamun woods of the Aravalli round the plain outer
// walls.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees(scatter(30, [-62, 62, -68, 68], { seed: 5, gap: 10, avoid: [[-30, 30, -42, 42], [-8, 8, 30, 70]] }), { kind: 'mango', seed: 5 }));
}
