# Scenery corrections

A plan for the vegetation, water, lawn scatter, roof tanks and close-up camera, from the review of all 101 home views (desktop, high detail, day) and from measuring each built model.

The buildings can stay. The flicker scan in `tools/check-flicker.mjs` found no visible z-fighting on any monument after `separateCoplanar` and `separateMerged`. The work is the dressing around them, plus one camera clamp.

Do the phases in order. Each phase is a reviewable change on its own. Phases 1–4 correct what is already drawn. Phase 5 adds ground that is missing. Leave the architecture, sculpture and doorways alone.

## What to leave alone

These already match the place. A later phase must not “improve” them into something else.

- Cypress charbagh and canals at the Taj Mahal, Humayun’s Tomb, Safdarjung’s Tomb, Akbar’s Tomb and Bibi ka Maqbara. Fruit trees in the squares (mango, neem) are fair.
- Deodar at Hidimba Devi. Bare ground at Key Monastery, Kedarnath and the Kargil War Memorial. Yaks at Key and Tawang. Field guns at Kargil.
- The 90 neem of the National War Memorial’s outer ring (the Rakshak Chakra). No pool there.
- The Amrit Sarovar, the nine Lotus pools, the Meenakshi tank, the Padma Theertham, Kushavarta at Trimbakeshwar, the well at Rani ki Vav, Padmini’s pool at Chittorgarh, Sher Shah’s lake, Lake Pichola and its boats, the Ganga and the Narmada and the boats on them, Maota Lake as a place (its material changes in phase 3; the lake stays).
- Elephanta launches at the Gateway, country boats at Howrah, Bekal and the Shore Temple, shikaras and houseboats at Hazratbal. Traffic on Howrah Bridge and the Sea Link. Update the sentence in `js/details/realism.js` and the README that says there are no motor vehicles, so it names these two bridges.
- Laad Bazaar stalls at Charminar, the Dasara elephants at Mysore, the dressed elephants on the Amber ramp, the deer at Dhamek and Sikandra.

## Constraints

- Triangle budgets in `js/detail.js`: 650,000 on desktop, 300,000 on phones. `upgradeTrees` in `js/details/realism.js` fills whatever is left, smallest planting first. A new full tree that is heavier than a banyan will push Ajanta, Bhimashankar and Shikharji over the budget or will simply never upgrade. Keep the plain form cheap. Forests stay on the plain form.
- Phones (`detail.low`) keep plain trees and skip `scatterGround`. Every new kind needs a plain form. The full form is desktop only.
- `findMirror` in `js/main.js` reflects a single water plane: the largest mesh with `material.userData.reflect`. `M.water` is created with `reflect: false` on purpose (`js/helpers.js`), and the comment above `findMirror` says pools are too small to reflect. Do not flip that flag on `M.water`. A charbagh canal and the Yamuna are different heights; one mirror plane cannot serve both. Sites whose only water is a lake or a sea already use `M.lake`, `M.sea` or `M.river`, which reflect.
- Spots passed to `trees()` are `[x, z]` or `[x, z, height, ground]`. A tree whose ground height is within about a metre of a water surface, and whose xz lies inside that water, stands in the water. Golden Temple is the known case.
- Home framing (`js/framing.js`) ignores meshes marked `userData.dressing` and ground under 2.5 m. `copies()` already sets `dressing`. New trees, shrubs and boats go through `copies()` so they do not pull the camera back. A new river sheet or a town must stay out of `focus`, or the home view will frame the landscape instead of the building.

## Phase 1 — More tree kinds, still one planter

All of this is `js/details/realism.js`: `trees()`, the crown-ratio table, `fullGeo()`, `fullTrees()`, and the default heights.

The comments already name the plant. The planter only knows neem, mango, palm, ashoka, cypress, banyan and deodar, and substitutes. Add kinds. Do not add a new mesh function per species. Four silhouettes cover them, and the existing broadleaf, columnar and conifer code is the implementation.

