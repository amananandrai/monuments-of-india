import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, sheet, hipRoof, kalash, flag, surface, photo } from '../helpers.js';
import { archRing, windowFrame, chhajja, railing, mouldings, pilasters, mergeByMaterial } from '../parts/components.js';
import { lampPosts, garland, stalls, shrubs, along, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';

// Badrinath, finer architecture and the setting. Dimensions follow js/monuments/badrinath-temple.js:
// the temple's floor at PL = 3.8; the Singh Dwar at z = 6, 4 deep (its face at z = 8): a middle
// bay 7 wide and 11 high with an arch 3.3 wide and 5.6 high, and side bays 4.6 wide and 9.3 high,
// their faces at z = 7.6; the hall 13 × 11 behind and the sanctum 8.4 square at z = -11.2.
// From photographs, the front is painted in bands: a red base, the gateway's arch in nested frames
// of red, white, blue and green, rows of small arched windows in white and blue frames in every
// bay (three storeys of them), red and green cornices with eaves, slender blue and white turrets
// at the corners of the bays, a parapet, and three small gilt cupolas, the middle one largest.
const paint = (c) => surface(mat(c, 0.75), 'none');
const RED = paint('#b5302a'), BLUE = paint('#2c5aa6'), GREEN = paint('#2e8a57'), WHITE = paint('#f3eee2');
const STONE = photo(mat('#8f8b84', 0.9), 'blocks'), STONE_DARK = photo(mat('#6f6b64', 0.9), 'blocks');
const STEEL = surface(mat('#9aa0a4', 0.45, 0.6), 'none'), SNOW = mat('#f4f6f8', 0.8);
const GHAT = 0.6, COURT = 2.4, PL = 3.8;

// A small gilt cupola on four posts, r its dome's radius, standing on y = 0.
function cupola(r) {
  const g = new THREE.Group();
  g.add(box(r * 2.5, r * 0.25, r * 2.5, RED));
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(cyl(r * 0.12, r * 0.12, r * 0.9, WHITE, x * r * 0.95, r * 0.25, z * r * 0.95, 8));
  g.add(box(r * 2.6, r * 0.18, r * 2.6, GREEN, 0, r * 1.15, 0));
  g.add(at(mesh(new THREE.SphereGeometry(r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.gild), 0, r * 1.33, 0), at(kalash(r * 0.6, M.gild), 0, r * 2.28, 0));
  return g;
}

function singhDwar(d) {
  const s = at(new THREE.Group(), 0, PL, 6);
  // The middle bay (face at z = 2): the arch's frames, three rows of windows over it, cornices.
  s.add(at(archRing(3.3, 5.6, false, 0.3, 0.16, RED), 0, 0, 2), at(archRing(3.9, 5.9, false, 0.22, 0.12, WHITE), 0, 0, 2));
  s.add(at(archRing(4.34, 6.12, false, 0.3, 0.08, BLUE), 0, 0, 2), at(archRing(4.94, 6.42, false, 0.2, 0.05, GREEN), 0, 0, 2));
  s.add(box(7.1, 0.3, 0.14, RED, 0, 6.95, 2.07), box(7.1, 0.22, 0.1, BLUE, 0, 7.25, 2.05));
  for (const x of [-2.1, 0, 2.1]) s.add(at(windowFrame(1.05, 1.7, WHITE, { shape: 'round', frame: 0.16 }), x, 7.9, 2.01));
  for (const x of [-2.6, 2.6]) for (const y of [1.2, 3.6]) s.add(at(windowFrame(0.7, 1.3, BLUE, { shape: 'round', frame: 0.13 }), x, y, 2.01));
  s.add(at(chhajja(7.6, 0.7, 0.25, 0.1, RED), 0, 10.25, 2), box(7.2, 0.3, 4.2, GREEN, 0, 10.25, 0), box(7.3, 0.45, 4.3, RED, 0, 11, 0));
  for (let k = 0; k < 7; k++) s.add(box(0.5, 0.45, 0.2, k % 2 ? BLUE : WHITE, -3 + k, 11.45, 1.95));
  s.add(at(cupola(0.62), 0, 11.45, 0));
  // The side bays (faces at z = 1.6): three storeys of two windows each, a cornice and a cupola.
  for (const sx of [-1, 1]) {
    const b = at(new THREE.Group(), sx * 5.8, 0, -0.2);
    for (const [y, fr] of [[1.1, BLUE], [3.9, WHITE], [6.5, BLUE]]) {
      for (const x of [-1.05, 1.05]) b.add(at(windowFrame(0.85, 1.5, fr, { shape: 'round', frame: 0.15 }), x, y, 1.81));
      b.add(box(4.7, 0.2, 0.1, y === 3.9 ? GREEN : RED, 0, y + 2.05, 1.85));
    }
    b.add(at(chhajja(5, 0.6, 0.22, 0.1, RED), 0, 8.75, 1.8), box(4.8, 0.3, 3.8, GREEN, 0, 8.72, 0), box(4.9, 0.4, 3.9, RED, 0, 9.3, 0));
    for (let k = 0; k < 5; k++) b.add(box(0.45, 0.4, 0.2, k % 2 ? WHITE : BLUE, -1.9 + k * 0.95, 9.7, 1.75));
    b.add(at(cupola(0.42), 0, 9.7, 0));
    s.add(b);
  }
  // A red base along the whole front, and turrets at the edges of the bays: banded shafts under
  // small pointed caps.
  for (const sx of [-1, 1]) s.add(box(4.7, 0.7, 0.1, RED, sx * 5.8, 0, 1.65), box(1.75, 0.7, 0.1, RED, sx * 2.6, 0, 2.05));
  for (const [x, z, h] of [[-3.5, 2, 11.6], [3.5, 2, 11.6], [-8.1, 1.6, 9.9], [8.1, 1.6, 9.9]]) {
    for (let k = 0; k < 6; k++) s.add(cyl(0.2, 0.2, h / 6 - 0.01, k % 2 ? BLUE : WHITE, x, (k * h) / 6, z, 8));
    s.add(cyl(0.3, 0.3, 0.14, RED, x, h, z, 8), cyl(0, 0.26, 0.7, M.gild, x, h + 0.14, z, 8));
  }
  d.add(s);
}

function temple(d) {
  // The hall: base, pilasters and a window in each bay of its sides; the sanctum: moulded base and
  // cornice, pilasters at its corners.
  const h = at(new THREE.Group(), 0, PL, -1.5);
  h.add(mouldings(13, 11, [[0, 0.45, 0.2, STONE_DARK]], STONE));
  for (const a of [Math.PI / 2, -Math.PI / 2]) {
    const p = at(pilasters(10, 4, 0.6, 6, 0.14, STONE), 0, 0.1, 0), w = new THREE.Group();
    for (const l of [-3.3, 0, 3.3]) w.add(at(windowFrame(0.9, 1.5, WHITE, { shape: 'round', frame: 0.15 }), l, 2.6, 0.02));
    for (const o of [p, w]) { o.rotation.y = a; o.position.x = Math.sin(a) * 6.5; h.add(o); }
  }
  const sn = at(new THREE.Group(), 0, PL, -11.2);
  sn.add(mouldings(8.4, 8.4, [[0, 0.5, 0.22, STONE_DARK], [0.5, 0.3, 0.1], [6.7, 0.3, 0.12, STONE_DARK]], STONE));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) {
    const p = at(pilasters(7.6, 4, 0.5, 6.4, 0.12, STONE), 0, 0.85, 0);
    p.rotation.y = a; p.position.set(Math.sin(a) * 4.2, 0.85, Math.cos(a) * 4.2);
    sn.add(p);
  }
  d.add(h, sn);
  // Railings of painted steel either side of the Singh Dwar's steps and along the edge of the court.
  for (const s of [-1, 1]) {
    const r = railing(3.4, 1, 0.07, STEEL, 1.1, STEEL);
    r.rotation.y = Math.PI / 2;
    d.add(at(r, s * 5.4, COURT + 0.7, 12.7));
    for (const [x, len] of [[s * 15.7, 14.4]]) d.add(at(railing(len, 1, 0.07, STEEL, 1.8, STEEL), x, COURT, 29.8));
    const side = railing(49, 1, 0.07, STEEL, 1.8, STEEL);
    side.rotation.y = Math.PI / 2;
    d.add(at(side, s * 22.8, COURT, 5));
  }
}

// The ghat: the Tapt Kund, the hot spring where pilgrims bathe before they go up, a tank in a stone
// kerb beside its bath-house; the Narad Kund by the river; and the footbridge over the Alaknanda.
function ghat(d, g) {
  const k = at(new THREE.Group(), -15, GHAT, 44);
  for (const s of [-1, 1]) k.add(box(9, 0.7, 0.6, STONE, 0, 0, s * 3), box(0.6, 0.7, 5.4, STONE, s * 4.2, 0, 0));
  k.add(box(7.8, 0.25, 5.4, STONE_DARK, 0, 0, 0));
  k.add(box(9.4, 3, 4, WHITE, -10.4, 0, 0), at(hipRoof(10.4, 5, 1.4, paint('#3c7a4f')), -10.4, 3, 0), box(9.5, 0.5, 0.08, BLUE, -10.4, 2.3, 2.02));
  d.add(k);
  g.add(sheet(7.8, 5.4, M.water, -15, GHAT + 0.5, 44));
  const n = at(new THREE.Group(), 14, GHAT, 52);
  for (const s of [-1, 1]) n.add(box(5, 0.5, 0.5, STONE, 0, 0, s * 1.75), box(0.5, 0.5, 3, STONE, s * 2.25, 0, 0));
  d.add(n);
  g.add(sheet(4, 3, M.water, 14, GHAT + 0.3, 52));
  // The bridge: a steel deck on two piers, railed, from the ghat to the east bank.
  const b = new THREE.Group();
  b.add(box(3.2, 0.3, 34, STEEL, 26, 1.5, 70), box(4, 1.5, 3, STONE, 26, 0, 54.6), box(4, 1.5, 3, STONE, 26, 0, 85.5));
  for (const s of [-1, 1]) { const r = railing(34, 1.1, 0.07, RED, 2, RED); r.rotation.y = Math.PI / 2; b.add(at(r, 26 + s * 1.5, 1.8, 70)); }
  b.add(at(mesh(new THREE.BoxGeometry(3.2, 0.25, 5).rotateX(0.24), STONE), 26, 1.0, 51.2), at(mesh(new THREE.BoxGeometry(3.2, 0.25, 6).rotateX(-0.26), STONE), 26, 0.9, 89.6));
  g.add(mergeByMaterial(b));
}

export function addDetails(f, g) {
  const d = new THREE.Group();
  singhDwar(d);
  temple(d);
  ghat(d, g);
  f.add(mergeByMaterial(d));
  // Marigold garlands across the gateway and along the front; saffron pennants on the court.
  f.add(garland([-1.6, PL + 4.6, 8.2], [1.6, PL + 4.6, 8.2], { sag: 0.7, strands: 2 }), garland([-3.3, PL + 6.6, 8.25], [3.3, PL + 6.6, 8.25], { sag: 0.5 }));
  for (const s of [-1, 1]) f.add(at(flag(5, M.saffron), s * 9.5, COURT, 14));
  // Lamps on the court, the stair and the ghat; stalls of offerings by the foot of the stair.
  g.add(lampPosts([[-12, 26], [12, 26], [-20, 12], [20, 12]], { y: COURT }), lampPosts(along(8, [-34, 54], [34, 54]), { y: GHAT }));
  g.add(stalls([[-12, 36, 0], [12, 36, 0], [16, 36, 0], [32, 46, -Math.PI / 2], [32, 40, -Math.PI / 2]], { y: GHAT }));
  // Above the tree line: low scrub on the valley floor, and snow lying in the hollows.
  g.add(shrubs(scatter(detail.low ? 20 : 50, [-240, 240, -150, 170], { seed: 4, gap: 9, avoid: [[-170, 170, -62, 150]] }), { seed: 4, dry: true, size: 1.4 }));
  for (const [x, z, r] of scatter(14, [-250, 250, -150, 170], { seed: 6, gap: 20, avoid: [[-175, 175, -66, 152]] }).map(([x, z], i) => [x, z, 3 + (i % 4) * 2])) {
    const s = mesh(new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), SNOW, x, 0.05, z);
    s.scale.set(r, 0.25, r * 0.7);
    g.add(s);
  }
}
