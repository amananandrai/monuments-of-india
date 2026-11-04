# Plan: real doorways, and reusing the detail parts across the site

Two problems, one plan:

1. **Entrances don't read.** Most temples are a solid block with no way in, and most Mughal and
   colonial buildings show a door as a flat black arch with no depth.
2. **The new detail parts serve five monuments only.** The Taj's iwans, kiosks and minarets, the
   Parliament's colonnade, eaves and jalis, and the rest of `js/details/` should be reused by every
   building of the same family.

## Status

- **Taj Mahal, done:** white throughout. Its calligraphy frame and spandrel flowers are white
  relief, and the black inlay lines on the minarets, drum and alcoves are gone. Only the doorways
  and the window behind the pishtaq screen stay dark.
- **Phase 1, done:** the temple builders now have real entrances (see section 4). They have moved
  from `helpers.js` to `js/details/temples.js`, because they use the doorway kit and `helpers.js`
  cannot import it without an import cycle.
- **Phase 2, done:** the Mughal-family buildings have real doorways and arcades from
  `js/details/mughal.js` (see section 4).
- **Phase 3, done:** eleven forts have gates with real passages from `js/details/forts.js`
  (see section 4).
- **Doorway kit:**
  - `js/details/doorways.js` holds the temple parts: `doorFrame`, `templeDoorway`, `templePorch`,
    `doorLeaves`, `interior`, `lamp`, `guardian` and `steps`.
  - `js/details/mughal.js` holds the Mughal parts: `pierced`, `mughalDoorway`, `iwan`,
    `arcadeSkin` and `cellRow`.
  - `js/details/forts.js` holds `fortGate`, the plan's `gateway`.
  - `classicalDoor` comes with Phase 5.

## 1. What the site does today

A survey of the 101 builders in `js/monuments/`:

| How an entrance is drawn | Monuments | Why it looks wrong |
| --- | --- | --- |
| A flat `archPanel(…, M.recess)`, a dark arch 0.2–0.4 m thick stuck on the wall, used for doors (and in some files for windows and arcades too) | **32**: agra-fort, akbars-tomb, amber-fort, bara-imambara, bibi-ka-maqbara, bom-jesus, buland-darwaza, charminar, chittorgarh-fort, chota-imambara, city-palace-udaipur, cooch-behar-palace, csmt, gol-gumbaz, golconda-fort, hazratbal-shrine, humayuns-tomb, itmad-ud-daulah, jama-masjid, kashi-vishwanath-temple, kirti-mandir, laxmi-vilas-palace, mahabodhi-temple, mysore-palace, new-parliament-house, qutb-shahi-tombs, red-fort, rumi-darwaza, safdarjung-tomb, sher-shah-suri-tomb, soniji-ki-nasiyan, victoria-memorial | No reveal, no jambs, no threshold, no door. It is one flat colour, so from any angle it reads as a black sticker. |
| `nagaraTemple()` in `helpers.js`: halls are `box(hw, hh, hw)` | **13**: baidyanath, bhimashankar, grishneshwar, kashi-vishwanath, mahakaleshwar, nageshwar, omkareshwar, palitana, parshvanath-khajuraho, shikharji, somnath, soniji-ki-nasiyan, trimbakeshwar | The halls are solid cubes. Steps lead up to a blank wall. |
| `gopuram()` in `helpers.js`: the passage is `box(w * 0.2, …, M.recess)` | **5**: mallikarjuna, meenakshi, padmanabhaswamy, ramanathaswamy, tirumala | The gate tower's passage is a dark box, not a way through. |
| Porches and halls built by hand as boxes | about **20**: akshardham, brihadeeswara, chennakesava, dilwara, hidimba-devi, jagannath-puri, kailasa, kamakhya, kandariya-mahadeva (porch `box(10, 6, 6)`), kedarnath, konark, ramappa, ranakpur, shore-temple, vittala-hampi, golden-temple, the monasteries, and the forts' gates | Solid porches; forts' gates are flat panels on walls. |
| Real openings cut through a wall (`archWall`) | **6**: india-gate, gateway-of-india, charminar, ajanta-caves, golconda-fort, rumi-darwaza | These already read. The Taj's pishtaqs (`niche`) read too. |

