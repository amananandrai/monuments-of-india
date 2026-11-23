import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, sheet, surface, limb } from '../helpers.js';
import { mergeByMaterial, panel, idol } from '../parts/components.js';
import { figure, trimurti } from '../parts/sculpture.js';
import { guardian } from '../parts/figures.js';
import { nandiGeometry, lion } from '../parts/animals.js';
import { steps } from '../parts/doorways.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, along, scatter, stalls, launches, umbrellas } from '../parts/realism.js';
import { detail } from '../detail.js';

// Elephanta's basalt: grey-brown outside, weathered and stained; paler where it was cut and is
// sheltered; and the dark of the hall's depths.
export const ROCK = surface(mat('#5f574d', 0.96), 'rock');
export const ROCK_LIGHT = surface(mat('#857b6d', 0.93), 'rock');
export const DARK = surface(mat('#2a2622', 0.95), 'rock');

// The Great Cave's plan, laid out on a bay B: the mouth of the north portico at z = 0, X1 either
// side of the axis; the hall X2 either side from ZN back to the south wall at ZS; the east and west
// porticoes from X2 out to X3, between ZA and ZB; beyond them the open courts, as far as XC, cut
// down through rock that runs out to XO and back to BACK. The hall is HH high under rock H high;
// the Trimurti's recess is RW wide, RD deep and RH high in the middle of the south wall. North is
// +z, so east is -x and west is +x. SH: the Shakti shrine in the south wall of the east court, from
// x = -SH[0] to -SH[1], SH[2] deep, its floor SH[3] above the court and its ceiling at SH[4].
const B = 5.47;
export const DIMS = { B, X1: 1.5 * B, X2: 2.5 * B, X3: 3.5 * B, XC: 36, XO: 46, ZN: -B, ZA: -2 * B, ZB: -5 * B, ZS: -6 * B, BACK: -70,
  HH: 5.5, H: 11, RW: 10, RD: 3.6, RH: 7.8, SH: [23, 33, 5.2, 1, 4.6] };

const V = (x, y, z) => new THREE.Vector3(x, y, z);
// A carved figure h high in `pose`, with more arms than the kit's two: each of `arms` is
// [side, elbow x, elbow y, hand x, hand y] in units of h from the figure's axis and foot, and ends
// in a knob (a hand round its attribute).
function deity(h, pose, x, y, arms = [], m = ROCK_LIGHT) {
  const g = new THREE.Group(), sy = pose === 'seated' ? 0.66 : 0.69;
  g.add(figure(h, m, pose));
  for (const [s, ex, ey, hx, hy] of arms) {
    const a = V(s * 0.12 * h, sy * h, 0.02 * h), b = V(s * ex * h, ey * h, 0.06 * h), c = V(s * hx * h, hy * h, 0.09 * h);
    g.add(limb(a, b, 0.032 * h, 0.027 * h, m), limb(b, c, 0.027 * h, 0.022 * h, m), at(mesh(new THREE.SphereGeometry(0.034 * h, 8, 6), m), c.x, c.y, c.z));
  }
  return at(g, x, y, 0.3);
}
// The lesser figures of a panel: [height, pose, x, y, tilt], the tilted ones flying.
function attend(g, list, m = ROCK_LIGHT) {
  for (const [h, pose, x, y, tilt = 0] of list) { const o = at(figure(h, m, pose), x, y, 0.22); o.rotation.z = tilt; g.add(o); }
}
// The gods who fly in the clouds along the top of every panel.
const fliers = (w, h) => [[h * 0.2, 'seated', -w * 0.36, h * 0.8, 0.5], [h * 0.2, 'seated', w * 0.36, h * 0.8, -0.5], [h * 0.17, 'seated', -w * 0.16, h * 0.84, 0.3], [h * 0.17, 'seated', w * 0.16, h * 0.84, -0.3]];
// A rock ledge (Kailash, a throne, a lotus seat) across a panel.
const ledge = (w, y, m = ROCK_LIGHT) => box(w, 0.28, 0.62, m, 0, y - 0.28, 0.39);

