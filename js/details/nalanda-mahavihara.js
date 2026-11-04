import { trees, asiBoard, scatter, along } from './realism.js';

// The ruins of Nalanda: the trees of the site park between the monasteries and the great stupa, and
// the ASI board.
export function addDetails(f, g) {
  g.add(trees([...along(9, [-110, -95], [110, -95]), ...along(9, [-110, 95], [110, 95]), ...scatter(10, [60, 120, -80, 80], { seed: 5, gap: 14 })], { kind: 'neem', seed: 5 }));
  g.add(asiBoard('Nalanda Mahavihara', -34, 96, Math.PI / 2, { line2: 'WORLD HERITAGE SITE' }));
}