So three helpers (`nagaraTemple`, `gopuram`, `archPanel` used as a door) account for about 50 of
the weak entrances. Fixing them fixes the most monuments for the least work.

## 2. How a doorway gets depth

Depth comes from geometry and light, not from colour. A doorway that reads has:

1. **A reveal:** side walls (jambs) and a soffit running back from the face, at least 0.6 m deep
   for a house door and 2–4 m for a gate or an iwan. They catch light on one side and shadow on
   the other, and ambient occlusion (GTAO) darkens the inner corners for free.
2. **Layers:** a frame proud of the wall, then one or more stepped frames, each a few centimetres
   further in. Temple doors (with three to seven bands, the *shakhas*) and Mughal iwans (an arch
   in an arch) both work this way.
3. **Something at the back:** door leaves, a screen, or a dim interior. A floor that runs in, and
   leaves standing ajar, show the space behind.
4. **A threshold and a way up:** a sill or a raised step, and stairs from the ground to the plinth.
5. **Shade from above:** a hood, an eave (`chhajja`), a half-dome or a porch roof throws a
   shadow into the opening.

**The constraint.** The walls are solid boxes and extrusions. Geometry set *behind* a box's front face
is hidden by that face, and there is no CSG in the project (and adding a CSG library is not worth
the cost). So a doorway gets its depth in one of three ways:

- **A. Proud surround (the default).** The frame, jambs and hood project 0.6–3 m from the wall,
  and the door sits at the wall face. No change to the base mass is needed. This is how the Taj's
  pishtaqs (`niche`) already work, and it suits iwans, temple doorframes, gates and porches.
- **B. Cut face.** Where the wall is already a thin face (`archWall`, gate passages, gopuram
  bases), build it as an extrusion with holes. The extrusion's hole sides become the reveals, and
  a door or interior goes behind. Use it where you should see *through* (gates, passages).
- **C. Porch.** For temples and Lutyens buildings, an open porch of columns and a roof, with the
  doorway at its back wall, gives depth by itself.

## 3. The doorway kit: `js/details/doorways.js`

New, shared parts, built from the existing components:

| Part | What it is | Built from |
| --- | --- | --- |
| `doorFrame(w, h, { bands, bw, depth, d0 })` (built) | Nested post-and-lintel bands, each standing further out than the one inside it, so the frame steps in to the door | boxes, `frieze` |
| `reveal(shape, depth, m)` | Jambs and soffit for any opening shape (rectangle, round, pointed, trefoil), seen from inside | `archCurve` and an extrusion of the outline |
| `doorLeaves(w, h, { open, studs, m })` (built) | Two timber leaves with raised panels, optional brass studs (instanced) and a chosen opening angle | boxes, `inst` |
| `interior(w, h)` and `lamp()` (built) | The dim room behind an open door, painted on an unlit panel: a floor lit by daylight fading inward, side walls lighter than the far wall, and the warm glow of an oil lamp (a real lamp stands in front of it, and its flame glows at night) | a vertex-coloured plane, `MeshBasicMaterial` |
| `threshold(w, kind)` | A sill, a raised *udumbara* step, or a half-moon stone | box, lathe |
| `steps(w, rise, n)` (built) | A flight of steps down from a plinth | boxes |
| `guardian(h, m)` (built) | A door guardian carved at the foot of a doorframe | `capsule`, spheres |
| `templePorch(pw, pd, ph)` (built) | An open porch: two columns and two pilasters with bracket capitals, beams, a slab with eaves on three sides, and a small stepped roof with bell and kalash | boxes, `bracketGeo`, `chhajja`, `pidaRoof` |
| `templeDoorway(w, h, { bands, guardians, hood, open })` (built) | A post-and-lintel temple door: `doorFrame`, a figure block and rosette in the middle of the lintel, a hood, timber leaves standing open onto the lit `interior` and a lamp, a raised threshold, a half-moon stone, and guardians at the foot | `doorFrame`, `rosette`, `chhajja`, `guardian` |
| `mughalDoorway(w, h, { jaliTransom, hood })` | A pointed-arch door in an iwan: rings, a screened transom, timber leaves | `niche`, `archRing`, `jali` |
| `gateway(w, h, depth, { doors, spikes })` | A fort or city gate: a passage with reveals, huge studded leaves (with the elephant spikes of Rajput and Mughal forts), and guard niches | `reveal`, `doorLeaves`, `niche` |
| `classicalDoor(w, h, { architrave, pediment, steps })` | A Lutyens or colonial door: architrave, a cornice or pediment, panelled leaves, steps | boxes, `dentils`, `keystone` |
| `porch(opts)` | Generalised from the Parliament porch: columns, an entablature, an eave, a parapet and a doorway at the back | the Parliament's porch, made parametric |

