import * as THREE from 'three';
import { flat, mesh, box, at, onFace, FACES, kalash } from '../helpers.js';
import { dravidaDress, trabeateGate, wallWithGaps } from '../parts/temples.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { kuta, shala } from '../parts/sculpture.js';
import { addDetails, GRANITE as S, SHADE as Sd, DIMS } from '../details/gangaikonda-cholapuram.js';

// The Brihadisvara temple of Gangaikonda Cholapuram, built about 1035 by Rajendra Chola I for the
// capital he founded after his march to the Ganges. It faces east (+z). The sanctum stands on a
// base about 30.5 m (100 ft) square, its walls in two storeys, and over it the vimana of nine
// storeys in all, 55 m high. Unlike the straight pyramid at Thanjavur, its storeys narrow quickly
// at first and then more slowly, so that its corners curve gently inward; it ends in a square neck
// and an octagonal dome. Before it the vestibule (ardha-mandapa, about 20 m), entered also from
// north and south up flights of steps between giant door guardians; then the long, low hall
// (maha-mandapa, about 53 m) of a hundred and forty pillars. On the axis outside, the great Nandi;
// round all, the walled court, its east gopuram fallen to its stone base.
export function buildGangaikondaCholapuram() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { VW, H1, H2, vz, az, aw, al, mz, mw, ml, MH } = DIMS;
  // The sanctum: a lower storey H1 high on its moulded base, an upper storey set back a little.
  f.add(box(VW, H1, VW, S, 0, 0, vz), at(dravidaDress(VW, VW, H1, S, { eaveM: Sd }), 0, 0, vz));
  const W2 = VW - 1.6;
  f.add(box(W2, H2, W2, S, 0, H1, vz), at(dravidaDress(W2, W2, H2, S, { eaveM: Sd, base: false }), 0, H1, vz));
  // The vimana's seven upper storeys, narrowing on a curve: quickly at first, then slowly, so that
  // the profile is concave. On the ledge of each, its parapet of miniature shrines.
  const tiers = 7, th = 3.9, w0 = W2 - 2.6, w1 = 8.6, hara = new THREE.Group();
  let y = H1 + H2 + 0.4;
  const widths = [];
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1), w = w1 + (w0 - w1) * Math.pow(1 - t, 1.45);
    widths.push(w);
    f.add(box(w, th * 0.72, w, S, 0, y, vz), box(w + 0.9, th * 0.28, w + 0.9, Sd, 0, y + th * 0.72, vz));
    const k = Math.max(0.8, w * 0.075), ky = y + th;
    if (i < tiers - 1) {
      for (const x of [-1, 1]) for (const z of [-1, 1]) hara.add(at(kuta(k, S), x * (w / 2 - k / 2), ky, vz + z * (w / 2 - k / 2)));
      for (const a of FACES) { const o = onFace(at(shala(w * 0.3, k, S), 0, ky, 0), a, w / 2 - k / 2); o.position.z += vz; hara.add(o); }
    }
    y += th;
  }
  f.add(mergeByMaterial(hara));
  // The neck (griva) and the octagonal dome (shikhara) with its kalash.
  f.add(box(7.4, 2.4, 7.4, Sd, 0, y, vz));
  const dome = mesh(new THREE.SphereGeometry(5.4, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), flat(S), 0, y + 2.4, vz);
  dome.rotation.y = Math.PI / 8;
  dome.scale.y = 0.9;
  f.add(dome, at(kalash(2.2), 0, y + 2.4 + 4.8, vz));
  // The vestibule: walled, its roof at the height of the sanctum's first storey; on its north and
  // south, the side entrances up their flights of steps.
  f.add(box(aw, H1 - 1, al, S, 0, 0, az), at(dravidaDress(aw, al, H1 - 1, S, { eaveM: Sd }), 0, 0, az));
  for (const s of [-1, 1]) {
    const e = new THREE.Group();
    e.add(box(7, 3.2, 6, Sd, 0, 0, 3), at(steps(4.4, 3.2, 10, S), 0, 0, 6));
    for (const x of [-3.2, 3.2]) e.add(box(0.8, 4.4, 6.4, S, x, 0, 3.1));
    e.add(at(templeDoorway(2.2, 4.2, { m: S, guardianH: 2.8, bands: 4 }), 0, 3.2, 0.02));
    const o = onFace(mergeByMaterial(e), s * Math.PI / 2, aw / 2);
    o.position.z += az;
    f.add(o);
  }
  // The great hall: long and low, its flat roof edged with miniature shrines; its east door up a
  // flight of steps.
  f.add(box(mw, MH, ml, S, 0, 0, mz), at(dravidaDress(mw, ml, MH, S, { eaveM: Sd }), 0, 0, mz));
  f.add(box(mw - 6, 1.2, ml - 6, Sd, 0, MH + 0.1, mz));
  f.add(box(9, 2, 5, Sd, 0, 0, mz + ml / 2 + 2.5), at(steps(6, 2, 6, S), 0, 0, mz + ml / 2 + 5));
  f.add(at(templeDoorway(2.6, 4.6, { m: S, guardianH: 2.6, bands: 4 }), 0, 2, mz + ml / 2 + 0.02));
  addDetails(f, g);
  // From the south-east, the hall in front and the curving vimana over it.
  return { group: g, focus: f, view: [0.85, 0.22, 1], zoom: 0.65 };
}

// The court: the wall round it and the stone base of the fallen east gopuram. Part of the setting.
export function enclosure(g) {
  const { ex, ez0, ez1 } = DIMS;
  const EW = ex * 2, ED = ez1 - ez0, ec = (ez0 + ez1) / 2;
  g.add(wallWithGaps('x', EW, 4.2, 1.6, Sd, [[0, 14]], 0, ez1), box(EW, 4.2, 1.6, Sd, 0, 0, ez0));
  for (const s of [-1, 1]) g.add(box(1.6, 4.2, ED, Sd, s * ex, 0, ec));
  g.add(at(trabeateGate(22, 7.5, 12, 4.4, 6.2, { m: S, trim: Sd, guardians: true }), 0, 0, ez1));
}