| Kind | Silhouette | Read it as | Plain form | Leaf |
| --- | --- | --- | --- | --- |
| `jamun` | broadleaf | darker and narrower than mango, dense crown | mango ratios with a smaller crown radius | `FOLIAGE_DARK` |
| `peepal` | broadleaf | wider than it is tall, pale trunk, crown starting low, no aerial roots | crown radius above banyan’s, trunk fraction shorter | `FOLIAGE` |
| `ber` | dry umbrella | short, gnarled, sparse; default height about 5 m | low wide crown, long trunk fraction inside that short height | `FOLIAGE_DRY` |
| `chinar` | broadleaf | very wide pale crown, thick trunk, no aerial roots | banyan width without the drooping roots | a new pale green, not the banyan green |
| `poplar` | columnar | tall pale column, wider than ashoka; default height about 16 m | ashoka path with a slightly larger crown radius | pale green |
| `willow` | broadleaf | medium height, drooping crown | broadleaf with the banyan droop flag and a lighter leaf | pale green |
| `casuarina` | feather | thin trunk, wispy tiers; not a solid cone | deodar/cypress tier path, narrower and more tiers than cypress | `FOLIAGE_DARK` |
| `teak` | broadleaf | tall straight trunk, crown held high | larger trunk fraction, crown radius near neem | `FOLIAGE` |
| `sal` | broadleaf | tall, crown high and a little narrower than teak | teak with a smaller crown radius | `FOLIAGE_DARK` |
| `babul` | dry umbrella | flat-topped, small, thorny look | low wide crown, default height about 6 m | `FOLIAGE_DRY` |
| `khejri` | dry umbrella | sparser and greyer than babul, similar height | babul with a thinner crown | `FOLIAGE_DRY` |
| `dhok` | dry umbrella | small round crown on a short trunk | khejri, rounder | `FOLIAGE_DRY` |
| `tamarind` | broadleaf | wide dark crown, long trunk | mango width, darker leaf | `FOLIAGE_DARK` |

`trees()` currently indexes a fixed map of crown ratios and throws on an unknown kind. Every new kind goes in that map, in the default-height map, and in `fullGeo()`. A kind missing from `fullGeo()` must not fall through to the neem limb layout.

`fullTrees()` picks `FOLIAGE_DARK` for mango, ashoka, deodar and cypress. Extend that choice to jamun, sal, tamarind and casuarina. Chinar, poplar and willow use the pale green. Banyan keeps its aerial roots. No other kind grows them.

Plain-form cost stays in the same range as today’s neem (one trunk mesh and one crown per tree, instanced). The full form stays in the same range as today’s broadleaf (a few limbs and a handful of clumps). Casuarina’s full form follows the deodar tier loop with fewer leaflets than a palm.

After the kinds exist, `node tools/check-budgets.mjs` on an untouched monument (Taj, Hidimba, Qutub) must still pass. The new kinds are unused until phase 2, so this phase is the planter only.

Update the kind list in the comment above `trees()`, and the README paragraph that lists neem, banyan, mango, ashoka, coconut, deodar and cypress.

## Phase 2 — Plant the kind the comment already names

Swap `kind` and, where the count is the problem, the count. Keep positions unless the phase 3 note says the tree stands in water. One monument per commit is too fine; group them as below so a budget failure is easy to bisect.

### Avenues and memorials

| Monument | File | Change |
| --- | --- | --- |
| India Gate | `js/details/india-gate.js` `addDetails` | `kind: 'mango'` becomes `kind: 'jamun'`. The row is `along(12, …)` at x = ±58. Leave the count. Canals and stalls are phase 3. |
| Rashtrapati Bhavan | `js/details/rashtrapati-bhavan.js` | The two `along(8, …)` rows at x = ±38 become jamun. |

### Desert, dry hill, Deccan rock

