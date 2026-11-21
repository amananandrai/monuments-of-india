import * as THREE from 'three';
import { surface } from '../surface.js';
import { mat, mesh, box, at, onFace, rng, inst, unitBox, aroundRect, tube, pidaRoof } from '../helpers.js';
import { onSkin, skinMatrix, normalAt } from '../sdf.js';
import { heightField, fbm, smooth } from '../details/terrain.js';
import { trabeateGate } from '../details/temples.js';
import { templeNiche, petalRing, mergeByMaterial } from '../details/components.js';
import { figure } from '../details/sculpture.js';
import { detail } from '../detail.js';
import { bahubaliBody, bahubaliSurface } from '../details/figures.js';
import { addDetails } from '../details/gommateshwara.js';

const GRANITE = mat('#c9c3b6', 0.8);
// The statue is one smooth monolith, so it gets plain stone rather than coursed masonry.
const STATUE = surface(mat('#cfc9bc', 0.75), 'marble');
const RELIEF = surface(mat('#cfc9bc', 0.75), 'carved');
const HILL = mat('#9a917f', 0.95, 0, { flatShading: true });

// Bahubali standing in kayotsarga, as carved from the one block of granite: the body, the
// anthills beside his legs and the head are one sculpted field (bahubaliBody, js/details/
// figures.js); on its skin lie, in the same stone and in low relief, the madhavi creepers that
// grew up him as he stood (leafy stems rising from the feet up the fronts of the thighs, and up
// each arm from the wrist to a coiled tendril on the upper arm), the tendrils and snakes carved
// on the anthills, and the tight curls of his hair. He stands on an open lotus.
function bahubali() {
  // The relief on the skin is in the body's own stone: its carved surface, without the marble's joints.
  const g = new THREE.Group(), G = RELIEF, F = bahubaliSurface();
  g.add(bahubaliBody(STATUE));
  const add = (o) => (g.add(o), o);
  // A stem in relief: its centre line on the skin, half its thickness sunk into the stone.
  const stem = (pts, r) => add(tube(onSkin(F, pts, r * 0.45), r, G, Math.max(24, pts.length * 4), 6));
  const leafM = [], leafS = [], curlM = [];
  // Leaves in pairs along a stem, every `step` metres, angled up and out from it, len long.
  const leaves = (pts, step, len, list) => {
    const curve = new THREE.CatmullRomCurve3(onSkin(F, pts, 0).map((p) => new THREE.Vector3(...p))), L = curve.getLength();
    for (let t = step; t < L - step * 0.4; t += step) {
      const u = t / L, p = curve.getPointAt(u), tg = curve.getTangentAt(u), n = new THREE.Vector3(...normalAt(F, p.toArray())), side = new THREE.Vector3().crossVectors(n, tg).normalize();
      for (const sd of [-1, 1]) {
        const dir = tg.clone().multiplyScalar(Math.cos(0.62)).addScaledVector(side, sd * Math.sin(0.62));
        const k = len(u);
        list.push(skinMatrix(F, p.toArray(), dir.toArray(), -0.01, [k, 1, k]));
      }
    }
  };
  for (const s of [-1, 1]) {
    // Up the front of each leg from the foot, over the thigh and out towards the hip.
    const leg = Array.from({ length: 12 }, (_, i) => { const t = i / 11; return [s * (1.02 + 0.3 * t + 0.5 * t ** 3), 1.0 + t * 7.5, 3]; });
    stem(leg, 0.11);
    leaves(leg, 0.5, (u) => 1.05 + 0.6 * u, leafM);
    // Up each arm from the wrist along the front of the forearm and the upper arm.
    const arm = Array.from({ length: 12 }, (_, i) => { const t = i / 11, ax = t < 0.5 ? 3.0 + (3.42 - 3.0) * t * 2 : 3.42, ay = t < 0.5 ? 8.5 + (11.0 - 8.5) * t * 2 : 11.0 + (13.0 - 11.0) * (t - 0.5) * 2; return [s * (ax + 0.35), ay, 2]; });
    stem(arm, 0.085);
    leaves(arm, 0.75, () => 0.85, leafS);
    // The coiled tendril at the top, on the front of the upper arm.
    const coil = Array.from({ length: 28 }, (_, i) => { const t = i / 27, a = Math.PI * 0.5 - t * Math.PI * 3.2, r = 0.55 * (1 - t) + 0.08; return [s * (3.42 + 0.12 + Math.cos(a) * r), 13.45 + Math.sin(a) * r, 2]; });
    stem([[s * 3.8, 13.0, 2], ...coil], 0.075);
    // On each anthill, tendrils carved rising in S-curves to curled ends, and two snakes.
    for (const [x0, ph] of [[2.6, 0], [3.4, 1.3], [4.3, 2.4]]) {
      const tend = Array.from({ length: 16 }, (_, i) => { const t = i / 15, a = t * 7 + ph; return [s * (x0 + 0.25 * Math.sin(a) + (t > 0.75 ? 0.3 * Math.cos((t - 0.75) * 18) * (1 - t) * 4 : 0)), 0.6 + t * 4.0 + (t > 0.75 ? 0.3 * Math.sin((t - 0.75) * 18) * (1 - t) * 4 : 0), 2]; });
      stem(tend, 0.07);
    }
    for (const z0 of [-0.9, 0.3]) {
      const outer = Array.from({ length: 10 }, (_, i) => { const t = i / 9; return [s * 5.6, 0.5 + t * 3.4, z0 + 0.35 * Math.sin(t * 6)]; });
      stem(outer, 0.13);
      const head = new THREE.Mesh(HOOD, G);
      head.matrixAutoUpdate = false;
      head.matrix.copy(skinMatrix(F, [s * 5.6, 4.05, z0 + 0.35 * Math.sin(6)], [0, 1, 0], 0.08, [1, 1, 1]));
      add(head);
    }
  }
  const placed = (geo, list) => { const im = new THREE.InstancedMesh(geo, G, list.length); list.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = im.receiveShadow = true; return add(im); };
  placed(leafGeo(1.0, 0.46, 0.09, 1.1), leafM);
  placed(leafGeo(0.75, 0.32, 0.07, 0.7), leafS);
  // The curls: rows of small snail-shell knobs over the scalp, down to the hairline (low over the
  // forehead and temples, lower behind), clear of the ears.
  for (let phi = 0.1; phi < 2.3; phi += 0.115) {
    const n = Math.max(6, Math.round((2 * Math.PI * Math.sin(phi) * 1.35) / 0.2));
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + phi * 3, p = [Math.sin(phi) * Math.sin(a) * 1.4, 17.75 + Math.cos(phi) * 1.62, -0.05 + Math.sin(phi) * Math.cos(a) * 1.45];
      const ca = Math.cos(a), line = ca > 0 ? 17.6 + 0.45 * ca : 17.6 + 0.3 * ca;
      if (p[1] < line || (Math.abs(p[0]) > 0.95 && p[1] < 18.0 && Math.abs(p[2]) < 0.5)) continue;
      curlM.push(skinMatrix(F, p, [Math.cos(a), 0, -Math.sin(a)], -0.03));
    }
  }
  placed(CURL, curlM);
  // The open lotus he stands on: a ring of broad petals turned out round his feet, its back half
  // lost in the anthills.
  add(at(petalRing(2.5, 20, 1.0, 0.8, 1.3, G, 0.32), 0, 0, 0.9));
  return g;
}
// A pointed leaf len long and w wide, t thick, its base at the origin and its tip along +z, curving
// down from its base to follow a limb of radius R, with a raised midrib.
function leafGeo(len, w, t, R) {
  const geo = new THREE.SphereGeometry(1, 20, 10), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), u = (z + 1) / 2;
    const width = Math.sin(Math.PI * Math.pow(u, 0.75)) * w * 0.5, zz = u * len, yy = y * t * 0.5 + (y > 0 ? t * 0.5 * Math.exp(-((x / 0.18) ** 2)) : 0);
    p.setXYZ(i, x * width, yy - (zz * zz) / (2 * R), zz);
  }
  geo.computeVertexNormals();
  return geo;
}
// A curl: a small knob, its top turned in a spiral.
const CURL = (() => {
  const geo = new THREE.SphereGeometry(0.11, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), r = Math.hypot(x, z); p.setY(i, y * (1 + 0.25 * Math.sin(a * 1 + r * 55))); }
  geo.scale(1, 0.6, 1);
  geo.computeVertexNormals();
  return geo;
})();
// A cobra's hood, raised.
const HOOD = new THREE.SphereGeometry(1, 12, 8).scale(0.32, 0.1, 0.42);

