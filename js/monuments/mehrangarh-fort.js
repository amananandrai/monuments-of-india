import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, chhatri, inst, unitBox, surface } from '../helpers.js';
import { fortGate } from '../details/forts.js';
import { heightField, rough, smooth } from '../details/terrain.js';
import { townHouses } from '../details/realism.js';
import { addDetails } from '../details/mehrangarh-fort.js';

const SAND = mat('#b9774f', 0.9);
const SAND_LIGHT = mat('#cf9a6e', 0.85);
const ROCK = mat('#8b6a4e', 0.95, 0, { flatShading: true });

export function buildMehrangarh() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(83);
  g.add(f);
  g.add(box(600, 0.2, 500, mat('#c9b48c', 0.95)));
  // The rocky hill, about 120 m above Jodhpur (scaled to fit), with the blue city at its foot
  const H = 45;
  // Bhakurcheeta, the rocky ridge: a long outcrop with sheer, broken faces where the fort's walls
  // rise straight from the rock, falling in scree and boulders to the plain and the blue city.
  g.add(heightField(380, 220, 190, (x, z) => {
    const ex = Math.abs(x) / 74, ez = Math.abs(z) / 27, e = Math.pow(ex ** 4 + ez ** 4, 0.25) + rough(x, z, 0.06, 1.6);
    const top = H + rough(x, z, 1.5, 1.2), cliff = smooth(1.3, 1.0, e), foot = 16 * smooth(2.6, 1.2, e) + rough(x, z, 3, 0.8);
    return Math.max(0, Math.max(top * cliff, foot * (1 - cliff)) + rough(x * 2, z * 2, 1.2 * cliff, 1.3)) - 0.2;
  }, { rock: ['#8b6a4e', '#7a5c43', '#9a7556'], cover: '#a98a65', steep: 0.75, band: 7 }));
  // The old city at its foot, its houses washed blue.
  const houses = [];
  for (let i = 0; i < 150; i++) {
    const x = (R() - 0.5) * 360, z = 62 + R() * 90, w = 5 + R() * 4;
    if (Math.abs(x) < 90 && z < 75) continue;
    houses.push([x, z, w, 5 + R() * 3, 1 + Math.floor(R() * 3), (Math.floor(R() * 4) * Math.PI) / 2]);
  }
  g.add(townHouses(houses, { seed: 83, paint: ['#6f9fd0', '#7fb0dc', '#5d8fc4', '#8dbbe2', '#6f9fd0', '#e8dcc0'] }));
  // Sheer walls rising straight from the rock, bastions, and the palaces on the summit
  f.add(box(130, 30, 44, SAND, 0, H - 6, 0));
  for (const x of [-60, -30, 0, 30, 60]) f.add(cyl(8, 9, 32, SAND, x, H - 6, 20, 16));
  // A gatehouse (pol) between two bastions, its passage ending at the inner door in the wall
  f.add(at(fortGate(11, 14, 8, 4.4, 7.5, { m: SAND, trim: SAND_LIGHT, through: false }), 15, H, 26));
  f.add(box(70, 14, 28, SAND_LIGHT, -10, H + 24, -2), box(40, 10, 20, SAND_LIGHT, 34, H + 24, 4));
  const jali = [];
  for (let k = 0; k < 22; k++) jali.push([-42 + k * 3, H + 28, 12.2, 2, 4, 0.4]);
  f.add(inst(unitBox(), jali, surface(mat('#c48a62', 0.85), 'lattice')));
  for (const x of [-38, -18, 2, 20, 46]) f.add(at(chhatri(2.6, 7, SAND_LIGHT), x, H + 38, 8));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.35, 0.22, 1.25] };
}
