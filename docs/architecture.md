# Architecture: the parts the buildings are made of

Every monument is built in code from shared parts. This page lists them: what each one is, what you
pass it, and which file it lives in.

For what stands round the buildings (trees, boats, flags) see [realism.md](realism.md).

## How a monument is put together

Each monument has two files:

- `js/monuments/<name>.js` builds the masses: plinth, walls, towers, roofs.
- `js/details/<name>.js` adds the finer architecture and the setting, from `addDetails(f, g)`.

The builder returns `{ group, focus, view, zoom }`. `focus` is the group the home view frames;
`group` is the whole site.

A few rules hold for every part:

- **Metres, y up.** A part stands on y = 0 and faces +z unless it says otherwise.
- **Materials are passed in.** A part takes the stone it is built of (`m`) and often a second for
  trim. The shared stones are in `M` in `js/helpers.js` (`M.marble`, `M.red`, `M.granite`…); make
  a monument's own with `mat('#hex', roughness)`.
- **Merge when done.** A part made of many small meshes is wrapped in `mergeByMaterial(group)`,
  which leaves one mesh per material.
- **Two faces never share a plane.** Lift an overlay 2 to 5 cm off its wall, or the two flicker.
  `node check-flicker.mjs <id>` from `tools/` finds the ones that do.

### Placing parts

| Helper | File | What it does |
| --- | --- | --- |
| `at(part, x, y, z)` | helpers | Move a part |
| `onFace(part, angle, dist, lat)` | helpers | Put a part on a wall face: `angle` 0 is the +z face, `dist` how far out, `lat` along the face. `FACES` is the four angles |
| `alongFace(angle, dist, len, n, y)` | components | `n` places along a face, for a row of brackets |
| `aroundCircle(r, n, y)` | components | `n` places round a circle, each turned outward |
| `aroundRect(w, d, step)` | helpers | Places round a rectangle: a colonnade |
| `placeAll(geometry, places, m)` | components | One geometry at every place |
| `inst(geometry, list, m)` | helpers | The same, instanced: each entry is `[x, y, z, sx, sy, sz, turn]`. Use with `unitBox()` and `unitCyl()` for hundreds of columns or merlons |

```js
// A window on each of a building's four faces, 11 m out from its centre.
for (const a of FACES) d.add(onFace(at(windowFrame(2, 4.2, M.cream, { shape: 'flat' }), 0, 13.6, 0), a, 11.01));
```

## Primitives (`js/helpers.js`)

| Part | What it is |
| --- | --- |
| `box(w, h, d, m, x, y, z)` | A block standing on `y` |
| `cyl(rTop, rBottom, h, m, x, y, z, sides)` | A cylinder, drum or tapering shaft |
| `lathe(points, m)` | A turned shape from a profile of `[radius, height]` points |
| `sheet(w, d, m, x, y, z)` | A flat sheet of water or ground |
| `ring(r, h, m, y)` | An open-ended tube: a well's rim, a gallery wall |
| `strut(a, b, thickness, m)` | A bar between two points: trusses, cables |
| `hipRoof(w, d, h, m)` | A hipped roof over a rectangle |
| `planPrism(points, y, h, m)`, `starPrism(n, rOuter, rInner, h, m)` | A block on any plan; a star-shaped block (the Hoysala plan) |

## Domes

| Part | File | What it is |
| --- | --- | --- |
| `onionDome(r, m)` | helpers | The bulbous dome. From 1.5 m radius up it has a moulded neck and an inverted lotus at its crown |
| `lotusDome(r, m, { ribs, petals })` | components | An onion dome with shallow ribs, sitting in a cup of lotus petals |
| `hemi(r, m)` | helpers | A plain hemisphere |
| `persianDome(r, m)` | helpers | A pointed, double-curved dome |
| `ribbed(dome, n, amount)` | helpers | Presses `n` ribs into any turned shape |
| `petalRing(r, n, len, w, tilt, m)` | components | A ring of petals: the lotus under a dome or over its crown |
| `finial(h, m)`, `kalash(size, m)`, `crescentFinial(h, m)` | helpers, components | What crowns a dome: a Mughal spike with its balls, a temple's pot, a crescent |

## Kiosks and turrets

| Part | File | What it is |
| --- | --- | --- |
| `chhatri(r, h, m, domeM)` | helpers | The domed kiosk on eight columns that stands on Mughal and Rajput roofs |
| `mughalChhatri(r, h, m, { domeM, arches, crescent })` | components | A richer chhatri: arches between the columns, a sloping eave, a ribbed lotus dome |
| `guldasta(h, r, m)` | helpers | The slender roof turret of Lucknow: a shaft, a tiny onion dome and a spike |
| `minaret(h, r, m, { balconies, cap })` | helpers | A tapering minaret with balconies, capped by a chhatri |
| `jharokha(w, h, m, { roof })` | components | An oriel window on brackets, screened on three sides, under a curved (`'bangla'`), domed or flat roof |
| `banglaRoof(w, d, rise, m)` | components | The curved roof of Bengal, as on jharokhas and pavilions |

