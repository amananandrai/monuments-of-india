import * as THREE from 'three';
import { M, box, cyl, at, archPanel } from '../helpers.js';
import { arcadeSkin, cellRow, pierced } from '../parts/mughal.js';
import { merlons, mergeByMaterial, chhajja, bracketGeo, placeAll, frieze } from '../parts/components.js';
import { addDetails, sidiJali, STONE, SHADE } from '../details/sidi-saiyyed-mosque.js';

// The Sidi Saiyyed Mosque, Ahmedabad, 1572–73. From photographs: a low prayer hall of yellow
// sandstone, about 22 m long, 11 m deep and 7 m high under a flat roof, on a plinth of three steps.
// Its east front is open in five pointed arches on square piers, under a deep eave on serpentine
// brackets, between two great octagonal turrets (the stumps of minarets never built) that stop just
// over the parapet. Eight pillars inside carry arches both ways, making fifteen bays, five by three.
// The west wall is solid below and pierced high up by five blunt-pointed lunettes: the middle one,
// behind the mihrab, is filled with stone; the two beside it hold the famous carved trees, and the
// outer two are grids of small square pierced panels. Each side wall has three lunettes of square
// panels over a dado: ten jalis in all. The model is turned so the west wall, the face everyone
// photographs from the street, looks towards +z; the open front faces -z.
// L long, D deep, H from the floor to the roof, on a plinth P; walls WT thick. WIN: the west
// wall's lunettes, [sill, width, height]; SIDE: the side walls'.
export const L = 22, D = 11, H = 6.3, P = 0.6, WT = 0.9, WIN = [3.2, 3.4, 2.45], SIDE = [2.7, 2.5, 2.9];

// An octagonal prism, a flat face to the front.
const octa = (rt, rb, h, m, x, y, z) => { const o = cyl(rt, rb, h, m, x, y, z, 8); o.rotation.y = Math.PI / 8; return o; };

