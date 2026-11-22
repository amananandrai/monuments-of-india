import * as THREE from 'three';
import { flat, mesh, box, at, onFace, kalash, bell, shikhara, pidaRoof, kalingaProfile } from '../helpers.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { addDetails, STONE, SHADE } from '../details/mukteswara-temple.js';

// The Mukteswara at Bhubaneswar, a small Kalinga temple of about 950 CE, 10.5 m high. Its front
// (west in life) faces +z: the torana, the arched gateway on two pillars; the jagamohana, a square
// hall under the first pyramidal roof of slabs in Odisha; and the deul, the sanctum under its
// curved rekha tower, all on a low moulded plinth inside a sunken court.
export function buildMukteswara() {
  const S = STONE, Sd = SHADE, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // P: the plinth. The deul: walls (bada) 4.6 m square, arms 5.2 wide, BH high at z = dz; its
  // tower TH high on the Kalinga taper. The jagamohana: 7 m square, its walls JH high, at z = jz.
  const P = 0.45, dz = -3.6, BH = 3.2, TH = 4.9, jz = 2.6, JW = 7, JH = 2.9;
  f.add(box(14, P, 16.4, Sd, 0, 0, -0.2), box(14.3, 0.12, 16.7, S, 0, P - 0.12, -0.2));
  f.add(at(steps(2.4, P, 3, Sd), 0, 0, 8.4));
  // The deul, on a pancharatha plan: a square with two stepped projections on each face.
  f.add(box(4.6, BH, 4.6, S, 0, P, dz), box(5.2, BH, 3.2, S, 0, P, dz), box(3.2, BH, 5.2, S, 0, P, dz), box(5.6, BH, 1.6, S, 0, P, dz), box(1.6, BH, 5.6, S, 0, P, dz));
  f.add(box(5.4, 0.25, 5.4, Sd, 0, P + BH - 0.25, dz), box(6, 0.25, 2, Sd, 0, P + BH - 0.25, dz), box(2, 0.25, 6, Sd, 0, P + BH - 0.25, dz));
  const tower = shikhara(5.4, TH, S, kalingaProfile, 18, S, 0.6);
  f.add(at(tower, 0, P + BH, dz));
  // The jagamohana: walls on a plan with a shallow projection in the middle of each face, a roof
  // of two flights of slabs with a recess between, and a bell, an amalaka and a kalasha over them.
  f.add(box(JW, JH, JW, S, 0, P, jz), box(JW + 0.6, JH, 3, S, 0, P, jz), box(3, JH, JW + 0.6, S, 0, P, jz));
  f.add(box(JW + 1, 0.25, JW + 1, Sd, 0, P + JH - 0.25, jz));
  const r1 = pidaRoof(JW + 0.6, 5.4, 4, 0.3, S, Sd);
  let y = P + JH;
  f.add(at(r1, 0, y, jz));
  y += r1.userData.top;
  f.add(box(4.2, 0.5, 4.2, Sd, 0, y, jz));
  y += 0.5;
  const r2 = pidaRoof(4.8, 3.2, 3, 0.28, S, Sd);
  f.add(at(r2, 0, y, jz));
  y += r2.userData.top;
  f.add(at(bell(1.3, S), 0, y, jz));
  const am = mesh(new THREE.SphereGeometry(1.0, 20, 8), flat(S), 0, y + 1.55, jz);
  am.scale.y = 0.38;
  f.add(am, at(kalash(0.55, S), 0, y + 1.85, jz));
  // The door of the jagamohana, and the doorway between it and the sanctum (seen through it).
  f.add(at(templeDoorway(1.1, 2.1, { m: S, bands: 3, guardians: false }), 0, P, jz + JW / 2 + 0.3));
  // The diamond-latticed windows of the north and south faces.
  for (const a of [Math.PI / 2, -Math.PI / 2]) {
    const w = onFace(at(box(1.5, 1.4, 0.06, Sd), 0, P + 1.2, 0), a, JW / 2 + 0.33);
    w.position.z += jz;
    f.add(w);
  }
  // The torana, before the hall's door.
  f.add(at(toranaArch(S, Sd), 0, 0, 11.6));
  addDetails(f, g, { P, dz, BH, TH, jz, JW, JH, towerTop: P + BH + tower.userData.top });
  return { group: g, focus: f, view: [0.9, 0.26, 1], zoom: 0.62 };
}

// The torana: two round pillars on square bases, with spreading capitals, carrying a lintel from
// which a rounded, trefoiled arch springs, its band beaded and garlanded; on its shoulders recline
// two smiling women (shalabhanjikas). Faces +z, stands on y = 0; about 4.7 m high.
function toranaArch(S, Sd) {
  const t = new THREE.Group(), W = 3.6;
  for (const s of [-1, 1]) {
    t.add(box(0.75, 0.5, 0.75, Sd, s * W / 2, 0, 0), box(0.6, 0.3, 0.6, S, s * W / 2, 0.5, 0));
    const sh = mesh(new THREE.CylinderGeometry(0.22, 0.26, 2.3, 12), S, s * W / 2, 1.95, 0);
    t.add(sh, box(0.7, 0.35, 0.6, S, s * W / 2, 3.1, 0), box(0.9, 0.25, 0.75, Sd, s * W / 2, 3.45, 0));
  }
  t.add(box(W + 1.2, 0.35, 0.7, S, 0, 3.6, 0));
  // The arch: a thick band in a round-headed curve with three lobes, beaded on its face.
  const path = new THREE.Shape(), R = W / 2 + 0.05;
  path.moveTo(-R - 0.35, 0);
  path.absarc(0, 0, R + 0.35, Math.PI, 0, true);
  path.lineTo(R, 0);
  path.absarc(0, 0, R, 0, Math.PI, false);
  path.closePath();
  const arch = mesh(new THREE.ExtrudeGeometry(path, { depth: 0.5, bevelEnabled: false, curveSegments: 24 }).translate(0, 0, -0.25), S, 0, 3.95, 0);
  arch.scale.y = 0.62;
  t.add(arch);
  for (let k = 0; k <= 14; k++) {
    const a = (k / 14) * Math.PI, b = mesh(new THREE.SphereGeometry(0.12, 8, 6), S, Math.cos(a) * (R + 0.18), 3.95 + Math.sin(a) * (R + 0.18) * 0.62, 0.28);
    t.add(b);
  }
  // A kirtimukha at the crown of the arch, and the reclining women on its shoulders.
  t.add(box(0.5, 0.42, 0.4, S, 0, 3.95 + (R + 0.35) * 0.62 - 0.12, 0.08));
  for (const s of [-1, 1]) {
    const body = mesh(new THREE.CapsuleGeometry(0.15, 0.85, 4, 8), S, s * (R - 0.25), 4.3, 0.15);
    body.rotation.z = s * 1.0;
    const head = mesh(new THREE.SphereGeometry(0.15, 10, 8), S, s * (R - 0.65), 4.75, 0.15);
    t.add(body, head);
  }
  return mergeByMaterial(t);
}
