import * as THREE from 'three';
import { flat, mesh, box, at, onFace, FACES, kalash } from '../helpers.js';
import { dravidaDress, trabeateGate, wallWithGaps, chandrashala } from '../parts/temples.js';
import { nandiGeometry } from '../parts/animals.js';
import { detail } from '../detail.js';
import { templeDoorway, steps, guardian } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { kuta, shala } from '../parts/sculpture.js';
import { addDetails, tiers, GRANITE as S, SHADE as Sd, PLASTER, DIMS } from '../details/gangaikonda-cholapuram.js';

// The Brihadisvara temple of Gangaikonda Cholapuram, built about 1035 by Rajendra Chola I for the
// capital he founded after his march to the Ganges. It faces east (+z), so north is +x. The sanctum
// stands on a base about 30.5 m (100 ft) square; over a high moulded base its walls rise 10.7 m
// (35 ft) in two storeys, each under a massive cornice, and over them the vimana of nine storeys in
// all, 55 m high. Unlike the straight pyramid at Thanjavur, its storeys narrow quickly at first and
// then more slowly, so that its corners curve gently inward; it ends in a neck with a Nandi at each
// corner and an octagonal dome with a great horseshoe gable, under a lion mask, on each side.
// Before it the two-storeyed vestibule (about 20 m), entered also from north and south up flights
// of steps between giant door guardians; then the long, low hall (maha-mandapa, about 53 m). On
// the axis outside, the great Nandi; round all, the walled court, its east gopuram fallen to its
// stone base.
export function buildGangaikondaCholapuram() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { VW, H1, H2, vz, az, aw, al, mz, mw, ml, MH } = DIMS;
  // The sanctum: a lower storey H1 high on its moulded base, an upper storey set back a little.
  f.add(box(VW, H1, VW, S, 0, 0, vz), at(dravidaDress(VW, VW, H1, S, { eaveM: Sd, hara: false }), 0, 0, vz));
  const W2 = VW - 1.6;
  f.add(box(W2, H2, W2, S, 0, H1, vz), at(dravidaDress(W2, W2, H2, S, { eaveM: Sd, base: false }), 0, H1, vz));
  // The vimana's seven upper storeys, narrowing on a curve: quickly at first, then slowly, so that
  // the profile is concave. On the ledge of each, its parapet of miniature shrines: a kuta at each
  // corner, a shala in the middle of each side and (desktops) a smaller shrine between them.
  const hara = new THREE.Group(), T = tiers(), top = T.at(-1).y + T.at(-1).h;
  T.forEach(({ y, h, w }, i) => {
    f.add(box(w, h * 0.72, w, S, 0, y, vz), box(w + 0.9, h * 0.28, w + 0.9, Sd, 0, y + h * 0.72, vz));
    const k = Math.max(0.8, w * 0.075), ky = y + h;
    if (i === T.length - 1) return;
    for (const x of [-1, 1]) for (const z of [-1, 1]) hara.add(at(kuta(k, S), x * (w / 2 - k / 2), ky, vz + z * (w / 2 - k / 2)));
    for (const a of FACES) {
      const o = onFace(at(shala(w * 0.3, k, S), 0, ky, 0), a, w / 2 - k / 2);
      o.position.z += vz;
      hara.add(o);
      if (!detail.low && w > 12) for (const s of [-1, 1]) { const q = onFace(at(kuta(k * 0.8, S), 0, ky, 0), a, w / 2 - k / 2, s * w * 0.3); q.position.z += vz; hara.add(q); }
    }
  });
  f.add(mergeByMaterial(hara));
  // The neck (griva), a Nandi lying at each of its corners, and the octagonal dome (shikhara) with
  // its kalash; on each side of the dome a horseshoe gable crowned by a kirtimukha.
  const neck = at(new THREE.Group(), 0, 0, vz);
  neck.add(box(6.4, 2.6, 6.4, Sd, 0, top, 0));
  for (const a of FACES) {
    const bull = mesh(nandiGeometry(false), S);
    bull.scale.setScalar(0.55);
    neck.add(onFace(at(bull, 0, top, 0), a + Math.PI / 4, 4.9));
    const gable = new THREE.Group();
    gable.add(at(chandrashala(1.3, S, 0.5), 0, 1.5, 0), box(3.2, 3.1, 1.5, S, 0, 0, -0.76), box(3.4, 0.4, 0.7, Sd, 0, 0, 0.2), at(mesh(new THREE.SphereGeometry(0.55, 8, 6), S), 0, 3.2, 0.1));
    for (const s of [-1, 1]) gable.add(at(mesh(new THREE.ConeGeometry(0.2, 0.6, 5), S), s * 0.45, 3.6, 0.1));
    neck.add(onFace(at(gable, 0, top + 2.6, 0), a, 4.5));
  }
  f.add(neck);
  const dome = mesh(new THREE.SphereGeometry(5.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), flat(S), 0, top + 2.6, vz);
  dome.rotation.y = Math.PI / 8;
  dome.scale.y = 0.92;
  f.add(dome, at(kalash(2.2), 0, top + 2.6 + 4.75, vz));
  // The vestibule: its lower storey walled like the sanctum's, an upper storey of plastered brick
  // over it; on its north and south, the side entrances up their flights of steps, a door guardian
  // twice a man's height on each side of each door.
  f.add(box(aw, H1, al, S, 0, 0, az), at(dravidaDress(aw, al, H1, S, { eaveM: Sd, hara: false }), 0, 0, az));
  f.add(box(aw - 1.4, H2 - 0.9, al - 0.2, PLASTER, 0, H1, az - 0.1), box(aw - 0.9, 0.5, al + 0.2, Sd, 0, H1 + H2 - 0.9, az - 0.1), box(aw - 1.6, 0.7, al - 0.4, PLASTER, 0, H1 + H2 - 0.4, az - 0.1));
  for (const s of [-1, 1]) {
    const e = new THREE.Group();
    e.add(box(8.4, 2.8, 5.4, Sd, 0, 0, 2.7), at(steps(4.4, 2.8, 9, S), 0, 0, 5.4));
    for (const x of [-2.6, 2.6]) e.add(box(0.8, 3.6, 3.8, S, x, 0, 7.3));
    e.add(at(templeDoorway(2, 3.2, { m: S, guardians: false, hood: false, bands: 3 }), 0, 2.8, 0.02));
    for (const x of [-2.9, 2.9]) e.add(box(1.5, 0.35, 1.2, S, x, 2.8, 0.75), at(guardian(3.5, S), x, 3.15, 0.75));
    const o = onFace(mergeByMaterial(e), s * Math.PI / 2, aw / 2);
    o.position.z += az;
    f.add(o);
  }
  // The great hall: long and low, its flat roof edged with miniature shrines; its east door up a
  // flight of steps, between its own pair of guardians.
  f.add(box(mw, MH, ml, S, 0, 0, mz), at(dravidaDress(mw, ml, MH, S, { eaveM: Sd }), 0, 0, mz));
  f.add(box(mw - 6, 1.2, ml - 6, Sd, 0, MH + 0.1, mz));
  f.add(box(9, 2, 5, Sd, 0, 0, mz + ml / 2 + 2.5), at(steps(6, 2, 6, S), 0, 0, mz + ml / 2 + 5));
  const east = new THREE.Group();
  east.add(templeDoorway(2.2, 3.2, { m: S, guardians: false, hood: false, bands: 3 }));
  for (const x of [-3, 3]) east.add(box(1.4, 0.3, 1.1, S, x, 0, 0.7), at(guardian(3.1, S), x, 0.3, 0.7));
  f.add(at(mergeByMaterial(east), 0, 2, mz + ml / 2 + 0.02));
  addDetails(f, g);
  // From the south-east, the hall in front and the curving vimana over it.
  return { group: g, focus: f, view: [-0.85, 0.22, 1], zoom: 0.65 };
}

// The court: the wall round it and the stone base of the fallen east gopuram. Part of the setting.
export function enclosure(g) {
  const { ex, ez0, ez1 } = DIMS;
  const EW = ex * 2, ED = ez1 - ez0, ec = (ez0 + ez1) / 2;
  g.add(wallWithGaps('x', EW, 4.2, 1.6, Sd, [[0, 14]], 0, ez1), box(EW, 4.2, 1.6, Sd, 0, 0, ez0));
  for (const s of [-1, 1]) g.add(box(1.6, 4.2, ED, Sd, s * ex, 0, ec));
  g.add(at(trabeateGate(22, 7.5, 12, 4.4, 6.2, { m: S, trim: Sd, guardians: true }), 0, 0, ez1));
}
