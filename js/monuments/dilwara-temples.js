import * as THREE from 'three';
import { M, V, mat, mesh, doubleSided, box, cyl, lathe, group, at, kalash, bell, shikhara, pidaRoof, nagaraProfile, ribbed, inst, unitBox, unitCyl, aroundRect, hoopArch } from '../helpers.js';
import { trabeateGate, wallWithGaps } from '../details/temples.js';
import { templeDoorway, steps } from '../details/doorways.js';
import { miniSpireGeo } from '../details/sculpture.js';
import { addDetails } from '../details/dilwara-temples.js';

// The Ranga Mandapa's dome, [radius, height] from its springing.
export const DOME = [[8.4, 0], [7.8, 1.1], [6.2, 2.3], [4, 3.3], [1.5, 3.9], [0, 4]];

export function buildDilwara() {
  const Mb = M.marble, Sh = M.marbleShade, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(260, 0.2, 170, M.grass, 20, 0, 0));
  // The plain outer wall, with the gateway in its middle
  f.add(box(48, 1.5, 70, Sh), at(wallWithGaps('x', 48.6, 5, 0.8, M.plaster, [[0, 7.6]], 0, 35), 0, 1.5, 0));
  f.add(at(trabeateGate(8, 6.5, 3, 2.6, 4, { m: M.plaster, trim: Mb, bands: 2 }), 0, 1.5, 35));
  // Rows of shrine cells (devakulikas) with little spires, behind a pillared cloister
  const cells = aroundRect(44, 66, 3.2, 1.6), cellList = [], spires = [], posts = [];
  cells.forEach(([x, z, ry]) => {
    if (z > 30 && Math.abs(x) < 3) return; // the way in from the gateway
    // 3 cm short of the cloister roof, so the cells' tops and the roof's never share a plane
    cellList.push([x, 1.5, z, 3, 3.97, 3, ry]);
    spires.push([x, 5.5, z, 2.6, 3.4, 2.6, ry]);
    posts.push([x + Math.sin(ry) * 3.2, 1.5, z + Math.cos(ry) * 3.2, 0.5, 3.6, 0.5]);
  });
  f.add(inst(unitBox(), cellList, Mb), inst(miniSpireGeo(), spires, Mb), inst(unitCyl(10), posts, Mb));
  f.add(at(group(...[[44, 3.6, -29.4], [44, 3.6, 29.4]].map(([w, d, z]) => box(w - 6, 0.4, d, Sh, 0, 5.1, z)), ...[-19.4, 19.4].map((x) => box(3.6, 0.4, 60, Sh, x, 5.1, 0)))));
  // Main shrine, closed hall and the open Ranga Mandapa with its ribbed dome and hoop arches
  f.add(box(10, 8, 10, Mb, 0, 1.5, -16), at(shikhara(9, 12, Mb, nagaraProfile, 12), 0, 9.5, -16));
  const gm = pidaRoof(10, 5, 4, 0.8, Mb, Sh);
  f.add(box(10, 7, 10, Mb, 0, 1.5, -5), at(gm, 0, 8.5, -5), at(bell(2.6, Mb), 0, 8.5 + gm.userData.top, -5));
  f.add(at(templeDoorway(1.6, 3.2, { m: Mb, bands: 4 }), 0, 2.5, 0));
  const rz = 9, pc = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) pc.push([-6 + i * 4, 2.5, rz - 6 + j * 4, 0.9, 6.5, 0.9]);
  f.add(box(17, 1, 17, Sh, 0, 1.5, rz), inst(unitCyl(12), pc, Mb));
  // A short flight from the court up onto the mandapa's platform, the way to the doorway.
  f.add(at(steps(6, 1, 4, Sh, 0.4), 0, 1.5, rz + 8.5));
  for (const j of [0, 3]) for (let i = 0; i < 3; i++) f.add(hoopArch(V(-6 + i * 4, 7.3, rz - 6 + j * 4), V(-2 + i * 4, 7.3, rz - 6 + j * 4), Mb));
  for (const i of [0, 3]) for (let j = 0; j < 3; j++) f.add(hoopArch(V(-6 + i * 4, 7.3, rz - 6 + j * 4), V(-6 + i * 4, 7.3, rz - 2 + j * 4), Mb));
  // The dome stands open to the hall below: an octagonal drum ring, and a shell seen from both sides,
  // so the carved ceiling inside it shows (js/details/dilwara-temples.js).
  const Mbd = doubleSided(Mb);
  f.add(mesh(new THREE.CylinderGeometry(9.2, 9.2, 1.2, 8, 1, true), Mbd, 0, 9.6, rz));
  for (const [y, rx] of [[9, Math.PI / 2], [10.2, -Math.PI / 2]]) f.add(mesh(new THREE.RingGeometry(8.3, 9.2, 8, 1).rotateX(rx).rotateY(Math.PI / 8), Mbd, 0, y, rz));
  f.add(at(ribbed(lathe(DOME, Mbd, 48), 24, 0.04), 0, 10.2, rz), at(kalash(1.6), 0, 14.2, rz));
  // That is Vimal Vasahi (1031). The other four temples of the group stand beside it, each as plain
  // outside as the first.
  f.add(otherTemples());
  addDetails(f, g);
  return { group: g, focus: f, view: [0.85, 0.55, 1.15] };
}

