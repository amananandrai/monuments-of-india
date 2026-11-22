import * as THREE from 'three';
import { M, mat, box, cyl, at, inst, unitBox, photo } from '../helpers.js';
import { fortGate, rampart, bastionCrowns } from '../parts/forts.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { addDetails } from '../details/shaniwar-wada.js';

// The stones of the Peshwas' palace: dark Deccan basalt for the lower walls and bastions, brick
// for their upper courses, a lighter stone for the copings, and the teak of the gate's leaves and
// its upper gallery.
export const STONE = {
  basalt: photo(mat('#7a7064', 0.92), 'rubble'), brick: mat('#8f6a52', 0.9), trim: mat('#a39684', 0.9),
  teak: mat('#5e4330', 0.8), teakLight: mat('#7a5a40', 0.78),
};

// Shaniwar Wada, Pune, 1730–1732: the seat of the Peshwas. The palace inside burned down in 1828;
// what stands is its fortification: a wall round an enclosure of about 6.25 acres (here 170 by
// 150 m), with nine round bastions and five gates. From photographs: the walls are of basalt below
// and brick above, crowned with merlons; the great Delhi Darwaza in the middle of the north face
// (+z here) is a gatehouse between two massive bastions, its leaves studded with spikes against
// elephants, and over its arch an upper storey with a gallery of teak arches, the drum house
// (nagarkhana).
export const WX = 85, WZ = 75, WH = 10.5, T = 3.2;
export function buildShaniwarWada() {
  const S = STONE, g = new THREE.Group(), f = new THREE.Group(), site = new THREE.Group();
  g.add(f);
  f.add(site);
  // The curtain walls, basalt to 4.5 m and brick above, broken for the gates. Each length is
  // [x, z, len, ry].
  const gate = 20, runs = [
    [-(WX + gate / 2) / 2, WZ, WX - gate / 2, 0], [(WX + gate / 2) / 2, WZ, WX - gate / 2, 0],
    [0, -WZ, 2 * WX, 0], [-WX, 0, 2 * WZ, Math.PI / 2],
    [WX, 0, 2 * WZ, Math.PI / 2],
  ];
  const low = [], up = [], segs = [];
  for (const [x, z, len, ry] of runs) {
    low.push([x, 0, z, len, 4.5, T, ry]);
    up.push([x, 4.5, z, len, WH - 4.5, T - 0.4, ry]);
    segs.push([x, 4.5, z, len, WH - 4.5, T - 0.4, ry]);
  }
  site.add(inst(unitBox(), low, S.basalt), inst(unitBox(), up, S.brick), rampart(segs, S.brick, { trim: S.trim, size: 0.9, kerb: true, every: 1 }));
  // The nine bastions: four at the corners, two flanking the Delhi Darwaza, one in the middle of
  // each of the other three sides. [x, z, r, h].
  const bastions = [[-WX, WZ, 7, 13], [WX, WZ, 7, 13], [-WX, -WZ, 7, 13], [WX, -WZ, 7, 13], [-gate / 2 - 4.5, WZ + 1.5, 6.5, 15], [gate / 2 + 4.5, WZ + 1.5, 6.5, 15], [WX, 0, 6, 12.5], [-WX, 0, 6, 12.5], [0, -WZ, 6, 12.5]];
  for (const [x, z, r, h] of bastions) site.add(cyl(r, r * 1.08, 5, S.basalt, x, 0, z, 20), cyl(r * 0.97, r, h - 5, S.brick, x, 5, z, 20));
  site.add(bastionCrowns(bastions.map(([x, z, r, h]) => [x, h, z, r]), S.brick, { trim: S.trim, size: 0.9, seg: 20 }));
  // The Delhi Darwaza: a gatehouse 13 m high with a pointed arch 5.4 m wide and spiked leaves.
  const GH = 13;
  f.add(at(fortGate(gate, GH, 12, 5.4, 9, { m: S.basalt, trim: S.trim, spikes: true, leafM: S.teak, crest: false }), 0, 0, WZ));
  f.add(box(gate + 0.4, 0.5, 12.4, S.trim, 0, GH, WZ));
  // The nagarkhana over the arch: a gallery of teak arches on each long face, a projecting balcony
  // before it, and a parapet of merlons above.
  const ny = GH + 0.5, nh = 4.2;
  f.add(box(gate - 3.2, nh, 9, S.brick, 0, ny, WZ));
  for (const a of [0, Math.PI]) {
    const sk = arcadeSkin(gate - 2, nh, cellRow(7, 2.3, 0.6, 1.5, 2.8), 0.6, S.teakLight, { trim: S.teak, fill: 'room' });
    sk.position.set(0, ny, WZ + (a === 0 ? 4.5 : -4.5));
    sk.rotation.y = a;
    f.add(sk);
  }
  f.add(box(gate, 0.4, 11.4, S.teak, 0, ny + nh, WZ), box(gate - 1, 0.3, 1.4, S.teak, 0, ny + 0.4, WZ + 5.7));
  f.add(at(rampart([[0, ny + nh + 0.4, WZ, gate, 0, 10, 0]], S.brick, { trim: S.trim, size: 0.7, slits: false, kerb: false, course: false, centre: [0, 0] }), 0, 0, 0));
  addDetails(f, g, { WX, WZ, WH, T, gate, GH, bastions });
  // From the north-east, the Delhi Darwaza and its bastions in front, the walls running back.
  return { group: g, focus: f, view: [0.45, 0.22, 1], zoom: 0.42 };
}
