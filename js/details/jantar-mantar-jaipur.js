import * as THREE from 'three';
import { M, mat, mesh, box, at, sheet, mown, chhatri, flag, hipRoof, inst, unitBox } from '../helpers.js';
import { mergeByMaterial, merlons } from '../parts/components.js';
import { wallWithGaps } from '../parts/temples.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, lampPosts, benches, asiBoard, along, scatter, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { samrat, LAT, OCHRE, OCHRE_DARK, RED, SAND, MARBLE, BRASS, SAMRAT } from '../monuments/jantar-mantar-jaipur.js';

// Jantar Mantar, finer detail. From photographs and the plan of the yard: besides the great
// instruments (js/monuments/jantar-mantar-jaipur.js) there are
// - the twelve Rashivalaya, one for each sign of the zodiac: small sundials whose gnomons point at
//   the pole of the ecliptic at the moment their sign crosses the meridian, so each stands at its
//   own angle and turns its own way, on a common terrace south of the Jai Prakash;
// - the Chakra Yantra, two brass rings pivoted on the polar axis between pairs of pillars;
// - the Unnatamsa Yantra, a great brass ring hung from a stone frame, and the Yantra Raj, two
//   brass astrolabe discs hung the same way;
// - the Dakshinottara Bhitti, a wall in the meridian with marble arcs drawn on its east face;
// - the two chambers of the Shashthamsa under the Vrihat Samrat's quadrants, doors in their walls.
const PINK = mat('#d98a6a', 0.85), PINK_DARK = mat('#bd6e50', 0.85), CREAM = mat('#ead9a6', 0.85);

// The gnomon's angle and the way it is turned, for each sign: the ecliptic's pole circles the
// celestial pole at 23.5°, so the gnomons stand between about 3° and 50° and swing east and west.
const RASHIS = [[27, 24, 3.1], [14, 21, 2.6], [6, 12, 2.4], [3.5, 0, 2.3], [6, -12, 2.4], [14, -21, 2.6], [27, -24, 3.1], [39, -21, 3.6], [47, -12, 4.0], [50, 0, 4.4], [47, 12, 4.0], [39, 21, 3.6]];
function rashivalaya(f) {
  const d = new THREE.Group();
  RASHIS.forEach(([lat, turn, H], k) => {
    const a = Math.max(lat, 12) * Math.PI / 180, s = samrat(Math.min(H, 7.5 * Math.tan(a)), { T: 0.9, R: 1.9, lat: a, ticks: false });
    s.rotation.y = turn * Math.PI / 180;
    d.add(at(s, -25 + (k % 4) * 11.5, 0.5, 30 + Math.floor(k / 4) * 11));
  });
  d.add(box(48, 0.5, 35, SAND, -7.8, 0, 41), box(48.6, 0.2, 35.6, RED, -7.8, -0.01, 41));
  f.add(d);
}

