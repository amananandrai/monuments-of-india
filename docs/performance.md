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

## Results

Before is the site as it was; after is the site with these changes. Times are wall-clock in the
headless browser described above.

| Measure | Before | After |
| --- | --- | --- |
| Map: main thread blocked (long tasks) | 2.1 s | 0.16 s |
| Map, 4G profile: page last frozen at | 6.9 s | 0.9 s |
| Map, 4G profile and CPU slowed 4×: page last frozen at | 9.7 s | 1.3 s |
| Map: files fetched | 228 | 17 |
| Draw calls a frame: Taj Mahal | 350 | 220 |
| Draw calls a frame: Gateway of India | 218 | 135 |
| Draw calls a frame: Howrah Bridge | 2,223 | 81 |
| Draw calls a frame: Meenakshi | 2,496 | 209 |
| Draw calls a frame: Red Fort | 1,033 | 108 |
| Draw calls a frame: Golden Temple | 1,392 | 96 |
| Frame time while turning, software GPU (Howrah Bridge) | 253 ms | 17 ms |
| Frame time while turning, software GPU (Meenakshi) | 278 ms | 37 ms |

The draw calls fell everywhere, not only where parts were merged: the shadow pass no longer runs
every frame, and it drew every part once more. The frame times are those of a software GPU, a
worst case; a real one is much faster before and after, but the share saved is of the same kind.

## Checks

- **Renders:** the home views of the four batched monuments, the Taj Mahal and the Statue of
  Unity, captured from the app before and after, differ by under 0.5 of 255 on average, with no
  visibly changed pixels. Switching from one monument to another redraws its shadows: the result
  matches opening it directly.
- **Racing:** two quick picks show the second; going back to the map while a monument loads leaves
  the map with no loading message.
- **Builds:** all 101 monuments build with the same triangle counts as before, through both the
  site's loader and `js/builders.js`.

# Detail levels: lighter models for phones

A monument can be built at two levels (`js/detail.js`): **high**, the full models, and **low**,
for phones. The level is chosen once when the page opens: `?detail=low` or `?detail=high` in the
address wins; otherwise phones (a touch screen whose shorter side is under 600 px) and devices with
2 GB of memory or less get low, and everything else gets high. Low keeps every building, every
view and every material; it thins out the finest carving, meshes statues coarser and keeps trees
plain. On low the slow figures are not meshed ahead (phones already skipped it).

## What low changes, so far

Every monument keeps its plain trees on low (the fuller ones are not planted). The four heaviest
temples, the pilot, also have a lighter build:

| Monument | On low | Triangles, high | Triangles, low |
| --- | --- | --- | --- |
| Meenakshi | gopuram figures wider apart and simpler (`stuccoLow`: body, head and crown), fewer kudus | 496,772 | 255,808 |
| Vittala, Hampi | yali on its plain block with the simpler rider, no dancers on the pillar blocks, four colonnettes a pillar, friezes wider apart, the chariot's wheels and elephants coarser | 480,628 | 227,596 |
| Konark | the wheels' carving cut coarser (`carvedWheelGeo(r, { low })`), the horses coarser | 418,365 | 227,110 |
| Nageshwar | the Shiva body meshed coarser (`shivaBody(m, { coarse })`), one ring of minor spires, friezes half as dense | 368,652 | 271,444 |

Over all 101 monuments, low is 21% lighter (11.9 million triangles against 15.2 million), and the
heaviest monument on low is 286,496 triangles. High is unchanged: every monument builds to the
same count as before.

## Measured on an emulated phone

iPhone 13 screen and touch, CPU slowed four times, software GPU. The site chose low by itself;
`?detail=high` forced high for comparison.

| Monument | Ready, high | Ready, low | Main thread blocked, high | Blocked, low |
| --- | --- | --- | --- | --- |
| Meenakshi | 9.4 s | 7.4 s | 5.6 s | 5.5 s |
| Vittala, Hampi | 7.5 s | 5.8 s | 4.4 s | 3.2 s |
| Konark | 10.9 s | 7.4 s | 8.0 s | 5.6 s |
| Nageshwar | 11.2 s | 9.1 s | 8.0 s | 6.8 s |

The first open is a fifth to a third faster. Frame time on the software GPU hardly changes: it is
bound by filling pixels there, not by triangles, so whether low draws faster on a real phone's GPU
is still to be measured on a real phone. The home views at the two levels look alike at a phone's
size; the plain trees are the plainest difference.

## Next

- Measure on real phones (frame rate while turning, and memory), then decide whether more
  monuments need a lighter build.
- Nageshwar's low build is still 271k: the rest of the Shiva (locks, malas, the serpent, the
  trishul) could be cut coarser on low.
- A setting in the page to switch level (it needs the models rebuilt, so a reload).
