# The Giving Roof

Group 11A student concept site for SJI International (2026 IB Collaborative Science Project).
Not an approved campus design and not the school's official website.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + static build into dist/
npm run preview    # serve the built site
```

`dist/` is a plain static site and can be hosted anywhere (no server, keys or paid services).

## Where things live

- `src/three/` 3D concept model (procedural Three.js via @react-three/fiber)
  - `layout.ts` model dimensions, `cameraTargets.ts` named camera states, `routes.ts` pipe/cable paths
  - `Campus.tsx` façade, arches, dome; `RoofWing.tsx` PV, planting, beds; `WaterSystem.tsx` gutter, tank, flushing, overflow, cutaway
- `src/data/` content kept out of components
  - `returns.ts` four returns and panel copy, `hotspots.ts` 3D markers, `research.ts` published facts,
    `calculations.ts` scenario maths, `timeline.ts` phases and dashboard metrics, `sdgs.ts`, `sources.ts`
- `src/motion/` Lenis smooth scroll, GSAP ScrollTrigger reveals, pause-motion handling
- `src/components/` page sections

## Scroll choreography

Chapters in `src/components/Explorer.tsx` (`CHAPTERS`) each set a mode and a named camera from `cameraTargets.ts`.
Add or retune camera moves there; the intro chapter drives a continuous façade-to-roof lerp.

## Images

- `01_campus_hero.png` hero + loader preload
- `02_system_axometric.png` 3D loading poster, static fallback, close-up card 3
- `03_roof_detail.png` close-up card 1 (roots / solar)
- `04_rainwater_detail.png` close-up card 2 (rain)
- Academic poster: poster viewer with magnifier
- SJI crest/wordmark: supplied PNG, unmodified, header/footer/loader
