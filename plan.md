# Realism and accuracy plan, round two

The remaining work from the Nov 9 accuracy review ("Monuments of India: 3D model accuracy review"), checked against the code on `main` at `5d6caee` plus the flicker fixes in pull request 30. Each task can be carried out without the rest of the chat. Tick a box when the task is on `main`.

Out of scope: CSS changes. The look is improved in the 3D scene, not by styling the canvas.

## How to work

1. Take **one task** at a time. One commit per monument; a shared helper goes in its own commit before the monuments that use it.
2. Edit `js/` only. `video/site/` is a generated copy (`npm run sync` in `video/`); never hand-edit it.
3. No build step: `npx serve .` at the repo root, then open `http://127.0.0.1:3000/#<id>` (the `id` in `js/data.js`). Add `?detail=low` to see the phone build.
4. **Budgets** (`js/detail.js`): every monument stays under **600k triangles on desktops** and **300k on phones**, counted before the trees are filled in. Desktop-only detail goes behind `!detail.low`; a phone build may thin a part (`every`, `fine: false`, `cheap: true`, `coarse: true`). Meenakshi is at 598k on desktops: anything added there must be paid for there.
5. **No flicker:** two faces of different materials must never lie in one plane. Lift an overlay 2 to 5 cm, stop a band 2 cm short of the face above it, or give the overlay a depth offset (`M.recess` and `latheStripes` already have one). `js/coplanar.js` only separates separate, axis-aligned boxes, cylinders and extrusions; instanced, merged and rotated parts are on their own.
6. Keep the overall height at the `stat` figure in `js/data.js` unless the task says otherwise.
7. Check in the browser from the default view, the opposite side and close to the new part.

## Already done

Do not redo these.

- [x] Every step of the review's roadmap: quick fixes, missing companions, terrain pass (Ajanta, Kailasa, Amber, Tawang, Key), context rings and recent additions, surface ornament (PRs 24 to 28).
- [x] Temple specificity, desktop and phone budgets, town houses, boats, stalls, elephants, harbour craft, towns at Kashi, Trimbak, Ujjain, Omkareshwar, Tirumala and Kedarnath (PRs 21, 22, 29).
- [x] Flicker, first pass: recess panels, Jama Masjid stripes, Gateway launches, town houses, Nagara cornices, stair treads and ten local fixes (PR 30). Visible clashes went from 67 monuments to 29.

## Tasks

Suggested order: T1, T2 and T3 first (checks that keep the rest honest, and the two open "Fix first" items), then T4, then the rest in any order.

### T1. Checks in the repository

The budget count and the flicker scan used so far live outside the repo. Put them in so any change can be checked.

- [x] `tools/check-budgets.mjs`: builds every monument headless at both levels (Playwright with the local three.js, as `video/` already depends on) and fails if any is over 600k / 300k. Prints the top ten of each level.
- [x] `tools/check-flicker.mjs`: builds each monument as `js/main.js` does (`naturalize`, `separateCoplanar`, `blendIntoLand`), buckets triangles by plane, and reports overlapping same-facing faces of different materials without a depth offset, keeping only those a short ray off the face shows to be uncovered and not inside a solid. Takes monument ids, or all.
- [ ] `tools/check-heights.mjs` (with T13): compares each model's height with its `refs`.
- [x] A short `tools/README.md`: how to run them, and that they need `npm i` in `tools/` (three, playwright).

### T2. Jama Masjid: open cloisters and the north and south stairs

Files: `js/monuments/jama-masjid.js`, `js/details/jama-masjid.js`. Hash: `#jama-masjid`.

Today the cloisters on three sides are solid red boxes (`box(w, 7, d, Rd, ...)`), and a stair (six boxes at `z = 59.5 + k * 3`) climbs only to the east gate. The real mosque has open arched colonnades round the court and flights at all three gates.

