import * as THREE from 'three';
import { M, mat, box, at, onFace, sheet, inst, unitBox, aroundRect, photo, FACES } from '../helpers.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { steps } from '../parts/doorways.js';
import { carved, frieze, jali, archRing, archSlab, medallion, merlons, jharokha, mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, fountains, asiBoard, scatter, along, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE, SHADE, TRIM, minar, PW, PD, VS, VH, U, CP, BAYS, PIERS, MW, MD, MH, TKX, TK } from '../monuments/ibrahim-rauza.js';

// Bands of Arabic cut in relief, the floral carving of pillars and panels, and the teak of the doors.
// (Made on first use: the stones come from the monument's file, which imports this one.)
let K = null;
const carving = () => K || (K = { CALLI: carved(TRIM, 'calligraphy'), FLORAL: frieze(TRIM), PANEL: frieze(STONE) });
const TEAK = photo(mat('#4a3020', 0.75), 'timber');

// The carving of the tomb, about its own centre on the plinth's top. Outside: a moulded ring round
// each arch, a medallion on every pier and a carved band over the arcade. Inside: the second row of
// the double verandah, square pillars with floral shafts and bracket capitals under a carved beam,
// and a ceiling of floral medallions. On each face of the chamber: a teak door framed in bands of
// calligraphy under an arched screen, and either side of it a window of three narrow lights under
// a wide arched jali, in its own inscribed frame. Blind arches round the upper storey.
function tombDress() {
  const g = new THREE.Group(), len = VS - 2 * CP, IS = 22.6, { CALLI, FLORAL, PANEL } = carving();
  for (const a of FACES) {
    const out = new THREE.Group(), ch = new THREE.Group();
    for (const [cx, w, h] of BAYS) out.add(at(archRing(w, h, true, 0.16, 0.07, TRIM), cx, 0, 0));
    out.add(box(len, 0.6, 0.05, PANEL, 0, 7.75, 0.025), box(len, 0.16, 0.12, TRIM, 0, 8.4, 0.06));
    if (!detail.low) for (const x of PIERS) out.add(at(medallion(0.3, TRIM), x, 7.1, 0.01));
    g.add(onFace(out, a, VS / 2));
    // The chamber's wall.
    ch.add(box(3.2, 5, 0.06, CALLI, 0, 0, 0.03), box(2.3, 4.3, 0.1, TRIM, 0, 0, 0.05), box(1.8, 3.8, 0.14, TEAK, 0, 0, 0.07), box(0.05, 3.8, 0.16, SHADE, 0, 0, 0.08));
    ch.add(at(archSlab(2.6, 1.9, true, M.recess, 0.06), 0, 5.15, 0), at(archSlab(2.55, 1.85, true, jali(TRIM), 0.08), 0, 5.15, 0), at(archRing(2.6, 1.9, true, 0.3, 0.1, CALLI), 0, 5.15, 0));
    for (const s of [-1, 1]) {
      const x = s * 4.9;
      ch.add(box(2.9, 5.2, 0.06, CALLI, x, 0.8, 0.03), box(2.1, 1.7, 0.1, M.recess, x, 1.2, 0.05), box(2.3, 0.2, 0.14, TRIM, x, 2.9, 0.07), box(2.3, 0.2, 0.14, TRIM, x, 1, 0.07));
      for (const q of [-0.37, 0.37]) ch.add(box(0.14, 1.7, 0.13, TRIM, x + q, 1.2, 0.065));
      ch.add(at(archSlab(2.1, 2.5, true, M.recess, 0.08), x, 3.15, 0), at(archSlab(2.05, 2.45, true, jali(TRIM), 0.1), x, 3.15, 0));
    }
    ch.add(box(U - 0.6, 0.8, 0.05, CALLI, 0, 6.6, 0.025));
    // Blind arches round the upper storey, above the verandah's roof.
    for (let k = -2; k <= 2; k++) ch.add(at(archSlab(1.7, 2.6, true, SHADE, 0.05), k * 2.8, VH + 0.5, 0), at(archRing(1.7, 2.6, true, 0.12, 0.09, TRIM), k * 2.8, VH + 0.5, 0));
    g.add(onFace(ch, a, U / 2));
    // The beam over the inner pillars, carved along its face.
    g.add(onFace(box(IS + 0.7, VH - 6.9, 0.7, STONE, 0, 5.9, 0), a, IS / 2), onFace(box(IS, 0.5, 0.04, PANEL, 0, 6.2, 0), a, IS / 2 + 0.37));
  }
  const spots = aroundRect(IS, IS, IS / 9);
  g.add(inst(unitBox(), spots.map(([x, z]) => [x, 0.4, z, 0.6, 5.1, 0.6]), FLORAL), inst(unitBox(), spots.map(([x, z]) => [x, 0, z, 0.85, 0.4, 0.85]), TRIM));
  g.add(inst(unitBox(), spots.map(([x, z, ry]) => [x, 5.5, z, 1.7, 0.4, 0.75, ry]), TRIM));
  g.add(box(VS - 2.8, 0.08, VS - 2.8, FLORAL, 0, 8.5, 0));
  return mergeByMaterial(g);
}

