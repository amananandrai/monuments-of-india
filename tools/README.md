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

With no ids, a check runs over all 101 monuments.

Reading a flicker report: the overlap is measured on bounding boxes, so a large diagonal face can be
over-counted, and a face hidden behind an open-backed part can slip through the visibility test. Three
reports are known false alarms: Ajanta's band ends, the Golden Temple ranges' backs and Vivekananda's
diagonal faces. Look at a clash in the browser (the `near` point) before fixing it. The usual fixes:
lift an overlay 2 to 5 cm off its face, stop a band 2 cm short of the face above it, or give the
overlay's material a depth offset (as `M.recess` in `js/helpers.js` has).
