# Monuments of India

**Live site: https://monuments-of-india-nu.vercel.app**

Ten Indian landmarks modelled in interactive 3D with [three.js](https://threejs.org/):

Qutub Minar · Gateway of India · Taj Mahal · Charminar · Ram Mandir · Brihadeeswara Temple · India Gate · Statue of Unity · Howrah Bridge · Jagannath Puri Temple

Every model is built procedurally from primitives at roughly real-world proportions, so there are no model files to download. Drag to orbit, scroll or pinch to zoom, and use ← → to switch monuments. Link to one directly with a hash, e.g. `#taj-mahal`.

## Run locally

It is a single static `index.html` with three.js loaded from a CDN. Serve the folder with any static server:

```bash
npx serve .
```

## Deploy

Hosted on Vercel at https://monuments-of-india-nu.vercel.app as a static site with no build step. Every push to `main` deploys to production.
