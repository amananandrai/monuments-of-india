import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, tube, mown } from '../helpers.js';
import { mergeByMaterial, medallion, crescentFinial, dentils } from '../parts/components.js';
import { statue, urn } from '../parts/sculpture.js';
import { heightField, smooth, fbm } from '../parts/terrain.js';
import { trees, shrubs, lampPosts, fountains, scatter, along, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, WHITE, TRIM } from '../monuments/falaknuma-palace.js';

const IRON = mat('#dfe1de', 0.45, 0.35), GLOBE = mat('#fbf6e6', 0.3, 0, { emissive: '#5a5136' });

// One flight of the double staircase: n wedge-shaped treads `w` wide sweeping a quarter circle of
// radius R about the y axis, from `rise` at angle 0 down to the ground; side: 1 or -1 mirrors it.
// A handrail on balusters follows each edge.
function sweep(rise, w, R, n, side) {
  const g = new THREE.Group(), q = Math.PI / 2, pt = (r, a) => [side * r * Math.sin(a), -r * Math.cos(a)];
  const rails = [[], []];
  for (let k = 0; k < n; k++) {
    const a0 = (k / n) * q, a1 = ((k + 1) / n) * q, h = (rise * (n - k)) / (n + 1), sh = new THREE.Shape();
    const ring = [...[0, 0.5, 1].map((t) => pt(R + w / 2, a0 + (a1 - a0) * t)), ...[1, 0.5, 0].map((t) => pt(R - w / 2, a0 + (a1 - a0) * t))];
    ring.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
    sh.closePath();
    g.add(mesh(new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }).rotateX(-Math.PI / 2), WHITE));
    [R + w / 2 - 0.12, R - w / 2 + 0.12].forEach((r, i) => {
      const [x, z] = pt(r, (a0 + a1) / 2);
      g.add(cyl(0.07, 0.09, 0.85, WHITE, x, h, z, 6));
      rails[i].push([x, h + 0.9, z]);
    });
  }
  for (const r of rails) g.add(tube(r, 0.09, WHITE, n * 2, 6));
  // A newel at the foot of each rail.
  for (const r of [R + w / 2 - 0.12, R - w / 2 + 0.12]) { const [x, z] = pt(r, q + 0.03); g.add(box(0.5, 1.3, 0.5, WHITE, x, 0, z), at(urn(0.7, WHITE), x, 1.3, z)); }
  return g;
}

// The cast-iron lamp standard on the lawn's axis: a stepped stone plinth, a pedestal, a tall
// ornate post with four scrolled arms and their globes, and one more at its head.
function lampStandard() {
  const g = new THREE.Group();
  [[5.4, 0], [4.2, 0.45], [3, 0.9]].forEach(([w, y]) => g.add(box(w, 0.45, w, TRIM, 0, y, 0)));
  g.add(box(1.5, 1.9, 1.5, TRIM, 0, 1.35, 0), box(1.8, 0.2, 1.8, TRIM, 0, 3.25, 0));
  g.add(at(lathe([[0.5, 0], [0.42, 0.3], [0.2, 0.6], [0.26, 1.1], [0.16, 1.5], [0.13, 4], [0.2, 4.2], [0.12, 4.5], [0.1, 6], [0.18, 6.15], [0, 6.3]], IRON, 12), 0, 3.45, 0));
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    g.add(tube([[c * 0.12, 7.2, s * 0.12], [c * 0.7, 7.9, s * 0.7], [c * 1.25, 7.5, s * 1.25], [c * 1.3, 7.9, s * 1.3]], 0.045, IRON, 12, 5));
    g.add(mesh(new THREE.SphereGeometry(0.26, 10, 8), GLOBE, c * 1.3, 8.2, s * 1.3));
  }
  g.add(mesh(new THREE.SphereGeometry(0.32, 10, 8), GLOBE, 0, 10.05, 0));
  return g;
}

// Falaknuma, finer detail. From photographs: the Nizam's arms, gilt, in the tympanum, and a
// crescent on the pediment's apex; dentils under the main cornice; urns on the roof's balustrade;
// the double staircase of marble sweeping from the terrace up to the lower gallery, with statues
// beside it and a fountain before it; the lamp standard on the lawn. Measures follow
// js/monuments/falaknuma-palace.js.
function architecture(f) {
  const { B, TD, S, CW, GD, EB, T, PED } = P, d = new THREE.Group(), Y = B + S, top = Y + 2 * T;
  // The arms: a gilt shield and its supporters, drawn as a roundel between two scrolls.
  d.add(at(medallion(1.25, M.gold), 0, top + 3.3, -0.06));
  for (const s of [-1, 1]) d.add(at(mesh(new THREE.TorusGeometry(0.55, 0.14, 5, 12, Math.PI * 1.3), M.gold), s * 1.9, top + 2.7, -0.02).rotateZ(s > 0 ? -2 : Math.PI + 2 - Math.PI * 1.3));
  d.add(at(crescentFinial(2.6, M.gold), 0, top + 5.9, -1.1));
  d.add(at(dentils(CW - 2 * EB, 0.26, 0.26, 0.26, WHITE), 0, top - 0.55, 0.36));
  for (const x of [PED / 2 + 0.6, CW / 2 - 0.5]) for (const s of [-1, 1]) d.add(box(0.8, 1.2, 0.8, WHITE, s * x, top, -0.3), at(urn(1.2, WHITE), s * x, top + 1.2, -0.3));
  // The staircase: a landing before the middle bay, and a flight sweeping down to either side.
  const lw = 9, lz = P.PF + 1.5, R = 5.2, w = 3.2;
  d.add(box(lw, S, 3.4, WHITE, 0, B, lz + 1.7));
  for (const s of [-1, 1]) d.add(at(sweep(S, w, R, 11, s), s * lw / 2, B, lz + 1.7 + R));
  f.add(mergeByMaterial(d));
  if (!detail.low) for (const s of [-1, 1]) for (const x of [16, 30]) f.add(at(statue(3, WHITE), s * x, B, TD - 3));
  f.add(at(lampStandard(), 0, 0, TD + 30));
}

