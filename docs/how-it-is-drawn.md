# How it is drawn

How the site turns code into stone, light and landscape: what happens when a monument is opened,
how its surfaces, water, sculpture and setting are made, and what changes between desktops and
phones.

[README](../README.md) · [Architecture](architecture.md) · [The setting](setting.md) · [Components](components.md) · [Project structure](project-structure.md) · [States and monuments](../monuments.md)

## Contents

- [From a click to a picture](#from-a-click-to-a-picture)
- [Stone, brick and earth](#stone-brick-and-earth) · [Water](#water) · [Landscape and sky](#landscape-and-sky)
- [Sculpture](#sculpture) · [Fine detail and entrances](#fine-detail-and-entrances) · [The setting](#the-setting)
- [Light, day and night](#light-day-and-night) · [The camera](#the-camera)
- [Budgets and loading](#budgets-and-loading) · [No flicker](#no-flicker) · [Desktops and phones](#desktops-and-phones)

## From a click to a picture

The map needs only the list of monuments (`js/data.js`). When a monument is opened, `js/main.js`
runs these steps, showing each one in the loading bar:

| Step | What happens | Where |
| --- | --- | --- |
| Fetch | The monument's two modules are imported, and whichever shared parts they use | `load()` in `js/data.js` |
| Build | The builder runs and returns `{ group, focus, view, … }` | `js/monuments/<id>.js`, `js/details/<id>.js` |
| Plant | On desktops: grass tufts and stones on open ground, then fuller trees, for as long as the model stays under the planting budget | `scatterGround`, `upgradeTrees` in `js/parts/realism.js` |
| Colour | Rocks, hills and tree crowns are rebuilt smoother and sculpted with noise | `js/naturalize.js` |
| Depth | Faces that share a plane are given depth offsets | `js/coplanar.js` |
| Land | Lawns and pavements fade into the open land; seas and long rivers run to the horizon | `js/landscape.js` |
| Frame | The box the home view frames is measured: the building, not its gardens | `js/framing.js` |
| Batch | A model of very many parts (`batch: true`) is merged into a few draw calls | `js/batch.js` |

The built model is cached. Only the last few opened are kept (four on desktops, two on phones);
an older one is freed and rebuilt if opened again.

## Stone, brick and earth

Surfaces are generated in the shader from world position (`js/surface.js`): masonry with block
joints, marble veining, brick courses, rock, earth, paving, carved friezes, incised names, pierced
jali screens and glazed tiles, each with bump, weathering (grime and damp at the foot of walls,
rain streaks, patches of soot and age) and a slight per-piece tint. Nothing depends on how a
model's geometry was built, so a 1 m block is the same size everywhere.

Most stones also carry CC0 photo detail (`js/textures.js`), projected triplanar and tinted to
each model's own colour, with the photo's normal and roughness maps on desktops, so the stone
catches the light as a rough surface. There are ten sets: marble, sandstone, plaster, granite,
rock, laterite, blocks, rubble, concrete and timber. Each is fetched the first time a monument
that uses it is opened.

Special surfaces cost no triangles either: bronze cast in plates (the Statue of Unity), granite
blocks whose joints show (Thiruvalluvar), sheet copper with verdigris, gilded sheet, thin
terracotta brick and moulded plaques, the fish-scale bed of a Mughal cascade, and the marble
cladding of the Lotus Temple. They are listed in [Architecture: Surfaces](architecture.md#surfaces).

## Water

Seas, rivers, lakes and pools have their own colours and moving ripples (`M.sea`, `M.river`,
`M.lake`, `M.water`). On desktops the largest sheet of water reflects the monument: the scene is
drawn once more from a mirrored camera into a texture that the water's shader reads.

## Landscape and sky

A sky with haze, distant hills, the sun and drifting clouds by day, and stars by night. The land
runs out to the horizon. Each monument's lawns and pavements fade into it at their open edges, and
seas and long rivers carry on to the horizon (`js/landscape.js`). Where a site's outer ground is
natural (a lawn, a meadow, a forested or rocky hill), the open land round it takes that colour
(`siteLand`), so a green site does not end on a sandy plain; paved and sandy sites keep the sandy
land. A haze in the horizon's colour thickens with distance, so far hills fade as they do in a
photograph.

Hills, ridges and mountain rings are single height-field meshes coloured by height and slope
(`js/parts/terrain.js`): see [The setting: Hills and mountains](setting.md#hills-and-mountains).

## Sculpture

The statues and temple animals are each sculpted as one continuous skin from a signed distance
field and meshed in the browser (`js/sdf.js`, `js/parts/figures.js`, `js/parts/animals.js`), so
limbs grow out of bodies as in a carving. Every statue is pictured in
[Components: Statues](components.md#statues).

- **How a figure is made.** A figure is a function giving the distance from any point to its
  surface, built from ellipsoids and tapered capsules joined with a smooth minimum. Surface nets
  turn it into a mesh once, and every copy shares it. Crevices are darkened and ridges rubbed pale
  in vertex colours baked from the same field.
- **Detail where it shows.** A head, a hand or a foot is meshed on its own grid, three to four
  times finer than the body's, inside an ellipsoid that crosses the neck or wrist without a seam.
  On desktops the life-size statues have heads on 3 mm cells and fists on 3.5 mm, and bodies fine
  enough for folds of cloth to hold. The caps that would close each part
  inside the body are dropped, which saves a tenth to a fifth of the triangles.
- **Things laid on the skin.** Creepers, hems, curls, threads and leaves are moved onto the skin
  with `snap()` and `skinMatrix()` rather than placed by hand, so they never float.
- **Portraits.** The portrait statues get their sitters' features through options of one shared
  face: Patel's heavy brow and set mouth, Netaji's round face behind his spectacles, Shivaji's
  combed beard and upswept moustache.
- **The great statues.** Patel in dhoti, kurta and shawl (182 m, bronze plates); Bahubali with
  creepers up his legs and arms; Thiruvalluvar built of granite blocks; the seated Shiva of
  Nageshwar with his trishul, malas and cobra; the Adiyogi bust in black steel; Ramanuja of the
  Statue of Equality, gilt, with joined hands and the tridandam.
- **Modern and colonial statues.** Netaji saluting under the canopy at India Gate; Shivaji on a
  prancing horse at the Gateway of India; Adi Shankaracharya at Kedarnath and the boy Shankara of
  the Statue of Oneness; the Victoria Memorial's Angel of Victory, Queen Victoria and allegories;
  Progress, Commerce and Agriculture on Victoria Terminus; Gajalakshmi on Mysore Palace.
- **Animals.** Nandis, elephants plain and dressed, Konark's war horses, temple lions, the Lion
  Capital, the couchant lion and tiger, the Kangla Sha.

Twelve monuments whose subject is sculpture may build to a million triangles on desktops
(`STATUES` in `js/detail.js`) and spend the difference on their statues. On phones the great
statues are meshed on coarser cells and the colonial allegories are the light kit's robed figures.
On larger screens the slowest figures are meshed while the map sits idle (`js/warmup.js`), so
their monuments open quickly.

## Fine detail and entrances

Every monument carries a second layer of architectural detail from `js/details/`: base mouldings,
image niches and amalakas on the temples; banded and slit bastions and jharokhas on the forts;
stacked iwans, inlaid stars and calligraphy on the Mughal tombs; capitals, balustrades and eaves
on the colonial buildings; pinnacles, rose windows and buttresses on the churches; the Dharma
wheel and victory banners on the monasteries. Sculpture is modelled rather than blocked in: carved
figures and elephants in the temple friezes and on the gopurams, kutas and shalas on the vimanas,
yali pillars at Hampi, Corinthian orders and statues on the colonial buildings.

Doors have depth. A doorway is a reveal cut through a surround, with frames stepped one inside
another, leaves standing open onto a dim room, a threshold and shade from above:

- temples: stepped frames with carved jambs, a lamp-lit sanctum, guardians, porches, and real
  passages through the gopurams (`js/parts/doorways.js`, `js/parts/temples.js`);
- Mughal, Nawabi, Qutb Shahi and Deccan buildings: iwans with half-domes and muqarnas, and arcades
  of real arched cells (`js/parts/mughal.js`);
- forts: passages through the gatehouses, with guard niches and leaves spiked against elephants
  (`js/parts/forts.js`);
- churches, colonial and Indo-Saracenic buildings: Gothic portals with crocketed gables, Baroque
  doors, porches of paired columns, sash and two-light windows (`js/parts/colonial.js`);
- monasteries: painted Tibetan doors in pillared porticoes (`js/parts/tibetan.js`).

The parts are shared, and merged or instanced into a few meshes per monument. They are all listed
in [Architecture](architecture.md).

## The setting

Each monument's detail file also adds what stands round it, from a shared kit
(`js/parts/realism.js`, [The setting](setting.md)):

- the trees and shrubs of its region, twenty-one kinds from one planter: neem, banyan, mango,
  ashoka, coconut palms, deodars and cypress avenues; jamun on Delhi's avenues, peepal at Bodh
  Gaya and Sarnath, chinar in Kashmir, poplar and willow in Ladakh, firs in the eastern Himalaya,
  teak and sal in the forests, tamarind in the south, casuarina on the coast, and the small dry
  trees of desert and scrub;
- flags and garlands: the tricolour, the Nishan Sahibs, saffron temple pennants, Tibetan prayer
  flags and marigold strings;
- heritage lamp posts (lit at night), fountains and the blue boards of the Archaeological Survey
  of India;
- boats, launches, ships and houseboats on the water, and stalls outside the temple gates;
- towns and city blocks round the urban sites;
- trains, platforms and airliners at the stations, rail bridges and airports;
- animals: temple elephants, the deer at Sarnath and Sikandra, yaks, camels and ponies.

The ceremonial lawns (India Gate, the Taj, the Victoria Memorial, the National War Memorial, both
Parliaments) stay mown; elsewhere low grass tufts and stones lie on the open ground.

There are no people. Motor traffic runs only on the bridges and on the city streets beside the
stations, airports and town churches, so the monument stays the subject. Everything is instanced,
so a garden of fifty trees costs a few draw calls.

## Light, day and night

One sun casts the shadows, drawn once per monument rather than every frame; a builder may set its
own sun direction. The scene follows the device's dark mode until the Night button is pressed, and
then remembers the choice. At night the sun becomes moonlight, floodlights and festival lights
come on (parts register their lamps with `nightState` in `js/helpers.js`), and stars fill the sky.

On desktops the picture passes through ambient occlusion (GTAO), bloom, SMAA antialiasing and a
gentle warm colour grade (three.js post-processing passes).

## The camera

The home view frames the monument as built (`js/framing.js`), not the lawns, plazas and water
round it. Most builders set the direction of that view (`view`), and some its distance (`zoom`)
and aim (`target`), so that a monument opens on the view of its best-known photograph: the Taj
Mahal down its garden, the Red Fort's Lahori Gate, Meenakshi's south gopuram, Hawa Mahal's street
front. Zooming out stops short of the hills and forests round a monument, so the camera never
enters them.

## Budgets and loading

- **Triangles.** Each monument stays under 800,000 triangles on desktops, 1,000,000 for the twelve
  with large statues, and 300,000 on phones (`budgetFor` in `js/detail.js`). Trees and ground
  cover are planted only up to 650,000, so the rest goes to the architecture.
  `node tools/check-budgets.mjs` checks every model at both levels.
- **Draw calls.** Repeated parts are instanced and carved parts are merged by material. The twelve
  monuments of the most parts (Howrah Bridge, Meenakshi, the Red Fort, the Golden Temple and four
  gurdwaras, Ram Mandir, the Chenab bridge and the two airports) are merged again once built
  (`batch: true`, `js/batch.js`).
- **Code.** Each monument's code is fetched when it is first opened, and that of its neighbours in
  the list (and of whatever the pointer rests on) just before.
- **Heights.** 59 monuments carry their real height, with its source where known, in `refs` in
  `js/data.js`, and `node tools/check-heights.mjs` checks the models against it.

## No flicker

Faces that share a plane get depth offsets when a monument loads (`js/coplanar.js`:
`separateCoplanar`, and `separateMerged` for faces within one merged mesh), and curved walls and
cliffs are built as single continuous bands (`curvedBand`), so surfaces don't shimmer as the
camera moves. `node tools/check-flicker.mjs` runs the same passes and reports what they cannot fix.

## Desktops and phones

| | Desktops and laptops | Phones |
| --- | --- | --- |
| Detail level (`js/detail.js`) | `high` | `low`: a touch screen under 600 px on its shorter side, or 2 GB of memory or less |
| Triangles a monument | up to 800,000 (1,000,000 with statues) | up to 300,000 |
| Trees and ground | fuller trees, grass tufts and stones | plain trees, bare ground |
| Carving and statues | everything | the finest carving thinned, statues on coarser cells |
| Shadow map | 4096 | 2048 |
| Post-processing | ambient occlusion, bloom, SMAA, colour grade | below 760 px wide, ambient occlusion and reflections are skipped |
| Photo textures | diffuse, normal and roughness maps | diffuse only |
| Built models kept | 4 | 2 |

Add `?detail=high` or `?detail=low` to the address to choose a level by hand.