- [x] Replace each solid cloister with an open arcade facing the court: piers and cusped arches (`arcadeSkin` from `js/details/mughal.js`, as Kashi's ranges use it) in front of a roofed gallery, the outer wall kept solid. Marble trim on the arches and the parapet.
- [x] A broad flight up to the north and the south gate, like the east one (the plinth is `P = 6` high). Use `grandStair` or `steps`; keep the east stair.
- [x] Keep the striped domes and minarets and the old-town ring. Run the flicker check: the new arcades sit on the plinth's top and against the gates.

### T3. Gommateshwara: proportions and the cloister

Files: `js/monuments/gommateshwara.js`, `js/details/figures.js` (`bahubaliBody`, the SDF field), `js/details/gommateshwara.js`. Hash: `#gommateshwara`.

Today the figure is stocky with short legs, and two onion-domed Mughal chhatris (`chhatri(2.2, 6, ...)` at `x = ±14, z = 18`) stand in the enclosure. The real Bahubali is slender with broad shoulders and arms hanging almost to the knees, and stands in a pillared cloister.

- [x] Re-proportion the body in `bahubaliField`: longer legs (about half the height to the crotch), narrower waist, broad shoulders, arms reaching to just above the knees. Keep the height (17.4 m figure), the creepers, the anthills, the face and the curls, and move them with the limbs.
- [x] Replace the chhatris with a pillared cloister round the inside of the enclosure wall (a colonnade with a flat roof and a parapet, the stair's opening kept) and a small gateway pavilion over the opening.
- [x] Check the statue mesh build time: it is one of the slowest first opens. Keep the SDF resolution as it is.

### T4. Flicker, second pass

Run `tools/check-flicker.mjs` on all monuments and fix what is left.

- [x] A second pass at load, `separateMerged` in `js/coplanar.js` (called after `separateCoplanar` in `js/main.js`): for merged, instanced and turned parts, which the first pass cannot see, it finds meshes of different materials with overlapping faces in one plane and draws the smaller a layer in front. Instanced sculpture and trees are skipped. Under 0.3 s per monument.
- [x] Cellular Jail, CSMT, Gol Gumbaz, Victoria Memorial, Cooch Behar, Itmad-ud-Daulah, Safdarjung, Bibi ka Maqbara, Ranakpur, Mehrangarh, Vittala, Rani ki Vav, Hawa Mahal and the rest: `tools/check-flicker.mjs` reports no visible clashes on any of the 101 monuments.

### T5. Terrain for the remaining hills

Use `heightField`, `rough` and `smooth` from `js/details/terrain.js` (as the Kailasa, Amber, Tawang and Trimbak terrain does): a slope that reads as rock where it is steep and as scrub or grass where it is not, sinking under the ground at its foot so there is no dark seam.

- [x] **Palitana** (`js/monuments/palitana-temples.js`): the two hills are `CylinderGeometry` cones squashed to 0.7 in z. Make one ridge with two summits and a saddle; keep the tuks on the summits, the switchback stair and the `ground()` function the stair and trees read (rewrite it to sample the new field). The dark patches at the foot go with the cones.
- [x] **Kamakhya**: the Nilachal hill above the Brahmaputra, the temple on its top.
- [x] **Golconda**: the granite hill is a lathe on `hillRadius(a)`. Keep the outline, add boulders and rough relief.
- [x] **Gommateshwara**: Vindhyagiri is a hemisphere. Make it a granite dome with sheet-rock slopes; rewrite `ground()` for the stair.
- [x] **Key**: steeper, rockier cone; the Spiti river braided across the valley floor.
- [x] **Jaisalmer and Chittorgarh**: real hills under the forts (see T6 for their size).
- [x] **Statue of Unity**: the green hills read as blobs on the water and the dam as a pale panel in the haze. Rocky Satpura hills with real relief; a solid dam face that holds up in the fog.
- [x] **Kargil**: the mountains are a flat grey wall. Tololing and Tiger Hill as terrain with relief.
- [x] **Ring mountains** (`mountainRing`: Mallikarjuna, Tirumala, Rumtek, Bhimashankar, Kedarnath, Tawang, Thiksey): finer relief and rock strata, so they stop reading as low-poly facets. One change in `js/details/terrain.js` reaches all seven.

### T6. The compressed forts

Today each says on its plaque that it is compressed (`scaleNote` in `js/data.js`). Rebuild them at or nearer real size where the camera can still frame them, and update or remove the note.

- [x] **Mehrangarh**: the rock is `H = 45`; real is about 122 m. Raise it, stretch the fort along the ridge with the palace ranges at its north end, and detail the back and sides. The blue city stays at the foot.
- [x] **Jaisalmer**: `RX = 92, RZ = 54` on a `H = 22` hill; real is about 460 × 230 m on a 76 m hill. Scale about 2.5×, follow the three-lobed Trikuta outline, add the lower outer wall. The houses inside (`townHouses`) scale with it; check the budget.
- [x] **Chittorgarh**: `L = 300, W = 90, H = 40`; real is a 180 m hill, about 280 ha. Full size would make the towers specks, so keep a labelled compression but lengthen the plateau, raise the hill, and add the zigzag ascent road with its gates.

### T7. Blank backs

These are detailed from the front and plain boxes behind. Give each back the same language as its front, lighter where it is seen least.

- [x] Mysore Palace: rear and side ranges with arcades, windows and turrets.
- [x] City Palace, Udaipur: the rear mass, and raise the palace onto its ridge above the lake.
- [x] Laxmi Vilas Palace: rear wings (and see T8 for its skyline).
- [x] Cooch Behar Palace: rear wings.
- [x] Rumtek: monks' quarters with windows and doors round the courtyard instead of a blank yellow wall.
- [x] Hawa Mahal: the rear courtyards and ramps behind the screen front.

### T8. Signature features still missing

One commit each. Check the budget after each.

- [x] **Taj Mahal**: the minarets lean slightly outwards (about 0.5°, built so to fall away from the tomb). Tilt each about its foot.
- [x] **Laxmi Vilas Palace**: an asymmetric, picturesque skyline (domes, gables and towers of different heights) instead of a symmetrical block; red sandstone with blue trap and marble.
- [x] **Qutb Shahi Tombs**: globular grey domes on petalled drums, in place of the pointed white onions (`onionDome` in `js/monuments/qutb-shahi-tombs.js`), and the large raised terraces.
- [x] **Golden Temple**: the Akal Takht with white marble lower storeys under its gilded top (`js/details/golden-temple.js`).
- [ ] **Meenakshi**: roofed halls covering most of the court, and the Thousand Pillar Hall. Desktop budget: pay for it within Meenakshi (for example thinner gopuram figures or one row of town on desktops).
- [x] **Red Fort**: the irregular octagon plan in place of straight runs of wall; Chhatta Chowk, Naubat Khana.
- [x] **Kamakhya**: a segmented beehive dome with sculpture bands; curved chala roofs on the halls.
- [x] **Gwalior**: a long narrow plateau; Teli ka Mandir with its wagon-vault top; the Sas-Bahu temples.
- [x] **Akshardham**: the two-storey colonnaded parikrama with pavilions, in place of a solid wall.
- [x] **Cellular Jail**: a taller central watchtower with its lantern.
- [x] **Mysore Palace**: the outline bulbs that light it at night (already on `main`: `bulbPoints` outlines the walls, arches and domes).
- [ ] **Key Monastery**: irregular stacked massing on the steeper hill (with T5).

### T9. Materials

- [ ] Nalanda: the brick (`#a5553b`, `#844230`) is too orange. Darker, weathered, less saturated, with variation between walls.
- [ ] Grishneshwar: the red basalt (`RED` in `js/monuments/grishneshwar-temple.js`) is too saturated. Darker weathered stone.
- [ ] Review the other saturated stones in `M` (`js/helpers.js`) against photographs while doing these.

### T10. Weathering in the surface shader

`js/surface.js` already varies each surface by kind ('brick', 'marble', 'facade', 'ground' ...). Add weathering there, so every monument gains it without new geometry or triangles:

- [ ] Damp and grime at the foot of walls: darken towards the ground over the first metre or two.
- [ ] Streaks under ledges and cornices: faint vertical darkening below horizontal edges (from world height and a noise, not from geometry).
- [ ] Soot and age on old brick and stone, weaker on marble, none on gilt and glass.
- [ ] Phone builds: the same, or switched off if it costs frame rate on a real phone.

### T11. Atmosphere and light

`js/main.js` has fog, a sky shader with haze and distant hills, GTAO, bloom and SMAA.

- [ ] Haze that thickens with distance and takes the sky's colour near the horizon (aerial perspective), so distant mountains and skylines read as far away. In the fog, not in CSS.
- [ ] Per-site sun: the sun direction is one fixed vector (`SUN_DIR`). Let a monument return its own (from its latitude and its best-known photo light), defaulting to today's.
- [ ] Colour grading: an optional LUT pass in the composer for a warm, slightly hazy Indian daylight, tuned once for all monuments. Desktops only if it costs a pass on phones.

### T12. Vegetation and ground

- [ ] Two or three shapes per tree species in `js/details/realism.js` (`trees`, `fullTrees`), chosen per tree, so a row of the same kind is not identical.
- [ ] Ground scatter near the monuments on desktops: grass tufts and stones along path edges and lawn borders, instanced and inside the budget.

### T13. Keeping it accurate

- [ ] A `refs` field on each monument in `js/data.js`: its key real dimensions (height, length or area) and a source link.
- [ ] `tools/check-heights.mjs`: builds each model and compares its bounding-box height (and, where given, its plan size) with `refs`, allowing for the plaque's `scaleNote`.
- [ ] One camera preset per monument matching its best-known photograph (`view` and `zoom` in the builder, or a `photo` preset beside them), to compare screenshots with reference photos.

## Checking a task

1. `npx serve .`, open the hash, reset the view; look from the default view, the opposite side and close to the new part. Then `?detail=low`.
2. `node tools/check-budgets.mjs` (or count the one monument): under 600k on desktops, 300k on phones.
3. `node tools/check-flicker.mjs <id>`: no new visible clashes.
4. Neighbours that share a helper you changed (a `townHouses`, `nagaraTemple` or `gopuram` change reaches many monuments) still look right.