// The pillared cloister round the hilltop court (a 36 m square, its floor at H + 0.5): the solid
// outer wall, a colonnade 2.4 m in from it under a flat roof with a parapet, and in the middle of the
// front a gateway over the head of the stair. On desktops (js/detail.js) the back of the walk is
// lined with small niches, each holding a seated tirthankara, as the cloister's cells do.
function cloister(H) {
  const g = new THREE.Group(), y = H + 0.5, S = 18, WT = 1.1, IN = 14.5, CH = 3.8;
  // The wall: a ring of blocks, open at the front where the stair arrives.
  const walls = [];
  aroundRect(S * 2, S * 2, 3).forEach(([x, z, ry]) => { if (!(z > 0 && Math.abs(x) < 3.5)) walls.push([x, y, z, 3, 4.5, WT * 2, ry]); });
  g.add(inst(unitBox(), walls, GRANITE));
  // The colonnade: square pillars every 3 m on the inner line, the roof from the wall to it.
  const cols = aroundRect(IN * 2, IN * 2, 3).filter(([x, z]) => !(z > 0 && Math.abs(x) < 3.5)).map(([x, z]) => [x, y, z, 0.5, CH, 0.5]);
  g.add(inst(unitBox(), cols, GRANITE));
  const deep = S - WT - IN + 0.5;
  for (const s of [-1, 1]) {
    for (const [x0, x1] of s > 0 ? [[-S + WT, -3.5], [3.5, S - WT]] : [[-S + WT, S - WT]]) g.add(box(x1 - x0, 0.45, deep, GRANITE, (x0 + x1) / 2, y + CH, s * (IN + deep / 2 - 0.25)));
    g.add(box(deep, 0.45, 2 * (IN - 0.25), GRANITE, s * (IN + deep / 2 - 0.25), y + CH, 0));
  }
  // The gateway over the opening, between the two ends of the front walk.
  g.add(at(trabeateGate(8, 5.2, 3, 3.4, 3.8, { m: GRANITE }), 0, y, S - 0.5), at(pidaRoof(8, 3, 3, 0.55, GRANITE, GRANITE), 0, y + 5.2, S - 0.5));
  if (!detail.low) {
    const niches = new THREE.Group();
    for (const [a, len] of [[0, 2 * (S - WT)], [Math.PI / 2, 2 * (S - WT)], [-Math.PI / 2, 2 * (S - WT)]]) {
      for (let t = -len / 2 + 2; t < len / 2 - 1.5; t += 3) niches.add(onFace(at(templeNiche(1.1, 1.6, GRANITE, { figure: figure(1.3, GRANITE, 'seated'), crown: false }), 0, y + 0.9, 0), a, -(S - WT), t));
    }
    g.add(mergeByMaterial(niches));
  }
  return g;
}

