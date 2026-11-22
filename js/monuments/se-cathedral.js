import * as THREE from 'three';
import { mat, box, at, onFace, photo } from '../helpers.js';
import { mergeByMaterial, gableRoof, leanTo } from '../parts/components.js';
import { classicalDoor, oculus, pediment } from '../parts/colonial.js';
import { addDetails } from '../details/se-cathedral.js';

// The Sé Cathedral's lime-washed laterite, the grey stone of its pilasters and cornices, and the
// half-round tiles of its roofs.
export const LIME = photo(mat('#f1ece2', 0.88), 'plaster');
export const TRIM = mat('#bdb5a6', 0.85);
export const TILE = mat('#a24a33', 0.82);

// The church's measures, shared with js/details/se-cathedral.js. The façade faces +z (in Old Goa it
// faces east, over the square towards Bom Jesus) at z = FZ; the church runs back 76 m. The nave
// (NW wide) rises to NH under a gable; aisles and chapels (AW wide, AH high) line it on both sides,
// 55 m across in all. The façade is three storeys (T1, T2, T3) under a pediment; the bell tower
// (TW square, TH to its cornice) stands at its south (+x) end, and the stump of the fallen north
// tower at the other.
export const S = { FZ: 10, LEN: 76, NW: 27, NH: 24, AW: 14, AH: 15, FW: 31, T1: 10, T2: 19, T3: 26.5, TW: 9.5, TH: 33 };

export function buildSeCathedral() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { FZ, LEN, NW, NH, AW, AH, FW, T1, T2, T3, TW, TH } = S, cz = FZ - LEN / 2;
  // The nave, its gable roof, and the aisles and chapels under lean-to roofs on both sides.
  f.add(box(NW, NH, LEN - 2, LIME, 0, 0, cz - 1), at(gableRoof(NW + 1.6, LEN - 1.5, 8, TILE), 0, NH, cz - 1.25));
  for (const s of [-1, 1]) {
    f.add(box(AW, AH, LEN - 4, LIME, s * (NW / 2 + AW / 2), 0, cz - 2));
    f.add(at(leanTo(AW + 1.2, LEN - 3.5, 3.4, TILE, s), s * NW / 2, AH, cz - 2));
  }
  // The transept arms, a bay deep, under their own gables, two-thirds of the way back.
  for (const s of [-1, 1]) f.add(box(6, AH + 4, 16, LIME, s * (NW / 2 + AW + 3), 0, cz - 14), at(gableRoof(17, 7, 4.5, TILE).rotateY(Math.PI / 2), s * (NW / 2 + AW + 3), AH + 4, cz - 14));
  // The chancel at the back, lower and narrower than the nave.
  f.add(box(16, 18, 12, LIME, 0, 0, FZ - LEN - 4), at(gableRoof(17.4, 12.6, 5.5, TILE), 0, 18, FZ - LEN - 4));
  // The façade: a screen of three storeys across the nave, its cornices of grey stone.
  f.add(box(FW, T3, 2.6, LIME, 0, 0, FZ));
  for (const y of [T1, T2]) f.add(box(FW + 0.8, 0.7, 3.2, TRIM, 0, y - 0.35, FZ));
  f.add(box(FW + 1, 0.9, 3.4, TRIM, 0, T3 - 0.9, FZ));
  // The pediment over the top storey, and the cross at its apex.
  const ped = pediment(FW * 0.62, 5.2, 2.4, LIME, TRIM);
  f.add(at(ped, 0, T3, FZ - 1.2));
  f.add(box(0.45, 3.2, 0.45, TRIM, 0, T3 + 5.4, FZ), box(1.9, 0.45, 0.45, TRIM, 0, T3 + 7, FZ));
  // The bell tower: the south bay of the front carried up two storeys more as a belfry, its top a
  // cornice and a low tiled pyramid. The north bay ends level with the façade's second cornice.
  const tx = FW / 2 + TW / 2 - 0.3;
  f.add(box(TW, TH, TW, LIME, tx, 0, FZ - TW / 2 + 1.3));
  for (const y of [T1, T2, T3, TH]) f.add(box(TW + 0.8, 0.7, TW + 0.8, TRIM, tx, y - 0.35, FZ - TW / 2 + 1.3));
  const cap = new THREE.Mesh(new THREE.ConeGeometry(TW * 0.62, 4.2, 4).rotateY(Math.PI / 4), TILE);
  cap.position.set(tx, TH + 0.35 + 2.1, FZ - TW / 2 + 1.3);
  f.add(cap, box(TW + 0.4, 0.5, TW + 0.4, TRIM, tx, TH + 0.35, FZ - TW / 2 + 1.3));
  f.add(box(TW, T2 + 1, TW, LIME, -tx, 0, FZ - TW / 2 + 1.3), box(TW + 0.8, 0.7, TW + 0.8, TRIM, -tx, T1 - 0.35, FZ - TW / 2 + 1.3), box(TW + 1, 0.9, TW + 1, TRIM, -tx, T2 + 0.6, FZ - TW / 2 + 1.3));
  // Doors and windows of the front: the great portal between paired Corinthian columns, two side
  // doors, round-headed windows on the second storey, and an oculus and two windows on the third.
  const fd = { m: LIME, trim: TRIM, colM: TRIM }, front = new THREE.Group(), zf = FZ + 1.3;
  front.add(onFace(classicalDoor(4, 7, { ...fd, columns: 2, top: 'pediment', depth: 0.6, frame: 0.6 }), 0, zf));
  const side = classicalDoor(2.6, 5, { ...fd, pilasters: true, top: 'cornice', depth: 0.4 });
  const win = classicalDoor(2, 4, { ...fd, fill: 'glass', top: 'cornice', depth: 0.3, frame: 0.35 });
  for (const x of [-10, 10]) front.add(onFace(side.clone(), 0, zf, x));
  for (const x of [-10, 0, 10]) front.add(onFace(at(win.clone(), 0, T1 + 2.2, 0), 0, zf, x));
  front.add(onFace(at(oculus(1.8, { m: LIME, trim: TRIM, frame: 0.5 }), 0, T2 + 3.6, 0), 0, zf));
  for (const x of [-8.5, 8.5]) front.add(onFace(at(win.clone(), 0, T2 + 1.6, 0), 0, zf, x));
  // The tower's own windows on its front, and the round-arched belfry openings on every face.
  const tw = classicalDoor(1.6, 3.2, { ...fd, fill: 'glass', top: null, depth: 0.25, frame: 0.3 });
  for (const y of [T1 + 2.4, T2 + 2]) front.add(onFace(at(tw.clone(), 0, y, 0), 0, zf, tx), onFace(at(tw.clone(), 0, y, 0), 0, zf, -tx));
  const bel = classicalDoor(2.8, 4.6, { ...fd, fill: 'room', top: null, depth: 0.4, frame: 0.4 });
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const t = at(new THREE.Group(), tx, 0, FZ - TW / 2 + 1.3);
    t.add(onFace(at(bel.clone(), 0, T3 + 0.9, 0), a, TW / 2));
    front.add(t);
  }
  f.add(mergeByMaterial(front));
  addDetails(f, g);
  // From the south-east of the square, the bell tower nearest.
  return { group: g, focus: f, view: [0.7, 0.24, 1], zoom: 0.85 };
}
