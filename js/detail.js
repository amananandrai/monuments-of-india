// How much detail the models are built with: 'high' (the full models) or 'low' (for phones: the
// same buildings and the same views, with the finest carving thinned out, statues meshed coarser and
// the trees kept plain, so they build faster and draw lighter). Set once at startup, before any
// monument is built (js/main.js); builders read it through detail.low.
//
// Which parts thin out is decided per monument, where it costs most and shows least: Meenakshi
// (stucco figures and kudus on the gopurams), Vittala at Hampi (yali riders and their elephants,
// figure friezes), Konark (the carving on the wheels, the horses) and Nageshwar (the Shiva statue,
// the minor spires); and in the shared parts, the carving of temples and gopurams, the boats,
// stalls and dressed elephants round them. Every monument keeps plain trees
// on 'low'.
//
// The triangle budget each level builds to: up to 800k on desktops (a million where statues stand:
// budgetFor) (a monument may take two or
// three seconds to build behind its "Loading" notice) and 300k on phones. Every monument stays
// under its level's budget (budgetFor). The budget is for the buildings: trees and ground cover are
// planted only up to PLANT (detail.budget), 650k on desktops, so the extra goes to the architecture.
export const BUDGET = { high: 800000, low: 300000 };
export const PLANT = { high: 650000, low: 300000 };
export const detail = { level: 'high', get low() { return this.level === 'low'; }, get budget() { return PLANT[this.level]; } };
// The budget a monument (an entry of js/data.js) is built to at a level ('high' or 'low').
//
// A monument whose subject is sculpture, or which carries large sculpted figures, may build to a
// million triangles on desktops: a statue's face and hands are meshed finely, and the triangles go
// there. Phones keep to 300k for every monument.
export const STATUES = new Set(['statue-of-unity', 'india-gate', 'gateway-of-india', 'nageshwar-temple', 'gommateshwara', 'vivekananda-rock-memorial', 'kedarnath-temple', 'omkareshwar-temple', 'victoria-memorial', 'csmt', 'mysore-palace', 'adiyogi']);
export const STATUE_BUDGET = 1000000;
export function budgetFor(m, level = detail.level) {
  return level === 'high' && m && STATUES.has(m.id) ? STATUE_BUDGET : BUDGET[level];
}

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
