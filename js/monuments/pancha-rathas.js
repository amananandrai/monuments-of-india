import * as THREE from 'three';
import { mesh, box, cyl, at, kalash, flat } from '../helpers.js';
import { dravidaVimana, dravidaDress } from '../parts/temples.js';
import { mergeByMaterial } from '../parts/components.js';
import { haraRow } from '../parts/sculpture.js';
import { nandi, elephant, lion } from '../parts/animals.js';
import { detail } from '../detail.js';
import { addDetails, GRANITE as S, SHADE as Sd, LAYOUT } from '../details/pancha-rathas.js';

// The Pancha Rathas at Mamallapuram: five shrines of the 7th century, each cut whole from one
// granite outcrop as a model of a different kind of temple. Four stand in a row from north to
// south, facing west (+z here, north to -x): the Draupadi ratha, a thatched hut; the Arjuna
// ratha, a small two-storey vimana; the Bhima ratha, an oblong hall under a barrel roof; and the
// Dharmaraja ratha, the tallest (about 10.6 m), a square vimana of three storeys under an
// octagonal cap. West of the row the Nakula-Sahadeva ratha, apsidal (gajaprishta), faces south
// (+x), an elephant carved beside it; a lion sits by Draupadi's shrine and a Nandi behind Arjuna's.

// A ground storey w × d and h high on a low plinth: a core with pillars round it (a verandah on
// the front, pilasters on the other faces), the dress of a Dravida storey, and a parapet over it.
function storey(w, d, h, { porch = 0 } = {}) {
  const g = new THREE.Group(), P = 0.6;
  g.add(box(w + 0.6, P, d + 0.6, Sd));
  g.add(box(w - (porch ? 0 : 0), h, d - porch, S, 0, P, -porch / 2));
  g.add(at(dravidaDress(w, d - porch, h, S, { eaveM: Sd, base: false, hara: false }), 0, P, -porch / 2));
  // Pillars of the open verandah across the front, standing on seated lions in the Pallava way.
  if (porch) {
    const n = Math.max(2, Math.round(w / 2.2));
    const cols = new THREE.Group();
    for (let k = 0; k <= n; k++) {
      const x = -w / 2 + 0.35 + (k / n) * (w - 0.7);
      cols.add(box(0.55, 0.7, 0.55, Sd, x, P, d / 2 - 0.35), cyl(0.24, 0.27, h - 1.1, S, x, P + 0.7, d / 2 - 0.35, 8), box(0.75, 0.4, 0.75, S, x, P + h - 0.4, d / 2 - 0.35));
    }
    g.add(mergeByMaterial(cols));
    g.add(box(w + 0.3, 0.5, porch + 0.3, Sd, 0, P + h, d / 2 - porch / 2), box(w, 0.04, porch - 0.2, Sd, 0, P, d / 2 - porch / 2));
  }
  return g;
}

// A barrel (wagon) roof len long along x over a body d deep: the vault, and at each gable end a
// great horseshoe arch (kudu) round a blind window.
function wagonRoof(len, d, m) {
  const g = new THREE.Group(), r = d / 2;
  const v = mesh(new THREE.CylinderGeometry(r, r, len, 16, 1, false, 0, Math.PI), m);
  v.rotation.z = Math.PI / 2;
  v.scale.set(1, 1, 1.25);
  g.add(v);
  // The ridge with its row of finials (stupis).
  g.add(box(len, 0.25, 0.5, m, 0, r * 1.25 - 0.08, 0));
  for (let k = 0; k < 7; k++) g.add(at(kalash(0.32, m), -len / 2 + 0.6 + (k / 6) * (len - 1.2), r * 1.25 + 0.15, 0));
  const kg = new THREE.TorusGeometry(r * 0.96, r * 0.13, 4, 14, Math.PI * 1.25).rotateZ(-Math.PI * 0.125);
  for (const s of [-1, 1]) {
    const k = mesh(kg, m, s * (len / 2 + 0.02), 0, 0);
    k.rotation.y = Math.PI / 2;
    k.scale.set(1, 1.2, 1);
    g.add(k);
  }
  return g;
}