Rules: a dark colour is never used alone to stand for an opening. Every doorway has at least a
reveal and something at the back. Each part merges with `mergeByMaterial`.

## 4. Fixing entrances, family by family

**Phase 1: the shared helpers (19 monuments). Done.**
- `nagaraTemple()`:
  - The front hall opens through an open porch (`templePorch`) onto a `templeDoorway` on its
    axis, with steps (`steps`) the width of the porch.
  - The first hall has a smaller doorway on each side, with steps down from the plinth, wherever
    the plinth leaves room.
  - A shrine with no hall has its doorway in the sanctum.
  - This covers the 13 temples listed above, including Baidyanath's small shrines.
  - Not done: halls as pillared rooms with a parapet seat (*kakshasana*). The halls keep their
    walls; their entrances were the problem.
- `gopuram()`:
  - The granite base is split either side of a real passage (method B), with stepped frames at
    both ends, beams across the ceiling, and two great studded doors standing open at its middle.
  - The compound walls of all five temples now open where their gopurams stand
    (`wallWithGaps`), so each passage leads through into the courtyard.
- `mandap(w, h, roofs, m, shade, doors)`: takes the faces that open. Each gets a `templeDoorway`
  in the core, with the columns in front of it left out. Ram Mandir opens:
  - the front hall's front and sides;
  - the middle hall's sides;
  - the outer face of each side hall.

**Phase 2: Mughal, Indo-Islamic, Nawabi, Qutb Shahi and Deccan (15 monuments). Done.**
Every flat `archPanel(…, M.recess)` door and arcade in these buildings is replaced by parts from
`js/details/mughal.js`:

- `pierced(len, h, holes, depth, m)`: a slab with pointed arched openings cut through it, so each
  opening has real jambs and a soffit (the reveal).
- `mughalDoorway(w, h)`:
  - an arch in two orders, the inner one a step narrower and set back;
  - a door up to the springing under a lintel, with a pierced screen in the arch head;
  - studded leaves standing open onto a dim room, and a threshold.
- `iwan(w, h, { m, trim, shade, depth, frame, top, fill, door })`: the Taj's pishtaq made
  general. It has a niche with a half-dome, a ring and a flat band in the trim stone (the white
  marble lines on red sandstone), and a blind arch on the back wall. `fill` puts a
  `mughalDoorway` at the back (with a screened window above it where there is room), a jali, or
  nothing. Options add merlons, spandrel rosettes and steps.
- `arcadeSkin(len, h, cells, depth, m, { trim, fill })` and `cellRow`: a row of arched cells
  built as the outer `depth` of a block (method B: the block is built that much shallower and the
  skin set in front, so the footprint does not change). Each cell's back is a small framed door,
  a dim gallery (`'room'`), a jali window, or the bare wall, set per cell.

Applied to:

- **Humayun's Tomb:**
  - 56 plinth cells 1.4 m deep, each with a door at its back;
  - four red-and-white iwans with doors and merlons;
  - smaller iwans on the chamfers (a door below, a screen above).
- **Safdarjung's Tomb:** the gate iwan, the plinth cells and the four buff iwans.
- **Bibi ka Maqbara:** the gate iwan and the four tomb iwans (with merlons).
- **Itmad-ud-Daulah:**
  - three arches a side: a door in the middle, screens either side;
  - the upper pavilion's front as a framed jali.