function smallInstruments(f) {
  const d = new THREE.Group();
  // The Chakra Yantra: each ring turns on an axis that points at the pole.
  for (const x of [-3, 3]) {
    const c = at(new THREE.Group(), -30 + x, 0, -16);
    c.add(box(0.7, 1.6, 0.7, OCHRE, 0, 0, 1.3), box(0.7, 2.9, 0.7, OCHRE, 0, 0, -1.3), box(0.8, 0.1, 0.8, MARBLE, 0, 1.6, 1.3), box(0.8, 0.1, 0.8, MARBLE, 0, 2.9, -1.3));
    const ringM = mesh(new THREE.TorusGeometry(1.0, 0.05, 6, 32), BRASS);
    ringM.position.y = 2.35;
    ringM.rotation.set(LAT, Math.PI / 2 + x * 0.2, 0, 'YXZ');
    c.add(ringM, box(1.9, 0.14, 4, SAND, 0, 0, 0));
    d.add(c);
  }
  // The Unnatamsa Yantra: a brass ring 5 m across, hung in a stone gallows, to take altitudes.
  const u = at(new THREE.Group(), -62, 0, -18);
  for (const s of [-1, 1]) u.add(box(1.1, 6.8, 1.1, OCHRE, s * 3.4, 0, 0), box(1.3, 0.2, 1.3, RED, s * 3.4, 6.8, 0));
  u.add(box(8.4, 0.6, 0.9, OCHRE_DARK, 0, 6.3, 0), at(mesh(new THREE.TorusGeometry(2.5, 0.07, 6, 48), BRASS), 0, 3.5, 0), box(0.05, 5, 0.05, BRASS, 0, 1, 0), at(box(5, 0.05, 0.05, BRASS, 0, 0, 0), 0, 3.5, 0), box(8.6, 0.3, 4, SAND, 0, 0, 0));
  u.rotation.y = 0.5;
  d.add(u);
  // The Yantra Raj: two astrolabe discs, the larger 2.4 m across.
  const y = at(new THREE.Group(), -52, 0, -42);
  for (const s of [-1, 0, 1]) y.add(box(0.6, 3.6, 0.6, OCHRE, s * 3, 0, 0));
  y.add(box(7, 0.4, 0.7, OCHRE_DARK, 0, 3.6, 0), at(mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.05, 40).rotateX(Math.PI / 2), BRASS), -1.5, 2.1, 0), at(mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.05, 40).rotateX(Math.PI / 2), BRASS), 1.5, 2.3, 0), box(7.6, 0.3, 2.4, SAND, 0, 0, 0));
  d.add(y);
  // The Dakshinottara Bhitti: a wall along the meridian, marble arcs on its east face, a stair
  // behind it.
  const w = at(new THREE.Group(), 56, 0, -40);
  w.add(box(1.4, 5.2, 7, OCHRE, 0, 0, 0), box(1.6, 0.2, 7.2, RED, 0, 5.2, 0), box(5, 0.4, 9, SAND, 0, 0, 0));
  for (const z of [-3.3, 3.3]) { const arc = mesh(new THREE.RingGeometry(2.6, 3.0, 24, 1, Math.PI, Math.PI / 2).rotateY(Math.PI / 2), MARBLE); arc.position.set(0.73, 4.6, z); arc.rotation.x = z > 0 ? 0 : -Math.PI / 2; w.add(arc); }
  for (let k = 0; k < 8; k++) w.add(box(1.2, (k + 1) * 0.6, 0.6, OCHRE_DARK, -1.3, 0, 3 - k * 0.6));
  d.add(w);
  // The Shashthamsa chambers under the great quadrants: a doorway in the end of each ramp,
  // and the Dhruva Darshak Pattika, a small sloping slab that sights the pole star.
  for (const s of [-1, 1]) d.add(box(0.1, 3.2, 1.5, M.recess, SAMRAT.x + s * 15.34, 0, SAMRAT.z - 0.8), box(0.16, 0.3, 2.1, RED, SAMRAT.x + s * 15.36, 3.2, SAMRAT.z - 0.8));
  const pole = at(new THREE.Group(), -40, 0, -18);
  pole.add(box(1.2, 0.5, 2.6, SAND), at(box(0.6, 0.25, 2.4, RED, 0, 0, 0), 0, 0.9, 0).rotateX(LAT));
  d.add(pole);
  mergeByMaterial(d);
  f.add(d);
}

// The yard: paving of red and buff stone, lawns between the instruments, the plastered wall round
// it with its gate on the north-west, towards the City Palace.
function yard(g) {
  const d = new THREE.Group();
  d.add(box(156, 0.3, 126, M.path, -5, -0.3, 0));
  for (const [x0, x1, z0, z1] of [[-70, -50, -8, 4], [-48, -22, -8, 22], [-2, 8, -44, 22], [40, 66, -50, 30], [-78, -66, 10, 50], [20, 66, 34, 56], [-78, -66, -50, -30], [-20, 6, -52, -30]]) d.add(mown(sheet(x1 - x0, z1 - z0, M.grass, (x0 + x1) / 2, 0.03, (z0 + z1) / 2)));
  // The enclosure wall, in the pink wash of the old city, with merlons along its top.
  const H = 3.4;
  d.add(wallWithGaps('x', 156, H, 0.7, PINK, [[-52, 7]], -5, -63), wallWithGaps('x', 156, H, 0.7, PINK, [], -5, 63), wallWithGaps('z', 126, H, 0.7, PINK, [], -83, 0), wallWithGaps('z', 126, H, 0.7, PINK, [[-30, 5]], 73, 0));
  for (const z of [-63, 63]) d.add(at(merlons(156, 0.8, 0.7, 0.5, PINK_DARK), -5, H, z));
  for (const x of [-83, 73]) { const m = at(merlons(126, 0.8, 0.7, 0.5, PINK_DARK), x, H, 0); m.rotation.y = Math.PI / 2; d.add(m); }
  // The gate: a plastered gatehouse with a chhatri at each end of its roof.
  const gate = at(new THREE.Group(), -57, 0, -63);
  for (const s of [-1, 1]) gate.add(box(4, 6.4, 3, PINK, s * 5.5, 0, 0), at(chhatri(1.2, 2.6, CREAM, CREAM), s * 5.5, 6.4, 0));
  gate.add(box(7, 1.6, 3, PINK, 0, 4.8, 0), box(15.4, 0.3, 3.4, CREAM, 0, 6.4, 0));
  d.add(gate);
  mergeByMaterial(d);
  g.add(d);
}