export function buildPanchaRathas() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const L = LAYOUT;
  // The Dharmaraja ratha: a ground storey 8.4 square with its verandah of lion pillars, then a
  // vimana of three storeys under an octagonal cap (its tip about 10.6 m up).
  const dh = at(new THREE.Group(), ...L.dharmaraja);
  dh.add(storey(8.4, 8.4, 3.0, { porch: 1.8 }));
  dh.add(at(dravidaVimana(6.8, 3, 1.5, S, Sd, { taper: 0.42, capScale: 0.22, kalashScale: 0.45 }), 0, 4.1, -0.4));
  f.add(dh);
  // The Bhima ratha: an oblong hall 13.2 × 6.6, a verandah along its front, a parapet of shrines,
  // and an upper storey under a barrel roof.
  const bh = at(new THREE.Group(), ...L.bhima);
  bh.add(storey(13.2, 6.6, 3.2, { porch: 1.6 }));
  bh.add(at(haraRow(12.6, 1.05, S), 0, 4.3, 2.75), at(haraRow(12.6, 1.05, S), 0, 4.3, -2.75));
  for (const s of [-1, 1]) bh.add(at(haraRow(4.4, 1.05, S), s * 6.1, 4.3, 0).rotateY(Math.PI / 2));
  bh.add(box(11, 1.6, 4.4, S, 0, 4.3, 0), box(11.6, 0.35, 5, Sd, 0, 5.9, 0));
  bh.add(at(wagonRoof(11, 4.4, S), 0, 6.25, 0));
  f.add(bh);
  // The Arjuna ratha: a square shrine 4.6 across with a short porch, two storeys and an
  // octagonal cap.
  const ar = at(new THREE.Group(), ...L.arjuna);
  ar.add(storey(4.6, 4.6, 2.6, { porch: 1.1 }));
  ar.add(at(dravidaVimana(4.2, 2, 1.3, S, Sd, { taper: 0.45, capScale: 0.3, kalashScale: 0.45 }), 0, 3.7, -0.3));
  f.add(ar);
  // The Draupadi ratha: a hut shrine 3.6 square on a plinth carried by elephants and lions, under a
  // curved, four-sided thatch roof carved in stone.
  const dr = at(new THREE.Group(), ...L.draupadi);
  dr.add(box(4.6, 0.9, 4.6, Sd), box(3.6, 2.6, 3.6, S, 0, 0.9, 0));
  const hut = mesh(new THREE.LatheGeometry([[0, 2.75], [0.7, 2.6], [1.6, 2.15], [2.3, 1.4], [2.75, 0.55], [2.95, 0], [2.6, 0]].map(([r, y]) => new THREE.Vector2(r, y)).reverse(), 4), flat(S), 0, 3.5, 0);
  hut.rotation.y = Math.PI / 4;
  dr.add(hut, box(0.5, 0.5, 0.5, S, 0, 6.2, 0), at(kalash(0.45, S), 0, 6.7, 0));
  f.add(dr);
  // The Nakula-Sahadeva ratha: apsidal, its round end to the north (-x) and its porch to the south,
  // two storeys under a barrel roof that ends over the apse in a half dome.
  const nk = at(new THREE.Group(), ...L.nakula);
  nk.rotation.y = Math.PI / 2;
  const apse = (r, h, m, y = 0) => mesh(new THREE.CylinderGeometry(r, r, h, 16, 1, false, Math.PI / 2, Math.PI), m, 0, y + h / 2, 0);
  nk.add(box(3.8, 0.6, 3.4, Sd, 0, 0, 0.2), apse(1.9, 0.6, Sd), box(3.4, 2.4, 3, S, 0, 0.6, 0.3), apse(1.7, 2.4, S, 0.6));
  nk.add(box(3.9, 0.35, 3.4, Sd, 0, 3, 0.3), apse(1.95, 0.35, Sd, 3));
  for (const x of [-1.1, 1.1]) nk.add(cyl(0.18, 0.2, 2.4, S, x, 0.6, 1.95, 8));
  nk.add(box(3, 1.3, 2.2, S, 0, 3.35, 0.4), apse(1.45, 1.3, S, 3.35));
  const vault = mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.6, 14, 1, false, 0, Math.PI), S, 0, 4.65, 0.6);
  vault.rotation.z = Math.PI / 2;
  vault.rotation.y = Math.PI / 2;
  const dome = mesh(new THREE.SphereGeometry(1.5, 14, 6, Math.PI / 2, Math.PI, 0, Math.PI / 2), S, 0, 4.65, -0.7);
  nk.add(vault, dome, at(kalash(0.3, S), 0, 6.1, 0.6));
  f.add(nk);
  // The animals cut from the same rock: the elephant by the apsidal shrine, the lion by Draupadi's,
  // the Nandi behind Arjuna's (towards the east, -z).
  f.add(at(elephant(S, 0.95, { coarse: detail.low }), ...L.elephant).rotateY(Math.PI / 2));
  f.add(at(lion(1.15, S), ...L.lion).rotateY(0.3));
  f.add(at(nandi(S, 0.75), ...L.nandi));
  addDetails(f, g);
  // From the south-west, the row of four going away to the north and the apsidal shrine before it.
  return { group: g, focus: f, view: [0.75, 0.3, 1], zoom: 0.62 };
}
