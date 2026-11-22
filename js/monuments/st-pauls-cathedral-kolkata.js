import * as THREE from 'three';
import { mat, mesh, box, cyl, at, photo } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { gothicDoor, gothicWindow } from '../parts/colonial.js';
import { gothicPinnacle } from '../parts/sculpture.js';
import { addDetails } from '../details/st-pauls-cathedral-kolkata.js';

// St Paul's, Calcutta: William Nairn Forbes's cathedral of 1847, in stuccoed brick washed an off-white,
// its mouldings a shade greyer, under low roofs of grey slate hidden behind parapets.
export const WALL = photo(mat('#ece7dc', 0.86), 'plaster');
export const TRIM = mat('#cbc3b4', 0.84);
export const SLATE = mat('#6b6966', 0.8);

// A gable roof w across x, d along z and h high, standing on y = 0.
export function gable(w, d, h, m) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
  return mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }).translate(0, 0, -d / 2), m);
}

// An octagonal turret r in radius and h high on y = 0, banded, ending in a crocketed spirelet.
export function turret(r, h, m, trim, spire = r * 4) {
  const g = new THREE.Group();
  g.add(cyl(r, r * 1.08, h, m, 0, 0, 0, 8));
  for (let y = h / 3; y < h - 1; y += h / 3) g.add(cyl(r * 1.12, r * 1.12, 0.35, trim, 0, y, 0, 8));
  g.add(cyl(r * 1.22, r * 1.22, 0.5, trim, 0, h, 0, 8), at(gothicPinnacle(spire, trim), 0, h + 0.5, 0));
  return g;
}

// The cathedral's measures, shared with js/details/st-pauls-cathedral-kolkata.js. The west front
// faces +z at z = FZ; the church runs back 75 m. The nave is NW wide (buttresses outside that) and
// its walls WH high to the parapet; the transept, TW across, crosses it at z = CZ; the chancel, CW
// wide, runs on east to the back. Over the crossing stands the tower, T square: its shaft rises to
// TH, its corner turrets to TT, and their pinnacles to 61 m.
export const S = { FZ: 37, LEN: 75, NW: 21, WH: 17, CZ: -10, TW: 35, TD: 14, CW: 14, T: 12, TH: 48.5, TT: 53 };

