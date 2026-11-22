import * as THREE from 'three';
import { mesh, box, at, planPrism, planBand, pidaRoof, kalash, offsetPlan } from '../helpers.js';
import { cuspedArchGeo, chhajja, mergeByMaterial } from '../parts/components.js';
import { addDetails, STUCCO as S, TRIM as T, STONE, RECESS, PLAN, H } from '../details/lotus-mahal-hampi.js';

// One storey of the pavilion on the plan PLAN (a cross of stepped bays, its corners [x, z]): a pier
// at every corner and a cusped arch hung between each pair along every edge, facing out, under a
// beam course. closed: the upper storey, its arches windows in a wall set back behind them.
function storey(y, h, archH, { closed = false } = {}) {
  const g = new THREE.Group(), pw = 1.3, n = PLAN.length;
  for (const [x, z] of PLAN) g.add(box(pw, h, pw, S, x, y, z));
  for (let i = 0; i < n; i++) {
    const [ax, az] = PLAN[i], [bx, bz] = PLAN[(i + 1) % n], len = Math.hypot(bx - ax, bz - az);
    // Outward along the edge's right-hand normal (the plan runs clockwise seen from above).
    const nx = (bz - az) / len, nz = -(bx - ax) / len, mx = (ax + bx) / 2, mz = (az + bz) / 2;
    const arch = mesh(cuspedArchGeo(len - pw, archH, 0.45), S, mx, y + h, mz);
    arch.rotation.y = Math.atan2(nx, nz);
    g.add(arch);
    if (closed) {
      // The wall behind, with a window in it, and a low balcony wall under the arch.
      const w = mesh(new THREE.BoxGeometry(len - pw, h, 0.3), S, mx - nx * 0.5, y + h / 2, mz - nz * 0.5);
      w.rotation.y = arch.rotation.y;
      const win = mesh(new THREE.BoxGeometry(Math.min(1.6, len - pw - 1.2), h * 0.5, 0.05), RECESS, mx - nx * 0.33, y + h * 0.45, mz - nz * 0.33);
      win.rotation.y = arch.rotation.y;
      const sill = mesh(new THREE.BoxGeometry(len - pw, 0.8, 0.35), T, mx + nx * 0.02, y + 0.4, mz + nz * 0.02);
      sill.rotation.y = arch.rotation.y;
      g.add(w, win, sill);
    }
  }
  return g;
}

// The Lotus Mahal (Kamal Mahal) in the Zenana Enclosure at Hampi, a pavilion of the Vijayanagara
// court of the 16th century. Its plan is a square with a bay stepping out from the middle of each
// face; the lower storey is open on all sides in cusped arches, the lobes of which open like a
// lotus; the upper storey is walled, with arched windows behind small balconies; a curved eave
// runs between the two. On its roof stand nine stepped pyramidal towers in the manner of a temple's
// spire: a tall one in the middle, one over each corner and one over each projecting bay. Islamic
// arches, Hindu roofs, all in brick and stucco on a stone base.
export function buildLotusMahal() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { base, g1, g2, archLow, archHigh } = H;
  // The moulded stone base and its steps.
  f.add(planPrism(offsetPlan(PLAN, 1.4), 0, base, STONE), planBand(offsetPlan(PLAN, 1.4), base - 0.25, 0.25, 0.08, T));
  f.add(planPrism(PLAN, base - 0.02, 0.06, T));
  // The open lower storey and its ceiling.
  f.add(storey(base, g1, archLow));
  f.add(planPrism(offsetPlan(PLAN, 0.3), base + g1, 0.7, T));
  // The eave between the storeys, along every outer edge.
  const ev = new THREE.Group(), y2 = base + g1 + 0.7;
  for (let i = 0; i < PLAN.length; i++) {
    const [ax, az] = PLAN[i], [bx, bz] = PLAN[(i + 1) % PLAN.length], len = Math.hypot(bx - ax, bz - az);
    const nx = (bz - az) / len, nz = -(bx - ax) / len;
    for (const [yy, d] of [[y2 - 0.05, 1.5], [y2 + g2 + 0.65, 1.3]]) {
      const c = chhajja(len + 1.6, d, 0.55, 0.14, T);
      c.position.set((ax + bx) / 2 + nx * 0.6, yy, (az + bz) / 2 + nz * 0.6);
      c.rotation.y = Math.atan2(nx, nz);
      ev.add(c);
    }
  }
  f.add(mergeByMaterial(ev));
  // The walled upper storey and its roof slab.
  f.add(storey(y2, g2, archHigh, { closed: true }));
  f.add(planPrism(PLAN.map(([x, z]) => [x * 0.97, z * 0.97]), y2, g2, S));
  const ry = y2 + g2;
  f.add(planPrism(offsetPlan(PLAN, 0.35), ry, 0.6, T));
  // The nine towers: a stepped pyramid of curved-edged tiers on a square drum, a ribbed stone and a
  // pot. The middle tower is the tallest.
  const tower = (w, n, u) => {
    const t = new THREE.Group(), r = pidaRoof(w, w * 0.32, n, u, S, T);
    t.add(box(w * 1.05, 0.7, w * 1.05, T), at(r, 0, 0.7, 0));
    const top = 0.7 + r.userData.top, am = mesh(new THREE.SphereGeometry(w * 0.2, 16, 6), S, 0, top + w * 0.08, 0);
    am.scale.y = 0.45;
    t.add(am, at(kalash(w * 0.12, T), 0, top + w * 0.15, 0));
    return t;
  };
  const roofs = new THREE.Group();
  roofs.add(at(tower(7, 6, 0.75), 0, ry + 0.6, 0));
  for (const [x, z] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) roofs.add(at(tower(3.4, 4, 0.55), x, ry + 0.6, z));
  for (const [x, z] of [[0, -7.6], [0, 7.6], [-7.6, 0], [7.6, 0]]) roofs.add(at(tower(3, 4, 0.5), x, ry + 0.6, z));
  f.add(roofs);
  addDetails(f, g);
  // From the south-east, inside the walls of the enclosure.
  return { group: g, focus: f, view: [0.85, 0.32, 1], zoom: 0.75 };
}