// A walled temple court: plain outer walls with a gateway on the south (+z), shrine cells round the
// inside when `cells`, the sanctum with its spire to the north, a closed hall, and an open domed
// mandapa when `domeR`. Built at the origin, standing on y = 0.
function court({ w, d, cells = true, spireW = 7, spireH = 9, domeR = 0, m = M.marble, sh = M.marbleShade }) {
  const c = new THREE.Group();
  c.add(box(w, 1.2, d, sh));
  c.add(wallWithGaps('x', w, 4.6, 0.8, M.plaster, [[0, 6]], 0, d / 2), wallWithGaps('x', w, 4.6, 0.8, M.plaster, [], 0, -d / 2));
  for (const sx of [-1, 1]) c.add(wallWithGaps('z', d, 4.6, 0.8, M.plaster, [], sx * w / 2, 0));
  for (const o of c.children.slice(1)) o.position.y += 1.2;
  c.add(at(trabeateGate(6, 5.5, 2.6, 2.2, 3.4, { m: M.plaster, trim: m, bands: 2 }), 0, 1.2, d / 2));
  if (cells) {
    const list = [], spires = [];
    aroundRect(w - 4, d - 4, 3.2, 1.6).forEach(([x, z, ry]) => {
      if (z > d / 2 - 6 && Math.abs(x) < 3) return;
      list.push([x, 1.2, z, 3, 3.6, 3, ry]);
      spires.push([x, 4.8, z, 2.4, 3, 2.4, ry]);
    });
    c.add(inst(unitBox(), list, m), inst(miniSpireGeo(), spires, m));
  }
  const sz = -d / 2 + spireW / 2 + (cells ? 6 : 3);
  c.add(box(spireW, spireW * 0.8, spireW, m, 0, 1.2, sz), at(shikhara(spireW * 0.9, spireH, m, nagaraProfile, 12), 0, 1.2 + spireW * 0.8, sz));
  const hz = sz + spireW / 2 + spireW * 0.45, hall = pidaRoof(spireW * 0.95, spireW * 0.48, 3, 0.6, m, sh);
  c.add(box(spireW * 0.9, spireW * 0.7, spireW * 0.9, m, 0, 1.2, hz), at(hall, 0, 1.2 + spireW * 0.7, hz), at(bell(spireW * 0.24, m), 0, 1.2 + spireW * 0.7 + hall.userData.top, hz));
  if (domeR) {
    const mz = hz + spireW * 0.45 + domeR + 1, pc = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) pc.push([-domeR * 0.72 + i * domeR * 0.48, 2, mz - domeR * 0.72 + j * domeR * 0.48, 0.7, domeR * 0.75, 0.7]);
    c.add(box(domeR * 2, 0.8, domeR * 2, sh, 0, 1.2, mz), inst(unitCyl(10), pc, m));
    c.add(cyl(domeR * 1.05, domeR * 1.05, 0.8, m, 0, 2 + domeR * 0.75, mz, 8));
    c.add(at(ribbed(lathe(DOME.map(([r, y]) => [r * domeR / 8.4, y * domeR / 8.4]), m, 40), 24, 0.04), 0, 2.8 + domeR * 0.75, mz), at(kalash(domeR * 0.18), 0, 2.8 + domeR * 1.23, mz));
  }
  return c;
}

const GREY = mat('#8f8a80', 0.9), GREY_SH = mat('#76726a', 0.9);
function otherTemples() {
  const o = new THREE.Group();
  // Luna Vasahi (1230), the Tejpal temple, laid out like Vimal Vasahi on a smaller court.
  o.add(at(court({ w: 38, d: 56, spireW: 8, spireH: 10, domeR: 6.2 }), 50, 0, -4));
  // Pittalhar, named for its brass image of Rishabhanatha: court, sanctum and hall, its mandapa
  // left unfinished.
  o.add(at(court({ w: 30, d: 42, spireW: 7, spireH: 8.5 }), 92, 0, -10));
  // The Parshvanath or Khartar Vasahi (1459), the tallest of the group: a three-storey four-faced
  // shrine in grey sandstone rather than marble, under its spire.
  const k = new THREE.Group();
  k.add(box(30, 1.2, 30, GREY_SH), wallWithGaps('x', 30, 4.2, 0.7, M.plaster, [[0, 6]], 0, 15), wallWithGaps('x', 30, 4.2, 0.7, M.plaster, [], 0, -15));
  for (const sx of [-1, 1]) k.add(wallWithGaps('z', 30, 4.2, 0.7, M.plaster, [], sx * 15, 0));
  for (const c of k.children.slice(1)) c.position.y += 1.2;
  let y = 1.2;
  for (const [wd, h] of [[14, 6.5], [11, 5.5], [8.5, 5]]) {
    k.add(box(wd, h, wd, GREY, 0, y, 0), box(wd + 1.2, 0.5, wd + 1.2, GREY_SH, 0, y + h, 0));
    for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) k.add(at(box(2.2, h * 0.6, 0.3, M.recess, 0, 0, 0), Math.sin(a) * (wd / 2 + 0.02), y + 0.6, Math.cos(a) * (wd / 2 + 0.02)).rotateY(a));
    y += h + 0.5;
  }
  k.add(at(shikhara(7.5, 9, GREY, nagaraProfile, 12), 0, y, 0));
  o.add(at(k, -44, 0, -12));
  // Mahavir Swami (1582): a small shrine with a porch, its walls painted inside.
  const mv = new THREE.Group(), mp = pidaRoof(5.4, 2.6, 3, 0.4, M.marble, M.marbleShade);
  mv.add(box(14, 1, 16, M.marbleShade), box(6, 5, 6, M.marble, 0, 1, -3), at(shikhara(5.4, 5.5, M.marble, nagaraProfile, 10), 0, 6, -3));
  mv.add(box(5.6, 4, 5, M.marble, 0, 1, 2.6), at(mp, 0, 5, 2.6));
  o.add(at(mv, -44, 0, 26));
  return o;
}
