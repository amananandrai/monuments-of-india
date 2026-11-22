import * as THREE from 'three';
import { box, at, onFace, inst, unitBox } from '../helpers.js';
import { dravidaVimana, dravidaDress, wallWithGaps } from '../parts/temples.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { kuta, shala, haraRow, kutaGeo, instances, yaliPillar } from '../parts/sculpture.js';
import { addDetails, STONE as S, SHADE as Sd, DIMS } from '../details/kailasanathar-temple.js';

// The Kailasanathar temple at Kanchipuram, built about 700 by the Pallava king Narasimhavarman II
// (Rajasimha), the oldest structural temple of the town. It faces east (+z). The sanctum, square,
// carries a vimana of four storeys whose name says it reached Kailasa; round its foot cling seven
// small shrines, one at each corner and one in the middle of the north, south and west faces, so that
// the whole reads as a mountain of little temples. Before it stands the hall (maha-mandapa), once
// open, now joined to the sanctum by a vestibule. Round them runs the court's wall, lined on the
// inside by a ring of 58 tiny shrines, each a cell under its own small vimana. On the east the
// entrance, a small gopuram, and outside it a row of eight shrines built by Mahendravarman III.
// The walls are of soft sandstone, carved everywhere with rearing lions (yalis) on the pilasters.
export function buildKailasanatharTemple() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { VW, VH, vz, mz, mw, md, MH, cx, cz0, cz1 } = DIMS;
  // The sanctum and its vimana.
  f.add(box(VW, VH, VW, S, 0, 0, vz), at(dravidaDress(VW, VW, VH, S, { eaveM: Sd }), 0, 0, vz));
  const vim = dravidaVimana(VW - 1, 4, 2.4, S, Sd, { taper: 0.55, capScale: 0.3, kalashScale: 0.5, kalashM: Sd });
  f.add(at(vim, 0, VH + 0.35, vz));
  // The seven shrines round its foot: square ones with a domed kuta roof at the corners, oblong ones
  // with a barrel-roofed shala on the three free faces.
  const sh = new THREE.Group(), o = VW / 2 + 1.1;
  for (const x of [-1, 1]) for (const z of [-1, 1]) {
    const p = at(new THREE.Group(), x * o, 0, vz + z * o);
    p.add(box(2.6, 4.2, 2.6, S), box(3, 0.4, 3, Sd, 0, 4.2), at(kuta(2.4, S), 0, 4.6, 0));
    sh.add(p);
  }
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) {
    const p = onFace(at(new THREE.Group(), 0, 0, 0), a, VW / 2 + 1);
    p.position.z += vz;
    p.add(box(3.6, 4.6, 2.2, S, 0, 0, 0), box(4, 0.4, 2.6, Sd, 0, 4.6, 0), at(shala(3.6, 2.4, S), 0, 5, 0));
    sh.add(p);
  }
  f.add(mergeByMaterial(sh));
  // The vestibule and the hall, with a parapet of miniature shrines; yali pillars in its east front.
  f.add(box(5.6, VH - 0.8, 3.2, S, 0, 0, vz + VW / 2 + 1.6), at(dravidaDress(5.6, 3.2, VH - 0.8, S, { eaveM: Sd, hara: false }), 0, 0, vz + VW / 2 + 1.6));
  f.add(box(mw, MH, md, S, 0, 0, mz), at(dravidaDress(mw, md, MH, S, { eaveM: Sd }), 0, 0, mz));
  const front = new THREE.Group();
  front.add(box(mw, 1.1, 2.6, Sd, 0, 0, md / 2 + 1.3), box(mw + 0.6, 0.5, 2.9, Sd, 0, MH - 0.5, md / 2 + 1.3));
  for (const x of [-3.3, -1.1, 1.1, 3.3]) front.add(at(yaliPillar(MH - 1.6, S), x, 1.1, md / 2 + 2.2));
  front.add(at(steps(2.4, 1.1, 4, S), 0, 0, md / 2 + 2.6), at(templeDoorway(1.4, 2.8, { m: S, guardianH: 1.5 }), 0, 1.1, md / 2 + 0.02));
  f.add(at(front, 0, 0, mz));
  // The court: its wall, and on the inside the ring of 58 cells, each under a small kuta.
  const cw = cx * 2, cd = cz1 - cz0, cc = (cz0 + cz1) / 2, CH = 3.2, cells = [], roofs = [];
  f.add(wallWithGaps('x', cw, CH + 0.6, 1, Sd, [[0, 4]], 0, cz1), box(cw, CH + 0.6, 1, Sd, 0, 0, cz0));
  for (const s of [-1, 1]) f.add(box(1, CH + 0.6, cd, Sd, s * cx, 0, cc));
  const ring = (x0, z0, x1, z1, n, ry) => {
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      cells.push([x, 0, z, 1.9, CH, 1.9, ry]);
      roofs.push([x, CH, z, 1.8, 1.6, 1.8, ry]);
    }
  };
  const ix = cx - 1.45, iz0 = cz0 + 1.45, iz1 = cz1 - 1.45;
  ring(-ix, iz0, ix, iz0, 15, 0);
  ring(-ix, iz0 + 2, -ix, iz1 - 2, 13, Math.PI / 2);
  ring(ix, iz0 + 2, ix, iz1 - 2, 13, -Math.PI / 2);
  ring(-ix, iz1, -3.5, iz1, 8, Math.PI);
  ring(3.5, iz1, ix, iz1, 8, Math.PI);
  f.add(inst(unitBox(), cells, S), instances(kutaGeo(), roofs, S));
  // The gopuram over the east entrance: a passage through a block, under two storeys and a shala.
  const gp = at(new THREE.Group(), 0, 0, cz1);
  for (const s of [-1, 1]) gp.add(box(2.4, 4.6, 4.4, S, s * 2.6, 0, 0));
  gp.add(box(7.6, 1.4, 4.4, S, 0, 4.6, 0), box(8.2, 0.4, 5, Sd, 0, 6, 0), box(6.4, 1.6, 3.6, S, 0, 6.4, 0), box(7, 0.35, 4.2, Sd, 0, 8, 0));
  gp.add(at(shala(6, 3.4, S), 0, 8.35, 0), at(haraRow(6.6, 0.9, S), 0, 6.4, 2.2), at(haraRow(6.6, 0.9, S), 0, 6.4, -2.2));
  f.add(mergeByMaterial(gp));
  // Outside the east wall, the row of eight shrines of Mahendravarman III, on a low plinth.
  const row = new THREE.Group();
  row.add(box(cw - 10, 0.6, 4, Sd, 0, 0, cz1 + 3.4));
  for (let k = 0; k < 8; k++) {
    const x = (k < 4 ? -1 : 1) * (5 + (k % 4) * 3.6);
    row.add(box(2.6, 3.4, 2.6, S, x, 0.6, cz1 + 3.2), box(3, 0.35, 3, Sd, x, 4, cz1 + 3.2), at(kuta(2.2, S), x, 4.35, cz1 + 3.2));
  }
  f.add(mergeByMaterial(row));
  addDetails(f, g);
  // From the south-east, over the east wall into the court.
  return { group: g, focus: f, view: [0.75, 0.36, 1], zoom: 0.72 };
}
