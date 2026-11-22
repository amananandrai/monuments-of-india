import * as THREE from 'three';
import { box, at, inst, unitCyl, unitBox, hemi } from '../helpers.js';
import { arcadeSkin } from '../parts/mughal.js';
import { carved, mergeByMaterial } from '../parts/components.js';
import { addDetails, LIME, LIME_DARK } from '../details/adhai-din-ka-jhonpra.js';

// Adhai Din Ka Jhonpra, Ajmer: the mosque of 1199, with the screen added under Iltutmish in 1229.
// From photographs: a screen of yellow limestone about 56 m long stands across the front of the
// prayer hall. Its middle section rises to about 20 m round a tall pointed arch, with the stumps of
// two fluted (stellate) minarets on top; three lower arches open either side. Every arch is framed in
// bands of carved Kufic and Tughra script. Behind the screen, the hall: rows of slender pillars taken
// from temples, stacked three high, under a flat roof with low corbelled domes. In front, the
// ruined court. It faces east (+z).
export const SL = 56, SD = 3.6, CH = 20.5, SH = 14.5, HD = 14, HH = 10;

// A band of carved script, w wide and h high, t proud of the wall.
const SCRIPT = () => carved(LIME, 'calligraphy');
function frameArch(aw, ah, bw) {
  const g = new THREE.Group(), m = SCRIPT();
  for (const x of [-1, 1]) g.add(box(bw, ah + bw, 0.08, m, x * (aw / 2 + bw * 0.5 + 0.15), 0, 0.04));
  g.add(box(aw + 2 * bw + 0.3, bw, 0.08, m, 0, ah + 0.15, 0.04));
  return g;
}

export function buildAdhaiDinKaJhonpra() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const P = 1.8;
  // The platform under hall and court.
  f.add(box(SL + 14, P, 70, LIME_DARK, 0, 0, 12));
  // The screen: the middle section 14 wide, then three arches either side, 7 m apart.
  const screen = new THREE.Group();
  screen.add(at(arcadeSkin(14, CH, [[0, 0, 8, 15.5]], SD, LIME, { trim: LIME_DARK, fill: 'none' }), 0, 0, 0));
  screen.add(frameArch(8, 15.5, 1.1).translateZ(SD));
  for (const s of [-1, 1]) {
    const cells = [0, 1, 2].map((k) => [s * (3.5 + k * 7) - s * 10.5, 0, 4.6, 9.5]);
    screen.add(at(arcadeSkin(21, SH, cells, SD, LIME, { trim: LIME_DARK, fill: 'none' }), s * 17.5, 0, 0));
    for (const [cx] of cells) screen.add(at(frameArch(4.6, 9.5, 0.7), s * 17.5 + cx, 0, SD));
    // Two bands of script run the length of each wing over the arches.
    screen.add(box(21, 0.9, 0.08, SCRIPT(), s * 17.5, SH - 2.6, SD + 0.04));
  }
  screen.add(box(14, 1.2, 0.08, SCRIPT(), 0, CH - 2.6, SD + 0.04));
  // The stumps of the two fluted minarets over the middle section.
  for (const x of [-5.4, 5.4]) {
    const flutes = [];
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; flutes.push([x + Math.sin(a) * 1.15, CH, SD / 2 + Math.cos(a) * 1.15, 0.7, 3.2 + (k % 3) * 0.5, 0.7, a]); }
    screen.add(inst(unitBox(), flutes, LIME), box(2.2, 3.4, 2.2, LIME, x, CH, SD / 2));
  }
  f.add(at(mergeByMaterial(screen), 0, P, 0));
  // The hall behind: back and side walls, a flat roof, and the pillars: five rows of 22, each three
  // stacked shafts with square blocks between.
  f.add(box(SL, HH + 0.6, 1.4, LIME_DARK, 0, P, -HD + 0.7));
  for (const s of [-1, 1]) f.add(box(1.4, HH + 0.6, HD, LIME_DARK, s * (SL / 2 - 0.7), P, -HD / 2));
  f.add(box(SL, 0.6, HD, LIME_DARK, 0, P + HH, -HD / 2));
  const shafts = [], blocks = [];
  for (let i = 0; i < 22; i++) for (let j = 0; j < 4; j++) {
    const x = -SL / 2 + 2.2 + i * ((SL - 4.4) / 21), z = -1.6 - j * 3.3;
    for (let k = 0; k < 3; k++) { shafts.push([x, P + k * HH / 3 + 0.35, z, 0.5, HH / 3 - 0.7, 0.5]); blocks.push([x, P + k * HH / 3, z, 0.75, 0.35, 0.75], [x, P + (k + 1) * HH / 3 - 0.35, z, 0.75, 0.35, 0.75]); }
  }
  f.add(inst(unitCyl(8), shafts, LIME), inst(unitBox(), blocks, LIME_DARK));
  // Low corbelled domes on the roof over the middle bays.
  for (const x of [-16, -8, 0, 8, 16]) {
    const d = at(hemi(x === 0 ? 4 : 2.8, LIME, 20), x, P + HH + 0.6, -HD / 2);
    d.scale.y = 0.45;
    f.add(d);
  }
  addDetails(f, g, { P });
  // From the court, a little to the south-east, the screen full on with the hill behind.
  return { group: g, focus: f, view: [0.35, 0.16, 1], zoom: 0.6, target: [0, 9, 4] };
}