// The nine great panels of the hall, each a relief w wide and h high in a framed recess, facing
// +z with its foot at y = 0. They are composed as the carvings are: who stands, sits or dances,
// with how many arms, and who attends.
const PANELS = {
  // Shiva as lord of yogis, seated in the lotus posture on a lotus whose stalk two nagas hold.
  yogishvara(g, w, h, m) {
    g.add(cyl(0.12, 0.16, h * 0.3, m, 0, 0, 0.4, 8), cyl(h * 0.24, h * 0.1, 0.3, m, 0, h * 0.3, 0.4, 16), deity(h * 0.5, 'seated', 0, h * 0.3 + 0.3));
    attend(g, [[h * 0.26, 'standing', -w * 0.2, 0], [h * 0.26, 'standing', w * 0.2, 0], [h * 0.22, 'seated', -w * 0.36, h * 0.48], [h * 0.22, 'seated', w * 0.36, h * 0.48], ...fliers(w, h)]);
  },
  // Shiva dancing, with eight arms spread like a fan, Parvati beside him and the gods above.
  nataraja(g, w, h, m) {
    g.add(deity(h * 0.9, 'dancer', -w * 0.06, 0, [[-1, 0.3, 0.74, 0.38, 0.92], [-1, 0.33, 0.6, 0.45, 0.66], [-1, 0.28, 0.5, 0.36, 0.38], [1, 0.3, 0.76, 0.36, 0.95], [1, 0.34, 0.64, 0.46, 0.72], [1, 0.3, 0.46, 0.4, 0.34]]));
    attend(g, [[h * 0.48, 'mirror', w * 0.36, 0], [h * 0.26, 'seated', -w * 0.38, 0], [h * 0.2, 'seated', -w * 0.38, h * 0.74, 0.4], [h * 0.2, 'seated', w * 0.38, h * 0.74, -0.4]]);
  },
  // Ravana under Kailash, his arms raised to shake it; Shiva and Parvati seated on it above.
  ravananugraha(g, w, h, m) {
    g.add(ledge(w - 0.3, h * 0.46), deity(h * 0.36, 'seated', -w * 0.14, h * 0.46), deity(h * 0.3, 'seated', w * 0.2, h * 0.46));
    g.add(deity(h * 0.38, 'seated', 0, 0, [-1, 1].flatMap((s) => [0.25, 0.42, 0.6, 0.78, 0.95].map((t) => [s, 0.2 + 0.16 * t, 0.62 + 0.2 * t, 0.16 + 0.42 * t, 0.98 + 0.12 * (1 - t)]))));
    attend(g, [[h * 0.3, 'standing', -w * 0.4, h * 0.46], [h * 0.3, 'chauri', w * 0.41, h * 0.46], ...fliers(w, h).slice(0, 2)]);
  },
  // Shiva and Parvati at ease on Kailash, Nandi below them and their household round them.
  kailash(g, w, h, m) {
    g.add(ledge(w - 0.3, h * 0.36), deity(h * 0.44, 'seated', -w * 0.15, h * 0.36, [[-1, 0.2, 0.7, 0.26, 0.92], [1, 0.22, 0.6, 0.34, 0.5]]), deity(h * 0.36, 'seated', w * 0.2, h * 0.36));
    const bull = at(mesh(nandiGeometry(false), m), -w * 0.12, 0, 0.5);
    bull.rotation.y = Math.PI / 2;
    bull.scale.setScalar(h * 0.085);
    g.add(bull);
    attend(g, [[h * 0.3, 'standing', w * 0.36, 0], [h * 0.26, 'seated', w * 0.14, 0], [h * 0.3, 'chauri', -w * 0.41, h * 0.36], [h * 0.28, 'standing', w * 0.42, h * 0.36], ...fliers(w, h)]);
  },
  // Half Shiva, half Parvati: one tall figure with four arms, the hip thrown out and a breast on
  // the woman's side, leaning on Nandi; the gods on their mounts either side.
  ardhanarishvara(g, w, h, m) {
    const H1 = h * 0.86;
    g.add(deity(H1, 'mirror', 0, 0, [[-1, 0.26, 0.6, 0.34, 0.42], [1, 0.24, 0.74, 0.3, 0.92]]), at(mesh(new THREE.SphereGeometry(H1 * 0.045, 10, 8), m), H1 * 0.02, H1 * 0.655, 0.3 + H1 * 0.075));
    const bull = at(mesh(nandiGeometry(false), m), -w * 0.26, 0, 0.45);
    bull.rotation.y = Math.PI / 2;
    bull.scale.setScalar(h * 0.1);
    g.add(bull);
    attend(g, [[h * 0.3, 'standing', w * 0.36, 0], [h * 0.22, 'seated', -w * 0.38, h * 0.5], [h * 0.22, 'seated', w * 0.38, h * 0.5], ...fliers(w, h)]);
  },
  // Shiva taking the Ganga in his hair, Parvati at his side: over his head the river as a small
  // goddess with three heads, at his foot Bhagiratha on his knees.
  gangadhara(g, w, h, m) {
    g.add(deity(h * 0.8, 'standing', -w * 0.14, 0, [[-1, 0.24, 0.74, 0.3, 0.9], [1, 0.22, 0.74, 0.16, 0.96]]), deity(h * 0.66, 'mirror', w * 0.24, 0));
    g.add(cyl(0.2, 0.3, 0.5, m, -w * 0.14, h * 0.82, 0.4, 8));
    for (const x of [-0.3, 0, 0.3]) g.add(at(mesh(new THREE.SphereGeometry(0.2, 8, 6), m), -w * 0.14 + x, h * 0.82 + 0.62 - Math.abs(x) * 0.3, 0.42));
    attend(g, [[h * 0.2, 'seated', -w * 0.4, 0], [h * 0.26, 'standing', w * 0.43, 0], ...fliers(w, h)]);
  },
  // The wedding: Shiva with Parvati at his right hand, Brahma seated as the priest, her father
  // behind her and Vishnu as witness.
  kalyanasundara(g, w, h, m) {
    g.add(deity(h * 0.78, 'standing', -w * 0.08, 0, [[1, 0.18, 0.52, 0.2, 0.42]]), deity(h * 0.64, 'mirror', w * 0.16, 0));
    attend(g, [[h * 0.5, 'standing', w * 0.38, 0], [h * 0.26, 'seated', -w * 0.34, 0], [h * 0.5, 'standing', -w * 0.4, h * 0.26 + 0.1], ...fliers(w, h)]);
    g.add(ledge(w * 0.24, h * 0.26 + 0.1, m).translateX(-w * 0.38));
  },
  // Shiva as Bhairava killing the demon Andhaka: eight arms, the elephant's hide held up behind
  // him, the demon spitted on his trident and a bowl held under to catch the blood.
  andhaka(g, w, h, m) {
    g.add(deity(h * 0.84, 'dancer', -w * 0.04, 0, [[-1, 0.3, 0.8, 0.42, 0.98], [-1, 0.34, 0.62, 0.44, 0.6], [-1, 0.26, 0.5, 0.3, 0.36], [1, 0.3, 0.82, 0.44, 1.0], [1, 0.32, 0.66, 0.4, 0.72], [1, 0.3, 0.5, 0.36, 0.4]]));
    const hide = mesh(new THREE.TorusGeometry(w * 0.4, 0.14, 6, 20, Math.PI), m, -w * 0.04, h * 0.72, 0.2);
    hide.scale.y = 0.55;
    g.add(hide, limb(V(-w * 0.1, h * 0.3, 0.6), V(w * 0.36, h * 0.74, 0.6), 0.04, 0.04, m));
    const demon = at(figure(h * 0.2, m, 'standing'), w * 0.37, h * 0.68, 0.5);
    demon.rotation.z = -0.9;
    g.add(demon, cyl(0.2, 0.12, 0.16, m, w * 0.3, h * 0.36, 0.6, 10));
    attend(g, [[h * 0.22, 'seated', w * 0.38, 0], [h * 0.22, 'seated', -w * 0.38, 0]]);
  },
};
function reliefPanel(kind, w, h, m = ROCK_LIGHT) {
  const g = new THREE.Group();
  g.add(box(w, h, 0.05, DARK, 0, 0, 0.025), at(panel(w + 0.6, h + 0.6, 0.3, m, null, 0.35), 0, -0.3, 0));
  PANELS[kind](g, w, h, m);
  return g;
}

