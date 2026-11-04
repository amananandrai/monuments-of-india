import { boats, lampPosts, along } from './realism.js';

// The Vivekananda Rock Memorial off Kanyakumari: the ferries out from the shore, fishing boats in
// the bay, and lamps along the promenade.
export function addDetails(f, g) {
  g.add(boats([[20, 80, 0.2], [-20, 170, 3.3], [30, 260, 0.1]], { y: 0.3, size: 3.4, canopy: true, colours: ['#f4f1ea', '#2f5d9a', '#f4f1ea'] }));
  g.add(boats([[-200, 200, 1.2], [180, 150, 2.4], [260, 300, 0.6], [-260, 280, 2.9]], { y: 0.3, size: 1.8, colours: ['#2f5d9a', '#c2512a', '#f2d23a'] }));
  g.add(lampPosts(along(14, [-200, 362], [200, 362]), { y: 0.3 }));
}