- **Akbar's Tomb:**
  - the ground-storey cells and a tall iwan in the middle of each side;
  - the white marble iwan of the south gate.
- **Sher Shah Suri:** a screened iwan on every face of both octagonal storeys.
- **Jama Masjid:**
  - iwans on the three gates;
  - the prayer hall's marble iwan;
  - five open arches either side of it, onto the dim hall.
- **Buland Darwaza:** the great iwan cut 6 m into the gate's mass under its half-dome, with the
  doorway and a screened window at its back; screened iwans on the wings.
- **Bara Imambara:**
  - the ranges' two tiers of cells: open arcades below, screened windows above;
  - the gateway iwan, with the string course stopping either side of it.
- **Chota Imambara:** the gate iwan, and the hall's seven arches (the middle one the door, the
  rest screened).
- **Rumi Darwaza:** a jali in a moulded ring under the hood, and cells with doors in the wings.
- **Qutb Shahi tombs:** low cells round each terrace, the chamber's arcade opening on its gallery,
  and the mosque's arcade.
- **Gol Gumbaz:**
  - the great blind arch on each face with a doorway and a screened window at its foot;
  - screened arches either side;
  - the gallery of small arches along the top.
- **Hazratbal:** screened arched windows all round the hall, and the door in the middle of the
  front.
- **Charminar:** both galleries now open onto the dim galleries behind them (the detail module's
  rings moved to the new faces).

Cost: each of these monuments now has 8,000–70,000 more triangles than before. Qutb Shahi is the
largest at about 140,000, for its seven tombs, so every one is within the 200,000 budget.

**Phase 3: forts and gates (11 forts). Done.**
`fortGate(w, h, d, aw, ah, opts)` in `js/details/forts.js` is a gatehouse with a real arched
passage through it:

- **Passage:**
  - its arch is cut through the block (method B), and it has a paved floor;
  - a guard niche is cut into each side wall, in front of and behind the doors;
  - the great timber leaves at its middle carry rows of iron spikes against war elephants, and
    stand open inward so their spiked faces show;
  - mouldings ring both mouths.
- **Options:**
  - `iwan` puts a deep recess with a half-dome at the front, opening onto the passage at its back;
  - `through: false` ends the passage at a dim inner doorway;
  - `towers` adds a round or polygonal tower at each front corner, domed or crenellated;
  - `crest` adds merlons; `ramp` adds a slope up to the sill.
- `doorLeaves` gained `inward` and `spikes`.

Each fort's own wall is opened where its gate stands:

- **Red Fort:** the Lahori Gate's passage runs through the gatehouse behind a 4 m iwan, between
  its octagonal towers.
- **Agra Fort:** the Amar Singh Gate gets an iwan and a passage; the curved wall is built in two
  pieces either side of it.
- **Golconda:** the Fateh Darwaza, with towers, moves into a stretch of outer town wall on the
  plain below the hill. The old arch stood on the hill's slope, where the hill and the inner ring
  wall filled it.
- **Amber:** the Ganesh Pol leads from the Jaleb Chowk through to the palace court.
- **Chittorgarh:** a Ram Pol with domed towers in the ring wall round the mesa.
- **Mehrangarh:** a gatehouse against the walls between two bastions, its passage ending at the
  inner door.
- **Gwalior:** the Hathi Pol at the east end of Man Mandir, with domed towers and a stone elephant
  either side.
- **Jaisalmer:** the Akhey Pol takes the place of three walls and bastions in the ring.
- **Daulatabad:** a towered gate in the outer walls.
- **Bekal:** a towered gate at the neck, joined to the neck walls, with a baffle wall inside that
  makes the way in a zigzag.
- **Fort Aguada:** a round-arched Portuguese gate in the landward wall.

Not done: zigzag ramps climbing the hills to the hill forts' gates.