// The skyline of the old city round the yard: the Chandra Mahal of the City Palace to the
// north-west, seven storeys of cream and yellow under a curved roof; the back of the Hawa Mahal to
// the east; the pink houses of the bazaars; and on the ridge to the north, Nahargarh.
function city(g) {
  const d = new THREE.Group(), cm = at(new THREE.Group(), -120, 0, -190);
  [[46, 22, 9], [42, 18, 5], [36, 16, 4.5], [30, 14, 4.5], [22, 12, 4], [14, 10, 3.6]].reduce((y, [w, dp, h], k) => {
    cm.add(box(w, h, dp, CREAM, 0, y, 0), box(w + 0.8, 0.35, dp + 0.8, PINK_DARK, 0, y + h, 0));
    const n = Math.round(w / 2.6), wins = [];
    for (let i = 0; i < n; i++) wins.push([-w / 2 + (i + 0.5) * (w / n), y + h * 0.3, dp / 2 + 0.02, 1.1, h * 0.5, 0.06]);
    cm.add(inst(unitBox(), wins, M.recess));
    if (k > 0 && k < 5) for (const s of [-1, 1]) cm.add(at(chhatri(1.3, 2.8, CREAM, CREAM), s * (w / 2 + 1.2), y, dp / 2 - 1.4));
    return y + h;
  }, 0);
  cm.add(at(hipRoof(12, 8, 2.6, CREAM), 0, 30.6, 0), at(flag(7, M.flagRed), 0, 33, 0));
  cm.add(box(120, 7, 1, PINK, 0, 0, 40), box(1, 7, 90, PINK, -60, 0, -5), box(1, 7, 90, PINK, 60, 0, -5));
  d.add(cm);
  // The Hawa Mahal from behind: its tiers stepping up to the crown, plain on this side.
  const hm = at(new THREE.Group(), 215, 0, -40);
  [[10, 44, 8], [8, 40, 3.2], [6, 30, 3], [4, 20, 2.8], [3, 9, 2.4]].reduce((y, [w, dp, h]) => { hm.add(box(w, h, dp, M.hawa, 0, y, 0), box(w + 0.4, 0.3, dp + 0.4, M.lime, 0, y + h, 0)); return y + h; }, 0);
  d.add(hm);
  mergeByMaterial(d);
  g.add(d);
  g.add(cityAround([-83, 73, -63, 63], { rows: detail.low ? 1 : 2, gap: 16, lane: 9, storeys: [2, 3], seed: 12, paint: ['#d98a6a', '#e09a78', '#cf7d5e', '#e3a585'], trim: '#f1e2cf', tanks: 0.3, keep: [[-190, -50, -250, -100]], fine: false }));
  // The Aravalli ridge north of the city, Nahargarh's wall along its crest.
  g.add(heightField(2600, 420, detail.low ? 60 : 110, (x, z) => {
    const t = smooth(-520, -700, z) * (1 - smooth(-800, -905, z)) * (1 - smooth(900, 1290, Math.abs(x)));
    return t * (70 + 30 * fbm(x, z, { scale: 0.004, octaves: 3 })) - 1;
  }, { cz: -700, rock: ['#a08a6c', '#93805f', '#ad9878'], cover: '#9c9a66', steep: 0.9, band: 14 }));
  g.add(box(260, 6, 3, mat('#d6b98a', 0.9), -80, 92, -735));
}

export function addDetails(f, g) {
  rashivalaya(f);
  smallInstruments(f);
  yard(g);
  city(g);
  const keep = [[4, 44, -32, 26], [-34, 18, 22, 60], [-66, -50, 4, 34], [-22, -2, -26, 22], [-50, -22, -48, -28]];
  g.add(trees([[-76, -56], [-76, 56], [66, 54], [66, -56], [52, 10], [-72, -4], [0, -56]], { kind: 'neem', seed: 3 }));
  g.add(trees([...along(6, [-20, -58], [40, -58]), ...along(5, [68, -20], [68, 30])], { kind: 'ashoka', seed: 5 }));
  g.add(shrubs(scatter(26, [-76, 66, -56, 56], { seed: 9, gap: 9, avoid: keep }).map(([x, z]) => [x, z, 0.9]), { seed: 4, flowers: '#d0306f' }));
  g.add(lampPosts([[-40, -8], [-2, 24], [44, 32], [44, -40], [-66, 40], [-66, -26]]), benches([[-45, 6], [4, -40], [48, 20], [-70, 46]]));
  g.add(asiBoard('Jantar Mantar', -50, -56, 0, { line2: 'WORLD HERITAGE SITE' }));
}
