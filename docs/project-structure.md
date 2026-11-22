# Project structure

Where everything lives, what each file is for, how a monument gets from `js/data.js` to the
screen, and how to add one.

[README](../README.md) · [Project structure](project-structure.md) · [Architecture](architecture.md) · [The setting](setting.md) · [Components](components.md) · [How it is drawn](how-it-is-drawn.md) · [States and monuments](../monuments.md)

## The repository

```text
index.html                 the page: sidebar, map, 3D stage, plaque
css/style.css              all the styling, desktop and phone
js/
  main.js                  the app: scene, lights, sky, loading, camera, list, plaque, routing
  data.js                  the 201 monuments: facts for the map, list and plaque, and how to load each
  builders.js              every builder imported up front, for the film only (kept in step with data.js)
  filters.js               the style and material groups of the sidebar's filter chips
  map.js, india-map.js     the map of India and its pins; the outline and state borders
  detail.js                the detail level (desktop or phone) and the triangle budgets
  helpers.js               primitives, shared stones (M), domes, spires, flags, placing helpers
  surface.js               drawn surfaces: masonry, marble, brick, jali, water… (the shader)
  textures.js              photo textures over the drawn surfaces
  sdf.js                   sculpting with signed distance fields, for statues and animals
  naturalize.js            rebuilds rocks, hills and tree crowns smoother, with noise
  coplanar.js              gives faces that share a plane a depth offset, so they don't flicker
  landscape.js             fades a site's ground into the open land; runs seas to the horizon
  framing.js               the box the home view frames
  batch.js                 merges a model of very many parts into a few draw calls
  warmup.js                meshes the slowest statues while the map sits idle
  parts/                   the shared kit, one file per family
    components.js            mouldings, arches, niches, roundels, eaves, railings, roofs, kiosks
    temples.js               Nagara, Dravida and Kerala temples: spires, vimanas, gopurams, halls
    mughal.js                iwans, muqarnas, doorways and arcades
    forts.js                 gates, ramparts, bastions, machicolations
    colonial.js              classical and Gothic doors, windows, porches, columns: churches, stations, palaces
    doorways.js              temple doorways, door leaves, stairs, Tibetan doors, rock-cut doors
    tibetan.js               monastery halls, windows, roofs, prayer wheels, chortens
    sikh.js                  gurdwara domes, storeys and the Nishan Sahib
    sculpture.js             carved figures, friezes, miniature shrines, classical ornament
    figures.js               the sculpted statues: Patel, Bahubali, Shiva, Netaji, the allegories…
    animals.js               Nandi, elephants, horses, lions, deer, yaks, camels
    realism.js               the setting: trees, shrubs, lamps, flags, boats, stalls, towns, traffic
    transport.js             track, trains, platforms, airliners
    terrain.js               hills, ridges and mountain rings as height fields
  monuments/<id>.js        one file per monument: the masses, and the builder data.js names
  details/<id>.js          one file per monument: finer architecture and the setting
assets/
  views/<id>.png           the home view of each monument (drawn by the screenshot workflow)
  textures/                CC0 photo textures and their normal-and-roughness maps
  blog/                    pictures used by articles about the site
docs/                      the guides, and img/ with a picture of every shared part
monuments.md               all 201 monuments by state, with pictures (generated)
tools/                     headless checks and picture tools (Node and Playwright)
video/                     the HyperFrames film of the first 101 monuments
.github/workflows/         screenshots.yml: redraws a monument's picture when its code changes
```

There is no build step and no bundler. The site is served as it stands; `tools/` and `video/` have
their own `package.json` and are not needed to run it.

## How the code is layered

```text
index.html → js/main.js ─┬─ data.js ── load() ──→ monuments/<id>.js ──→ details/<id>.js
                         │                              │                    │
                         │                              └────── parts/*.js ──┘
                         │                                        │
                         ├─ map.js, filters.js                    └─ helpers.js → surface.js, textures.js, sdf.js, detail.js
                         └─ naturalize, coplanar, landscape, framing, batch, warmup (run on a built model)
```

- A **monument file** imports from `helpers.js`, `parts/` and its own detail file. It never
  imports another monument.
