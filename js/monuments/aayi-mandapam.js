import * as THREE from 'three';
import { mat, mesh, box, cyl, at, onFace, FACES, hemi, archWall, planPrism, ribbed, lathe } from '../helpers.js';
import { pediment } from '../parts/colonial.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/aayi-mandapam.js';

// Aayi Mandapam, Bharathi Park, Puducherry: the white pavilion of about 1854 that marks the tank of
// Aayi, from photographs (Wikimedia Commons: "Aayi Mandapam in Bharathi Park, Puducherry",
// "Puducherry-Bharathi Park-Aayi Mandapam-WUS02289"). A square core some 7.6 m across, pierced both
// ways by a tall round arch at ground level, so the two passages cross under it. Against each face
// stands a portico of four fluted Doric columns in two pairs, on a podium 1.1 m high that the
// passage cuts through, so the plan is a Greek cross about 10 m over all. One entablature with a
// frieze of rosettes runs round the cross; over it an attic with a band of scrollwork and a
// pediment on each arm, their roofs meeting under a low dome of fish-scale tiles, and on the dome
// a great leafy urn: about 12.5 m to its top. Lime plaster, painted white throughout, stained
// dark on the cornices. Faces the four ways; the park's main avenue meets it from the south (+z).
export const WHITE = mat('#f4f2ec', 0.75), SHADE = mat('#dcd7cc', 0.85), DARK = mat('#5b5650', 0.9);
const STAIN = mat('#b9b4a8', 0.9);
// A Greek-cross plan: arms of half-width a reaching to e, round a square of half-width c.
export const cross = (a, c, e) => [[-a, -e], [a, -e], [a, -c], [c, -c], [c, -a], [e, -a], [e, a], [c, a], [c, c], [a, c], [a, e], [-a, e], [-a, c], [-c, c], [-c, a], [-e, a], [-e, -a], [-c, -a], [-c, -c], [-a, -c]];

// A fluted Doric column of foot radius r and height h on y = 0: twenty flutes meeting in arrises,
// a low base ring, a necking, a spreading echinus and a square abacus.
function doric(r, h, m) {
  const g = new THREE.Group(), n = 20;
  g.add(cyl(r * 1.12, r * 1.18, 0.12, m, 0, 0, 0, 20));
  g.add(ribbed(cyl(r * 0.86, r, h - 0.54, m, 0, 0.12, 0, n * (detail.low ? 2 : 4)), n, -0.05));
  g.add(cyl(r * 0.93, r * 0.93, 0.07, m, 0, h - 0.5, 0, 20), cyl(r * 1.28, r * 0.9, 0.2, m, 0, h - 0.36, 0, 20), box(r * 2.75, 0.16, r * 2.75, m, 0, h - 0.16, 0));
  return g;
}

export function buildAayiMandapam() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // P: the podium. C: the core. PW: a portico's width; PJ: how far it stands out from the core.
  // CH: the columns. Levels: E under the entablature, K under the cornice, A the attic's foot,
  // T its top (the pediments' and the dome's foot).
  const P = 1.1, C = 7.6, PW = 6.1, PJ = 1.25, CH = 4.7, G = 1.03, E = P + CH, K = E + 1.05, A = K + 0.5, T = A + 1.3;
  const c = C / 2, a = PW / 2, e = c + PJ, wt = 1.3, in_ = c - wt;
  // The core: four walls with the arch (2.06 m wide, 5.25 m to its crown) through each, and the
  // flat ceiling of the crossing.
  for (const [k, ang] of FACES.entries()) f.add(onFace(archWall(k % 2 ? C - 2 * wt : C, K, wt, G * 2, 5.25, false, WHITE), ang, c - wt / 2));
  f.add(box(C - 2 * wt + 0.2, 0.5, C - 2 * wt + 0.2, SHADE, 0, 5.6, 0));
  // The podium under the porticoes, in four pieces between the passages.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const q = [[G, in_], [in_, in_], [in_, G], [e + 0.3, G], [e + 0.3, a + 0.3], [c + 0.3, a + 0.3], [c + 0.3, c + 0.3], [a + 0.3, c + 0.3], [a + 0.3, e + 0.3], [G, e + 0.3]].map(([x, z]) => [sx * x, sz * z]);
    if (sx * sz < 0) q.reverse();
    f.add(planPrism(q, 0, P, WHITE));
  }
  // The porticoes: two pairs of columns before pilasters on the wall, and the entablature block
  // they carry.
  for (const ang of FACES) {
    const face = new THREE.Group();
    for (const s of [-1, 1]) for (const dx of [1.6, 2.55]) face.add(at(doric(0.4, CH, WHITE), s * dx, P, PJ - 0.5), box(0.74, CH, 0.14, WHITE, s * dx, P, 0.07));
    face.add(box(PW, K - E, PJ, WHITE, 0, E, PJ / 2));
    f.add(onFace(face, ang, c));
  }
  // The cornice round the cross, its soffit stained by the monsoon, and the attic above it with
  // its own capping.
  f.add(planPrism(cross(a + 0.22, c + 0.22, e + 0.22), K, 0.2, STAIN), planPrism(cross(a + 0.42, c + 0.42, e + 0.42), K + 0.2, 0.3, SHADE));
  f.add(planPrism(cross(a - 0.1, c - 0.1, e - 0.1), A, T - A - 0.16, WHITE), planPrism(cross(a + 0.12, c + 0.12, e + 0.12), T - 0.16, 0.16, STAIN));
  // A pediment on each arm and the gabled roof behind it; the four roofs meet under the dome.
  const gable = new THREE.Shape();
  gable.moveTo(-a - 0.1, 0); gable.lineTo(a + 0.1, 0); gable.lineTo(0, 1.4); gable.closePath();
  for (const [k, ang] of FACES.entries()) {
    f.add(onFace(at(pediment(PW + 0.5, 1.45, 0.8, WHITE, SHADE), 0, T, -0.8), ang, e + 0.1));
    if (k < 2) f.add(at(mesh(new THREE.ExtrudeGeometry(gable, { depth: 2 * e - 1.4, bevelEnabled: false }).translate(0, 0, -e + 0.7), STAIN), 0, T, 0).rotateY(ang));
  }
  // The dome, a low saucer, and the urn on it: a spreading foot, a collar, and a tall fluted vase
  // opening in a rim of curled leaves round a heap of fruit.
  const D = T + 0.35, dome = at(hemi(2.7, SHADE, 40), 0, D, 0);
  dome.scale.y = 0.6;
  const U = D + 1.55;
  f.add(dome, at(ribbed(lathe([[0.62, 0], [0.66, 0.1], [0.5, 0.22], [0.4, 0.4], [0.36, 0.52], [0.5, 0.58], [0.5, 0.68], [0.4, 0.74], [0.46, 0.95], [0.58, 1.25], [0.74, 1.55], [0.9, 1.8], [0.96, 1.92], [0.8, 2.0], [0.4, 2.02]], WHITE, 32), 12, 0.07), 0, U, 0));
  const top = at(hemi(0.6, WHITE, 12), 0, U + 1.98, 0);
  top.scale.y = 0.5;
  f.add(top);
  addDetails(f, g, { P, C, PW, PJ, CH, G, E, K, A, T, D, U });
  // From the south-east, down the avenue of the park.
  return { group: g, focus: f, view: [0.75, 0.22, 1], zoom: 1.35 };
}