// The Koh-e-Falaknuma: a rocky hilltop some 600 m above the sea, about 60 m above the old city
// around it, levelled for the palace and its gardens.
function hillY(x, z) {
  const r = Math.hypot(x, (z + 10) / 1.2);
  return -58 * smooth(150, 330, r) + 4 * fbm(x, z, { scale: 0.012, octaves: 3 }) * smooth(140, 200, r);
}

// The palace on its hill: the paved terrace with a fountain before the staircase; below the
// basement a broad lawn with palms along the arcade's foot; the drive winding down to the north;
// gardens and trees round about; the old city of Hyderabad below.
export function addDetails(f, g) {
  architecture(f);
  const { B, TW, TD, CD } = P;
  g.add(heightField(1300, 1300, detail.low ? 90 : 140, hillY, { cz: 0, rock: ['#8d8272', '#a09584', '#7c7467'], cover: '#7f8a55', steep: 0.82 }));
  g.add(box(250, 0.1, 240, M.grass, 0, -0.06, -10), mown(box(TW + 10, 0.05, 66, M.grass, 0, 0, TD + 35)));
  // The terrace's paving, and the fountain on its axis.
  f.add(box(TW - 2, 0.06, TD + 4, M.path, 0, B, TD / 2 - 2.4));
  const pz = TD - 4.2;
  f.add(cyl(2.6, 2.8, 0.6, TRIM, 0, B, pz, 24), cyl(2.3, 2.3, 0.62, M.water, 0, B, pz, 24), cyl(0.3, 0.5, 1.5, TRIM, 0, B, pz, 10), cyl(1, 0.2, 0.25, TRIM, 0, B + 1.5, pz, 16));
  g.add(fountains([[0, pz]], { y: B + 1.7, h: 1.6 }));
  // The drive down the hill.
  g.add(box(9, 0.05, 80, M.path, 0, 0.03, TD + 108), box(TW + 10, 0.05, 5, M.path, 0, 0.03, TD + 70.5));
  g.add(lampPosts([...along(6, [-6, TD + 76], [-6, TD + 146]), ...along(6, [6, TD + 76], [6, TD + 146])]));
  // Palms and shrubs along the foot of the basement, as in every photograph of the front.
  g.add(trees(along(detail.low ? 10 : 18, [-TW / 2 + 6, TD + 5], [TW / 2 - 6, TD + 5]).filter(([x]) => Math.abs(x) > 6).map(([x, z], k) => [x + (k % 3) - 1, z + (k % 2) * 3, 9 + (k * 7) % 4]), { kind: 'palm', seed: 5 }));
  g.add(shrubs(along(24, [-TW / 2 + 4, TD + 2], [TW / 2 - 4, TD + 2]).filter(([x]) => Math.abs(x) > 5).map(([x, z]) => [x, z, 1]), { seed: 3, flowers: '#d94f7a' }));
  g.add(trees(scatter(30, [-125, 125, -120, 112], { seed: 7, gap: 14, avoid: [[-TW / 2 - 8, TW / 2 + 8, -CD - 92, TD + 72], [-10, 10, TD, TD + 160]] }), { kind: 'neem', seed: 7 }));
  // Scrub on the slopes; the city below.
  const slope = scatter(detail.low ? 40 : 90, [-480, 480, -480, 480], { seed: 11, gap: 14 }).filter(([x, z]) => { const r = Math.hypot(x, (z + 10) / 1.2); return r > 170 && r < 330; });
  g.add(trees(slope.map(([x, z]) => [x, z, null, hillY(x, z)]), { kind: 'babul', seed: 11 }));
  g.add(cityAround([-380, 380, -420, 400], { rows: detail.low ? 1 : 4, every: detail.low ? 4 : 1, fine: false, y: -58, gap: 4, storeys: [2, 4], seed: 41,
    paint: ['#efe6d2', '#e3d3b2', '#cfd8d4', '#e8d0b8', '#d9e2c4', '#f1e9d8'] }));
}
