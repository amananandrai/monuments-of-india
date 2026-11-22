import * as THREE from 'three';
import { mesh, box, cyl, at } from '../helpers.js';
import { dravidaVimana, dravidaDress, gopuram, wallWithGaps, trabeateGate } from '../parts/temples.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { clusterPillar } from '../parts/sculpture.js';
import { nandi } from '../parts/animals.js';
import { detail } from '../detail.js';
import { addDetails, GRANITE as S, SHADE as Sd, STUCCO, DIMS } from '../details/lepakshi-temple.js';

// A pillared hall w × d on a plinth P high, its pillars h tall and about `step` apart, under a flat
// roof with a deep eave. roof: false leaves the beams bare, as in the unfinished Kalyana Mandapa.
function hall(w, d, P, h, step, { roof = true, figures = false } = {}) {
  const g = new THREE.Group(), cols = new THREE.Group();
  g.add(box(w + 0.8, P, d + 0.8, Sd), box(w + 1, 0.25, d + 1, S, 0, P - 0.25, 0));
  const nx = Math.round((w - 1.6) / step), nz = Math.round((d - 1.6) / step);
  const pil = clusterPillar(h, S, { figures: figures && !detail.low, low: detail.low });
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
    const o = pil.clone();
    o.position.set(-w / 2 + 0.8 + (i / nx) * (w - 1.6), P, -d / 2 + 0.8 + (j / nz) * (d - 1.6));
    cols.add(o);
  }
  g.add(cols);
  // Beams over every row of pillars.
  for (let i = 0; i <= nx; i++) g.add(box(0.7, 0.6, d - 1, Sd, -w / 2 + 0.8 + (i / nx) * (w - 1.6), P + h, 0));
  for (let j = 0; j <= nz; j++) g.add(box(w - 1, 0.6, 0.7, Sd, 0, P + h, -d / 2 + 0.8 + (j / nz) * (d - 1.6)));
  if (roof) g.add(box(w + 0.6, 0.5, d + 0.6, S, 0, P + h + 0.6), box(w + 0.2, 0.5, d + 0.2, Sd, 0, P + h + 1.1));
  return g;
}

// The Nagalinga: a linga sheltered by a great serpent, its body coiled three times under the linga
// and its seven hoods spread over it, carved from one granite boulder (about 6 m high).
function nagalinga(m) {
  const g = new THREE.Group();
  g.add(box(5.4, 0.6, 5.4, Sd));
  for (let k = 0; k < 3; k++) {
    const t = mesh(new THREE.TorusGeometry(1.75 - k * 0.3, 0.42, 10, 28), m, 0, 1.0 + k * 0.72, 0);
    t.rotation.x = Math.PI / 2;
    g.add(t);
  }
  g.add(cyl(0.75, 0.75, 1.4, m, 0, 2.4, 0, 20), at(mesh(new THREE.SphereGeometry(0.75, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), m), 0, 3.8, 0));
  // The neck rising behind the linga, and the seven hoods fanned over it.
  const neck = mesh(new THREE.CylinderGeometry(0.5, 0.65, 3.4, 12), m, 0, 3.6, -1.15);
  neck.rotation.x = 0.18;
  g.add(neck);
  for (let k = 0; k < 7; k++) {
    const a = (k - 3) * 0.36, hood = mesh(new THREE.SphereGeometry(0.85, 12, 8), m, Math.sin(a) * 1.45, 5.0 + Math.cos(a) * 0.75, -0.75 + Math.cos(a) * 0.3);
    hood.scale.set(0.7, 1.05, 0.32);
    hood.rotation.set(-0.5, 0, -a * 0.9);
    g.add(hood);
  }
  return mergeByMaterial(g);
}

// The Veerabhadra temple at Lepakshi, built in the 1530s by the brothers Virupanna and Viranna on a
// low granite hill shaped like a tortoise (Kurmasaila). It faces north, here +z. Two walled courts:
// in the inner, the dance hall (natya mandapa), open on pillars carved with dancers and musicians
// (one of them the "hanging pillar"), then the closed hall and the sanctum of Veerabhadra under a
// modest stucco tower. To the east (+x) of the shrine, the Nagalinga; to the south-west, the
// unfinished wedding hall (Kalyana Mandapa), its pillars and beams never roofed. A gopuram leads
// into the outer court, and on the road some 200 m before it lies the great monolithic Nandi.
export function buildLepakshi() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { R, nz, sz, kx, kz, lx, lz } = DIMS;
  // The rock the temple stands on: its top levelled into the courts.
  f.add(box(74, R, 86, Sd, 0, 0, 4));
  // The dance hall: 20 m square, its pillars 4.6 m high, with a raised middle bay.
  f.add(at(hall(20, 18, 1.2, 4.6, 2.6, { figures: true }), 0, R, nz));
  f.add(at(steps(4, 1.2, 5, Sd), 0, R, nz + 9.4));
  // The closed hall and the sanctum, with its stucco tower.
  f.add(box(12, 6.4, 10, S, 0, R, sz + 8.5), at(dravidaDress(12, 10, 6.4, S, { eaveM: Sd }), 0, R, sz + 8.5));
  f.add(at(templeDoorway(1.6, 3, { m: S, guardianH: 1.5 }), 0, R + 1.2, sz + 13.5));
  f.add(box(9, 7, 9, S, 0, R, sz), at(dravidaDress(9, 9, 7, S, { eaveM: Sd }), 0, R, sz));
  const tower = dravidaVimana(7.6, 3, 1.9, STUCCO, STUCCO, { taper: 0.45, capScale: 0.3, kalashScale: 0.5, kalashM: S });
  f.add(at(tower, 0, R + 7.3, sz));
  // The Nagalinga beside the shrine, and the unfinished wedding hall behind it.
  f.add(at(nagalinga(S), lx, R, lz));
  f.add(at(hall(15, 15, 1.4, 4.2, 2.4, { roof: false }), kx, R, kz));
  // The inner court's wall and its gate on the axis.
  const W = 56, D = 64, wz = 6;
  f.add(at(wallWithGaps('x', W, 4.2, 1.4, Sd, [[0, 6]]), 0, R, wz + D / 2), at(box(W, 4.2, 1.4, Sd), 0, R, wz - D / 2));
  for (const s of [-1, 1]) f.add(at(box(1.4, 4.2, D, Sd), s * W / 2, R, wz));
  f.add(at(trabeateGate(9, 6.5, 4, 2.6, 4.2, { m: S, trim: Sd, guardians: true }), 0, R, wz + D / 2));
  // The outer gopuram and the flight up the rock to it.
  const gz = 47;
  f.add(at(gopuram(13, 8, 16, 3, 17, ['#9d9483', '#8e8574', '#aba291', '#958c7b']), 0, R, gz));
  f.add(at(steps(5, R, 7, Sd), 0, 0, gz + 4.5));
  // The monolithic Nandi on the road, facing the temple, on its plinth.
  g.add(box(10, 0.8, 12, Sd, 0, 0, 120), at(nandi(S, 1.4), 0, 0.8, 120).rotateY(Math.PI));
  addDetails(f, g);
  // From the north-east, over the gopuram into the courts, the Nagalinga beside the shrine.
  return { group: g, focus: f, view: [0.8, 0.42, 1], zoom: 0.7 };
}
