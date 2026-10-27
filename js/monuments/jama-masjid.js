import * as THREE from 'three';
import { M, box, cyl, group, at, archPanel, onionDome, finial, chhatri, minaret, domeBands } from '../helpers.js';

export function buildJamaMasjid() {
  const Rd = M.red, Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(200, 0.2, 200, M.path));
  const P = 6;
  f.add(box(110, P, 110, Rd), box(96, 0.2, 96, M.redLight, 0, P, 6));
  // Cloisters on three sides, with gateways east, north and south
  for (const [w, d, x, z] of [[110, 8, 0, 51], [8, 102, -51, 0], [8, 102, 51, 0]]) f.add(box(w, 7, d, Rd, x, P, z), box(w + 0.4, 0.5, d + 0.4, Mb, x, P + 7, z));
  const gate = (big) => {
    const w = big ? 24 : 18, h = big ? 18 : 15, gr = new THREE.Group();
    gr.add(box(w, h, 14, Rd), box(w + 0.4, 0.6, 14.4, Mb, 0, h - 0.6), at(archPanel(w * 0.42, h * 0.75, true, M.recess, 0.3), 0, 0.3, 7));
    for (const x of [-w / 2 + 2, w / 2 - 2]) gr.add(at(chhatri(1.8, 5.5, Rd, Mb), x, h, 5));
    gr.add(at(onionDome(3.2, Mb), 0, h, 0));
    return gr;
  };
  f.add(at(gate(true), 0, P, 51));
  for (let k = 0; k < 6; k++) f.add(box(34 - k * 2, P - k, 3, Rd, 0, 0, 59.5 + k * 3));
  for (const s of [-1, 1]) f.add(at(gate(false), s * 51, P, 0).rotateY(s * Math.PI / 2));
  // Prayer hall with eleven arches, three striped marble domes and two minarets
  const hz = -40;
  f.add(box(80, 14, 24, Rd, 0, P, hz), box(80.4, 0.6, 24.4, Mb, 0, P + 13.4, hz));
  f.add(box(18, 20, 1.2, Mb, 0, P, hz + 12.6), at(archPanel(12, 17, true, M.recess, 0.4), 0, P + 0.4, hz + 13.2));
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) f.add(at(archPanel(4.4, 8.5, true, M.recess, 0.3), s * (14 + k * 5.6), P + 0.5, hz + 12));
  [[-18, 7], [0, 9.5], [18, 7]].forEach(([x, r]) => {
    f.add(cyl(r * 0.92, r * 0.92, 3, Mb, x, P + 14, hz - 2, 32));
    f.add(at(onionDome(r, Mb), x, P + 17, hz - 2), domeBands(x, P + 17, hz - 2, r, M.stoneDark), at(finial(r * 0.6), x, P + 17 + r * 1.78, hz - 2));
  });
  for (const s of [-1, 1]) f.add(at(minaret(34, 2.2, Rd, { capM: Mb }), s * 40, P, hz + 12));
  f.add(box(16, 0.6, 12, Mb, 0, P, 8), box(14, 0.7, 10, M.water, 0, P, 8));
  for (const x of [-51, 51]) f.add(at(chhatri(3, 8, Rd, Mb), x, P + 7.5, 51));
  return { group: g, focus: f, view: [0.65, 0.42, 1.2] };
}
