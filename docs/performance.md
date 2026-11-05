# Performance: what was measured, and what changed

A pilot of five changes to how the site loads and draws, measured before and after on the same
machine. The renders are unchanged (see the last section).

## How it was measured

- **Browser:** headless Chromium with a software GPU (SwiftShader), the site served locally by a
  plain static server, three.js loaded from a local copy. A software GPU is far slower than a real
  one, so frame times here are only good for comparing before with after; load times, request
  counts, main-thread blocking and draw calls are what matter.
- **Network:** once with no limit, and once emulating a 4G connection (70 ms latency, 9 Mb/s).
- **Draw calls:** every WebGL draw call counted, per frame, while the monument turns.
- **Main-thread blocking:** the browser's long tasks (over 50 ms) in the first 15 s.
- **Build time:** each monument built in Node with the same code, to time the work done on the
  first click.

## What the baseline showed

- **The cold start was not the models.** Of about 3.4 s of main-thread work before the map was
  usable, 2.8 s was one function: `averageColor` in `js/textures.js`, which drew each of the seven
  1024 × 1024 photo textures down to 16 × 16 to find its average colour, on every visit.
- **On a slow connection, the module graph was.** `js/data.js` imported all 101 monument modules,
  so the map waited for 243 JavaScript files, fetched a level of imports at a time: 7.5 s on the
  4G profile.
- **First clicks were slow where a statue is meshed.** The median monument builds in about 60 ms;
  the slowest are those that mesh a sculpted figure on first use: Patel (0.88 s), Shiva (0.80 s),
  Thiruvalluvar (0.58 s), the horse (0.56 s) and Bahubali (0.40 s).
- **Draw calls, not triangles, made the slow frames.** Howrah Bridge drew 2,224 calls a frame and
  Meenakshi 2,562, against 359 for the Taj Mahal, which has more triangles than Howrah. Each part
  is drawn in every pass: the view, the shadow map, the water's reflection and the occlusion pass.
- **The shadow map was redrawn every frame**, though the sun and the shadow box are fixed to the
  monument and nothing moves.
- **The canvas was multisampled for nothing:** the scene is drawn into the composer's own target,
  so the canvas only receives a finished full-screen image.

## What changed

1. **Monuments load when opened** (`js/data.js`, `js/main.js`). The list carries only the facts and
   a loader per monument; a monument's module is fetched on its first opening, with a "Loading …"
   message if it takes more than a moment. The previous monument stays in view meanwhile, and a
   monument that finishes loading after the visitor has moved on is not shown. The neighbours in
   the list, and whatever the pointer rests on, are fetched just before they are likely to be
   wanted. `js/builders.js` still imports every builder up front, for the film in `video/`, which
   must build any monument without waiting.
2. **Texture colours are stored, not measured** (`js/textures.js`). Each photo's average colour
   is fixed, so it is written into the file (measured once, the same way, in the browser).
3. **Shadows are drawn once per monument** (`js/main.js`): when a monument is shown and when the
   theme changes (night shows lamps), not every frame.
4. **No multisampling on the canvas** (`js/main.js`).
5. **Many parts become few draw calls** (`js/batch.js`). A monument that returns `batch: true` has
   its meshes merged by material once built, after the passes that need them separate. Instanced
   meshes, reflecting water, transparent parts and the lamps night shows and hides are left alone.
   Piloted on four monuments: Howrah Bridge (443 meshes to 24), Meenakshi (638 to 101), the Red
   Fort (271 to 50) and the Golden Temple (281 to 29), triangle counts unchanged, at a one-off
   cost of 24 to 85 ms.
6. **The slowest figures are meshed ahead** (`js/warmup.js`): on larger screens, while the map is
   showing and the visitor has been still for two seconds, one figure at a time and never while a
   monument loads. Phones skip it: meshing a figure blocks the page for its whole duration, which
   on a phone could be a few seconds.

## Checks

- **Renders:** the home views of the four batched monuments, the Taj Mahal and the Statue of
  Unity, captured from the app before and after, differ by under 0.5 of 255 on average, with no
  visibly changed pixels. Switching from one monument to another redraws its shadows: the result
  matches opening it directly.
- **Racing:** two quick picks show the second; going back to the map while a monument loads leaves
  the map with no loading message.
- **Builds:** all 101 monuments build with the same triangle counts as before, through both the
  site's loader and `js/builders.js`.