export function buildStPaulsCathedralKolkata() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { FZ, LEN, NW, WH, CZ, TW, TD, CW, T, TH, TT } = S, BZ = FZ - LEN;
  const nz0 = CZ + TD / 2, nlen = FZ - nz0, cz0 = CZ - TD / 2, clen = cz0 - BZ;
  // The nave, the transept and the chancel, each under a low slate gable behind its parapet.
  f.add(box(NW, WH, nlen, WALL, 0, 0, nz0 + nlen / 2), at(gable(NW - 1, nlen - 1, 4.5, SLATE), 0, WH - 0.4, nz0 + nlen / 2 - 0.5));
  f.add(box(TW, WH, TD, WALL, 0, 0, CZ), at(gable(TD - 1, TW - 1, 4.5, SLATE).rotateY(Math.PI / 2), 0, WH - 0.4, CZ));
  f.add(box(CW, WH - 2, clen, WALL, 0, 0, cz0 - clen / 2), at(gable(CW - 1, clen - 1, 3.8, SLATE), 0, WH - 2.4, cz0 - clen / 2));
  // Parapets with a moulded coping along every wall head.
  const par = (w, d, y, x, z) => f.add(box(w, 1.1, d, WALL, x, y, z), box(w + 0.3, 0.25, d + 0.3, TRIM, x, y + 1.1, z));
  for (const s of [-1, 1]) {
    par(0.5, nlen, WH, s * (NW / 2 - 0.25), nz0 + nlen / 2);
    par(TW / 2 - NW / 2, 0.5, WH, s * (NW / 2 + (TW / 2 - NW / 2) / 2), CZ + TD / 2 - 0.25);
    par(TW / 2 - CW / 2, 0.5, WH, s * (CW / 2 + (TW / 2 - CW / 2) / 2), CZ - TD / 2 + 0.25);
    par(0.5, TD, WH, s * (TW / 2 - 0.25), CZ);
    par(0.5, clen, WH - 2, s * (CW / 2 - 0.25), cz0 - clen / 2);
  }
  par(CW, 0.5, WH - 2, 0, BZ + 0.25);
  // Buttresses down the sides of the nave and chancel, stepped twice, each ending in a pinnacle
  // above the parapet; the bays between hold tall two-light windows.
  const tr = new THREE.Group(), pin = gothicPinnacle(3.6, TRIM);
  const win = gothicWindow(2.6, 8.4, { m: WALL, trim: TRIM, depth: 0.35 });
  const butt = (x, z, side, h) => {
    tr.add(box(1.3, h * 0.55, 1.5, WALL, x + side * 0.65, 0, z), box(1.3, h * 0.45, 1.0, WALL, x + side * 0.45, h * 0.55, z));
    tr.add(box(1.5, 0.3, 1.7, TRIM, x + side * 0.7, h * 0.55, z), at(pin.clone(), x + side * 0.4, h + 1.35, z));
  };
  for (const s of [-1, 1]) {
    for (let k = 0; k <= 5; k++) butt(s * NW / 2, FZ - 1 - k * ((nlen - 2) / 5), s, WH);
    for (let k = 0; k < 5; k++) tr.add(at(win.clone(), s * NW / 2, 4.5, FZ - 1 - (k + 0.5) * ((nlen - 2) / 5)).rotateY(s * Math.PI / 2));
    for (let k = 0; k <= 3; k++) butt(s * CW / 2, cz0 - 1 - k * ((clen - 2) / 3), s, WH - 2);
    for (let k = 0; k < 3; k++) tr.add(at(win.clone(), s * CW / 2, 4, cz0 - 1 - (k + 0.5) * ((clen - 2) / 3)).rotateY(s * Math.PI / 2));
    // The transept's ends: a great window and turrets at the corners.
    tr.add(at(gothicWindow(6, 11, { m: WALL, trim: TRIM, depth: 0.45 }), s * TW / 2, 3.5, CZ).rotateY(s * Math.PI / 2));
    for (const z of [CZ - TD / 2, CZ + TD / 2]) tr.add(at(turret(1, WH + 3, WALL, TRIM, 4), s * (TW / 2 + 0.2), 0, z));
  }
  // The east end: a window over the altar, and turrets at the corners.
  tr.add(at(gothicWindow(5, 9.5, { m: WALL, trim: TRIM, depth: 0.4 }), 0, 4, BZ).rotateY(Math.PI));
  for (const s of [-1, 1]) tr.add(at(turret(0.9, WH, WALL, TRIM, 3.6), s * (CW / 2 + 0.1), 0, BZ));
  // The west front: a gabled screen between two octagonal turrets, the great west window (the
  // Burne-Jones glass) over a projecting porch, which carries the library above its door.
  tr.add(box(NW + 1, WH + 2, 1.6, WALL, 0, 0, FZ + 0.3), at(gable(NW + 1, 1.6, 7.5, WALL), 0, WH + 2, FZ + 0.3));
  tr.add(box(NW + 1.4, 0.35, 1.9, TRIM, 0, WH + 2, FZ + 0.3));
  for (const s of [-1, 1]) tr.add(at(turret(1.7, WH + 9, WALL, TRIM, 6), s * (NW / 2 + 1.2), 0, FZ + 0.6));
  tr.add(at(gothicPinnacle(4, TRIM), 0, WH + 9.3, FZ + 0.3), box(0.3, 2.2, 0.3, TRIM, 0, WH + 13, FZ + 0.3), box(1.4, 0.3, 0.3, TRIM, 0, WH + 14.4, FZ + 0.3));
  tr.add(at(gothicWindow(7.4, 10.5, { m: WALL, trim: TRIM, depth: 0.5 }), 0, 9.2, FZ + 1.1));
  const PZ = FZ + 1.1, PD = 5.5;
  tr.add(box(12, 8.4, PD, WALL, 0, 0, PZ + PD / 2), box(12.6, 0.35, PD + 0.6, TRIM, 0, 8.4, PZ + PD / 2), box(12.2, 1, PD + 0.2, WALL, 0, 8.75, PZ + PD / 2));
  tr.add(at(gothicDoor(3.4, 6.6, { m: WALL, trim: TRIM, orders: 3, gable: false, pinnacles: false }), 0, 0, PZ + PD));
  for (const s of [-1, 1]) tr.add(at(turret(0.6, 9.7, WALL, TRIM, 2.4), s * 6.2, 0, PZ + PD));
  for (const x of [-4.2, 4.2]) tr.add(at(gothicWindow(1.2, 3.2, { m: WALL, trim: TRIM, depth: 0.2 }), x, 4.1, PZ + PD));
  // The tower over the crossing, after Canterbury's Bell Harry: a square shaft rising from the
  // crossing, two tall stages of paired lancets on every face between buttressed octagonal corner
  // turrets, a pierced parapet, and the turrets carried up above it to their crocketed pinnacles.
  tr.add(box(T, TH, T, WALL, 0, 0, CZ));
  for (const y of [WH + 3, WH + 15.5, TH - 0.4]) tr.add(box(T + 0.5, 0.4, T + 0.5, TRIM, 0, y, CZ));
  tr.add(box(T, 1.6, T, WALL, 0, TH, CZ), box(T + 0.6, 0.3, T + 0.6, TRIM, 0, TH + 1.6, CZ));
  const lan = gothicWindow(1.8, 10.5, { m: WALL, trim: TRIM, depth: 0.3, sill: false });
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) for (const y of [WH + 3.8, WH + 16.3]) for (const s of [-1.4, 1.4]) {
    const o = at(lan.clone(), Math.sin(a) * T / 2 + Math.cos(a) * s, y, CZ + Math.cos(a) * T / 2 - Math.sin(a) * s);
    o.rotation.y = a;
    tr.add(o);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) tr.add(at(turret(1.15, TT, WALL, TRIM, 7.4), sx * T / 2, 0, CZ + sz * T / 2));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const o = at(gothicPinnacle(3.2, TRIM), Math.sin(a) * T / 2, TH + 1.9, CZ + Math.cos(a) * T / 2);
    tr.add(o);
  }
  f.add(mergeByMaterial(tr));
  addDetails(f, g);
  // From the north-west, across the lawns: the west front and the tower over the crossing.
  return { group: g, focus: f, view: [-0.75, 0.3, 1], zoom: 0.85 };
}