| Monument | File | Change |
| --- | --- | --- |
| Jaisalmer Fort | `js/details/jaisalmer-fort.js` | `scatter(60, …)` filtered by `trikuta` becomes about 25 khejri, same filter, `h` about 5. Roof tanks are phase 4. |
| Chittorgarh Fort | `js/details/chittorgarh-fort.js` | `plateau.slice(0, 44)` mango becomes about 20 khejri. Keep the dry shrubs on the rest of the plateau. |
| Amber Fort | `js/details/amber-fort.js` | Hillside `kind: 'mango'` becomes `kind: 'dhok'`, `h` about 5. The 2.2 m flowering shrubs on the Kesar Kyari island (`flowers: '#f08a1c'`, spots around z = 60–72) come out. The grass quadrants are already in `js/monuments/amber-fort.js` (`box(9, 1.4, 9, M.grass, …)` on the island); those are the beds. |
| Daulatabad Fort | `js/details/daulatabad-fort.js` | The 30 mango in the ring become babul. Keep `r > 78` so they stay outside the moat (the water cylinder is radius 70–74 in `js/monuments/daulatabad-fort.js`). |
| City Palace, Udaipur | `js/details/city-palace-udaipur.js` | The 40 mango on the ridge become dhok. Boats and the lake stay. |
| Buland Darwaza | `js/details/buland-darwaza.js` | `scatter(22, …)` neem becomes about 8 dhok or neem, same `avoid`. Fatehpur’s ridge is bare. |
| Golconda Fort | `js/details/golconda-fort.js` | Split `plain` (40 neem outside radius 125): half stay neem, half become babul. Dry scrub on the slope stays. |
| Palitana | `js/details/palitana-temples.js` | Slope mango becomes dhok, shorter (`h` about 4). The stair filter already keeps x = −54 to −26, z = 30 to 96 clear. Keep it. |
| Qutb Shahi Tombs | `js/details/qutb-shahi-tombs.js` | `kind: 'palm'` on the 40-tree scatter becomes `kind: 'neem'`. The tomb garden is lawn and shade, not a coconut grove. |

### Sacred trees and the wrong substitute

| Monument | File | Change |
| --- | --- | --- |
| Golden Temple | `js/details/golden-temple.js` | The three spots `(60,-72)`, `(-70,70)`, `(72,68)` lie inside the 150 m sarovar (half-extent 75). Move each spot out past the parikrama, radius above 80, and plant `ber` at `h` about 5. The sarovar, lamps and Nishan Sahibs stay. |
| Mahabodhi | `js/monuments/mahabodhi-temple.js` | Replace the trunk cylinder at z = −28 and the ten icosahedron leaf blobs with one `peepal` call, one tree, height about 18, at the same spot west of the temple. |
| Mahabodhi | `js/details/mahabodhi-temple.js` | Remove the `prayerFlags` strings across the court. Butter lamps can stay. |
| Dhamek Stupa | `js/details/dhamek-stupa.js` | Replace the 20 neem and 2 banyan with about 6 peepal, same `avoid` around the drum. Remove the six `prayerFlags`. Keep the deer and the ASI board. |
| Hazratbal | `js/details/hazratbal-shrine.js` | The two `along(7, …)` rows become `chinar`, `h` about 14. Boats and houseboats stay. |
| Thiksey | `js/details/thiksey-monastery.js` | The 28 ashoka (`along` at x = 100 and x = 140, `h: 14`) become about 10 poplar and 8 willow, `h` about 12, still on the river banks (the Indus strip is the 30 m box at x = 120 in `js/monuments/thiksey-monastery.js`). Do not put them on the hill. |
| Konark | `js/details/konark-sun-temple.js` | The two `along(6, …)` cypress rows become casuarina. Keep the palm scatter. Remove the pink `shrubs` scatter (`flowers: '#d0306f'`). |
| Tipu Sultan’s Gumbaz | `js/monuments/tipu-sultan-gumbaz.js` | The avenue built as cypress becomes neem or mango, about the same count, shorter variation. |
| Tipu Sultan’s Gumbaz | `js/details/tipu-sultan-gumbaz.js` | Remove the pink shrub rows, or cut them to a few bushes at the gate. The loose green shrub scatter on the lawn comes down to a handful. |
| Shore Temple | `js/details/shore-temple.js` | Keep the palms. Add a casuarina row behind them, on the landward side (positive z, on the sand, clear of the temple). |
| Ajanta | `js/details/ajanta-caves.js` | Plateau and cliff-top plantings (`mango`, including the 160-tree plateau scatter) become teak. Valley neem can stay as a second species. Scrub stays. The Waghora stays. |
| Bhimashankar | `js/monuments/bhimashankar-temple.js` | The 110 mango become teak. The 60 neem stay, so the hollow still reads as mixed forest. Do not add trees. |
| Shikharji | `js/details/shikharji.js` | Mango becomes sal. If the count (about 95) makes the hill an orchard, cut it by about half and keep the trees off the temple platforms. |
| Gommateshwara | `js/details/gommateshwara.js` | Keep dry scrub on the rock and coconut below. Add about 8 tamarind in the same field scatter (`hypot > 88`), mixed with the palms. |
| Dilwara | `js/details/dilwara-temples.js` | Split the 48 mango: half mango, half jamun. |
| Brihadeeswara | `js/details/brihadeeswara-temple.js` | The palm rows at x = ±32 run through the court. Move them outside the prakara wall, or drop them. The court should read as stone. |
| Lotus Temple | `js/details/lotus-temple.js` | The ashoka ring at radius 82 stands in front of the outer petals. Move it out to about 110, or cut it from 36 to about 18 and keep it beyond the paths. Cut the pink hedge loop (`d` from 64 to 82, nine wedges) to one low band, or remove it. The nine pools stay. |
| Cooch Behar | `js/details/cooch-behar-palace.js` | `scatter(26, …)` palms come out. Keep a short ashoka row on the drive (the existing `along(6, …)` at x = ±12), and cut the pink shrub scatter. The pond is phase 3. |