// The mosque's dress, about its own centre, its front towards +z: rings and spandrel medallions on
// the five plastered arches, a carved band over them, a domed oriel window and blind arches on
// each side wall, and the mihrab's niche behind.
function mosqueDress() {
  const g = new THREE.Group(), len = MW - 2 * CP, fr = new THREE.Group(), { FLORAL } = carving();
  for (const [cx, , w, h] of cellRow(5, len / 5, 0, 3.5, 6.7)) {
    fr.add(at(archRing(w, h, true, 0.16, 0.07, TRIM), cx, 0, 0));
    if (!detail.low) for (const s of [-1, 1]) fr.add(at(medallion(0.32, TRIM), cx + s * 1.9, 7.2, 0.01));
  }
  fr.add(box(len, 0.6, 0.05, FLORAL, 0, 7.9, 0.025), box(len, 0.16, 0.12, TRIM, 0, 8.6, 0.06));
  g.add(at(fr, 0, 0, MD / 2));
  for (const s of [-1, 1]) {
    g.add(onFace(at(jharokha(1.9, 2.6, STONE, { roof: 'dome', trim: TRIM }), 0, 4.4, 0), s * Math.PI / 2, MW / 2, s * 2));
    for (const l of [-7, -1.5, 4]) g.add(onFace(at(archSlab(2.2, 5.6, true, SHADE, 0.05), 0, 0.6, 0), s * Math.PI / 2, MW / 2, s * (l - 3)), onFace(at(archRing(2.2, 5.6, true, 0.14, 0.09, TRIM), 0, 0.6, 0), s * Math.PI / 2, MW / 2, s * (l - 3)));
  }
  g.add(at(archSlab(2.4, 5, true, SHADE, 0.05), 0, 0.8, -MD / 2 - 2.4).rotateY(Math.PI), at(archRing(2.4, 5, true, 0.16, 0.09, TRIM), 0, 0.8, -MD / 2 - 2.4).rotateY(Math.PI));
  return mergeByMaterial(g);
}