**Phase 4: hand-built temples, one at a time.** Each needs its own porch and door:
- **Kandariya Mahadeva:** the `box(10, 6, 6)` porch becomes an open porch with a *makara* arch.
- **Konark:** doors on three sides of the hall.
- **Kedarnath:** a front porch.
- **Brihadeeswara, Shore Temple, Kailasa:** sanctum doors flanked by guardian figures.
- **Chennakesava:** star-plan doorways with a lintel.
- **Dilwara, Ranakpur:** columned entrance halls.
- **Ramappa, Vittala, Jagannath, Kamakhya, Mahabodhi:** porch and doorway.
- **Golden Temple:** the Darshani Deori gate on the causeway.
- **The monasteries:** a painted door under a curtain and a pillared porch.

**Phase 5: colonial and Indo-Saracenic.** Victoria Memorial, CSMT, Mysore Palace, Laxmi Vilas,
Cooch Behar Palace, Bom Jesus, Cellular Jail: `classicalDoor` and `porch`. CSMT gets a Gothic
pointed door with tracery. Bom Jesus gets its Baroque portal.

## 5. Reusing the detail parts

### What there is to reuse

| Source | Part (today) | Becomes (shared, in `components.js`) |
| --- | --- | --- |
| Taj Mahal | `pishtaq()` | `iwan({ w, h, depth, frame, body, trim })`: niche, half-dome, rings, door, transom, relief frame, guldastas, merlons |
| Taj Mahal | `alcoves()` | `alcoveStack({ w, storeys, jali })` |
| Taj Mahal | `guldasta()` | `pinnacle(h, r, m)` (named to avoid the Lucknow `guldasta` in `helpers.js`) |
| Taj Mahal | `parapet()` | `merlonParapet(outline, m)` for any square, chamfered or polygonal roof |
| Taj Mahal | `tajMinaret()` | `mughalMinaret({ h, r, balconies, top: 'chhatri', m })` |
| Taj Mahal | plinth arcade | `blindArcade(len, n, m)` |
| Charminar | `charminarMinaret()` | `deccanMinaret({ flutes, balconies, windows, petals })` |
| Charminar, Gateway | `arcadeScreen`, `railingRing`, `clockFace`, `chhajja`, `bracketGeo` | already shared |
| Gateway of India | `gatewayTurret()`, `spandrels()` | `octTurret({ r, h, balcony, kiosk })`, `spandrelScreen()` |
| Old Parliament | column bases and capitals, the eave, the jali, screened windows, `porch()` | `colonnade({ path: ring or line, n, order })`, `eaveWithBrackets(path)`, `screenedWindows(path, n)`, `porch(opts)` |
| India Gate | `lettering`, `sunburst`, `dentils`, `keystone`, `archRing` | already shared; add more letters to `GLYPHS` as inscriptions need them |

Two changes make this reuse work:

- **Palette:** each part takes `{ body, trim, carve, screen, dark, metal }` instead of the hard-coded
  `MB`, `STUCCO`, `CARVE` and `CREAM` constants in the detail files. Humayun's Tomb can then pass red
  sandstone with white trim, and Bibi ka Maqbara white plaster with a marble dome.
- **Paths:** colonnades, eaves, railings and merlon parapets take a path (a line, a rectangle, a
  chamfered square or a circle), so one function serves a round Parliament and a rectangular
  Rashtrapati Bhavan.

### Mughal family: parts from the Taj

