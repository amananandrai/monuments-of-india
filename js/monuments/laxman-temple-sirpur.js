import * as THREE from 'three';
import { box, cyl, at, shikhara, nagaraProfile } from '../helpers.js';
import { steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { addDetails, BRICK, BRICK_DARK, STONE, STONE_DARK } from '../details/laxman-temple-sirpur.js';

// The Laxman temple at Sirpur, of the 7th century: one of the finest brick temples in India. It
// faces east (+z) on a stone platform (jagati) 23.5 m long, 12 m wide and 2.1 m high. Only the
// sanctum and its tower stand, at the west end; of the hall (mandapa) before it the stone bases
// of the pillars are left on the platform. The tower, a curved Nagara spire on a stellate plan of
// many offsets, has lost its amalaka and stands about 15 m above the ground.
export function buildLaxmanSirpur() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // P: the platform. sz: the sanctum's centre. The walls (bada) BW square, WH high on a stone
  // base B; the spire TW at its foot and TH high.
  const P = 2.1, PW = 12, PL = 23.5, sz = -6.2, B = 0.7, BW = 7.6, WH = 3.6, TW = 7.8, TH = 7.6;
  f.add(box(PW, P, PL, STONE, 0, 0, 0), box(PW + 0.3, 0.2, PL + 0.3, STONE_DARK, 0, P - 0.2, 0));
  // Two flights of steps up the east face, either side of a middle wall.
  for (const s of [-1, 1]) f.add(at(steps(2.6, P, 9, STONE_DARK), s * 2.4, 0, PL / 2));
  f.add(box(2.2, P, 3.8, STONE, 0, 0, PL / 2 + 1.9));
  // The sanctum's stone base, and its brick walls on a plan stepping out to the middle of each face.
  const yb = P + B;
  f.add(box(BW + 0.8, B, BW + 0.8, STONE, 0, P, sz));
  const plan = [[BW, BW], [BW + 0.5, BW * 0.66], [BW + 0.9, BW * 0.36]];
  for (const [w, d] of plan) f.add(box(w, WH, d, BRICK, 0, yb, sz), box(d, WH, w, BRICK, 0, yb, sz));
  for (const [w, d] of plan) f.add(box(w + 0.3, 0.3, d + 0.3, BRICK_DARK, 0, yb + WH - 0.3, sz), box(d + 0.3, 0.3, w + 0.3, BRICK_DARK, 0, yb + WH - 0.3, sz));
  // The spire, its top broken off below the amalaka: shikhara() builds the full one, and the crown
  // (the parts above its last course) is dropped.
  const tower = shikhara(TW, TH, BRICK, nagaraProfile, 22, BRICK, 0.6);
  tower.children.splice(tower.children.length - 3, 3);
  f.add(at(tower, 0, yb + WH, sz));
  // A ragged stump of brick where the neck and amalaka were.
  const tw = TW * nagaraProfile(1);
  f.add(box(tw * 0.8, 0.5, tw * 0.6, BRICK_DARK, 0, yb + WH + TH, sz), box(tw * 0.45, 0.4, tw * 0.5, BRICK, 0.3, yb + WH + TH + 0.5, sz - 0.2));
  // The vestibule (antarala) before the sanctum, its walls broken down to a few courses.
  for (const s of [-1, 1]) f.add(box(1.1, 1.9 - s * 0.4, 2.4, BRICK, s * 2.1, yb, sz + BW / 2 + 1.2), box(0.8, 0.5, 1.6, BRICK_DARK, s * 2.1, yb + 1.9 - s * 0.4, sz + BW / 2 + 1));
  f.add(box(3.1, 0.12, 2.4, STONE_DARK, 0, yb - 0.1, sz + BW / 2 + 1.2));
  // The hall: the bases and stumps of its stone pillars in rows on the platform.
  const hall = new THREE.Group(), z0 = sz + BW / 2 + 3.2;
  for (let i = 0; i < 4; i++) for (const x of [-4, -1.4, 1.4, 4]) {
    const z = z0 + i * 3.1, h = 0.4 + ((i * 7 + x * 3 + 11) % 5) * 0.18;
    hall.add(box(0.9, 0.35, 0.9, STONE_DARK, x, P, z), cyl(0.28, 0.32, h, STONE, x, P + 0.35, z, 8));
  }
  hall.add(box(PW - 1.2, 0.25, 0.6, STONE_DARK, 0, P, z0 - 1.3), box(0.6, 0.25, 10, STONE_DARK, -5.3, P, z0 + 4.4), box(0.6, 0.25, 10, STONE_DARK, 5.3, P, z0 + 4.4));
  f.add(mergeByMaterial(hall));
  addDetails(f, g, { P, PW, PL, sz, B, BW, WH, TW, TH, yb });
  // From the south-east, the platform's stairs and the tower's east face in view.
  return { group: g, focus: f, view: [-0.9, 0.28, 1], zoom: 1.1 };
}