// Ibrahim Rauza: the carving of the tomb and mosque, and all that stands round them. On the plinth,
// a low kerb round its edge; in the middle of its north side the stair, between two pillars each
// under a ball dome in a cup of petals; between tomb and mosque the tank, sunk in stepped ledges
// with short posts round its rim. The garden's wall is lined with small arched cells on the inside
// and opens in wide arches either side of the gateway, which carries a gallery of small arches
// under its battlements. Round the plinth, lawns, palms and old tamarinds; outside, the low houses
// of the town. Dimensions follow js/monuments/ibrahim-rauza.js.
export function addDetails(f, g, { PH, TX, MX, L, WH, WT, GW, GH }) {
  f.add(at(tombDress(), TX, PH, 0), at(mosqueDress(), MX, PH, 0).rotateY(-Math.PI / 2));
  const d = new THREE.Group();
  // The kerb, the stair and its two domed pillars.
  for (const a of FACES) {
    const len = Math.abs(Math.sin(a)) > 0.5 ? PD : PW, dist = (Math.abs(Math.sin(a)) > 0.5 ? PW : PD) / 2 - 0.3;
    if (a === 0) for (const s of [-1, 1]) d.add(onFace(box(len / 2 - 4.5, 0.55, 0.5, SHADE, 0, PH, 0), a, dist, s * (len / 4 + 2.25)));
    else d.add(onFace(box(len, 0.55, 0.5, SHADE, 0, PH, 0), a, dist));
  }
  d.add(at(steps(9, PH, 13, SHADE, 0.45), 0, 0, PD / 2));
  for (const s of [-1, 1]) d.add(box(1.3, PH, 5.6, STONE, s * 5.15, 0, PD / 2 + 2.8), at(minar(PH + 6, 0.85, STONE, { dome: 1.2, stages: 2 }), s * 5.15, 0, PD / 2 + 0.9));
  // The tank: three ledges stepping down to the water, posts along the upper one, a flight of
  // steps down from the mosque's side and a small platform in the water.
  const th = TK / 2, tk = new THREE.Group();
  for (let k = 0; k < 3; k++) {
    const s = TK - k * 2.2, h = PH - 0.7 - k * 0.6;
    for (const q of [-1, 1]) tk.add(box(s, h, 1.1, SHADE, 0, 0, q * (s / 2 - 0.55)), box(1.1, h, s - 2.2, SHADE, q * (s / 2 - 0.55), 0, 0));
  }
  for (const a of FACES) {
    tk.add(onFace(box(TK, PH - 0.02, 0.25, SHADE), a, th - 0.125));
    for (let k = 0; k < 6; k++) tk.add(onFace(box(0.45, 0.6, 0.45, TRIM, 0, PH - 0.7, 0), a, th - 0.7, -th + 1.6 + k * (TK - 3.2) / 5));
  }
  tk.add(at(steps(4, 1.2, 4, TRIM, 0.5), th - 3.3, PH - 1.9, 0).rotateY(-Math.PI / 2), box(2.2, 1.1, 2.2, TRIM), box(0.4, 1.1, 0.4, TRIM, 0, 1.1, 0));
  d.add(at(tk, TKX, 0, 0));
  // The garden wall's cells, its coping, and the gateway's gallery and battlements.
  const skin = (len, aw, ah, pitch) => arcadeSkin(len, WH, cellRow(Math.round(len / pitch), len / Math.round(len / pitch), 0, aw, ah), 0.6, STONE, { trim: TRIM, fill: 'room' });
  for (const a of FACES) {
    if (a === 0) for (const s of [-1, 1]) {
      d.add(at(skin((L - GW) / 2, 3.2, 3.7, 5.2), s * (L + GW) / 4, 0, L / 2 - 0.6));
      d.add(at(skin((L - GW) / 2 - WT, 1.2, 2.3, 5.4), s * (L / 2 - WT + GW / 2) / 2, 0, L / 2 - WT + 0.6).rotateY(Math.PI));
    } else d.add(onFace(skin(L - 2 * WT, 1.2, 2.3, 5.4), a, L / 2 - WT).rotateY(Math.PI));
    d.add(onFace(box(a === 0 ? L + 0.3 : L - 2 * WT, 0.25, WT + 0.3, TRIM, 0, WH, 0), a, L / 2 - WT / 2));
  }
  const gz = L / 2 - 2;
  d.add(at(arcadeSkin(10, 2.4, cellRow(7, 1.4, 0.3, 0.8, 1.6), 0.3, STONE, { trim: TRIM, fill: 'room' }), 0, GH - 3.2, gz + 4.5));
  const crest = new THREE.Group();
  FACES.forEach((a, i) => crest.add(onFace(at(merlons(i % 2 ? 9 : GW, 0.9, 1, 0.4, STONE), 0, GH + 1, 0), a, (i % 2 ? GW : 9) / 2 - 0.25)));
  d.add(at(crest, 0, 0, gz));
  f.add(mergeByMaterial(d));
  g.add(sheet(TK - 6.5, TK - 6.5, M.lake, TKX, 0.9, 0), fountains([[TKX + 3, 3]], { y: 0.9, h: 2 }));
  // The garden inside the walls, and the ground outside.
  g.add(box(L - 2, 0.12, L - 2, mat('#6b8a46', 0.95), 0, 0, 0), box(600, 0.08, 600, mat('#a89a78', 0.96), 0, -0.05, 0));
  g.add(box(6, 0.06, L / 2 - WT - PD / 2 - 5.6, M.path, 0, 0.12, (L / 2 - WT + PD / 2 + 5.6) / 2), box(8, 0.06, 70, M.path, 0, 0.02, L / 2 + 35));
  const avoid = [[-PW / 2 - 4, PW / 2 + 4, -PD / 2 - 4, PD / 2 + 4], [-7, 7, 20, 72], [-70, 4, 20, 70]];
  g.add(trees(scatter(16, [-60, 60, -60, 60], { seed: 4, gap: 12, avoid }), { kind: 'tamarind', seed: 4 }));
  g.add(trees([...along(5, [14, 46], [58, 46]), ...along(8, [-58, -46], [58, -46])], { kind: 'palm', seed: 6 }));
  g.add(shrubs(scatter(40, [-60, 60, -60, 60], { seed: 7, gap: 5, avoid }).map(([x, z]) => [x, z, 1]), { seed: 7, y: 0.12 }));
  // The clipped shrubs and hedges of the approach, outside the gateway.
  g.add(shrubs([...along(7, [-9, L / 2 + 8], [-9, L / 2 + 62]), ...along(7, [9, L / 2 + 8], [9, L / 2 + 62])].map(([x, z]) => [x, z, 2.6]), { seed: 3, y: 0.05 }));
  if (!detail.low) g.add(townHouses(scatter(60, [-220, 220, -220, 220], { seed: 9, gap: 16, avoid: [[-80, 80, -80, 150]] }).map(([x, z], i) => [x, z, 8 + (i % 3) * 2, 9, 1 + (i % 2), (i % 4) * Math.PI / 2]), { seed: 9, fine: false }));
  g.add(asiBoard('Ibrahim Rauza', 8, L / 2 + 6, 0));
}
