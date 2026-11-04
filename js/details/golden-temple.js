import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES, clothGeometry, onionDome, ribbed, kalash, chhatri } from '../helpers.js';
import { panel, frieze, jharokha, rosette, mergeByMaterial, chhajja } from './components.js';
import { arcadeSkin, cellRow } from './mughal.js';
import { trees, lampPosts } from './realism.js';

// The Harmandir Sahib, finer detail. From photographs: the marble lower storey is inlaid with floral
// panels (pietra dura) in a band above its arches; the gilded upper storey is sheathed in embossed
// copper, in a band above its arcade, and opens in a bay window (jharokha) with a curved roof in
// the middle of each face; the Darshani Deori's gilded storey is embossed the same way.
// Dimensions follow js/monuments/golden-temple.js: base b = 1.6, the shrine 12.25 square.
function architecture(f) {
  const d = new THREE.Group(), b = 1.6, W = M.marble, G = M.gild;
  for (const a of FACES) {
    d.add(onFace(at(panel(12.1, 0.9, 0.1, W, frieze(W)), 0, b + 4.95, 0), a, 6.13));
    for (const x of [-3.6, 3.6]) d.add(onFace(at(rosette(0.32, G, 8), 0, b + 4.8 + 0.05, 0), a, 6.36, x));
    d.add(onFace(at(panel(12.1, 1.5, 0.12, G, frieze(G)), 0, b + 10.9, 0), a, 6.13));
    d.add(onFace(at(jharokha(1.5, 2.3, G, { d: 0.75 }), 0, b + 7.8, 0), a, 6.35));
  }
  // The Darshani Deori's gilded storey (12.5 × 3.5 × 14.5 at (-86, 9.8, 0)).
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) > 0.5, len = long ? 14.3 : 12.3;
    const p = onFace(at(panel(len, 2.4, 0.14, G, frieze(G)), 0, 10.35, 0), a, long ? 6.25 : 7.25);
    p.position.x += -86;
    d.add(p);
  }
  mergeByMaterial(d);
  f.add(d);
}

// The Akal Takht, across the plaza from the Darshani Deori and facing the shrine (+x): five storeys,
// the lower two of white marble opening in arcades, the upper ones gilded with a row of bay windows
// on each and a deep eave between, under a fluted golden dome on a drum with a kiosk at each corner.
export function akalTakht() {
  const g = new THREE.Group(), W = M.marble, G = GILT_BRIGHT, w = 30, d = 16, dp = 1;
  g.add(box(w + 2, 1, d + 2, W));
  g.add(box(w, 10, d - dp, W, 0, 1, -dp / 2), onFace(at(arcadeSkin(w, 10, [...cellRow(5, 5.6, 0, 3.6, 4.4), ...cellRow(5, 5.6, 5.2, 3.2, 4)], dp, W, { trim: G, fill: 'room' }), 0, 1, 0), 0, d / 2 - dp));
  let y = 11;
  for (const [h, m, n] of [[5, G, 7], [4.6, G, 7], [4.2, G, 5]]) {
    const ww = w - (y - 11) * 0.5;
    g.add(box(ww, h, d - 1, m, 0, y, -0.5));
    for (let k = 0; k < n; k++) g.add(onFace(at(jharokha(2, 2.6, G, { d: 0.9 }), 0, y + 1.2, 0), 0, d / 2 - 1, (k - (n - 1) / 2) * (ww / n)));
    g.add(onFace(at(chhajja(ww + 0.4, 1.2, 0.5, 0.18, G), 0, y + h, 0), 0, d / 2 - 1));
    y += h;
  }
  g.add(box(16, 0.6, 12, G, 0, y, -0.5), cyl(4.6, 4.6, 2.4, G, 0, y + 0.6, -0.5, 32));
  g.add(at(ribbed(onionDome(5, G), 16, 0.06), 0, y + 3, -0.5), at(kalash(2.2, G), 0, y + 3 + 9.2, -0.5));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(chhatri(1.1, 4, G), sx * 6.6, y + 0.6, -0.5 + sz * 4.6));
  return mergeByMaterial(g);
}

// Harmandir Sahib: the two Nishan Sahibs, tall saffron-clad poles with their saffron pennants and
// the khanda, by the Akal Takht; the old ber trees at the water's edge; and the golden lanterns
// along the marble parikrama.
// The Akal Takht's gilding, lit warmly so it reads as gold and not as dark bronze in its own shade.
const GILT_BRIGHT = mat('#e3b54a', 0.35, 0.6, { emissive: '#4a3306' });
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 }), GOLD = mat('#e3b54a', 0.3, 0.85);
export function addDetails(f, g) {
  architecture(f);
  g.add(at(akalTakht(), -113, 0.8, 0).rotateY(Math.PI / 2));
  // The Nishan Sahibs
  for (const z of [-6, 6]) {
    g.add(cyl(0.35, 0.45, 32, SAFFRON, -96, 0.8, z, 10), at(cyl(0.25, 0, 1.6, GOLD, 0, 0, 0, 10), -96, 32.8, z));
    // The saffron cloth, tapering to a point, flying from the top of the staff, and the gilt khanda.
    const cl = new THREE.Mesh(clothGeometry(7, 3.2, { taper: 0.85 }), SAFFRON);
    cl.position.set(-96, 32.4, z + 0.3);
    cl.rotation.y = -Math.PI / 2;
    g.add(cl, box(0.1, 1, 1, GOLD, -96, 34.4, z));
  }
  g.add(trees([[60, -72], [-70, 70], [72, 68]], { kind: 'mango', seed: 8, h: 9, y: 0.8 }));
  const lamps = [];
  for (let t = -72; t <= 72; t += 18) lamps.push([t, -76], [t, 76], [-76, t], [76, t]);
  g.add(lampPosts(lamps, { y: 0.8, h: 3.6 }));
}