export function buildSidiSaiyyedMosque() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const S = STONE, Sd = SHADE, d = new THREE.Group(), BAY = L / 5;
  // The plinth, and the three long steps up to the front from the court.
  d.add(box(L + 1.4, P, D + 1.2, S, 0, 0, 0));
  for (let k = 0; k < 2; k++) d.add(box(L - 2.6, P - (k + 1) * 0.2, 0.45, Sd, 0, 0, -D / 2 - 0.82 - k * 0.45));
  // The west wall (+z): five bays, a lunette high in each but the middle one, which is walled up.
  const wins = cellRow(5, BAY, ...WIN);
  d.add(at(arcadeSkin(L, H, wins.filter((c, k) => k !== 2), WT, S, { trim: Sd, fill: 'none', pointed: true }), 0, P, D / 2 - WT));
  // The side walls, each with three lunettes over a dado.
  // (the turrets take the front end of each, so the three bays sit a little towards the west).
  const sl = D - WT, sides = (s) => cellRow(3, 3.03, ...SIDE).map(([cx, ...c]) => [cx - s * 0.5, ...c]);
  for (const s of [-1, 1]) {
    const w = at(arcadeSkin(sl, H, sides(s), WT, S, { trim: Sd, fill: 'none', pointed: true }), s * (L / 2 - WT), P, -WT / 2);
    w.rotation.y = s * Math.PI / 2;
    d.add(w);
  }
  // The east front (-z): five open pointed arches on square piers.
  const arches = cellRow(5, BAY, 0, 3.3, 4.9);
  d.add(at(pierced(L, H, arches, 0.8, S), 0, P, -D / 2 + 0.8).rotateY(Math.PI));
  // Inside: two rows of four pillars, arches springing between them both ways, fifteen bays.
  d.add(box(L - 2 * WT, 0.06, D - WT, Sd, 0, P, -WT / 2));
  const rows = [-D / 2 + 0.4 + (D - WT - 0.4) / 3, -D / 2 + 0.4 + 2 * (D - WT - 0.4) / 3];
  for (const z of rows) d.add(at(pierced(L - 2 * WT, H, arches, 0.6, S), 0, P, z - 0.3));
  for (let k = 1; k < 5; k++) {
    const x = -L / 2 + k * BAY, a = pierced(D - WT - 0.8, H, cellRow(3, (D - WT - 0.4) / 3, 0, 2.5, 4.9), 0.6, S);
    a.rotation.y = Math.PI / 2;
    d.add(at(a, x - 0.3, P, -WT / 2 - 0.4));
  }
  // The roof: a slab, the deep eave of the front on its serpentine brackets, a lighter cornice
  // round the other three sides, and a parapet of merlons.
  const yr = P + H;
  d.add(box(L + 0.2, 0.45, D + 0.2, S, 0, yr, 0), box(L + 0.3, 0.3, D + 0.3, Sd, 0, yr + 0.45, 0));
  d.add(at(chhajja(L - 1.3, 1.15, 0.3, 0.12, Sd), 0, yr - 0.1, -D / 2).rotateY(Math.PI));
  d.add(placeAll(bracketGeo(1.0, 0.95, 0.3), [-2, -1, 1, 2].map((k) => [(k - Math.sign(k) / 2) * BAY, yr - 0.32, -D / 2, Math.PI]), Sd));
  d.add(at(chhajja(L + 0.2, 0.5, 0.14, 0.1, Sd), 0, yr + 0.02, D / 2));
  for (const s of [-1, 1]) {
    const e = at(chhajja(D - 1.6, 0.5, 0.14, 0.1, Sd), s * L / 2, yr + 0.02, 0.8);
    e.rotation.y = s * Math.PI / 2;
    d.add(e, at(merlons(L - 3, 0.5, 0.62, 0.22, S, 0.12), 0, yr + 0.75, s * (D / 2 - 0.05)));
    const p = at(merlons(D - 0.4, 0.5, 0.62, 0.22, S, 0.12), s * (L / 2 - 0.05), yr + 0.75, 0);
    p.rotation.y = Math.PI / 2;
    d.add(p);
  }
  // The two turrets at the front corners: octagonal, on a moulded base, girdled by carved bands,
  // with small blind niches in their faces; they end in a corbelled cornice just over the parapet.
  const TR = 1.75, TH = H + 1.5;
  for (const s of [-1, 1]) {
    const x = s * (L / 2 + 1.1), z = -D / 2 - 0.5;
    d.add(octa(TR, TR, TH, S, x, 0, z), octa(TR + 0.12, TR + 0.3, 0.55, Sd, x, 0, z), octa(TR + 0.02, TR + 0.12, 0.3, Sd, x, 0.55, z));
    for (const y of [2.5, 4.55]) d.add(octa(TR + 0.07, TR + 0.07, 0.3, frieze(Sd), x, P + y, z), octa(TR + 0.12, TR + 0.12, 0.08, Sd, x, P + y + 0.3, z));
    d.add(octa(TR + 0.22, TR + 0.02, 0.35, Sd, x, TH - 0.95, z), octa(TR + 0.16, TR + 0.16, 0.5, frieze(S), x, TH - 0.6, z), octa(TR + 0.24, TR + 0.24, 0.1, Sd, x, TH - 0.1, z));
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4, ap = TR * Math.cos(Math.PI / 8) + 0.005;
      const n = at(archPanel(0.42, 0.85, true, M.recess, 0.03), x + Math.sin(a) * ap, P + 3.1, z + Math.cos(a) * ap);
      n.rotation.y = a;
      d.add(n);
    }
  }
  f.add(mergeByMaterial(d));
  // The jalis. In the west wall, the two carved trees either side of the walled-up bay, and a grid
  // of square panels at each end; in the side walls, three grids each. The hall is dim: from
  // outside the piercing shows dark.
  const zj = D / 2 - WT + 0.3, kinds = ['grid', 'tree', null, 'palm', 'grid'];
  wins.forEach(([cx, sill, aw, ah], k) => {
    if (!kinds[k]) return;
    f.add(at(sidiJali(aw, ah, kinds[k], k), cx, P + sill, zj), at(archPanel(aw + 0.2, ah + 0.15, true, M.recess, 0.04), cx, P + sill - 0.05, zj - 0.3));
  });
  for (const s of [-1, 1]) sides(s).forEach(([cx, sill, aw, ah], k) => {
    const j = new THREE.Group();
    j.add(at(sidiJali(aw, ah, 'grid', 5 + k + (s + 1)), cx, sill, 0.3), at(archPanel(aw + 0.2, ah + 0.15, true, M.recess, 0.04), cx, sill - 0.05, 0));
    j.rotation.y = s * Math.PI / 2;
    f.add(at(j, s * (L / 2 - WT), P, -WT / 2));
  });
  addDetails(f, g, { L, D, H, P, WT, WIN, SIDE });
  // From the street to the west, the jali windows full on.
  return { group: g, focus: f, view: [0.3, 0.16, 1], zoom: 0.62, target: [0, 4.4, 0] };
}