Run `node check-budgets.mjs` from `tools/` on every id touched here, at both detail levels. Ajanta, Bhimashankar, Shikharji and Thiksey are the ones likely to move. Then `node check-flicker.mjs` on the same ids. Then `node shoot-views.mjs --site` for the home view of each, and compare with the review stills: no round green orchard on the Thar, no cypress at Konark, no banyan roots at Hazratbal, no leaf-blob tree at Bodh Gaya.

## Phase 3 — Water that is in the wrong place

`M.water` stays non-reflecting. Where a lake should reflect and it is the site’s only large sheet, build it with `M.lake` (or `M.river` / `M.sea` when that is what it is).

| Monument | File | Change |
| --- | --- | --- |
| India Gate | `js/details/india-gate.js` | Delete the two `box(5, 0.3, 200, M.water, ±15, …)`. They meet the piers (the arch face is at x = ±12). Delete the `stalls` on the lawn. Jamun from phase 2 stays. Do not draw a replacement canal in this model; the monument is the arch, and the real canals belong to the avenue west of it. |
| Jallianwala Bagh | `js/monuments/jallianwala-bagh.js` | Remove the 24×24 `M.water` box and the 28×28 stone rim under the flame (`box(28, …)` and `box(24, …, M.water, …)` near z = −6). Set the flame and its red base on the lawn. Reposition the four lanterns onto the lawn around the flame, a few metres out, so they are not standing in a pool that no longer exists. Keep the well at (−36, 20) and the bullet-marked wall. |
| Cooch Behar | `js/monuments/cooch-behar-palace.js` | Remove `box(60, 0.5, 30, M.water, -70, 0, 80)`. Keep the lawn and the path. |
| Amber | `js/monuments/amber-fort.js` | Change the Maota sheet from `M.water` to `M.lake` so the 160×60 lake reflects. It is the only large water, so `findMirror` has one plane. Keep the island and the grass beds. |
| Mahakaleshwar | `js/monuments/mahakaleshwar-temple.js` | Remove `box(70, 0.4, 20, M.water, -20, 0, -62)`. Keep the Koti Tirth tank (`box(22, 1.1, 18, M.water, -28, 0, -14)`). |
| Chota Imambara | `js/monuments/chota-imambara.js` | The channel is `box(7, 0.5, 70, M.water, …)`. Shorten the long axis to about 24 m so it reads as a court basin, and keep it on the axis in front of the building. |
| Ramanathaswamy | `js/monuments/ramanathaswamy-temple.js` | The sea is `sheet(1400, 1400, M.sea)` under a 320×300 sand pad, so the compound reads as a beach. Shrink the sand’s role: keep a sea, and push its near edge at least 80 m beyond the outer wall (walls span about x = ±70, z = ±95). The temple sits in the town, back from the shore. |
| Somnath | `js/monuments/somnath-temple.js` | The home view shows a seam where two ground planes meet on the shore. Stop the shared edge 2 cm short, or lift one plane by about 2 cm, the same remedy `tools/README.md` gives for flicker. Add about 8 casuarina or palms on the landward side of the platform, clear of the steps. |

Shoot the home view of each. India Gate’s lawn runs to the arch with no blue strip and no cart. Jallianwala’s flame stands on grass, with the well still in the garden. Amber’s lake shows the fort in the water. Udaipur already does this; Amber should look like that, at lake scale.

