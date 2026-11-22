import * as THREE from 'three';
import { M, mat, mesh, box, at, onFace, FACES, shikhara, nagaraProfile, flag, kalash } from '../helpers.js';
import { mergeByMaterial, chhajja, cuspedArchGeo, railing, mouldings, frieze, templeNiche, idol, lotusDome, petalRing } from '../parts/components.js';
import { carvedPillar } from '../parts/temples.js';
import { steps } from '../parts/doorways.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/prem-mandir.js';

// Prem Mandir, Vrindavan (2001–2012), from photographs: a temple of white Italian marble on a
// raised platform 128 ft (39 m) square, its two storeys carved all over. The ground storey is ringed
// by a verandah of carved pillars, a cusped arch between each pair, under a deep eave; a portico on
// each face, the front one wider, steps up to it. The upper storey stands back behind a balcony with
// a pierced railing and its own arcade. Over it rises the main spire, its foot clustered with
// smaller spires, and on the corners of each roof stand domed kiosks and little spires. The gold
// kalash and saffron flag stand 125 ft (38 m) over the ground. Faces +z (east).
export const WHITE = mat('#f4f1ea', 0.4), CARVE = mat('#e2dccf', 0.55), DARK = mat('#5c544c', 0.9);
// Heights: the platform's two tiers, the ground storey (G), its parapet, the upper storey (U).
export const P1 = 1.2, P2 = 3.6, G = 8.2, U = 6.6;
export const W0 = 28, W1 = 20;   // the ground storey's core and the upper storey, square

// A storey's arcade: carved pillars at spacing ~3.4 m round a square of side w, cusped arches between
// them, a beam over them, and a chhajja; open bays at the middle of the given faces left for porticos.
function arcade(w, h, m, carve, { open = [], gap = 0 } = {}) {
  const g = new THREE.Group(), n = Math.round(w / 3.4), step = w / n;
  for (let i = 0; i <= n; i++) {
    const t = -w / 2 + i * step;
    for (const a of FACES) {
      const sx = Math.sin(a), cz = Math.cos(a), x = sx * (w / 2) + cz * t, z = cz * (w / 2) - sx * t;
      if (i === n) continue;   // the corner is the next face's first pillar
      g.add(at(carvedPillar(h - 1.4, m), x, 0, z));
    }
  }
  for (const a of FACES) for (let i = 0; i < n; i++) {
    const t = -w / 2 + (i + 0.5) * step;
    if (open.includes(a) && Math.abs(t) < gap) continue;
    const arch = mesh(cuspedArchGeo(step - 0.95, 1.6, 0.25), carve);
    g.add(onFace(at(arch, 0, h - 1.4, 0), a, w / 2, t));
  }
  for (const a of FACES) {
    g.add(onFace(at(box(w + 1.2, 1.4, 0.9, m), 0, h - 1.4, 0), a, w / 2));
    g.add(onFace(at(chhajja(w + 3.2, 1.3, 0.5, 0.16, m), 0, h, 0), a, w / 2 + 0.45));
  }
  return mergeByMaterial(g);
}

// A domed kiosk on four pillars, for the roofs' corners.
function kiosk(r, h, m) {
  const g = new THREE.Group();
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(at(carvedPillar(h, m), x * r * 0.7, 0, z * r * 0.7));
  g.add(box(r * 2.1, 0.35, r * 2.1, m, 0, h), at(chhajja(r * 2.4, 0.4, 0.2, 0.08, m), 0, h + 0.35, r * 1.05));
  for (const a of [Math.PI / 2, Math.PI, -Math.PI / 2]) g.add(onFace(at(chhajja(r * 2.4, 0.4, 0.2, 0.08, m), 0, h + 0.35, 0), a, r * 1.05));
  const d = lotusDome(r * 0.95, m, { ribs: 12, petals: 12 });
  g.add(at(d, 0, h + 0.35, 0), at(kalash(r * 0.35), 0, h + 0.35 + r * 1.75, 0));
  return g;
}

// A portico before a face: pillars, cusped arches, a cornice and a small spire over it. w wide, d deep.
function portico(w, d, h, m, carve) {
  const g = new THREE.Group(), c = new THREE.Group(), xs = w > 8 ? [-w / 2, -w / 6, w / 6, w / 2] : [-w / 2, 0, w / 2];
  for (const x of xs) c.add(at(carvedPillar(h - 1.4, m), x, 0, d), at(carvedPillar(h - 1.4, m), x, 0, d * 0.45));
  for (let k = 0; k + 1 < xs.length; k++) c.add(at(mesh(cuspedArchGeo(xs[k + 1] - xs[k] - 0.95, 1.9, 0.25), carve), (xs[k] + xs[k + 1]) / 2, h - 1.4, d));
  c.add(box(w + 1.2, 1.4, d + 0.9, m, 0, h - 1.4, d / 2 + 0.2), at(chhajja(w + 2.6, 1.2, 0.5, 0.16, m), 0, h, d + 0.4));
  c.add(box(w + 1.6, 0.9, d + 1.4, carve, 0, h, d / 2 + 0.2), box(w + 0.4, 0.5, d + 0.2, m, 0, h + 0.9, d / 2 + 0.2));
  g.add(mergeByMaterial(c));
  const sp = shikhara(Math.min(w * 0.55, 5.5), Math.min(w * 0.75, 7), m, nagaraProfile, 9, M.gold, 1.2);
  g.add(at(sp, 0, h + 1.4, d / 2 + 0.2));
  return g;
}

