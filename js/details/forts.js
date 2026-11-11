import * as THREE from 'three';
import { M, mesh, box, cyl, at, onFace, archWall, rise, hemi, finial, inst, unitBox, unitCyl } from '../helpers.js';
import { detail } from '../detail.js';
import { archRing, hood, merlons, mergeByMaterial } from './components.js';
import { doorLeaves, interior } from './doorways.js';
import { pierced } from './mughal.js';

// Fort and city gates. A gate here is a gatehouse w wide, h high and d deep (centred on its own
// position, front face at z = d/2, facing +z) with a real arched passage aw × ah running through it.
// Inside the passage: guard niches cut into both side walls, and at its middle two great timber
// leaves with iron spikes against war elephants, standing open inward against the walls. Options:
// - iwan: { w, h, depth }, a deep arched recess with a half-dome at the front, at whose back the
//   passage opens (as at the Lahori Gate);
// - through: false ends the passage at a dim inner doorway instead of running through;
// - towers: { r, h, cap: 'dome' | 'merlons', seg }, a tower at each front corner;
// - crest: merlons along the top; ramp: [rise, run], a ramp up to the sill from the ground in front.
export function fortGate(w, h, d, aw, ah, {
  m, trim = m, pointed = true, iwan = null, through = true, open = 1.3, niches = true, crest = true,
  towers = null, ramp = null, spikes = true, leafM = undefined,
} = {}) {
  const g = new THREE.Group();
  const id = iwan ? iwan.depth : 0, pd = d - id, pz = -d / 2 + pd / 2;
  const nd = niches ? Math.min(0.9, aw * 0.18) : 0, W = aw + 2 * nd;
  const s = ah - rise(aw / 2, pointed), AH = s + rise(W / 2, pointed);
  // The passage block, its arch nd wider each side than the passage, for the guard niches.
  g.add(at(archWall(w, h, pd, W, AH, pointed, m), 0, 0, pz));
  if (nd > 0) {
    const nw = Math.min(1.5, pd * 0.16), nh = Math.min(2.8, s - 0.5);
    const holes = nh > rise(nw / 2, true) + 0.4 ? [[-pd * 0.3, 0.3, nw, nh], [pd * 0.3, 0.3, nw, nh]] : [];
    for (const sx of [-1, 1]) {
      const skin = pierced(pd, s, holes, nd, m);
      skin.rotation.y = -sx * Math.PI / 2;
      skin.position.set(sx * (aw / 2 + nd), 0, pz);
      g.add(skin);
    }
  }
  // Mouldings round the passage mouths.
  const band = Math.min(0.4, aw * 0.06);
  g.add(at(archRing(W, AH, pointed, band, 0.08, trim), 0, 0, pz + pd / 2));
  if (through) {
    const r = at(archRing(W, AH, pointed, band, 0.08, trim), 0, 0, pz - pd / 2);
    r.rotation.y = Math.PI;
    g.add(r);
  } else {
    g.add(at(interior(W, AH, 0.12, 0.08), 0, 0, -d / 2 + 0.03));
  }
  // A paved floor through the passage, its top just above the ground.
  g.add(box(W - 0.02, 0.3, d - 0.02, trim, 0, -0.28, 0));
  // The spiked leaves, a little in front of the middle of the passage, and the threshold under them.
  const dz = pz + pd * 0.12;
  g.add(at(doorLeaves(aw * 0.996, s * 0.97, { open, inward: true, spikes, ...(leafM ? { m: leafM } : {}) }), 0, 0.12, dz));
  g.add(box(aw, 0.12, 0.7, trim, 0, 0, dz));
  if (iwan) {
    const fz = d / 2 - id;
    g.add(at(pierced(w, h, [[0, 0, iwan.w, iwan.h]], id, m, pointed), 0, 0, fz));
    g.add(at(hood(iwan.w * 0.995, iwan.h * 0.995, pointed, id, m), 0, 0, fz));
    g.add(at(archRing(iwan.w, iwan.h, pointed, Math.min(0.45, iwan.w * 0.035), 0.08, trim), 0, 0, d / 2));
  }
  if (crest) g.add(at(merlons(w - 0.4, Math.min(0.9, w * 0.05), Math.min(1.2, w * 0.065), 0.5, m, 0.35), 0, h, d / 2 - 0.3));
  if (towers) {
    const { r, h: th, cap = 'dome', seg = 8 } = towers;
    for (const sx of [-1, 1]) {
      const x = sx * (w / 2 + r * 0.45), z = d / 2 - r * 0.6;
      g.add(cyl(r, r * 1.08, th, m, x, 0, z, seg), cyl(r * 1.12, r * 1.12, 0.35, trim, x, th * 0.55, z, seg));
      g.add(cyl(r * 1.15, r * 1.15, 0.45, trim, x, th - 0.47, z, seg));
      if (cap === 'dome') g.add(at(hemi(r * 0.9, m, 20), x, th, z), at(finial(r * 0.9), x, th + r * 0.88, z));
      else {
        const n = Math.max(6, Math.round(r * 2.6));
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2;
          g.add(box(0.7, 1, 0.5, m, x + Math.sin(a) * r * 0.95, th, z + Math.cos(a) * r * 0.95).rotateY(a));
        }
      }
    }
  }
  if (ramp) {
    const [rise_, run] = ramp, sh = new THREE.Shape();
    sh.moveTo(0, 0); sh.lineTo(run, 0); sh.lineTo(0, rise_); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: aw + 1, bevelEnabled: false });
    geo.rotateY(-Math.PI / 2);
    geo.translate((aw + 1) / 2, -rise_, d / 2);
    g.add(mesh(geo, trim));
  }
  return mergeByMaterial(g);
}

