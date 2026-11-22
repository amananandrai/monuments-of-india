import * as THREE from 'three';
import { mat, mesh, box, at, onFace, kalash, photo, inst } from '../helpers.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial, carved, templeNiche, idol, mouldings } from '../parts/components.js';
import { chandrashala } from '../parts/temples.js';
import { addDetails } from '../details/teli-ka-mandir.js';

// Teli ka Mandir, the tallest building on Gwalior Fort: a Pratihara temple of the 8th or 9th
// century, about 28 m high. From photographs: a sanctum on an oblong plan, some 18 m across its
// front (east, +z) and 12 m deep, on a moulded platform; its walls stand about 10 m, cut by a
// projecting central bay on every face, the front one opened by a doorway nearly 9 m high. Over
// them the tower rises not to a curved spire but in tiers of carved arch-windows (gavakshas),
// narrowing more front to back than side to side, to a barrel-vaulted roof (the valabhi form)
// whose ridge runs across the front, studded with pots, its ends closed by great horseshoe arches.
export const STONE = photo(mat('#b4a083', 0.9), 'sandstone');
export const SHADE = photo(mat('#93805f', 0.92), 'sandstone');
// The tiers of the tower carry a mesh of little arch-windows: the 'reliefs' surface.
export const MESHED = carved(mat('#a8946f', 0.92), 'reliefs');

export function buildTeliKaMandir() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  const S = STONE, Sd = SHADE;
  // P: the platform; W x D the walls; WH their height; the bays project `pb` from each face.
  const P = 1.6, W = 18, D = 12, WH = 10, pb = 1.1, Y = P + WH;
  d.add(box(W + 6, P, D + 8, Sd, 0, 0, 1), box(W + 6.4, 0.25, D + 8.4, S, 0, P - 0.25, 1));
  d.add(at(steps(7, P, 6, Sd), 0, 0, D / 2 + 5));
  // The walls, with a central bay on each face, and the moulded base.
  d.add(box(W, WH, D, S, 0, P, 0), box(6.4, WH, D + 2 * pb, S, 0, P, 0), box(W + 2 * pb, WH, 4.6, S, 0, P, 0));
  d.add(mouldings(W + 2 * pb + 0.01, D + 2 * pb + 0.01, [[P, 0.45, 0.22, Sd], [P + 0.45, 0.35, 0.12, S], [P + 0.8, 0.3, 0.18, Sd], [P + WH - 0.9, 0.35, 0.16, Sd], [P + WH - 0.55, 0.55, 0.3, S]], S));
  // Pilaster strips at the corners of the walls.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) d.add(box(1.2, WH - 1.6, 1.2, Sd, sx * (W / 2 - 0.5), P + 1.1, sz * (D / 2 - 0.5)));
  // The tower: eight tiers, each a block of carved arch-windows with a ledge at its head, the
  // width going from 17 to 11 m and the depth from 11 to 4.6 m; a spine of the same carving up the
  // middle of the front and the back.
  const TN = 8, TH = 1.75;
  for (let k = 0; k < TN; k++) {
    const t = k / (TN - 1), w = 17 - 6 * t, dp = 11 - 6.4 * t, y = Y + k * TH;
    d.add(box(w - 0.3, TH, dp - 0.3, Sd, 0, y, 0), box(w, TH - 0.35, dp, MESHED, 0, y + 0.02, 0), box(w + 0.35, 0.3, dp + 0.35, S, 0, y + TH - 0.33, 0));
    d.add(box(5.6 - 1.6 * t, TH - 0.35, dp + 1.2, MESHED, 0, y + 0.02, 0), box(6 - 1.6 * t, 0.3, dp + 1.5, S, 0, y + TH - 0.33, 0));
  }
  // A ribbed corner stone (amalaka) at each corner of every tier.
  const corners = [];
  for (let k = 0; k < TN; k++) {
    const t = k / (TN - 1), w = 17 - 6 * t, dp = 11 - 6.4 * t, y = Y + k * TH + TH - 0.05, r = 0.62 - 0.22 * t;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) corners.push([sx * (w / 2 - r * 0.6), y, sz * (dp / 2 - r * 0.6), r, r * 0.45, r]);
  }
  d.add(inst(new THREE.SphereGeometry(1, 12, 5).translate(0, 0.4, 0), corners, S));
  // The barrel roof: a half-cylinder along x over the last tier, a ridge with five pots.
  const VY = Y + TN * TH, VR = 2.3, VL = 11.2;
  const vault = mesh(new THREE.CylinderGeometry(VR, VR, VL, 24, 1, false, 0, Math.PI), MESHED, 0, VY, 0);
  // Half a cylinder (x >= 0), turned so that its axis runs along x and its curve is on top.
  vault.rotation.z = Math.PI / 2;
  d.add(vault);
  d.add(box(VL + 0.4, 0.3, 4.9, S, 0, VY - 0.3, 0));
  for (let k = -2; k <= 2; k++) d.add(at(kalash(0.75, S), k * 2.4, VY + VR - 0.1, 0));
  // Its ends, closed by great horseshoe arches, and the arches stacked up the front and the back.
  for (const s of [-1, 1]) {
    const e = at(chandrashala(2.1, S, 0.5), s * (VL / 2), VY + 0.2, 0);
    e.rotation.y = s * Math.PI / 2;
    d.add(e);
    for (const [y, r] of [[Y + 2.5, 1.9], [Y + 6.6, 1.6], [Y + 10.4, 1.3]]) {
      const zz = s * ((11 - 6.4 * ((y - Y) / TH) / (TN - 1)) / 2 + 0.62);
      d.add(onFace(at(chandrashala(r, S, 0.45), 0, y, 0), s > 0 ? 0 : Math.PI, Math.abs(zz)));
    }
  }
  // The front bay: the doorway, almost the height of the walls, and an image in a niche in the
  // middle of each of the other three faces, with two more either side of it.
  d.add(at(templeDoorway(3.2, 8.4, { m: S, guardianH: 2, bands: 4 }), 0, P, D / 2 + pb + 0.02));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) {
    const dist = (Math.abs(Math.sin(a)) > 0.5 ? W : D) / 2 + pb + 0.01;
    d.add(onFace(at(templeNiche(1.9, 3.6, S, { figure: idol(3, Sd) }), 0, P + 2, 0), a, dist));
    for (const l of [-1, 1]) d.add(onFace(at(templeNiche(1.2, 2.6, S, { figure: idol(2.2, Sd) }), 0, P + 2.4, 0), a, (Math.abs(Math.sin(a)) > 0.5 ? W : D) / 2 + 0.01, l * (Math.abs(Math.sin(a)) > 0.5 ? 4.4 : 6.4)));
  }
  for (const l of [-1, 1]) d.add(onFace(at(templeNiche(1.3, 3, S, { figure: idol(2.5, Sd) }), 0, P + 2, 0), 0, D / 2 + 0.01, l * 6.2));
  f.add(mergeByMaterial(d));
  addDetails(f, g, { P, W, D, WH, pb, Y, VY });
  // From the south-east: the tall front with its door, and the barrel roof seen end-on.
  return { group: g, focus: f, view: [0.62, 0.22, 1], zoom: 0.78 };
}
