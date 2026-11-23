import * as THREE from 'three';
import { M, mesh, box, cyl, at, sheet, ring, chhatri } from '../helpers.js';
import { mergeByMaterial, dentils, railing, jali, rosette, panel, chhajja } from '../parts/components.js';
import { column } from '../parts/colonial.js';
import { steps } from '../parts/doorways.js';
import { heightField, smooth, fbm } from '../parts/terrain.js';
import { trees, shrubs, lampPosts, benches, fountains, scatter, along, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, SAND, SAND_DEEP } from '../monuments/umaid-bhawan-palace.js';

// Umaid Bhawan, finer detail. From photographs: a band of dentils under each cornice; low
// balustrades along the wing roofs and round the base of the dome; stone lanterns by the steps;
// the arms over the entrance; and the marble baradari on the front lawn.
// Measures follow js/monuments/umaid-bhawan-palace.js.
function architecture(f) {
  const { CW, CH, WL, WD, WH } = P, d = new THREE.Group(), B = 1.6;
  for (const s of [-1, 1]) {
    d.add(at(dentils(CW, 0.3, 0.3, 0.3, SAND_DEEP), 0, B + CH - 1.25, s * (CW / 2 + 0.15)).rotateY(s > 0 ? 0 : Math.PI));
    const cx = s * (CW / 2 + WL / 2);
    for (const z of [-1, 1]) d.add(at(dentils(WL, 0.3, 0.3, 0.3, SAND_DEEP), cx, B + WH - 1.15, z * (WD / 2 + 0.15)).rotateY(z > 0 ? 0 : Math.PI));
    for (const z of [-1, 1]) d.add(at(railing(WL - 4, 1, 0.25, SAND, 2.2, SAND), cx, B + WH + 1.2, z * (WD / 2 - 0.9)));
  }
  // Lanterns on piers at the foot of the entrance steps.
  const fz = CW / 2, { PW, PD, PH } = P;
  for (const s of [-1, 1]) {
    const x = s * (PW / 2 + 0.8), z = fz + PD + 4.2;
    d.add(box(1.4, 1.6, 1.4, SAND_DEEP, x, B + 0.5, z - 1.2), cyl(0.35, 0.35, 1.4, M.stoneDark, x, B + 2.1, z - 1.2, 8), cyl(0.5, 0.2, 0.6, M.stoneDark, x, B + 3.5, z - 1.2, 8));
  }
  // The arms of the Rathores over the entrance, on the portico's parapet: a shield between two
  // supporters under a crest; and a carved cartouche on the parapet over each end of the portico.
  const arms = new THREE.Group();
  arms.add(box(5.2, 0.5, 0.6, SAND_DEEP, 0, 0, 0), box(1.5, 1.7, 0.4, SAND_DEEP, 0, 0.5, 0), cyl(0.001, 0.75, 0.5, SAND_DEEP, 0, 2.2, 0, 4), at(rosette(0.55, SAND), 0, 1.35, 0.21));
  for (const s of [-1, 1]) arms.add(box(0.7, 1.5, 0.4, SAND_DEEP, s * 1.4, 0.5, 0), at(mesh(new THREE.SphereGeometry(0.34, 8, 6), SAND_DEEP), s * 1.4, 2.2, 0), box(0.9, 0.5, 0.4, SAND_DEEP, s * 2.2, 0.5, 0));
  d.add(at(arms, 0, B + PH + 3.3, fz + PD - 0.5));
  for (const s of [-1, 1]) d.add(at(panel(2.6, 1.5, 0.2, SAND_DEEP), s * (PW / 2 - 3.4), B + PH + 2.1, fz + PD + 0.01), at(rosette(0.6, SAND_DEEP), s * (CW / 2 - 3.2), B + 16.4, fz + 2.03));
  // Pierced balustrade bands under the Durbar block's upper windows and round the dome's base.
  d.add(box(PW - 2, 1.1, 0.1, jali(SAND), 0, B + PH + 3.6, fz + 0.06));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) d.add(at(railing(20, 1, 0.25, SAND, 2.2, jali(SAND)), Math.sin(a) * 17.3, B + CH + 5, Math.cos(a) * 17.3).rotateY(a));
  f.add(mergeByMaterial(d));
}

// Chittar Hill: the hilltop levelled for the palace and its gardens, falling away on every side
// to the city of Jodhpur, the slopes rock and dry scrub.
function hillY(x, z) {
  const r = Math.hypot(x / 1.15, z - 40);
  return -30 * smooth(215, 330, r) + 3 * fbm(x, z, { scale: 0.01, octaves: 3 }) * smooth(215, 280, r);
}