## Phase 4 — Tufts, banyan roots, roof tanks, and the close camera

### Grass scatter

`scatterGround` in `js/details/realism.js` drops tufts whose geometry is already about half a metre tall, then scales them by 0.7 to 1.5, so a tuft can stand about a metre high. On a meadow that is texture. On a ceremonial lawn it reads as weeds, and at the Shaheed Minar the tufts pile on the plinth.

- Cap the instance scale so a tuft stays under about 0.35 m. Stones stay.
- Skip a hit when the mesh has `userData.mown`. Set `mown` on the ceremonial lawns: India Gate’s grass boxes (`js/monuments/india-gate.js`), the Taj lawns, Victoria’s lawns, the National War Memorial lawn, both Parliament lawns, and the Shaheed Minar ground if the scatter is landing on it (`js/details/shaheed-minar.js` and the monument file). Meadows, forest floors and fort hills do not get `mown`.
- The ray already rejects steep normals. Also reject a hit whose point is inside the focus bounding box expanded by about 4 m, so tufts stop landing on plinths that share a green material with the lawn.

### Banyan roots

In `fullGeo`, banyan aerial roots already run to y = 0 in unit space and the instance is scaled by the tree height, so a root reaches the instance origin. Where they look short, the origin is above the lawn. When planting banyans, pass the ground height (the fourth spot component) as the lawn surface, and check Shaheed Minar, Victoria Memorial and CSMT in the home view: the roots meet the grass. Chinar, from phase 1, must not take the banyan `droop` branch.

### Roof tanks

`townHouses` pushes a tank when `roof === 'flat' && R() < 0.7`. Add an option `tanks` (default `0.7`) and use it in that test. Pass `tanks: 0.15` from `js/monuments/jaisalmer-fort.js` where `townHouses(keep, …)` builds the fort town. Leave the default everywhere else: Varanasi, Madurai, Jodhpur, Charminar and the Howrah banks should keep their tanks.

### Close camera

`setEnvironment` in `js/main.js` sets `controls.minDistance = radius * 0.35`. The orbit target for India Gate is inside the arch, and that distance reaches into the masonry. A spherical minimum cannot follow a doorway, so do not simply raise the factor.

On each `controls` change, after the dolly:

1. Raycast from the camera toward the target against the focus meshes.
2. When the first hit is closer than about 1.5 m, move the camera back along that ray until the hit is 1.5 m away.
3. Leave `minDistance` as a floor so a monument with no hit (a statue, a bridge) can still come close.

Check India Gate at maximum zoom: the camera stays in the passage or outside the piers, and the inner face of a wall does not fill the frame. Check Rani ki Vav and a temple doorway still allow a close look. `minElevation` behaviour stays.

## Phase 5 — Ground that is missing

Do this after phases 1–4. Each item adds triangles and can change framing if it is put in `focus`. Build it on the group, outside `focus`.

| Monument | Where | What to add |
| --- | --- | --- |
| Vittala, Hampi | `js/monuments/vittala-temple-hampi.js` and `js/details/vittala-temple-hampi.js` | A Tungabhadra sheet with `M.river`, off the compound (the enclosure is roughly x = ±58, z = ±82). Keep a few palms and the boulders beside it. Cut the palm scatter (about 40) down to those beside the river. |
| Mahabodhi | `js/monuments/mahabodhi-temple.js` | A lotus pond south of the railing, modest (on the order of 30 m), `M.lake` only if it will be the largest reflecting sheet; otherwise `M.water`, since the peepal is the subject. |
| Bara Imambara | `js/details/bara-imambara.js` or the monument file | The baoli: a rectangular stepped shaft beside the hall, not another fountain. The existing court fountain can stay or go; the baoli is the one that belongs. |
| Ramappa | `js/monuments/ramappa-temple.js` | Ramappa lake as a sheet beyond the temple platform, `M.lake`. |
| Jagannath, Puri | `js/details/jagannath-puri-temple.js` | One or two rows of `townHouses` outside the wall, on the streets, with `tanks` left at the default. No trees inside the prakara. |
| Tawang and Rumtek | their detail files | A loose ring of a conifer. Casuarina is the wrong plant; add a short kind `fir` only if it can share the deodar tier code with a narrower, shorter default (about 12 m). A dozen trees on the ridge, clear of the courtyard. Skip this if the deodar budget on Hidimba shows the tier mesh is too heavy to repeat. |
| Mallikarjuna, Srisailam | the detail file | Optional, and easy to overdo. A few more sal or teak on the hill is enough. The Krishna gorge is a terrain piece (`js/details/terrain.js`); treat it as its own change, not part of the tree pass. |
| Somnath | already in phase 3 | The shore trees from phase 3 are the whole of this item. |