## Pillars and columns

| Part | File | What it is |
| --- | --- | --- |
| `column(r, h, m, { order })` | colonial | A classical column: plinth, base, tapering shaft, capital. `order: 'corinthian'` adds flutes and acanthus |
| `carvedPillar(h, m)` | temples | A temple pillar: square base, octagonal shaft with two carved bands, cushion and capital |
| `clusterPillar(h, m, { figures })` | sculpture | The Vijayanagara pillar: a shaft ringed by slender colonnettes |
| `yaliPillar(h, m)` | sculpture | A pillar carved with a rearing yali and its rider |
| `columnTrim(list, m, { capM })` | components | Bases and capitals for a colonnade built as bare instanced shafts |
| `pilasters(len, n, w, h, proud, m)` | components | Flat pilasters along a wall |
| `entablature(len, h, m)`, `corinthianCapital(r, m)` | sculpture | What a classical colonnade carries |

## Arches, doors and windows

| Part | File | What it is |
| --- | --- | --- |
| `archWall(w, h, d, archW, archH, pointed, m)` | helpers | A wall with an arch cut through it |
| `archPanel(archW, archH, pointed, m)`, `archSlab(…)` | helpers, components | A blind arch: a thin arch-shaped slab, usually dark, on a wall |
| `archRing(archW, archH, pointed, band, depth, m)` | components | The moulded ring round an arch's opening |
| `niche(archW, archH, pointed, depth, m)` | components | An arched niche with a half-dome hood |
| `barrelVault(radius, length, m)` | helpers | The underside of a barrel vault |
| `iwan(w, h, { m, trim, depth })` | mughal | The great arched recess of a Mughal gate or tomb front, with its door |
| `mughalDoorway(w, h, { m })` | mughal | A pointed doorway onto a dim room |
| `arcadeSkin(len, h, cells, depth, m)` | mughal | A wall face cut into a row of arched cells, each a door, a screen or a room |
| `windowFrame(w, h, m, { shape, screen })` | components | A window in a stone surround; `screen: jali(m)` fills it with a pierced screen |
| `classicalDoor(w, h, { shape, fill, top })` | colonial | A classical door or sash window, with a pediment if asked |
| `gothicDoor(w, h, …)`, `gothicWindow(w, h, …)`, `oculus(R, …)` | colonial | Gothic portal, two-light window and round window |
| `porch(w, d, h, …)`, `pediment(w, h, depth, m)` | colonial | A columned porch; a triangular pediment |
| `templeDoorway(w, h, { m })` | doorways | A temple door: stepped frame, hood, open leaves, a lamp in the sanctum behind, guardians |
| `doorFrame(w, h, { bands })` | doorways | The nested, carved bands round a post-and-lintel door |
| `doorLeaves(w, h, { open, studs, spikes })` | doorways | Timber leaves, standing open; `spikes` against war elephants |
| `interior(w, h)` | doorways | The dim room seen through an open door |

## Walls, eaves and parapets

| Part | File | What it is |
| --- | --- | --- |
| `chhajja(len, depth, drop, thickness, m)` | components | The deep sloping eave of Indian buildings; `chhajjaRing` for a round one |
| `bracketGeo(h, d, w)` | components | The bracket that carries an eave or a balcony |
| `merlons(len, w, h, depth, m)` | components | A row of pointed battlements |
| `rampart(segments, m, …)`, `bastionCrowns(list, m, …)` | forts | Battlements for a long curtain wall and for round bastions: parapet, merlons, string course, arrow slits |
| `railing(len, h, t, m)`, `railingRing(r, h, m)` | components | A railing of posts with pierced screens between |
| `balustrade(len, h, m)` | colonial | A classical balustrade |
| `beltCourse(w, d, y, h, proud, m)` | components | A band running round a rectangular building |
| `mouldings(w, d, courses, m)` | components | A stack of moulded courses: a plinth, a cornice |
| `dentils(len, w, h, d, m)` | components | The row of small blocks under a cornice |
| `panel(w, h, band, m, field)` | components | A sunk panel in a frame, its field carved or inlaid |
| `wallWithGaps(axis, len, h, t, m, gaps)` | temples | A compound wall with openings left for its gates |
| `curvedBand(points, a, b, y0, y1, m)`, `ellipseWall(…)` | helpers | A wall that follows a curve |

## Surface ornament (`js/details/components.js`)

These cost almost no triangles: the pattern is drawn by the surface shader (`js/surface.js`).

| Part | What it is |
| --- | --- |
| `jali(m)` | A pierced stone screen: octagons and diamonds, cut right through up close |
| `frieze(m)` | A carved band of rosettes |
| `carved(m, kind)` | Any other surface: `'script'` (incised names), `'calligraphy'`, `'pietra'` (inlay), `'reliefs'` (sculpture panels), `'tiles'` |
| `rosette(R, m)`, `medallion(R, m)`, `sunburst(R, m)` | Carved roundels |
| `lettering(text, size, depth, m)` | Raised letters |
| `photo(material, key)` (in `js/helpers.js`) | Gives a stone a photo texture set: `'laterite'`, `'blocks'`, `'rubble'`, `'concrete'`, `'timber'` and others (`js/textures.js`) |

