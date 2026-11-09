// How much detail the models are built with: 'high' (the full models) or 'low' (for phones: the
// same buildings and the same views, with the finest carving thinned out, statues meshed coarser and
// the trees kept plain, so they build faster and draw lighter). Set once at startup, before any
// monument is built (js/main.js); builders read it through detail.low.
//
// Which parts thin out is decided per monument, where it costs most and shows least: Meenakshi
// (stucco figures and kudus on the gopurams), Vittala at Hampi (yali riders and their elephants,
// figure friezes), Konark (the carving on the wheels, the horses) and Nageshwar (the Shiva statue,
// the minor spires); and in the shared parts, the carving of temples and gopurams, the boats,
// stalls and dressed elephants round them (docs/performance.md). Every monument keeps plain trees
// on 'low'.
//
// The triangle budget each level builds to: up to 600k on desktops (a monument may take two or
// three seconds to build behind its "Loading" notice, and the fuller trees fill what is left), and
// 300k on phones. Every monument stays under its level's budget; js/main.js replants trees up to it.
export const BUDGET = { high: 600000, low: 300000 };
export const detail = { level: 'high', get low() { return this.level === 'low'; }, get budget() { return BUDGET[this.level]; } };

// The level for this device: ?detail=low or ?detail=high in the address wins; otherwise 'low' on
// a phone (a touch screen whose shorter side is under 600 px) or a device with 2 GB of memory or
// less, and 'high' everywhere else.
export function chooseDetail() {
  const asked = new URLSearchParams(location.search).get('detail');
  if (asked === 'low' || asked === 'high') return asked;
  const phone = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600;
  const smallMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2;
  return phone || smallMemory ? 'low' : 'high';
}