// The shrine of the linga: a square cella SW across standing free in the hall, a door in each
// face up six steps, the door's frame stepped back in three bands, and inside, on a platform
// 1.8 m above the hall's floor, the linga in its pedestal. Either side of every door a dvarapala
// 4.6 m high: eight in all.
function shrine(f, cx, cz) {
  const { HH } = DIMS, L = ROCK_LIGHT, SW = 6, FL = 1.2, DW = 1.5, DH = 2.6, sh = new THREE.Group();
  sh.add(box(SW, FL, SW, L), box(SW - 1.6, 0.05, SW - 1.6, DARK, 0, HH - 0.66, 0), box(SW, 0.6, SW, L, 0, HH - 0.6, 0));
  for (const a of [0, 1, 2, 3]) {
    const w = new THREE.Group(), side = (SW - DW) / 2;
    for (const s of [-1, 1]) w.add(box(side, HH - FL - 0.6, 0.8, L, s * (DW + side) / 2, FL, SW / 2 - 0.4));
    w.add(box(DW, HH - FL - DH - 0.6, 0.8, L, 0, FL + DH, SW / 2 - 0.4));
    for (const k of [1, 2, 3]) {
      const o = k * 0.22, z = SW / 2 + 0.12 - k * 0.035;
      for (const s of [-1, 1]) w.add(box(0.2, DH + o, 0.08, L, s * (DW / 2 + o - 0.1), FL, z));
      w.add(box(DW + 2 * o, 0.2, 0.08, L, 0, FL + DH + o - 0.2, z));
    }
    w.add(at(steps(DW + 0.9, FL, 6, L, 0.3), 0, 0, SW / 2));
    w.rotation.y = a * Math.PI / 2;
    sh.add(w);
  }
  sh.add(box(2.6, 0.6, 2.6, L, 0, FL, 0), cyl(0.95, 1, 0.3, M.stoneDark, 0, FL + 0.6, 0, 20), cyl(0.42, 0.46, 1.1, M.stoneDark, 0, FL + 0.9, 0, 20), at(mesh(new THREE.SphereGeometry(0.42, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.stoneDark), 0, FL + 2, 0));
  f.add(at(mergeByMaterial(sh), cx, 0, cz));
  for (const a of [0, 1, 2, 3]) for (const s of [-1, 1]) {
    const c = Math.cos(a * Math.PI / 2), n = Math.sin(a * Math.PI / 2), u = s * (DW / 2 + 1.15), d = SW / 2 + 0.3;
    const o = detail.low ? idol(4.6, L) : guardian(4.6, L);
    f.add(at(o, cx + n * d + c * u, 0, cz + c * d - n * u).rotateY(a * Math.PI / 2));
  }
}

function hall(f, pillar) {
  const { B, X1, X2, X3, XC, ZA, ZB, ZS, HH, RW, RD, SH } = DIMS, L = ROCK_LIGHT, d = new THREE.Group();
  // The recess and its sculpture, with the two guardians at its sides.
  d.add(box(RW, 0.1, RD, L, 0, 0, ZS - RD / 2), at(trimurti(L), 0, 0.1, ZS - RD + 0.4));
  // The nine panels (the Trimurti is the ninth): [kind, width, height, sill, x, z, turn].
  const zc = (ZA + ZB) / 2, xp = X2 + 2.25;
  for (const [kind, w, h, y, x, z, a] of [
    ['ardhanarishvara', 4.2, 4.9, 0.3, -(RW / 2 + X2) / 2 - 0.5, ZS + 0.01, 0],       // south wall, east of the Trimurti
    ['gangadhara', 4, 4.9, 0.3, (RW / 2 + X2) / 2 + 0.5, ZS + 0.01, 0],              // south wall, west of it
    ['yogishvara', 3.8, 4.2, 0.6, -X1 + 0.01, -B / 2, Math.PI / 2],                    // north portico, east end
    ['nataraja', 4, 3.4, 1.2, X1 - 0.01, -B / 2, -Math.PI / 2],                        // north portico, west end
    ['ravananugraha', 3.6, 4.4, 0.5, -xp, ZA - 0.01, Math.PI],                         // east portico, north end
    ['kailash', 3.6, 4.4, 0.5, -xp, ZB + 0.01, 0],                                     // east portico, south end
    ['andhaka', 3.6, 3.5, 1, xp, ZA - 0.01, Math.PI],                                    // west portico, north end
    ['kalyanasundara', 3.6, 4.4, 0.5, xp, ZB + 0.01, 0],                               // west portico, south end
  ]) d.add(at(reliefPanel(kind, w, h), x, y, z).rotateY(a));
  // The east court: the round pedestal on which Nandi sat, in the middle of its floor; in its south
  // wall the Shakti shrine, a portico of two pillars up a flight of steps kept by two lions.
  const [s0, s1, sd, sf, st] = SH, sx = -(s0 + s1) / 2;
  d.add(cyl(2.7, 2.8, 0.35, L, -(X3 + XC) / 2, 0, zc, 32), cyl(2.3, 2.3, 0.12, L, -(X3 + XC) / 2, 0.35, zc, 32));
  d.add(box(s1 - s0, 0.05, sd - 1, DARK, sx, st - 0.06, ZB - sd / 2 - 0.5), box(s1 - s0, 0.5, 0.9, L, sx, st - 0.5, ZB - 0.45), at(steps(3.4, sf, 5, L, 0.34), sx, 0, ZB));
  d.add(box(2.2, 2.6, 0.06, DARK, sx, sf, ZB - sd + 0.04), at(panel(2.8, 3, 0.25, L, null, 0.2), sx, sf - 0.1, ZB - sd));
  for (const s of [-1, 1]) {
    const p = pillar(st - sf - 0.5);
    p.scale.set(0.7, 1, 0.7);
    d.add(at(p, sx + s * 1.9, sf, ZB - 0.5), box(0.9, st - sf, 0.9, L, sx + s * (s1 - s0 - 0.9) / 2, sf, ZB - 0.45));
  }
  f.add(mergeByMaterial(d));
  for (const s of [-1, 1]) f.add(at(lion(0.5, L), sx + s * 2.7, sf, ZB - 0.55));
  // The guardians at the Trimurti's recess, larger than life, and the shrine in the west of the hall.
  f.add(at(guardian(4.2, L), -RW / 2 - 1.2, 0, ZS + 0.6), at(guardian(4.2, L), RW / 2 + 1.2, 0, ZS + 0.6));
  shrine(f, X2 - 3, zc);
}

// The island's hill. The rock round the hall is solid blocks (the builder's), 70 m deep and 92 m
// across, its face cut sheer either side of the mouth; beyond them the hillside slopes up from the
// terrace. Behind the face the ground climbs inside the rock to its top, then on up to the wooded
// crest. Over the hall, the recess and the two courts it stays down under the floor, so it never
// shows inside; a cap of turf lies on the rock instead, with trees on it. Out of each court the
// ground climbs away east or west in a gully, back to the hillside.
export const hillY = (x, z) => {
  const { H } = DIMS, ax = Math.abs(x), gully = z > -31.5 && z < -6.7;
  if ((ax < 22 && z > -58 && z < 1) || (gully && ax < 40)) return -0.4;
  const w = smooth(40, 75, ax), rise = smooth(0.5, -7, z) * (1 - w) + smooth(9, -9, z) * w;
  const crest = smooth(-60, -300, z) * (40 + 12 * fbm(x, z, { scale: 0.01, octaves: 4 })) * (1 - 0.5 * smooth(150, 380, ax));
  const y = rise * (H + 0.6 + 1.5 * fbm(x, z, { scale: 0.04, octaves: 2 }) * smooth(-75, -100, z)) + crest - 0.4 * (1 - rise) - 4 * smooth(60, 160, z);
  return gully ? -0.4 + (y + 0.4) * smooth(40, 72, ax) : y;
};

// Elephanta: the forested hill over the cave, the terrace before it, the path down past the stalls
// to the jetty, the launches from the Gateway of India, and the harbour, with the ASI board.
export function addDetails(f, g, pillar) {
  hall(f, pillar);
  const { X3, XO, ZA, ZB, BACK, H } = DIMS, TURF = mat('#4e6a37', 0.95);
  for (const [w, z0, z1] of [[XO, 0, ZA], [X3, ZA, ZB], [XO, ZB, BACK]]) g.add(box(2 * w + 0.2, 0.55, z0 - z1, TURF, 0, H, (z0 + z1) / 2));
  g.add(heightField(900, 700, detail.low ? 110 : 170, hillY, { cz: -60, rock: ['#5d564c', '#675f53', '#544d44'], cover: '#4e6a37', steep: 0.68 }));
  // The terrace before the cave, paved, and the path down to the sea.
  g.add(box(52, 0.3, 16, M.path, 0, -0.25, 8), box(6, 0.2, 110, M.path, 8, -3.4, 82).rotateX(0.06));
  g.add(sheet(1600, 900, M.sea, 0, -6.2, 420));
  g.add(box(10, 1.4, 40, mat('#7a7166', 0.9), 8, -6.6, 178));
  g.add(launches([[0, 175, 0], [18, 182, 0.3], [-14, 190, -0.2]], { y: -6.2 }));
  const hillTrees = scatter(detail.low ? 60 : 140, [-420, 420, -340, -12], { seed: 3, gap: 12, avoid: [[-50, 50, -74, 0], [-90, 90, -38, 0]] }).map(([x, z]) => [x, z, 0, hillY(x, z)]);
  g.add(trees(hillTrees.filter((_, k) => k % 3), { kind: 'mango', seed: 4 }), trees(hillTrees.filter((_, k) => !(k % 3)), { kind: 'banyan', seed: 5 }));
  const front = scatter(detail.low ? 14 : 30, [-160, 160, 25, 160], { seed: 6, gap: 12, avoid: [[-2, 20, 20, 170], [-70, 70, 0, 110]] }).map(([x, z]) => [x, z, 0, hillY(x, z)]);
  g.add(trees(front, { kind: 'palm', seed: 7 }));
  g.add(trees(scatter(detail.low ? 6 : 12, [-40, 40, -66, -34], { seed: 8, gap: 9 }), { kind: 'mango', seed: 9, y: DIMS.H + 0.55 }));
  g.add(stalls([[14, 40, -Math.PI / 2], [14, 52, -Math.PI / 2], [14, 64, -Math.PI / 2], [2, 46, Math.PI / 2], [2, 58, Math.PI / 2]], { y: -1.6 }));
  g.add(shrubs(along(10, [-30, 4], [30, 4]).filter(([x]) => Math.abs(x) > 10), { size: 1.1 }));
  if (!detail.low) g.add(umbrellas([[-16, 12], [18, 13]]));
  g.add(asiBoard('Elephanta Caves', -12, 13, 0.3, { line2: 'WORLD HERITAGE SITE' }));
}