## Temples (`js/details/temples.js`)

| Part | What it is |
| --- | --- |
| `nagaraTemple({ w, h, m, halls, … })` | A whole North Indian temple: sanctum, curved spire and halls stepping out in front |
| `shikhara(baseW, h, m, profile)` (helpers) | The curved Nagara spire alone; `nagaraProfile` and `kalingaProfile` are two tapers |
| `bhumijaRows(w, h, profile)` | Rows of miniature spires between the bands of a Bhumija spire |
| `dravidaVimana(w, tiers, tierH, m)` | The stepped tower over a South Indian sanctum, with its parapets of miniature shrines |
| `gopuram(w, d, h, tiers, seed)` | A South Indian gate tower, tier on tier of painted stucco figures |
| `mandap(w, h, roofTiers, m, shade)` | A pillared hall under a stepped roof |
| `storeyedHall(w, roofs, m, shade, { floors })` | A hall of several storeys of pillared galleries |
| `pidaRoof(w0, w1, count, step, m)` (helpers) | The stepped pyramid roof of slabs |
| `templeNiche(w, h, m, { figure })` | A niche on a temple wall holding an image |
| `templePorch(w, d, h, m)` (doorways) | A small open porch before a door |
| `trabeateGate(w, h, d, passW, passH, …)` | A post-and-lintel gatehouse, with guardians or carved beasts |
| `dwajasthambha(x, z, h)` | The gold flagstaff before the sanctum |
| `kuta(s, m)`, `shala(w, d, m)`, `haraRow(len, s, m)` (sculpture) | The miniature shrines along the edge of each storey of a vimana |

## Forts (`js/details/forts.js`)

| Part | What it is |
| --- | --- |
| `fortGate(w, h, d, archW, archH, { towers, iwan })` | A gatehouse with a real passage through it, guard niches and spiked leaves |
| `towerDetail(rBottom, rTop, h, m)` | String courses and arrow slits for a round tower |
| `slitRow(len, n, y, w, h)` | A row of arrow slits along a wall |
| `rampart(…)`, `bastionCrowns(…)` | Battlements, as above |

## Tibetan monasteries (`js/details/tibetan.js`)

| Part | What it is |
| --- | --- |
| `tibetanBlock(w, h, d, floors)` (helpers) | A whitewashed block with dark windows under a maroon band |
| `quarters(blocks, { cap })` | Dresses a list of plain blocks as monks' houses: windows in black surrounds, doors, beam ends, earth roofs, prayer-flag poles |
| `dharmaWheel(w)` | The gilded wheel between two deer over an assembly hall |
| `gyaltsen(h)` | The victory banner at a roof's corner |
| `shabkhep(w)` | The pleated awning over a window |
| `parapetDiscs(len, pitch, r)` | Gilded discs along a parapet |
| `tibetanDoor(w, h)`, `tibetanPortico(…)` (doorways) | A painted door; a pillared portico |

## Stairs (`js/details/doorways.js`)

| Part | What it is |
| --- | --- |
| `steps(width, rise, n, m)` | A plain flight |
| `grandStair(rise, width, m, shade, { n, landing })` | A broad stair between side walls, with a landing and guardians |

## Sculpture

| Part | File | What it is |
| --- | --- | --- |
| `figure(h, m, pose)` | sculpture | A carved figure, standing or dancing |
| `idol(h, m)` | components | A cheap standing image in relief, for rows of niches |
| `guardian(h, m)` | figures | A door guardian |
| `statue(h, m, pose)` | sculpture | A statue on a pedestal |
| `figureFrieze(len, h, m, { kinds })` | sculpture | A band of figures, elephants or horses in relief |
| `urn(h, m)`, `pinnacle(h, m)`, `gothicPinnacle(h, m)` | sculpture | Roofline ornaments |

The great statues (Patel, Bahubali, Thiruvalluvar, the Nageshwar Shiva) are sculpted as one
continuous skin in `js/details/figures.js` and `js/sdf.js`.

## Terrain (`js/details/terrain.js`)

| Part | What it is |
| --- | --- |
| `heightField(w, d, n, fn, { rock, cover, steep })` | Ground shaped by a height function: rock where it is steep, scrub or grass where it is not |
| `mountainRing({ inner, outer, h, snow })` | A ring of mountains round a valley |
| `rough`, `smooth`, `fbm`, `ridged` | Noise helpers for writing a height function |

## Checking a change

From `tools/`:

```bash
node check-budgets.mjs <id>     # triangles, against 650,000 on desktops and 300,000 on phones
node check-flicker.mjs <id>     # faces that share a plane
node check-heights.mjs <id>     # the model's height against the real one
node shoot-views.mjs <id>       # a picture of the home view
```
