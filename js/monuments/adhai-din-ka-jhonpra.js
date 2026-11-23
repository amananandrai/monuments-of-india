import * as THREE from 'three';
import { M, box, cyl, at, inst, unitCyl, unitBox, hemi } from '../helpers.js';
import { arcadeSkin } from '../parts/mughal.js';
import { carved, frieze, mergeByMaterial } from '../parts/components.js';
import { detail } from '../detail.js';
import { addDetails, screenCarving, engrailed, fluted, LIME, LIME_DARK } from '../details/adhai-din-ka-jhonpra.js';

// Adhai Din Ka Jhonpra, Ajmer: the mosque of 1192–99, with the screen added under Iltutmish in 1213.
// From photographs, the plan of 1911 and Cunningham's measurements: an enclosure 79 m (259 ft)
// square on a high terrace at the foot of Taragarh. Along its west side runs the prayer hall,
// 76 x 12 m inside (248 x 40 ft): rows of pillars taken from temples, three shafts stacked one on
// another, broad at the base and tapering, under a flat roof about 7 m up with low corbelled domes.
// Across the hall's front stands the screen of yellow limestone, some 56 m long and 3.5 m thick:
// a middle section about 18 m high round a tall pointed arch 6.8 m wide, with the stumps of two
// fluted minarets on its top, and three lower arches either side, the inner two lined with
// engrailed (cusped) corbelling. Every arch is framed in bands of Kufic and Tughra script. The hall
// runs on past both ends of the screen. It faces east (+z); north is +x.
export const SL = 56, SD = 3.5, CH = 18, SH = 12, CW = 11, HL = 76, HD = 12.5, HH = 7.2, EW = 79;
// The screen's arches, [cx, width, crown]: the middle one, then at each side two of 4.1 m (13½ ft)
// and a narrower one at the end.
export const ARCHES = [[0, 6.8, 13.4], ...[-1, 1].flatMap((s) => [[s * 9.75, 4.1, 9.4], [s * 17.15, 4.1, 9.4], [s * 23.8, 3.15, 8.6]])];

export function buildAdhaiDinKaJhonpra() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const P = 6, Z0 = -HD - 1.5, Z1 = Z0 + EW;
  // The terrace under hall and court.
  f.add(box(EW, P, EW, LIME_DARK, 0, 0, (Z0 + Z1) / 2));
  // The screen: the middle section standing a little forward, and a wing of three arches either side.
  const screen = new THREE.Group(), skin = { trim: LIME_DARK, fill: 'none', ring: false };
  screen.add(arcadeSkin(CW, CH, [[0, 0, ARCHES[0][1], ARCHES[0][2]]], SD + 0.3, LIME, skin));
  for (const s of [-1, 1]) {
    const len = (SL - CW) / 2, cx = s * (CW / 2 + len / 2);
    screen.add(at(arcadeSkin(len, SH, ARCHES.filter(([x]) => x * s > 0).map(([x, w, h]) => [x - cx, 0, w, h]), SD, LIME, skin), cx, 0, 0));
  }
  // The engrailed lining of the inner two arches of each wing.
  for (const [cx, aw, ah] of ARCHES) if (aw === 4.1) screen.add(at(engrailed(aw, ah, 0.62, 0.9, carved(LIME, 'calligraphy')), cx, 0, SD - 1.3));
  screen.add(screenCarving(ARCHES, { SL, SD, CH, SH, CW }));
  // The stumps of the two minarets on the middle section's corners: hollow, tapering, with 24
  // flutes alternately round and angular and bands of inscription; the northern one stands higher.
  for (const [x, h] of [[-4.3, 1.1], [4.3, 2.6]]) {
    screen.add(at(fluted(1.15, 1.06, h, 24, LIME), x, CH, SD / 2 + 0.15), cyl(0.7, 0.7, 0.04, M.recess, x, CH + h, SD / 2 + 0.15, 16));
    for (let y = 0.55; y < h; y += 1.2) screen.add(cyl(1.19, 1.2, 0.34, carved(LIME, 'calligraphy'), x, CH + y, SD / 2 + 0.15, 24));
  }
  f.add(at(mergeByMaterial(screen), 0, P, 0));
  // The hall behind: its floor a step above the court, the back and end walls, the beams and the
  // flat roof with its parapet.
  const F = 0.4, x0 = HL / 2, rows = [-1.5, -4.7, -7.9, -11.1], nx = 26;
  f.add(box(HL + 3, F, HD + 1.5, LIME_DARK, 0, P, -(HD + 1.5) / 2 + 0.01));
  f.add(box(HL + 3, HH + 0.7, 1.5, LIME_DARK, 0, P, -HD - 0.75));
  for (const s of [-1, 1]) f.add(box(1.5, HH + 0.7, HD, LIME_DARK, s * (x0 + 0.75), P, -HD / 2));
  f.add(box(HL + 3.4, 0.7, HD + 1.7, LIME_DARK, 0, P + HH, -(HD + 1.7) / 2), box(HL + 3, 0.5, 0.5, LIME, 0, P + HH + 0.7, -0.3));
  for (const z of rows) f.add(box(HL, 0.5, 0.55, LIME, 0, P + HH - 0.5, z));
  // The pillars, four rows of 26: a broad base, a square shaft, an eight-sided one and a round one,
  // each a size slimmer, with carved bands between and a bracket capital under the beam.
  const base = [], sq = [], oct = [], round = [], band = [], y0 = P + F;
  for (let i = 0; i < nx; i++) for (const z of rows) {
    const x = -x0 + 1.4 + i * ((HL - 2.8) / (nx - 1));
    base.push([x, y0, z, 0.95, 0.7, 0.95], [x, y0 + 5.75, z, 1.1, 0.55, 0.75]);
    sq.push([x, y0 + 0.7, z, 0.66, 1.5, 0.66]);
    band.push([x, y0 + 2.2, z, 0.86, 0.28, 0.86], [x, y0 + 3.98, z, 0.78, 0.25, 0.78], [x, y0 + 5.5, z, 0.8, 0.25, 0.8]);
    oct.push([x, y0 + 2.48, z, 0.62, 1.5, 0.62]);
    round.push([x, y0 + 4.23, z, 0.5, 1.27, 0.5]);
  }
  const RELIEF = carved(LIME, 'reliefs');
  f.add(inst(unitBox(), base, LIME_DARK), inst(unitBox(), sq, RELIEF), inst(unitCyl(8), oct, RELIEF), inst(unitCyl(detail.low ? 8 : 12), round, LIME), inst(unitCyl(8), band, frieze(LIME)));
  // Low corbelled domes on the roof, one behind each arch of the screen (the middle one larger) and
  // one over each end of the hall beyond it, each on a low eight-sided base under a knob.
  for (const x of [...ARCHES.map(([cx]) => cx), -33.5, 33.5]) {
    const r = x === 0 ? 3.7 : 2.6, y = P + HH + 0.7, d = at(hemi(r, LIME_DARK, 20), x, y + 0.4, -HD / 2);
    d.scale.y = 0.55;
    f.add(cyl(r + 0.15, r + 0.25, 0.4, LIME_DARK, x, y, -HD / 2, 8), d, cyl(0.12, 0.3, 0.6, LIME, x, y + 0.4 + r * 0.55 - 0.05, -HD / 2, 8));
  }
  addDetails(f, g, { P, EW, Z0, Z1, SD });
  // From above the street, a little to the south-east: the gate and its stair, the court, and the
  // screen full on with the hill behind.
  return { group: g, focus: f, view: [0.4, 0.26, 1], zoom: 0.4, target: [0, 11, 22] };
}