// The palace's grounds on Chittar Hill: the drive up to the east front between lawns, a round
// fountain on its axis; the sunken garden behind; palms, bougainvillea and kiosks at the corners
// of the lawns; the hill falling away to the old city's houses below.
export function addDetails(f, g) {
  architecture(f);
  const { CW, WL, EW } = P, fz = CW / 2, half = CW / 2 + WL + EW + 4;
  g.add(heightField(1200, 1100, detail.low ? 90 : 140, hillY, { cz: 40, rock: ['#a8886a', '#b5977a', '#9c7e62'], cover: '#9a8f63', steep: 0.86 }));
  g.add(box(half * 2 + 40, 0.1, 230, M.grass, 0, -0.05, 40));
  // The drive, the forecourt and the paths round the lawns.
  g.add(box(40, 0.05, 30, M.path, 0, 0.02, fz + 26), box(12, 0.05, 110, M.path, 0, 0.02, fz + 95));
  g.add(box(half * 2 + 20, 0.05, 5, M.path, 0, 0.02, fz + 44), box(half * 2 + 20, 0.05, 5, M.path, 0, 0.02, -fz - 20));
  // The round pool and fountain on the axis of the drive.
  const pz = fz + 62, pool = new THREE.Group();
  pool.add(at(ring(13, 0.7, SAND_DEEP, 0, 48), 0, 0, pz), cyl(12.95, 12.95, 0.4, M.water, 0, 0, pz, 48));
  g.add(pool, fountains([[0, pz]], { y: 0.56, h: 4 }));
  // The garden behind: a sunken lawn in a frame of terraces.
  g.add(box(150, 0.7, 6, SAND_DEEP, 0, 0, -fz - 28), box(140, 0.05, 50, M.grass, 0, 0.02, -fz - 56), sheet(30, 12, M.water, 0, 0.15, -fz - 56));
  // The baradari on the front lawn: a pavilion of white marble, twelve columns on a stepped
  // platform under a flat roof with a deep chhajja.
  const bd = new THREE.Group(), bw = 13;
  bd.add(box(bw + 3, 1.2, bw + 3, M.marble, 0, 0, 0), box(bw + 1.4, 0.5, bw + 1.4, M.marbleShade, 0, 5.9, 0), box(bw + 0.6, 0.5, bw + 0.6, M.marble, 0, 6.4, 0));
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (i % 3 === 0 || j % 3 === 0) bd.add(at(column(0.34, 4.7, M.marble), (i - 1.5) * bw / 3.4, 1.2, (j - 1.5) * bw / 3.4));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) bd.add(at(chhajja(bw + 4, 1.6, 0.5, 0.14, M.marble), Math.sin(a) * (bw / 2 + 0.7), 6.4, Math.cos(a) * (bw / 2 + 0.7)).rotateY(a), at(steps(5, 1.2, 4, M.marble, 0.4), Math.sin(a) * (bw / 2 + 1.5), 0, Math.cos(a) * (bw / 2 + 1.5)).rotateY(a));
  g.add(at(mergeByMaterial(bd), -52, 0, fz + 66));
  // Kiosks at the corners of the front lawn.
  for (const s of [-1, 1]) g.add(at(chhatri(2.4, 6, SAND, SAND), s * 70, 0, fz + 80));
  g.add(trees([...along(9, [-12, fz + 44], [-12, fz + 140]), ...along(9, [12, fz + 44], [12, fz + 140])], { kind: 'palm', seed: 3, h: 12 }));
  g.add(trees(scatter(26, [-half - 20, half + 20, -fz - 90, fz + 150], { seed: 6, gap: 16, avoid: [[-half - 6, half + 6, -fz - 34, fz + 20], [-22, 22, fz, fz + 150], [-80, 80, fz + 40, fz + 100]] }), { kind: 'neem', seed: 6 }));
  g.add(shrubs([...along(16, [-half + 10, fz + 40], [-20, fz + 40]), ...along(16, [20, fz + 40], [half - 10, fz + 40])].map(([x, z]) => [x, z, 1]), { seed: 4, flowers: '#d6337a' }));
  g.add(lampPosts([...along(6, [-7.5, fz + 46], [-7.5, fz + 140]), ...along(6, [7.5, fz + 46], [7.5, fz + 140])]));
  g.add(benches([[-30, fz + 70], [30, fz + 70], [-40, -fz - 50], [40, -fz - 50]]));
  // Scrub on the slopes, and the city below.
  const slope = scatter(detail.low ? 40 : 90, [-560, 560, -500, 580], { seed: 9, gap: 14 }).filter(([x, z]) => Math.hypot(x / 1.15, z - 40) > 225 && Math.hypot(x / 1.15, z - 40) < 330);
  g.add(trees(slope.map(([x, z]) => [x, z, null, hillY(x, z)]), { kind: 'khejri', seed: 9 }));
  g.add(cityAround([-390, 390, -340, 420], { rows: detail.low ? 2 : 4, every: detail.low ? 3 : 1, fine: false, y: -30, gap: 4, storeys: [2, 4], seed: 31,
    paint: ['#e1b98a', '#d9a878', '#c8dbe6', '#9fc0d8', '#e8d2ae', '#b9d0e3'] }));
}
