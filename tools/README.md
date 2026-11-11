# Model checks

Headless checks for the monuments, run from this folder. They build each model in Chromium exactly as
the site's modules do, with three.js taken from `node_modules` instead of the CDN; nothing is written
to the repository.

```bash
npm install
npx playwright install chromium   # once, if Playwright has no browser yet
```

| Command | What it checks |
| --- | --- |
| `node check-budgets.mjs [id ...] [--top N]` | Triangles at both detail levels against the budgets in `js/detail.js` (600k on desktops, 300k on phones), counted before the trees are filled in. Exits 1 if any monument is over. |
| `node check-flicker.mjs [id ...] [--min m²] [--same]` | Faces that z-fight: two triangles of different materials in one plane, facing the same way, overlapping, with no depth offset, that can be seen. Lists each clash with its materials, the direction it faces and a point on it. Exits 1 if any is found. |
| `node check-heights.mjs [id ...]` | Each model's height against the real figure in its `refs` (`js/data.js`): up to 15% over (spires and flags) and 5% under. A building on a hill gives `refs.base`; `refs.top: 'rock'` compares the hill's height (the module's exported `H`). Exits 1 if any is out. |
| `node check-filters.mjs [--list]` | That every monument falls into at least one style group and one material group of the sidebar's filters (`js/filters.js`). Lists each group's size (and its monuments, with `--list`). Runs in Node, without a browser. Exits 1 if any monument is left out. |
| `node check-detail.mjs [id ...] [--top N] [--level high\|low] [--json file] [--against file]` | How finely each monument is modelled, coarsest first: triangles in the building, the area of its upright faces, triangles per m² of them, the size of an average piece of wall, and the share of wall in large plain faces (2 m² or more). A worklist, not a test. `--against detail-baseline.json` adds the change since the detail work began. |
| `node shoot-views.mjs [id ...] [--size WxH] [--view x,y,z] [--zoom z] [--target x,y,z] [--out dir]` | Renders each monument's home view to `tools/views/<id>.png` (git-ignored), to compare with reference photographs. The options override the builder's preset, to try a new one. |
| `node shoot-views.mjs --site [id ...] [--size WxH] [--night] [--back] [--level high\|low] [--out dir]` | Pictures from the site itself, with its shadows, surfaces, haze and trees: the home view (`<id>-site.png`), a close view (`<id>-site-close.png`) and, with `--back`, the opposite side. Shoot into `--out views/before` ahead of a change and `views/after` behind it. Slow: 20 to 60 seconds a monument. |
| `node probe-top.mjs id ...` | Lists the topmost meshes of each monument (top, bottom, width, colour, geometry), to find what makes a model too tall. |

With no ids, a check runs over all 101 monuments.

Reading a flicker report: the site itself separates clashing faces at load (`separateCoplanar` and
`separateMerged` in `js/coplanar.js`), and the check runs the same passes, so it reports only what
those cannot fix (for example two parts of one merged mesh). The overlap is measured on bounding
boxes, so a large diagonal face can be over-counted. Look at a clash in the browser (the `near`
point) before fixing it. The usual fixes: lift an overlay 2 to 5 cm off its face, or stop a band 2 cm
short of the face above it.
