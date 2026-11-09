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

# Desktop: antialiasing, sharper shadows, and more carving

With phones on their own lighter build, desktops at full detail get more:

- **Antialiasing.** An SMAA pass in the composer (`js/main.js`) smooths the stair-stepped edges of
  railings, trusses, spires and cornices. The scene had no antialiasing at all before: it is drawn
  into the composer's own target, which is not multisampled. The pass adds two or three draw calls
  a frame. Phones skip it.
- **Shadows.** The shadow map is 4096 square on desktops at full detail (2048 before, and still on
  phones), for crisp shadows under cornices, brackets and carving. Since shadows are drawn once
  per monument, the larger map costs memory, not frame time.
- **Konark** (418k to 476k triangles, of 500k), on desktops only:
  - the three Surya images of green chlorite in niches on the sanctum's south, west and north
    walls, over the seven horses of his chariot;
  - a band of carved figures (dancers, musicians, attendants) round the Jagamohana;
  - the Natamandira's pillars square and carved (a moulded base, bands of carving, a dancer on
    the front and the back) in place of plain stumps;
  - five musicians and dancers to a side on each roof terrace, not three.
- **Ajanta** (94k to 138k triangles for the caves themselves; 218k to 262k with the trees), on
  desktops only:
  - in the chaitya halls 19 and 26, the stone ribs of the vault, carved pillars with cushion
    capitals, a band of seated Buddhas over each colonnade, and on the stupa a seated Buddha in an
    arched niche and three umbrellas over the harmika;
  - a row of seated Buddhas in niches across each chaitya's facade, above the kudu arches;
  - in the vihara (Cave 11), the shrine's Buddha seated on its throne.

Phones (low detail) build Konark and Ajanta exactly as before. Both pass the camera and flicker
audit unchanged.

# Triangle budgets: 600k on desktops, 300k on phones

`js/detail.js` sets one budget per level (`BUDGET`, read as `detail.budget`): up to 600,000
triangles on desktops and 300,000 on phones. Builders no longer return their own `budget`;
`js/main.js` replants the trees in more detail up to the desktop budget, and phones keep plain
trees. On desktops a monument may take two or three seconds to build behind its "Loading" notice.

Every monument was measured at both levels after the change (before the fuller trees):

- **Desktop:** the heaviest are Konark (541k), Meenakshi (527k), Vittala (508k) and Baidyanath (486k).
  Every other monument is under 400k.
- **Phone:** unchanged; the heaviest are Mallikarjuna (296k), Ram Mandir (289k), Nageshwar (272k)
  and Meenakshi (266k).

What desktops get that phones do not:

- **Temples** (`js/details/temples.js`): the full carving on small shrines (sculpted guardians in the
  niches, finer amalakas), images in the smaller niches beside a sanctum's main ones, a second
  register of figures low on each hall's walls, and gopurams with their figures closer together and
  a kudu over every second bay. Fine elephants and horses at the gates and stairs of Jagannath,
  Vittala and Konark, and the full Ram Mandir corner shrines and gate guardians.
- **Harbour craft at the Gateway of India:** the Elephanta ferry launches (`launches`: a painted
  hull, closed lower cabin with windows, open upper deck under a canopy, wheelhouse, flag) and two
  ships at anchor (`ships`) on both levels; desktops add the launches' railings, life rings and
  mast, and the ships' bridge windows, mast and derricks.
- **Boats** (`js/details/realism.js`): the gunwale, the stem and stern posts, ribs, stowed oars, and
  the hoops under a canopy. Every boat now floats with its hull above the water.
- **Stalls:** a top board and panelled front on the counter, three baskets of flowers or offerings,
  garlands under a scalloped valance on a sloping awning, and a shelf of brass pots.
- **Surrounding buildings:** `townHouses` (`js/details/realism.js`) gives each house on desktops a
  moulded band at every floor, light frames and sunshades on the windows, a framed door up two
  steps, railings on the balconies, often a ground-floor shop (shutter, coloured awning, signboard)
  and a stair cabin on the roof. It also takes `roof: 'pitched'` (sheet-iron gables, on both levels)
  and a `trim` colour. Kedarnath's pilgrim lodges and Jaisalmer's houses inside the fort are now
  `townHouses` instead of plain boxes, and on desktops the ranges round the Golden Temple's pool have
  two storeys of arches and domed kiosks along their parapets. The largest increases are Howrah
  (157k to 341k) and Jaisalmer (169k to 316k; 216k on phones).
- **Backdrops:** the old city of Varanasi now surrounds the Kashi corridor on both levels (the ghats
  run on along the river, tall houses rise from them, and lanes of houses fill the blocks behind;
  kiosks on the riverfront roofs on desktops): 511k on desktops, 252k on phones. Behind the
  Bandra–Worli Sea Link, desktops get a fuller Mumbai skyline from its own random sequence (podiums,
  setbacks, glass and round towers, spires, helipads, and mid-rise blocks along the shore): 167k;
  phones keep the old skyline (136k).
  The town of Trimbak now surrounds Trimbakeshwar on both levels: houses under terracotta-tiled
  pitched roofs and newer flat-roofed ones along the temple street behind its stalls, in lanes west
  of the court and round the Kushavarta kund: 296k on desktops, 204k on phones.
  Ujjain's old town now runs out three more rows on every side of Mahakaleshwar, and north beyond
  the Rudra Sagar (386k on desktops, 212k on phones). At Omkareshwar the island's houses stand in
  terraces up the slope behind the ghat, and a town lines the south bank round Mamleshwar (493k on
  desktops; phones build every other house of both, 258k).
  Tirumala's town now rings the temple beyond the Mada streets, with rows along lanes behind,
  the approach lined either side of its stalls and four large choultries (274k on desktops, 152k
  on phones). Kedarnath's pilgrim town lines the stone path south of the Nandi in three rows a side
  under sheet-iron roofs (124k on desktops, 103k on phones). `houseRow` in js/details/realism.js lays
  out such rows of plots for `townHouses`.
- **Dressed elephants** (`rideElephant` in `js/details/animals.js`): a fringe of tassels and
  embroidered roundels on the cloths, a rope of bells round the neck, anklets, tusk caps, and on a
  temple elephant the gold nettipattam over the forehead and trunk.

## Back inside the budgets after the town rings

The old-town rings added round Meenakshi and Baidyanath (`cityAround` in js/details/realism.js), and
Taj Mahal's new garden and calligraphy, took three monuments over: Meenakshi to 1,037k on desktops and
439k on phones, Baidyanath to 692k and 323k, Taj Mahal to 311k on phones. `cityAround` now takes
`every` (build one plot in that many) and `fine` (passed to `townHouses`, whose desktop finish it
switches off for distant rows). Meenakshi's ring is two rows of plain houses on desktops and one
thinned row on phones, and its inner gopurams keep their earlier spacing; Baidyanath's is three plain
rows on desktops and two thinned on phones; the Taj's mosque, jawab and gate kiosks drop their
arches and crescents on phones. After: Meenakshi 598k / 284k, Baidyanath 555k / 274k, Taj Mahal
311k / 294k. Every monument is again under 600k on desktops and 300k on phones.

