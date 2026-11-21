import * as THREE from 'three';
import { M, box, at, inst } from '../helpers.js';
import { bracketGeo, placeAll, frieze, petalRing, archSlab, archRing, mergeByMaterial } from './components.js';
import { shrubs } from './realism.js';
import { FLOORS, CROWN } from '../monuments/hawa-mahal.js';

// The Hawa Mahal, finer detail. From photographs: each of the windows (jharokhas) of the screen
// projects on a pair of small carved brackets under its sill; the white lime bands along the
// storeys are carved; and a lotus crowns each of the domed kiosks at the top. The pink sandstone is
// outlined everywhere in white lime: a white eave round the head of every oriel under its dome and
// a white sill at its foot, white margins down the ends of every storey, and white bands on the
// crown's pavilions, whose fronts open in small arched windows.
// Dimensions follow js/monuments/hawa-mahal.js: storeys [width, height], the front at z = 0.275;
// the oriels listed there (f.userData.bays: [x, y, z, r, h, r], half-octagons of radius r).
function architecture(f) {
  const d = new THREE.Group(), floors = FLOORS, br = [];
  let y = 0;
  for (const [w, h] of floors) {
    const n = Math.max(3, Math.round(w / 1.5));
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + (i + 0.5) * (w / n);
      for (const s of [-1, 1]) br.push([x + s * 0.24, y + h * 0.18, 0.275, 0]);
    }
    d.add(box(w + 0.32, 0.08, 0.04, frieze(M.lime), 0, y + h - 0.1, 1.02));
    // White margins down both ends of the storey's front.
    for (const s of [-1, 1]) d.add(box(0.1, h - 0.2, 0.04, M.lime, s * (w / 2 - 0.07), y, 0.295));
    y += h;
  }
  d.add(placeAll(bracketGeo(0.42, 0.3, 0.1), br, M.hawaLight));
  for (const [x, r] of [[0, 1.1], [-3.8, 0.9], [3.8, 0.9]]) d.add(at(petalRing(r * 0.2, 8, r * 0.35, r * 0.2, Math.PI - 0.6, M.hawaLight), x, y + (x ? CROWN.side + 0.88 : CROWN.mid + 1.08), -0.8));
  // The crown's pavilions: a white band round the top of each, and on its front a small arched
  // window in a white ring.
  for (const [x, w, dd, h] of [[0, 3.4, 2.1, CROWN.mid], [-3.8, 2, 2, CROWN.side], [3.8, 2, 2, CROWN.side]]) {
    d.add(box(w + 0.12, 0.1, dd + 0.12, M.lime, x, y + h - 0.1, -0.8));
    const aw = Math.min(0.5, w * 0.2), ah = h * 0.62, zf = -0.8 + dd / 2;
    d.add(at(archSlab(aw, ah, true, M.recess, 0.02), x, y + 0.12, zf), at(archRing(aw, ah, true, 0.05, 0.04, M.lime), x, y + 0.12, zf + 0.01));
  }
  mergeByMaterial(d);
  f.add(d);
}

// The white eave and sill of every oriel: half-octagon slabs a little wider than the bay.
function trim(f) {
  const bays = f.userData.bays || [], eaves = [], sills = [];
  for (const [x, y, z, r, h] of bays) {
    eaves.push([x, y + h - 0.1, z, r + 0.07, 0.1, r + 0.07]);
    sills.push([x, y - 0.03, z, r + 0.05, 0.08, r + 0.05]);
  }
  const geo = new THREE.CylinderGeometry(1, 1, 1, 4, 1, false, -Math.PI / 2, Math.PI).translate(0, 0.5, 0);
  f.add(inst(geo, eaves, M.lime), inst(geo, sills, M.lime));
}

// The Hawa Mahal on Jaipur's Badi Chaupar road: flowering bougainvillea at either end of the
// pavement in front of the screen.
export function addDetails(f, g) {
  architecture(f);
  trim(f);
  g.add(shrubs([[-26, 3.6, 1.2], [26, 3.6, 1.2]], { flowers: '#d0306f', y: 0.3 }));
}