// The finer detail of a round tower or bastion, rb in radius at its foot and rt at its top, h tall
// (on y = 0, centred on its own axis): a battered plinth course, moulded string courses, and arrow
// slits in rings of n between them, staggered from one ring to the next.
export function towerDetail(rb, rt, h, m, trim = m, { n = 8, seg = 24, courses = [0.34, 0.68], slits = [0.2, 0.5, 0.82] } = {}) {
  const g = new THREE.Group(), r = (y) => rb + ((rt - rb) * y) / h;
  g.add(cyl(rb * 1.04, rb * 1.08, Math.min(1.2, h * 0.05), trim, 0, 0, 0, seg));
  for (const t of courses) { const y = t * h, rr = r(y) + Math.max(0.08, rb * 0.025); g.add(cyl(rr, rr, Math.min(0.5, h * 0.025), trim, 0, y, 0, seg)); }
  // On a polygonal tower (seg of 12 or fewer sides) the slits sit at the middle of its faces.
  const poly = seg <= 12, ap = poly ? Math.cos(Math.PI / seg) : 1;
  if (poly) n = seg;
  const sw = Math.min(0.35, rb * 0.08), sh = Math.min(1.4, h * 0.07);
  slits.forEach((t, i) => {
    const y = t * h;
    for (let k = 0; k < n; k++) {
      const a = ((k + (poly ? 0.5 : (i % 2) * 0.5)) / n) * Math.PI * 2, rr = r(y + sh / 2) * ap + 0.012;
      g.add(onFace(box(sw, sh, 0.05, M.recess, 0, y, 0), a, rr));
    }
  });
  return mergeByMaterial(g);
}

// A row of arrow slits along x on a wall face at z = 0: n slits w × h over len, from height y.
export function slitRow(len, n, y, w, h) {
  const g = new THREE.Group();
  for (let k = 0; k < n; k++) g.add(box(w, h, 0.05, M.recess, -len / 2 + ((k + 0.5) / n) * len, y, 0.02));
  return g;
}

/* ---------- ramparts ---------- */
// A merlon one unit wide, high and deep with a pointed head, standing on y = 0: few triangles, as
// a long wall carries hundreds of them.
function plainMerlon() {
  const sh = new THREE.Shape();
  sh.moveTo(-0.5, 0); sh.lineTo(0.5, 0); sh.lineTo(0.5, 0.62); sh.lineTo(0, 1); sh.lineTo(-0.5, 0.62); sh.closePath();
  return new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false }).translate(0, 0, -0.5);
}

