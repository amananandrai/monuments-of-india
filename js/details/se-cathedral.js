import * as THREE from 'three';
import { M, box, cyl, at, onFace } from '../helpers.js';
import { mergeByMaterial, windowFrame, sunburst, gableRoof } from '../parts/components.js';
import { classicalDoor, balustrade } from '../parts/colonial.js';
import { trees, shrubs, lampPosts, benches, asiBoard, scatter, along } from '../parts/realism.js';
import { S, LIME, TRIM, TILE } from '../monuments/se-cathedral.js';

// The Sé Cathedral, finer detail. From photographs: Tuscan pilasters of grey stone divide the
// façade into five bays on every storey, with moulded bases and capitals; the corners of the bell
// tower are pilastered too, and urn-like finials stand on the corners of each storey's cornice;
// the side walls of the aisles are buttressed between tall round-headed windows, and the nave's
// clerestory has a window in every bay. Measures follow js/monuments/se-cathedral.js.
function architecture(f) {
  const { FZ, LEN, NW, AW, AH, NH, FW, T1, T2, T3, TW, TH } = S, d = new THREE.Group(), zf = FZ + 1.3;
  // The façade's pilasters, storey by storey, and the tower's corner pilasters.
  const tiers = [[0, T1 - 0.7], [T1, T2 - 0.7], [T2, T3 - 0.9]];
  for (const [y0, y1] of tiers) for (const x of [-15, -5, 5, 15]) {
    d.add(box(1.1, y1 - y0, 0.3, TRIM, x, y0, zf + 0.15), box(1.4, 0.4, 0.45, TRIM, x, y0, zf + 0.2), box(1.4, 0.45, 0.45, TRIM, x, y1 - 0.45, zf + 0.2));
  }
  const tz = FZ - TW / 2 + 1.3, tx = FW / 2 + TW / 2 - 0.3;
  for (const [y0, y1] of [...tiers, [T3, TH - 0.35]]) for (const sx of [-1, 1]) {
    d.add(box(0.9, y1 - y0, 0.25, TRIM, tx + sx * (TW / 2 - 0.45), y0, tz + TW / 2 + 0.12));
    if (y1 <= T2 + 1) d.add(box(0.9, y1 - y0, 0.25, TRIM, -tx + sx * (TW / 2 - 0.45), y0, tz + TW / 2 + 0.12));
    d.add(box(0.25, y1 - y0, 0.9, TRIM, tx + TW / 2 + 0.12, y0, tz + sx * (TW / 2 - 0.45)));
  }
  // Finials on the cornices: along the façade's top, at the foot of the pediment, and on the tower.
  const urn = (x, y, z) => { d.add(box(0.8, 0.5, 0.8, TRIM, x, y, z), cyl(0.18, 0.38, 0.9, TRIM, x, y + 0.5, z, 10), cyl(0.04, 0.2, 0.7, TRIM, x, y + 1.4, z, 8)); };
  for (const x of [-15, -5, 5, 15]) urn(x, T3, FZ + 0.8);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) urn(tx + sx * (TW / 2 - 0.4), TH + 0.85, tz + sz * (TW / 2 - 0.4));
  for (const sx of [-1, 1]) urn(-tx + sx * (TW / 2 - 0.4), T2 + 1.5, tz + TW / 2 - 0.4);
  // A balustrade along the top of the north stump, where its tower once rose.
  d.add(at(balustrade(TW - 1, 1, TRIM), -tx, T2 + 1.5, tz + TW / 2 - 0.5));
  // The aisles' side walls: buttresses between windows, and a window in each bay of the clerestory.
  const win = classicalDoor(1.8, 4.2, { m: LIME, trim: TRIM, fill: 'glass', top: null, depth: 0.25, frame: 0.3 });
  const cl = windowFrame(1.6, 2.6, TRIM, { shape: 'round', frame: 0.25 });
  for (const s of [-1, 1]) for (let k = 0; k < 9; k++) {
    const z = FZ - 6 - k * 7.6;
    if (Math.abs(z - (FZ - LEN / 2 - 14)) < 8) continue;
    d.add(at(win.clone(), s * (NW / 2 + AW), 5, z).rotateY(s * Math.PI / 2));
    d.add(box(1.2, AH - 0.4, 1, TRIM, s * (NW / 2 + AW + 0.5), 0, z + 3.8), box(0.9, 2.6, 0.8, TRIM, s * (NW / 2 + AW + 1.2), 0, z + 3.8));
    d.add(at(cl.clone(), s * NW / 2, AH + 4.2, z).rotateY(s * Math.PI / 2));
  }
  // A cornice along the nave's eaves.
  for (const s of [-1, 1]) d.add(box(0.6, 0.5, LEN - 3, TRIM, s * (NW / 2 + 0.1), NH - 0.5, FZ - LEN / 2 - 1));
  // The sunburst and monogram of St Catherine's wheel in the pediment.
  d.add(at(sunburst(1.3, M.gild, { rays: 20 }), 0, T3 + 1.9, FZ + 1.25));
  f.add(mergeByMaterial(d));
}

