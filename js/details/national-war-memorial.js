import { lampPosts, around } from './realism.js';

// The National War Memorial in Delhi: lamps round the outer path of the Tyag Chakra and the Veerta
// Chakra.
export function addDetails(f, g) {
  g.add(lampPosts(around(24, 86)));
}