// The battlements of a curtain wall built as a run of plain lengths, each [x, y, z, len, h, t, ry]
// as given to inst() (the hill forts' walls: Mehrangarh, Jaisalmer, Chittorgarh). On the outer edge
// of each length's top (the side away from `centre`): a parapet course, pointed merlons along it,
// and below it a projecting string course and a row of arrow slits; on the inner edge, the low kerb
// of the wall walk. All instanced. size scales the parts (1: merlons 1.1 m wide and 1.3 high).
// On phones: merlons twice as far apart, and no slits or kerb.
export function rampart(segs, m, { trim = m, size = 1, centre = [0, 0], course = true, slits = true, kerb = true, every = 1 } = {}) {
  const g = new THREE.Group(), low = detail.low, s = size;
  const parapets = [], merlons = [], courses = [], loops = [], kerbs = [];
  const pitch = 1.9 * s * (low ? 2 : 1) * every;
  for (const [mx, y, mz, len, h, t, ry = 0] of segs) {
    const ux = Math.cos(ry), uz = -Math.sin(ry);
    let nx = Math.sin(ry), nz = Math.cos(ry);
    if (nx * (mx - centre[0]) + nz * (mz - centre[1]) < 0) { nx = -nx; nz = -nz; }
    const top = y + h, o = t / 2, put = (out, along = 0) => [mx + nx * out + ux * along, mz + nz * out + uz * along];
    const [px, pz] = put(o - 0.25 * s);
    parapets.push([px, top, pz, len, 0.7 * s, 0.5 * s, ry]);
    const n = Math.max(1, Math.round(len / pitch));
    for (let k = 0; k < n; k++) {
      const along = ((k + 0.5) / n - 0.5) * len, [x, z] = put(o - 0.25 * s, along);
      merlons.push([x, top + 0.7 * s, z, 1.1 * s, 1.3 * s, 0.5 * s, ry]);
      if (slits && !low && k % 2 === 0) { const [lx, lz] = put(o + 0.02, along); loops.push([lx, top - 4.2 * s, lz, 0.24 * s, 1.6 * s, 0.06, ry]); }
    }
    if (course) { const [cx, cz] = put(o + 0.1); courses.push([cx, top - 1.5 * s, cz, len, 0.4 * s, 0.3, ry]); }
    if (kerb && !low) { const [kx, kz] = put(-o + 0.2 * s); kerbs.push([kx, top, kz, len, 0.5 * s, 0.4 * s, ry]); }
  }
  const add = (geo, list, mm, shadow) => { if (!list.length) return; const im = inst(geo, list, mm); im.castShadow = shadow; g.add(im); };
  add(unitBox(), parapets, m, true);
  add(plainMerlon(), merlons, m, true);
  add(unitBox(), courses, trim, false);
  add(unitBox(), loops, M.recess, false);
  add(unitBox(), kerbs, m, false);
  return g;
}

// The crowns of round bastions, [x, top, z, r] each: a projecting cornice under the top and a ring
// of merlons round it. size as in rampart().
export function bastionCrowns(list, m, { trim = m, size = 1, seg = 16 } = {}) {
  const g = new THREE.Group(), merlons = [], cornices = [], s = size, step = detail.low ? 2 : 1;
  for (const [x, top, z, r] of list) {
    cornices.push([x, top - 1.3 * s, z, 2 * r + 0.5 * s, 0.45 * s, 2 * r + 0.5 * s]);
    const n = Math.max(6, Math.round((2 * Math.PI * r) / (1.9 * s)));
    for (let k = 0; k < n; k += step) {
      const a = (k / n) * Math.PI * 2;
      merlons.push([x + Math.sin(a) * (r - 0.3 * s), top, z + Math.cos(a) * (r - 0.3 * s), 1.1 * s, 1.3 * s, 0.5 * s, a]);
    }
  }
  g.add(inst(unitCyl(seg), cornices, trim), inst(plainMerlon(), merlons, m));
  return g;
}