// Old Goa round the cathedral: the lawns of the square, coconut palms and mango trees, the stone
// cross before the façade, and the low whitewashed Archbishop's Palace and the church of St Francis
// of Assisi on the north side, with lamps along the path.
export function addDetails(f, g) {
  architecture(f);
  const { FZ, NW, AW } = S, L = M.laterite;
  g.add(box(420, 0.06, 380, M.grass, 0, -0.06, -20));
  g.add(box(36, 0.05, 70, M.path, 0, 0, FZ + 36), box(220, 0.05, 8, M.asphalt, 0, 0, FZ + 76));
  // The church of St Francis of Assisi beside it, to the north (-x), and its convent.
  const sf = new THREE.Group(), sx = -(NW / 2 + AW + 30);
  sf.add(box(16, 15, 44, LIME, sx, 0, -12), at(gableRoof(17.4, 45, 5.5, TILE), sx, 15, -12));
  sf.add(box(20, 18, 2, LIME, sx, 0, 10.5), box(20.6, 0.6, 2.4, TRIM, sx, 18, 10.5));
  for (const s of [-1, 1]) sf.add(cyl(0.9, 1, 4, LIME, sx + s * 8.6, 18, 10.5, 8), cyl(0, 1.1, 2.2, TRIM, sx + s * 8.6, 22, 10.5, 8));
  sf.add(onFace(classicalDoor(2.8, 5, { m: LIME, trim: TRIM, top: 'cornice', depth: 0.4 }), 0, 11.5, sx));
  sf.add(box(30, 8, 20, LIME, sx - 22, 0, -20), at(gableRoof(31, 21, 3.5, TILE).rotateY(Math.PI / 2), sx - 22, 8, -20));
  g.add(mergeByMaterial(sf));
  // The cross in the square, on its laterite pedestal.
  f.add(box(3.2, 1.8, 3.2, L, 0, 0, FZ + 30), box(2.4, 0.4, 2.4, LIME, 0, 1.8, FZ + 30), cyl(0.2, 0.24, 5, LIME, 0, 2.2, FZ + 30, 8), box(2.2, 0.34, 0.34, LIME, 0, 5.8, FZ + 30));
  g.add(trees(scatter(30, [-140, 140, -110, 90], { seed: 5, gap: 11, avoid: [[-50, 34, -80, 34], [-20, 20, 10, 82], [-120, -40, -45, 25]] }), { kind: 'palm', seed: 5 }));
  g.add(trees([[60, 40], [-70, 52], [70, -60], [58, 70]], { kind: 'mango', seed: 6 }));
  g.add(shrubs(scatter(18, [-60, 60, 18, 74], { seed: 7, gap: 6, avoid: [[-19, 19, 14, 82]] }).map(([x, z]) => [x, z, 1.6]), { flowers: '#d0306f', seed: 7 }));
  g.add(lampPosts([...along(5, [-19, 20], [-19, 74]), ...along(5, [19, 20], [19, 74])]));
  g.add(benches([[-24, 30], [24, 30], [-24, 52], [24, 52]]));
  g.add(asiBoard('Se Cathedral', 22, 76, 0, { line2: 'WORLD HERITAGE SITE' }));
}