Frame check after each: `frameBox` still hugs the building. If a home view jumps back to include the new river, the new mesh was added under `focus` or is taller than 2.5 m and unmarked. Mark dressing, or parent it outside `focus`.

## Phase 6 — Words

- README, “Nature and figures” and the tree list under “Setting”: name the new kinds in the same sentence style as the current list, and say the ceremonial lawns stay mown.
- `js/details/realism.js` header: the line about no motor vehicles should say the Howrah Bridge and the Sea Link carry traffic, and nowhere else does.
- Comments that already name jamun, khejri, chinar, casuarina, poplar, willow, ber, teak: after phase 2 they match the `kind` again. Where a comment and the call still disagree, fix the call, not the comment.

## Verification

From `tools/`, on the ids touched by that phase:

```bash
node check-budgets.mjs <ids>
node check-flicker.mjs <ids>
node check-heights.mjs <ids>
node shoot-views.mjs --site --size 960x540 --out views/after <ids>
```

Heights should not move; the check is there so a peepal or a poplar planted inside `focus` does not fail the spire allowance.

On the desktop home view, after phases 2–4:

- India Gate: jamun at the sides, lawn to the piers, no canal, no cart, tufts absent or under a hand’s height.
- Jallianwala: flame on grass, well still in the garden, no 24 m pool.
- Cooch Behar: lawn and a short drive, no coconut grove, no pond.
- Amber: the lake reflects, the island is low grass, the hills are small grey-green trees.
- Konark: palms and feathery casuarina, no solid cypress cones, no pink beds.
- Thiksey: a thin pale line of poplars and willows by the river, none on the hill.
- Key, Kedarnath, Kargil: still bare.
- Hazratbal: wide chinars, no aerial roots; boats still on the lake.
- Jaisalmer: sparse low trees, few black tanks on the skyline.
- Golden Temple: no tree inside the sarovar; any ber stands on the walk.
- Mahabodhi: one peepal west of the temple, no blob crown, no prayer flags across the court.
- Dhamek: a few peepal, deer, no Tibetan flags.
- Hampi: boulders, a river, a few palms by the river.
- Taj, Hidimba, the National War Memorial, the sarovar, Lake Pichola: unchanged in kind.
- India Gate at maximum zoom: the camera stays out of the masonry.

`node check-flicker.mjs` with no ids, once at the end, to confirm the full set is still clean. A ground seam such as Somnath’s may need `--same` if both planes share a material; the default scan only reports different materials.

## Suggested commits

1. Tree kinds in `realism.js`, no site switched yet.
2. Desert and dry-hill swaps (Jaisalmer, Chittorgarh, Amber plants, Daulatabad, Udaipur ridge, Buland, Golconda, Palitana, Qutb Shahi).
3. Sacred-tree and coastal swaps (Golden Temple, Mahabodhi, Dhamek, Hazratbal, Thiksey, Konark, Tipu, Shore, Ajanta, Bhimashankar, Shikharji, Gommateshwara, Dilwara, Brihadeeswara, Lotus, Cooch Behar plants, India Gate and Rashtrapati jamun).
4. Water removals and the Amber reflection.
5. Tufts, banyan ground contact, Jaisalmer `tanks`, camera clamp.
6. Missing ground (Hampi river, Bodh Gaya pond, baoli, Ramappa lake, Puri streets, and firs only if the budget allows).
7. README and the realism.js header.

## Out of scope

People. Vehicles anywhere except the two bridges that already have them. Reworking carving, gopurams, or the sculpted figures. Night lighting. Replacing the seven original kinds on sites where they already fit (Qutub’s neem, the charbagh cypress, Hidimba’s deodar, the Parliament hedges). A second mirror plane so canals and a river can reflect at different heights; that is a renderer change, and phase 3 avoids it by giving each corrected site one reflecting sheet.
