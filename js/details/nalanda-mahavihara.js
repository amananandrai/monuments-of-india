import { trees, people, MONKS, asiBoard, scatter, along } from './realism.js';

// The ruins of Nalanda: visitors and a few monks on the paths between the monasteries and the
// great stupa, the trees of the site park, and the ASI board.
export function addDetails(f, g) {
  f.add(people([...scatter(30, [-46, -34, -96, 96], { seed: 3 }), ...scatter(20, [-30, 70, -60, 60], { seed: 4, avoid: [[-6, 46, -16, 60]] })], { seed: 3, palette: [...MONKS, '#f4f1ea', '#2f5d9a', '#e26a9c', '#f2d23a'] }));
  g.add(trees([...along(9, [-110, -95], [110, -95]), ...along(9, [-110, 95], [110, 95]), ...scatter(10, [60, 120, -80, 80], { seed: 5, gap: 14 })], { kind: 'neem', seed: 5 }));
  g.add(asiBoard('Nalanda Mahavihara', -34, 96, Math.PI / 2, { line2: 'WORLD HERITAGE SITE' }));
}
