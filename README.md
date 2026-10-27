# Monuments of India

**Live site: https://monuments-of-india-nu.vercel.app**

Seventy-one Indian landmarks modelled in interactive 3D with [three.js](https://threejs.org/):

Qutub Minar · Gateway of India · Taj Mahal · Charminar · Ram Mandir · Brihadeeswara Temple · India Gate · Statue of Unity · Howrah Bridge · Jagannath Puri Temple · Golden Temple · Hawa Mahal · Konark Sun Temple · Meenakshi Temple · Lotus Temple · Gol Gumbaz · Mysore Palace · Sanchi Stupa · Mahabodhi Temple · Red Fort · Old Parliament House · Rashtrapati Bhavan · Humayun’s Tomb · Jama Masjid · New Parliament House · Dilwara Temples · Swaminarayan Akshardham · Kandariya Mahadeva Temple · Ranakpur Jain Temple · Chennakesava Temple · Victoria Memorial · Chhatrapati Shivaji Maharaj Terminus · Kailasa Temple, Ellora · Vittala Temple, Hampi · Padmanabhaswamy Temple · Basilica of Bom Jesus · Kamakhya Temple · Tawang Monastery · Amber Fort · Rani ki Vav · Ramappa Temple · Kedarnath Temple · Hazratbal Shrine · Shore Temple · Gwalior Fort · Nalanda Mahavihara · Tirumala Venkateswara Temple · Capitol Complex, Chandigarh · Hidimba Devi Temple · Bandra–Worli Sea Link · Buland Darwaza · Panch Mahal · Bara Imambara · Rumi Darwaza · Chota Imambara · Itmad-ud-Daulah’s Tomb · Akbar’s Tomb · Agra Fort · Bibi Ka Maqbara · Safdarjung’s Tomb · Somnath · Mallikarjuna · Mahakaleshwar · Omkareshwar · Bhimashankar · Kashi Vishwanath · Trimbakeshwar · Baidyanath · Nageshwar · Ramanathaswamy · Grishneshwar

The site opens on a map of India with a pin for every monument; numbered pins group nearby monuments and zoom in when selected. Pick a pin, or search the list grouped by state, to open its 3D model.

Every model is built procedurally from primitives at roughly real-world proportions, so there are no model files to download. Drag to orbit, scroll or pinch to zoom, and use ← → to switch monuments. Link to one directly with a hash, e.g. `#taj-mahal`.

## Map data

State boundaries and India's outline come from [Natural Earth](https://www.naturalearthdata.com) (public domain), using its India point-of-view boundaries, simplified into `js/india-map.js`.

## Run locally

It is a static site with no build step: `index.html`, `css/style.css` and ES modules in `js/` (one file per monument in `js/monuments/`), with three.js loaded from a CDN. Serve the folder with any static server:

```bash
npx serve .
```

## Deploy

Hosted on Vercel at https://monuments-of-india-nu.vercel.app as a static site with no build step. Every push to `main` deploys to production.
