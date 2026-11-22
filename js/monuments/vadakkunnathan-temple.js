import * as THREE from 'three';
import { mat, mesh, box, cyl, at, onFace, hipRoof, kalash, photo, doubleSided, FACES } from '../helpers.js';
import { mergeByMaterial, windowFrame, jali } from '../parts/components.js';
import { keralaGable, ringRoof, keralaGopuram } from '../parts/temples.js';
import { addDetails } from '../details/vadakkunnathan-temple.js';

// Vadakkunnathan's laterite, bare on its great wall and its bases and whitewashed on the shrines;
// teak for its upper storeys, struts and lattices; the clay tiles of the gateways and cloister, and
// the copper sheets of the shrines' roofs, gone brown; brass for the finials.
export const LIME = photo(mat('#f1ece2', 0.86), 'plaster');
export const LATERITE = photo(mat('#99583c', 0.95), 'laterite');
export const TEAK = photo(mat('#57381f', 0.7), 'timber');
export const TILE = mat('#8e4630', 0.82);
export const COPPER = mat('#7d4f33', 0.5, 0.45);
export const BRASS = mat('#c99a3a', 0.35, 0.8);

// The temple's measures, shared with js/details/vadakkunnathan-temple.js: the outer wall S square
// (about 9 acres) and WH high; the cloister (chuttambalam) CW × CD, CH high to its eaves.
export const P = { S: 190, WH: 4.2, CW: 64, CD: 54, CH: 3.8 };

// A round shrine (vatta srikovil): a whitewashed drum r across on a moulded laterite base, under a
// conical roof of copper in two tiers, crowned by a brass finial.
function roundShrine(r, h, two = false) {
  const g = new THREE.Group();
  g.add(cyl(r + 0.9, r + 1.1, 0.5, LATERITE, 0, 0, 0, 32), cyl(r + 0.6, r + 0.8, 0.6, LATERITE, 0, 0.5, 0, 32));
  g.add(cyl(r, r, h, LIME, 0, 1.1, 0, 32), cyl(r + 0.15, r + 0.15, 0.3, TEAK, 0, 1.1 + h - 0.3, 0, 32));
  let y = 1.1 + h;
  const cone = (R, H, y0) => { const m = mesh(new THREE.ConeGeometry(R, H, 32, 1, true), doubleSided(COPPER), 0, y0 + H / 2, 0); g.add(m); };
  if (two) {
    cone(r + 2, 1.8, y - 0.1);
    g.add(cyl(r * 0.62, r * 0.62, 2.2, TEAK, 0, y + 0.6, 0, 32));
    y += 2.8;
    cone(r * 0.62 + 1.6, r * 0.62 + 2.4, y - 0.1);
    y += r * 0.62 + 2.4;
  } else {
    cone(r + 2, r + 2.6, y - 0.1);
    y += r + 2.6;
  }
  g.add(at(kalash(0.55, BRASS), 0, y - 0.35, 0));
  return g;
}

// A square shrine of two storeys under a copper pyramid, as the shrine of Rama.
function squareShrine(w, h) {
  const g = new THREE.Group();
  g.add(box(w + 2, 1.1, w + 2, LATERITE), box(w, h, w, LIME, 0, 1.1, 0), box(w + 0.3, 0.3, w + 0.3, TEAK, 0, 1.1 + h - 0.3, 0));
  const y = 1.1 + h;
  g.add(at(hipRoof(w + 3.6, w + 3.6, 1.6, COPPER), 0, y, 0), box(w * 0.66, 2, w * 0.66, TEAK, 0, y + 0.6, 0));
  g.add(at(hipRoof(w * 0.66 + 2.6, w * 0.66 + 2.6, w * 0.5, COPPER), 0, y + 2.5, 0), at(kalash(0.5, BRASS), 0, y + 2.5 + w * 0.5 - 0.15, 0));
  return g;
}

