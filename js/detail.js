// How much detail the models are built with: 'high' (the full models) or 'low' (for phones: the
// same buildings and the same views, with the finest carving thinned out, statues meshed coarser and
// the trees kept plain, so they build faster and draw lighter). Set once at startup, before any
// monument is built (js/main.js); builders read it through detail.low.
//
// Which parts thin out is decided per monument, where it costs most and shows least. So far:
// Meenakshi (stucco figures and kudus on the gopurams), Vittala at Hampi (yali riders and their
// elephants, figure friezes), Konark (the carving on the wheels, the horses) and Nageshwar (the
// Shiva statue, the minor spires). Every monument keeps plain trees on 'low'.
export const detail = { level: 'high', get low() { return this.level === 'low'; } };

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
