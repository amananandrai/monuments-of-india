import * as THREE from 'three';
import { box, cyl, at, inst, unitBox } from '../helpers.js';
import { dravidaVimana, dravidaDress, wallWithGaps } from '../parts/temples.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial, frieze } from '../parts/components.js';
import { kuta, shala, haraRow, kutaGeo, instances } from '../parts/sculpture.js';
import { addDetails, STONE as S, SHADE as Sd, GRANITE, PLASTER, DIMS, SHRINES, CELLS, ROW } from '../details/kailasanathar-temple.js';

// The Kailasanathar temple at Kanchipuram, built about 700 by the Pallava king Narasimhavarman II
// (Rajasimha), the oldest structural temple of the town. It faces east (+z; south is -x). The
// sanctum, square, carries a vimana of four storeys whose name says it reached Kailasa; round its
// foot cling nine small shrines: one at each corner, one in the middle of the north, south and west
// faces, and two flanking the entrance on the east, so that the whole reads as a mountain of little
// temples. Before it stands the hall (maha-mandapa), flat-roofed and once detached, now joined to
// the sanctum by a later, plainer hall. Round them runs the court's wall, lined on the inside by a
// ring of 58 tiny shrines, each a cell under its own small vimana. In the middle of the east wall
// stands the oblong shrine of Mahendravarman III under its barrel roof, a doorway into the court
// either side of it; before it a small front court, closed on the east by a row of eight shrines,
// and beyond them the Nandi on his platform. The walls are of soft sandstone on a course of grey
// granite, carved everywhere with rearing lions on the pilasters.
export function buildKailasanatharTemple() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { VW, VH, vz, mz, mw, md, MH, cx, cz0, cz1, fz } = DIMS;
  // The sanctum and its vimana.
  f.add(box(VW, VH, VW, S, 0, 0, vz), at(dravidaDress(VW, VW, VH, S, { eaveM: Sd }), 0, 0, vz));
  const vim = dravidaVimana(VW - 1, 4, 2.4, S, Sd, { taper: 0.55, capScale: 0.3, kalashScale: 0.5, kalashM: Sd });
  f.add(at(vim, 0, VH + 0.35, vz));
  // The nine shrines round its foot: square ones with a domed kuta roof at the corners and beside
  // the entrance, oblong ones with a barrel-roofed shala on the three free faces.
  const sh = new THREE.Group();
  for (const [x, z, w, d, a] of SHRINES) {
    const p = at(new THREE.Group(), x, 0, vz + z);
    p.rotation.y = a;
    p.add(box(w + 0.3, 0.35, d + 0.3, GRANITE), box(w, 4.2, d, S), box(w + 0.4, 0.4, d + 0.4, Sd, 0, 4.2));
    p.add(at(w > d ? shala(w, d + 0.2, S) : kuta(w - 0.2, S), 0, 4.6, 0));
    sh.add(p);
  }
  f.add(mergeByMaterial(sh));
  // The vestibule between the two eastern shrines, the later plain hall, and the maha-mandapa: flat
  // roofed under a carved parapet, its east front open between four pillars.
  const hall = new THREE.Group(), e0 = vz + VW / 2;
  hall.add(box(3.4, VH - 0.8, 2.6, S, 0, 0, e0 + 1.3), box(mw - 1.2, MH - 0.5, mz - md / 2 - e0 - 2.4, Sd, 0, 0, (e0 + 2.4 + mz - md / 2) / 2), box(mw - 0.8, 0.3, mz - md / 2 - e0 - 2.2, S, 0, MH - 0.5, (e0 + 2.4 + mz - md / 2) / 2));
  hall.add(box(mw + 0.9, 0.3, md + 0.9, GRANITE, 0, 0, mz), box(VW + 0.9, 0.3, VW + 0.9, GRANITE, 0, 0, vz));
  hall.add(box(mw, MH, md, S, 0, 0, mz), at(dravidaDress(mw, md, MH, S, { eaveM: Sd, hara: false }), 0, 0, mz), box(mw + 0.5, 0.75, md + 0.5, frieze(S), 0, MH + 0.02, mz));
  const front = at(new THREE.Group(), 0, 0, mz);
  front.add(box(mw, 1.1, 2.6, Sd, 0, 0, md / 2 + 1.3), box(mw + 0.6, 0.5, 2.9, Sd, 0, MH - 0.5, md / 2 + 1.3), box(mw + 0.5, 0.75, 2.6, frieze(S), 0, MH + 0.02, md / 2 + 1.3));
  for (const x of [-3.9, -1.3, 1.3, 3.9]) {
    // Plain Pallava pillars: square below and above, eight-sided between, under a cushion capital.
    front.add(box(0.6, 1.1, 0.6, S, x, 1.1, md / 2 + 2.2), cyl(0.3, 0.3, 1.4, S, x, 2.2, md / 2 + 2.2, 8), box(0.6, 0.6, 0.6, S, x, 3.6, md / 2 + 2.2), box(1.1, 0.5, 0.75, Sd, x, 4.2, md / 2 + 2.2));
  }
  front.add(at(steps(2.4, 1.1, 4, S), 0, 0, md / 2 + 2.6), at(templeDoorway(1.4, 2.8, { m: S, guardianH: 1.5 }), 0, 1.1, md / 2 + 0.02));
  hall.add(front);
  f.add(mergeByMaterial(hall));
  // The court: its wall on the granite course, and on the inside the ring of 58 cells, each under a
  // small kuta; here and there a cell keeps its coat of white plaster.
  const cw = cx * 2, cd = cz1 - cz0, cc = (cz0 + cz1) / 2, CH = 3.2, cells = [], roofs = [], white = [];
  const court = new THREE.Group();
  court.add(wallWithGaps('x', cw, CH + 0.6, 1, Sd, [[0, 11]], 0, cz1), box(cw, CH + 0.6, 1, Sd, 0, 0, cz0), box(cw + 1.3, 0.45, 1.3, GRANITE, 0, 0, cz0));
  for (const s of [-1, 1]) court.add(box(1, CH + 0.6, cd, Sd, s * cx, 0, cc), box(1.3, 0.45, fz - cz0, GRANITE, s * cx, 0, (fz + cz0) / 2), box(1.7, 1.1, 1, Sd, s * 4.65, 2.7, cz1));
  f.add(mergeByMaterial(court));
  for (const [x, z, ry] of CELLS) {
    cells.push([x, 0, z, 1.9, CH, 1.9, ry]);
    (cells.length % 6 === 2 ? white : roofs).push([x, CH, z, 1.8, 1.6, 1.8, ry]);
  }
  f.add(inst(unitBox(), cells, S), instances(kutaGeo(), roofs, S), instances(kutaGeo(), white, PLASTER));
  // The shrine of Mahendravarman III in the middle of the east wall: an oblong sanctum facing east
  // under two storeys and a barrel (shala) roof with its great horseshoe gable ends.
  const gp = at(new THREE.Group(), 0, 0, cz1);
  gp.add(box(8.5, 0.4, 5.3, GRANITE), box(7.6, 6, 4.4, S), dravidaDress(7.6, 4.4, 6, S, { eaveM: Sd, hara: false }), box(8.2, 0.4, 5, Sd, 0, 6, 0), box(6.4, 1.6, 3.6, S, 0, 6.4, 0), box(7, 0.35, 4.2, Sd, 0, 8, 0));
  gp.add(at(shala(6, 3.4, S), 0, 8.35, 0), at(haraRow(6.6, 0.9, S), 0, 6.4, 2.2), at(haraRow(6.6, 0.9, S), 0, 6.4, -2.2));
  gp.add(at(steps(1.8, 0.6, 3, S), 0, 0, 2.2), at(templeDoorway(1.1, 2.3, { m: S, guardians: false, hood: false }), 0, 0.6, 2.22));
  f.add(mergeByMaterial(gp));
  // The front court and, closing it on the east, the row of eight shrines on a low plinth, the way
  // in between the middle two.
  const row = new THREE.Group();
  for (const s of [-1, 1]) row.add(box(1, CH + 0.6, fz - cz1, Sd, s * cx, 0, (fz + cz1) / 2), box(cx - 15.4, CH + 0.6, 1, Sd, s * (cx + 15.4) / 2, 0, fz), box(13.6, 0.6, 3.6, Sd, s * 8.9, 0, fz));
  for (const [x] of ROW) row.add(box(2.6, 3.4, 2.6, S, x, 0.6, fz), box(3, 0.35, 3, Sd, x, 4, fz), at(kuta(2.2, S), x, 4.35, fz));
  f.add(mergeByMaterial(row));
  addDetails(f, g);
  // From the north-east, over the row of shrines and the east wall into the court.
  return { group: g, focus: f, view: [0.75, 0.36, 1], zoom: 0.62 };
}