| Monument | Parts to apply |
| --- | --- |
| Bibi ka Maqbara | Almost the Taj set as it is: `iwan`, `alcoveStack`, `mughalMinaret`, `mughalChhatri`, `lotusDome`, `crescentFinial`, `merlonParapet`, `blindArcade` (plaster body, marble dome) |
| Humayun's Tomb | `iwan` in red with white trim, `mughalChhatri` in red and white, `merlonParapet`, `blindArcade` cells on the plinth, a stacked-bulb finial |
| Safdarjung's Tomb | `iwan`, `octTurret` corner towers with kiosks, `merlonParapet`, `lotusDome` crown |
| Itmad-ud-Daulah | `alcoveStack` with jali, short `mughalMinaret`s with kiosks, `merlonParapet` |
| Akbar's Tomb | `mughalMinaret` ×4 on the gate, `iwan`, rows of `mughalChhatri` on the terraces |
| Jama Masjid | `mughalMinaret` with balconies, the central `iwan`, `lotusDome` crowns, `merlonParapet` along the courtyard walls, `steps` |
| Buland Darwaza | A 40 m `iwan` with its half-dome, a row of `mughalChhatri` along the top, `merlonParapet`, `steps` |
| Red Fort, Agra Fort | Gate `iwan`s, `mughalChhatri` on the gates and bastions, `merlonParapet` along the walls, jharokha balconies |
| Panch Mahal, Sher Shah Suri | `mughalChhatri` (a whole storey of them for Panch Mahal), `lotusDome` |
| Qutb Shahi tombs, Gol Gumbaz, Golconda | `petalRing` cups at the dome bases (as at Charminar), `deccanMinaret`, `arcadeScreen` parapets, `merlons` |
| Bara Imambara, Chota Imambara, Rumi Darwaza | `iwan`/`niche`, `arcadeScreen`, `merlonParapet`, the existing Lucknow `guldasta` |

### Delhi and Lutyens: parts from the Old Parliament House and India Gate

| Monument | Parts to apply |
| --- | --- |
| Rashtrapati Bhavan | `colonnade` along the Durbar Hall portico and wings, with a new "Delhi Order" capital (Lutyens's bells); `eaveWithBrackets` along the long chhajja; jali `railing` on the roof and a `railingRing` round the dome's drum (the Sanchi rail); `mughalChhatri` with a plain spike for the roof kiosks; `screenedWindows`; `steps` and `porch` |
| New Parliament House | jali `railing` panels on the facades, `colonnade` at the entrances, `porch`, `screenedWindows` |
| National War Memorial | `lettering` at small size, or the existing incised-names surface, on the concentric walls |
| India Gate canopy | done |
| Lutyens bungalows and other civic buildings, if added later | the same `colonnade`, `eaveWithBrackets`, `railing` and `classicalDoor` |

### Other families

| Family | Source | Monuments |
| --- | --- | --- |
| Indo-Saracenic | Gateway of India: `octTurret`, `spandrelScreen`, eaves, attic arcade | Mysore Palace, Laxmi Vilas Palace, Victoria Memorial (corner kiosks), CSMT (with `clockFace` on its tower) |
| Rajput | a new `jharokha` (a bracketed balcony with a curved *bangaldar* roof) from `bracketGeo`, `chhajja` and `jali` | Hawa Mahal, City Palace, Amber, Mehrangarh, Jaisalmer, Chittorgarh; with `merlons` on the walls and `mughalChhatri` |
| Temples | `petalRing` and `lotusDome` for amalakas and lotus ceilings; `railing` for verandah rails; `templeDoorway` | all Nagara, Kalinga, Maru-Gurjara and Jain temples |
| Buddhist | `railingRing` for the vedika round a stupa; the existing `torana` | Sanchi, Dhamek, Mahabodhi |

## 6. Order of work and checks

| Phase | Work | Monuments improved |
| --- | --- | --- |
| 0 | Doorway kit; promote `iwan`, `mughalMinaret`, `pinnacle`, `merlonParapet`, `octTurret`, `colonnade`, `porch` into `components.js` with palettes and paths (no visual change to the five finished monuments) | foundation |
| 1 | `nagaraTemple`, `gopuram`, `mandap` | ~20 |
| 2 | Mughal family: doors and reuse together | ~20 |
| 3 | Forts and gates | ~11 |
| 4 | Delhi/Lutyens and Indo-Saracenic reuse | ~8 |
| 5 | Hand-built temples, then Rajput, colonial, Buddhist | the rest |

Each phase is done when:
- all 101 monuments still build;
- each changed monument is rendered from the default view, a close view of its entrance and a
  street-level view, and compared with the render from before the change;
- there is no flicker, since every detail stands 1–3 cm off the surface it decorates;
- each monument stays under about 200,000 triangles and a few dozen draw calls after merging;
- night mode shows nothing broken.

The headless render script used for this work can live in `tools/` so these checks can be
re-run.