// Vindhyagiri's height at (x, z): a granite dome 40 m high and about 80 m round, its outline
// irregular, level on top (under the 40 m enclosure) and spreading at its foot, its flanks rippled like sheet rock, the foot sinking
// under the plain. Read by the stair here and the shrubs in js/details/gommateshwara.js.
export function vindhyagiri(x, z) {
  const H = 40, u = Math.min(1, Math.max(0, (Math.hypot(x, z) + 7 * fbm(x, z, { scale: 0.012, octaves: 2 }) * smooth(30, 45, Math.hypot(x, z)) - 29) / 55));
  let y = H * Math.pow(1 - u * u, 1.1);
  y += smooth(0.5, 4, y) * (1 - smooth(H - 3, H - 0.4, y)) * 1.6 * fbm(x, z, { scale: 0.04, octaves: 3 });
  return y - 0.4 * (1 - smooth(0, 3, y));
}

export function buildGommateshwara() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Vindhyagiri: a bare granite dome, with steps cut up its face and boulders lying on its flanks.
  const H = 40;
  g.add(box(300, 0.2, 300, mat('#7d8c5a', 0.95)));
  g.add(heightField(200, 200, detail.low ? 110 : 170, vindhyagiri, { rock: ['#958d7f', '#8e8678'], cover: '#8f8a6e', steep: 0.96, band: 400 }));
  const R = rng(13), stones = [];
  for (let k = 0; k < 60 && stones.length < 26; k++) {
    const a = R() * Math.PI * 2, r = 34 + R() * 42, x = Math.sin(a) * r, z = Math.cos(a) * r, sz = 1 + R() * 2.4;
    if (Math.abs(x) < 16 && z > 12) continue; // clear of the stair
    stones.push([x, vindhyagiri(x, z) - sz * 0.3, z, sz * 1.3, sz, sz * 1.1, R() * 6.28]);
  }
  g.add(inst(new THREE.IcosahedronGeometry(0.5, 1).translate(0, 0.5, 0), stones, HILL));
  // The Vindhyagiri stair, cut in the rock: a steep flight up the foot of the hill, then a switchback
  // of six legs with a landing at each turn, some 250 treads to the gateway of the enclosure. Each
  // tread reaches from below the rock to just above it, and none is lower than the one before it.
  const ground = (x, z) => Math.max(0, vindhyagiri(x, z)), TOP = H + 0.5, treads = [];
  const nodes = [[4, 86], [4, 70.5], ...[0, 1, 2, 3, 4].map((i) => [i % 2 ? 10 : -10, 62 - i * 8.6]), [0, 20.6]];
  let top = 0;
  const put = (x, z, w, d, ry) => {
    const c = Math.cos(ry), sn = Math.sin(ry), corners = [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].map(([u, v]) => [x + u * c + v * sn, z - u * sn + v * c]);
    top = Math.min(TOP, Math.max(top, ...corners.map(([px, pz]) => ground(px, pz) + 0.3)));
    const lo = Math.min(...corners.map(([px, pz]) => ground(px, pz))) - 2.5;
    treads.push([x, lo, z, w, top - lo, d, ry]);
  };
  for (let k = 1; k < nodes.length; k++) {
    const [x0, z0] = nodes[k - 1], [x1, z1] = nodes[k], len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0), n = Math.floor(len / 0.55);
    for (let i = 1; i < n; i++) put(x0 + ((x1 - x0) * i) / n, z0 + ((z1 - z0) * i) / n, 3.4, 0.57, ry);
    put(x1, z1, 4, 4, ry);
  }
  g.add(inst(unitBox(), treads, GRANITE));
  // The hilltop enclosure, with pillared cloisters round the statue
  f.add(box(40, 1, 40, GRANITE, 0, H - 0.5, 0));
  f.add(cloister(H));
  // The 17.4 m monolith of Bahubali
  f.add(at(bahubali(), 0, H + 0.5, -4));
  addDetails(f, g);
  // The home view matches the best-known photograph: Bahubali face on, over the court.
  return { group: g, focus: f, view: [0.15, 0.12, 1], zoom: 0.45, target: [0, 50, 0] };
}