export function buildPremMandir() {
  const S = WHITE, C = CARVE, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The platform: a broad low tier and the raised terrace, with steps up the middle of every face.
  f.add(box(48, P1, 48, C), box(39, P2 - P1, 39, S, 0, P1, 0));
  f.add(mouldings(39, 39, [[P1 + 0.2, 0.4, 0.12, C], [P2 - 0.7, 0.45, 0.1, frieze(C)], [P2 - 0.2, 0.2, 0.2, S]], S));
  for (const a of FACES) {
    f.add(onFace(at(steps(a === 0 ? 14 : 7, P2 - P1, 6, S), 0, P1, 0), a, 19.5));
    f.add(onFace(at(steps(a === 0 ? 18 : 9, P1, 3, C), 0, 0, 0), a, 24));
  }
  // The ground storey: a core, the verandah arcade round it, and its four porticos.
  const y1 = P2, y2 = y1 + G + 0.9;
  f.add(box(W0, G, W0, S, 0, y1), box(W0 + 6.2, 0.6, W0 + 6.2, C, 0, y1 - 0.01));
  f.add(at(arcade(W0 + 6, G, S, C, { open: FACES, gap: 4 }), 0, y1, 0));
  f.add(box(W0 + 6.6, 0.4, W0 + 6.6, S, 0, y1 + G + 0.01), box(W0 + 6.2, 0.5, W0 + 6.2, C, 0, y1 + G + 0.41));
  f.add(onFace(at(portico(12, 4.5, G, S, C), 0, y1, 0), 0, (W0 + 6) / 2));
  for (const a of [Math.PI / 2, Math.PI, -Math.PI / 2]) f.add(onFace(at(portico(7, 3.4, G, S, C), 0, y1, 0), a, (W0 + 6) / 2));
  // The balcony round the upper storey: a pierced railing at the roof's edge.
  const rail = new THREE.Group();
  for (const a of FACES) rail.add(onFace(at(railing(W0 + 5.4, 1.1, 0.25, S), 0, y2, 0), a, (W0 + 5.4) / 2));
  f.add(mergeByMaterial(rail));
  // The upper storey: its core and arcade, a band of niches with images round the core.
  const y3 = y2 + U;
  f.add(box(W1 - 3, U, W1 - 3, S, 0, y2), at(arcade(W1, U, S, C), 0, y2, 0));
  f.add(box(W1 + 2, 0.5, W1 + 2, C, 0, y3 + 0.01), box(W1 + 1.2, 1, W1 + 1.2, S, 0, y3 + 0.5));
  const nich = new THREE.Group();
  for (const a of FACES) for (const lat of [-5, 0, 5]) nich.add(onFace(at(templeNiche(1.3, 2.4, S, { figure: idol(2, C) }), 0, y2 + 1.2, 0), a, (W1 - 3) / 2, lat));
  for (const a of FACES) for (const lat of [-9, -3, 3, 9]) nich.add(onFace(at(templeNiche(1.5, 3, S, { figure: idol(2.4, C) }), 0, y1 + 1.5, 0), a, W0 / 2, lat));
  f.add(mergeByMaterial(nich));
  // The main spire, its foot ringed by four spires on its faces and four on its corners.
  const y4 = y3 + 1.5, main = shikhara(12.5, 14.2, S, nagaraProfile, 18, M.gold, 1.15);
  f.add(at(main, 0, y4, 0), at(flag(4.2, M.saffron, M.gold), 0, y4 + main.userData.top - 0.6, 0));
  for (const a of FACES) {
    f.add(onFace(at(shikhara(6.5, 8.2, S, nagaraProfile, 11), 0, y4, 0), a, 5.2));
    const c = onFace(at(shikhara(4.2, 5.2, S, nagaraProfile, 8), 0, y4, 0), a + Math.PI / 4, 8.4);
    c.rotation.y = 0;
    f.add(c);
  }
  // Ribbed amalakas on the main spire's corners, marking its storeys.
  const am = new THREE.SphereGeometry(1, 14, 6), amal = new THREE.Group();
  for (let k = 1; k <= 4; k++) {
    const t = k / 5, wt = 12.5 * nagaraProfile(t), yk = y4 + t * 14.2, r = wt * 0.085;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const o = mesh(am, S, sx * wt * 0.42, yk, sz * wt * 0.42); o.scale.set(r, r * 0.42, r); amal.add(o); }
  }
  f.add(mergeByMaterial(amal));
  // Kiosks on the corners of both roofs, and a lotus over each.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    f.add(at(kiosk(1.9, 3.2, S), sx * (W0 + 4) / 2, y2, sz * (W0 + 4) / 2));
    f.add(at(kiosk(1.4, 2.6, S), sx * (W1 / 2 + 0.2), y3 + 1.5, sz * (W1 / 2 + 0.2)));
  }
  if (!detail.low) f.add(at(petalRing(6.6, 24, 1.4, 0.9, 0.9, S), 0, y4, 0));
  addDetails(f, g, { y1, y2, y3, y4, S, C });
  // From the south-east, a little above the gardens.
  return { group: g, focus: f, view: [0.7, 0.3, 1], zoom: 0.85 };
}
