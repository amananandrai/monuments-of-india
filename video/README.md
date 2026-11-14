# Monuments of India: the video

A documentary journey across India through all 101 monuments from the website, about an hour long (57 min with the `aditya` voice) (1920×1080 at 30 fps), made with [HyperFrames](https://hyperframes.heygen.com): HTML rendered to MP4 frame by frame.

Each monument gets one slot, timed to its narration:

1. **The map flight.** A 3D map of India's states. The route draws itself from the last monument to this one while the narrator says where we are heading, then the camera dives onto the exact spot like a drone. A caption names the state and the route.
2. **The orbit.** The drone comes down out of the sky over the site's own 3D model (procedural sky, land, water, trees and ground scatter) and sweeps slowly round it while the narrator tells its story. The title card shows its name in English and its own script, category, UNESCO status, place, dates, style, material, key facts and a mini map.
3. **The details.** Two telephoto close-ups, of its crown (domes, spires, chhatris) and of its base (pillars, arches, carving), while the narrator describes them.

The film opens from black, dips to black between monuments, and closes on black. An ambient score runs under the voice.

## Narration

The script is hand-written in [`narration/narrations.json`](narration/narrations.json): for each monument a `travel` line (over the map), a `story` (over the orbit) and `details` (over the close-ups). It draws on the facts in `js/data.js` and adds well-documented history: who built it, how long it took, and what to look for.

It is voiced by [Sarvam AI](https://www.sarvam.ai/) text-to-speech (Bulbul v3, Indian English, the `aditya` voice). [`narration/pronounce.json`](narration/pronounce.json) respells names the voice should say a particular way, and years are spoken as a narrator reads them ("sixteen thirty-two").

```bash
# from the repository root; needs SARVAM_API_KEY in .env, and ffmpeg
node tools/generate-narration.mjs                      # voice what changed, rebuild the timeline
node tools/generate-narration.mjs --voice ritu         # another Bulbul v3 speaker
node tools/generate-narration.mjs --sample taj-mahal   # one monument in several voices, to compare
```

To make sure the voice runs smoothly, with no stutters, repeated or skipped words, odd pauses or clipping, every line can be checked. Each clip is transcribed back with Sarvam speech-to-text and compared word by word with the script, and ffmpeg listens for pauses and clipping. Failed lines are marked for a fresh take (`narration/retakes.json`), and the generator voices them again:

```bash
node tools/check-narration.mjs --retake     # report in narration/check-report.json (git-ignored)
node tools/generate-narration.mjs           # voice the new takes and re-mix
```

The generator writes `narration/timing.json` (every slot and shot, in seconds) and `assets/audio/narration-master.mp3`. Each line is voiced separately, so every shot starts when its line does. The slots follow the voice at its natural pace, with a pause between lines. Only if the film would run past an hour and a half is the voice re-rendered a little faster to fit. Voiced clips are cached by their text in `assets/audio/narration/` (git-ignored), so editing one line only re-voices that line.

## Render the video locally

The repository holds everything that makes the film (the script, the timeline, the compositions and the code), but not the media made from them. The voiced narration, the background score and the rendered MP4 are made on your machine and are git-ignored.

### 1. What you need

- **Node.js 22 or newer** and **npm**.
- **FFmpeg** (with `ffprobe`) on your `PATH`. The narration tools and the renderer both use it. Check with `ffmpeg -version`.
- **Chrome**, which HyperFrames uses to render each frame headless. Run `npx hyperframes@0.8.210 doctor` from `video/` to check your setup. `npx hyperframes@0.8.210 browser` manages the Chrome it renders with.
- **A [Sarvam AI](https://dashboard.sarvam.ai/) API key**, to voice the narration. Without one the film still renders, but silently.
- About **2 GB of free disk** and plenty of time: the film is about an hour of 1920×1080 at 30 fps, roughly 100,000 frames of 3D. On a typical laptop a full render takes several hours. A machine with a discrete GPU is much faster.

### 2. Install

```bash
git clone https://github.com/amananandrai/monuments-of-india.git
cd monuments-of-india/video
npm install
```

### 3. Voice the narration

Put your Sarvam key in a file named `.env` at the **repository root** (it is git-ignored):

```bash
SARVAM_API_KEY=your-key-here
```

Then, from the repository root:

```bash
node tools/generate-narration.mjs
```

This voices the 303 lines (about 10 to 15 minutes, a few thousand characters per monument), writes `video/assets/audio/narration-master.mp3` and refreshes `video/narration/timing.json`. Takes listed in `video/narration/retakes.json` are voiced as those takes. Optionally, check every line for stutters or skipped words; this re-voices any that fail (it uses Sarvam speech-to-text, about one call per line):

```bash
node tools/check-narration.mjs --retake
node tools/generate-narration.mjs
```

### 4. Add a background score (optional)

Put any music you have the rights to at `video/assets/audio/monuments-theme.mp3`. It loops under the voice at low volume, fading in and out. Without it, the film has narration only.

### 5. Preview, then render

From `video/`:

```bash
npm run dev       # the HyperFrames preview in your browser, to scrub through the film
npm run check     # lint, timing and layout checks
npx hyperframes@0.8.210 snapshot --at 10,40,90   # a few stills, to look at before a long render
npm run render    # the whole film -> video/renders/monuments-of-india.mp4
```

Every script runs `npm run sync` first. It copies in the site's models, textures and fonts and regenerates the compositions from the timeline, and it reports any missing sound file. `npm run render` uses all your CPU cores by default. Add `--workers 2` to the render command in `package.json` to leave some free.

## Files

- `narration/`: the script, the pronunciation list, the takes chosen after checking, and the generated timeline.
- `../tools/generate-narration.mjs`, `../tools/check-narration.mjs`, `../tools/lib/narration.mjs`: voicing, timing and checking the narration with Sarvam AI.
- `sync-site.mjs`: copies the site's models, textures and fonts in, and writes `compositions/timing.js`, the title cards, the dips and `index.html` from the timeline. Run by every npm script.
- `compositions/tour.js`, `tour.html`: the 3D map flight, the orbit and the close-ups, drawn from timeline time alone.
- `compositions/titles-01.html` … `titles-11.html`: journey captions, title and facts cards and name tags, ten monuments per file (generated).
- `compositions/dips.html`: the dips to black (generated).
- `index.html`: mounts the score and the narration (when present), the tour, the titles and the dips (generated).
- `assets/audio/` (git-ignored, made locally): `narration-master.mp3` (the voice), `narration/` (the clip cache) and your `monuments-theme.mp3` (the score).