- A **part** imports from `helpers.js` and other parts, never from a monument.
- **`main.js`** is the only file that touches the page; everything else can run headless, which is
  how the checks in `tools/` build every model in Chromium without the site.

## A monument's entry

One object in `MONUMENTS` in `js/data.js`:

| Field | What it is |
| --- | --- |
| `id` | The slug: the file names, the picture's name and the address (`#taj-mahal`) |
| `state`, `place` | Where it is; `state` groups the list and `monuments.md` |
| `lat`, `lng` | Its pin on the map |
| `type` | The pin's colour: `sacred`, `fort` (forts and palaces), `memorial` (tombs and memorials) or `civic` (civic and engineering) |
| `name`, `local`, `lang` | The name in English and in a local script, with that script's language code |
| `built`, `year` | The dates as shown, and one year for the [Historical Atlas of India](https://historical-atlas-of-india.vercel.app): the year it was finished (or begun, where `built` says "from"); negative for BCE |
| `stat` | The headline number on the plaque: `['Height', '73 m']` |
| `style`, `material` | Shown on the plaque, and tested by the filter groups in `js/filters.js` |
| `refs` | The real height in metres (`height`), with `base` for a building on a hill, `top: 'rock'` to compare the hill, and a `source`; checked by `tools/check-heights.mjs` |
| `load`, `fn` | The dynamic import of `js/monuments/<id>.js` and the name of the builder it exports |
| `facts` | Sentences for the plaque |

## Adding a monument

1. **Data.** Add its entry to `js/data.js`. Check that its `style` and `material` fall into a
   filter group (`node tools/check-filters.mjs`), or widen a group in `js/filters.js`.
2. **Masses.** Write `js/monuments/<id>.js`, exporting `build<Name>()`. Work in metres at the real
   size, from plans and photographs; note the sources in a comment at the top. Return
   `{ group, focus, view }`.
3. **Detail and setting.** Write `js/details/<id>.js`, exporting `addDetails(f, g)`: the finer
   architecture on `f`, the trees, town and water on `g`. Build from the shared parts in
   [Architecture](architecture.md) and [The setting](setting.md).
4. **The film's list.** Add the builder's import to `js/builders.js`.
5. **Check.** From `tools/`: `npm run check -- <id>` runs the registry, filter, height, budget and
   flicker checks. Look at it with `node shoot-views.mjs --site <id>`.
6. **Pictures and counts.** `node shoot-views.mjs --size 800x450 --out ../assets/views <id>` and
   `node update-gallery.mjs` (the workflow does both on a push). Update the counts in `README.md`.
7. **Share.** If you wrote a helper that another monument could use, move it to `js/helpers.js` or
   the right file in `js/parts/`, add a row to [Architecture](architecture.md) and an entry to
   `PARTS` in `tools/shoot-components.mjs`, and run that for its picture.

## Conventions

- **Units and axes:** metres, y up, a building's front faces +z.
- **One material, one mesh:** wrap a detail group in `mergeByMaterial`; instance repeats with
  `inst()` or `copies()`.
- **Shared stones:** take a stone from `M` in `js/helpers.js` where one fits (`M.marble`, `M.red`,
  `M.laterite`…); a monument's own colours are constants at the top of its file.
- **No coincident faces:** lift overlays 2 to 5 cm; build curved walls with `curvedBand`.
- **Phones:** put heavy carving behind `!detail.low`; a model must fit 300,000 triangles on `low`.
- **Ground follows one function:** a site on a hill writes `hillY(x, z)` once and stands
  everything on it.
- **Comments say what is modelled and from what:** the real building's parts and dimensions, and
  the sources.

## Automation

`.github/workflows/screenshots.yml` runs on a push to `main`, or a pull request, that changes
`js/monuments/**`, `js/details/**` or `js/data.js`. It redraws the home view of each monument whose
own file changed (`tools/changed-monuments.mjs` maps files to monuments), rewrites `monuments.md`
and commits both. A change to a shared part redraws nothing by itself: run the workflow by hand
(all monuments, or the ids you name) when a shared part changes the look.

Vercel deploys every push to `main` as a static site.