// Vadakkunnathan Temple, Thrissur. From photographs and plans: a great laterite wall enclosing
// some nine acres on a low hill in the middle of Thekkinkadu Maidan, with a gateway in the middle
// of each side, timber-framed under three tiers of tiled roof; within it the cloister
// (chuttambalam), a ring of tiled roofs round the inner court, and in the court three shrines
// side by side: the round shrine of Shiva (Vadakkunnathan), the square shrine of Rama, and the
// round two-storey shrine of Shankaranarayana; and outside the cloister the Koothambalam, the
// long, steep-roofed temple theatre. The east gateway faces +z.
export function buildVadakkunnathanTemple() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { S, WH, CW, CD, CH } = P;
  // The outer wall, with the gateways in the middle of each side.
  const wl = new THREE.Group(), gw = 15;
  for (const a of FACES) for (const s of [-1, 1]) {
    const len = S / 2 - gw / 2, w = onFace(box(len, WH, 1.4, LATERITE, 0, 0, 0), a, S / 2, s * (gw / 2 + len / 2));
    const cap = onFace(box(len, 0.3, 1.8, TILE, 0, WH, 0), a, S / 2, s * (gw / 2 + len / 2));
    wl.add(w, cap);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) wl.add(box(2.4, WH + 0.4, 2.4, LATERITE, sx * S / 2, 0, sz * S / 2));
  f.add(mergeByMaterial(wl));
  for (const a of FACES) f.add(onFace(keralaGopuram(gw, 11, { base: LATERITE, wood: TEAK, roof: TILE, brass: BRASS }), a, S / 2));
  // The cloister: an outer wall of laterite and lattices round a court, under one ring of roof.
  const cl = new THREE.Group(), WD = 9;
  for (const s of [-1, 1]) {
    cl.add(box(CW, CH, 0.8, LIME, 0, 0.8, s * CD / 2), box(0.8, CH, CD, LIME, s * CW / 2, 0.8, 0));
    cl.add(box(CW - 2 * WD, CH - 1, 0.5, LIME, 0, 0.8, s * (CD / 2 - WD)), box(0.5, CH - 1, CD - 2 * WD, LIME, s * (CW / 2 - WD), 0.8, 0));
  }
  cl.add(box(CW + 2, 0.8, CD + 2, LATERITE, 0, 0, 0));
  cl.add(box(CW - 2 * WD - 0.6, 0.06, CD - 2 * WD - 0.6, LATERITE, 0, 0.8, 0));
  cl.add(box(CW + 0.6, 0.3, CD + 0.6, TEAK, 0, 0.8 + CH - 0.3, 0));
  f.add(mergeByMaterial(cl));
  f.add(at(ringRoof(CW, CD, WD, 1.8, 4.6, TILE), 0, 0.8 + CH, 0));
  // The cloister's entrance on the east: a porch with a gable over it.
  const pe = keralaGable(7, 2.4, 3.6, TILE, TEAK);
  pe.position.set(0, 0.8 + CH + 0.9, CD / 2 + 1.8 - 0.9 * (1.8 + WD / 2) / 4.6 + 0.2);
  f.add(pe);
  // Windows of lattice along the cloister's outer wall.
  const lw = windowFrame(1.6, 1.4, TEAK, { shape: 'flat', screen: jali(TEAK), frame: 0.14 }), ws = new THREE.Group();
  for (const a of FACES) {
    const along = Math.abs(Math.sin(a)) > 0.5 ? CD : CW, dist = (Math.abs(Math.sin(a)) > 0.5 ? CW : CD) / 2 + 0.4, n = Math.floor(along / 4);
    for (let k = 0; k < n; k++) { const l = -along / 2 + (k + 0.5) * along / n; if (a === 0 && Math.abs(l) < 4) continue; ws.add(onFace(at(lw.clone(), 0, 2.2, 0), a, dist + 0.01, l)); }
  }
  f.add(mergeByMaterial(ws));
  // The three shrines in the court.
  f.add(at(squareShrine(7.4, 4.2), -12, 0.8, -2), at(roundShrine(5.2, 4.4), 3, 0.8, -2), at(roundShrine(4, 3.8, true), 16, 0.8, -1));
  // The Koothambalam, north of the cloister: a long hall of laterite and lattice under a steep
  // hipped roof with gables at its ends.
  const kz = -CD / 2 - 26, k = new THREE.Group();
  k.add(box(26, 1.2, 16, LATERITE, 0, 0, 0), box(22, 4.2, 12, LIME, 0, 1.2, 0), box(22.4, 0.3, 12.4, TEAK, 0, 5.1, 0));
  k.add(at(hipRoof(27, 17, 8.2, TILE), 0, 5.4, 0));
  for (const a of [Math.PI / 2, -Math.PI / 2]) { const gb = keralaGable(6, 3, 4.4, TILE, TEAK); gb.position.set(Math.sin(a) * 10.3, 7.2, 0); gb.rotation.y = a; k.add(gb); }
  for (const a of [0, Math.PI]) for (let j = -3; j <= 3; j++) k.add(onFace(at(lw.clone(), 0, 2.4, 0), a, 6.01, j * 3));
  f.add(at(k, -10, 0, kz));
  addDetails(f, g);
  // From the east, over the gateway, the cloister and its shrines behind.
  return { group: g, focus: f, view: [0.4, 0.3, 1], zoom: 0.42 };
}
