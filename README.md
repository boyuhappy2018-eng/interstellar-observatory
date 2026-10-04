# INTERSTELLAR — A Relativistic Observatory

An interactive browser experience with a custom WebGL2 Schwarzschild ray integrator, procedural emitting disk, lensed stars, representative null orbits, inertial camera and observatory controls.

## Run

Use the existing pnpm lockfile. `pnpm install`, then `pnpm dev`. `pnpm build` produces the hosted application. The managed environment uses `sites-preview start "$PWD"` instead of a direct dev server.

## Architecture

- `lib/observatory/shaders.ts`: GPU spatial null-ray integration, disk intersections, advected procedural emission, Doppler/redshift and background stars.
- `lib/observatory/engine.ts`: WebGL lifecycle, uniforms, render resolution controller, simulation clock, diagnostics and projected representative trajectories.
- `lib/observatory/camera.ts`: damped orbit/logarithmic zoom/pan, touch/pinch and canonical transitions.
- `lib/observatory/state.ts`: typed parameters, default values, camera presets and Kerr ISCO formula.
- `lib/observatory/science.ts`: scientific definitions and model limitations.
- `app/page.tsx`: observatory interface. The frame loop lives outside React; diagnostics update four times per second.
- `public/software.js`: independent worker-based compatibility renderer, explicitly marked SOFTWARE PREVIEW when no WebGL2 context is available.
- `public/physics.html`: accessible model reference, equations, limits and research sources.

## Interaction

Drag to orbit. Scroll or pinch to zoom. Shift/right-drag to pan. Space pauses time. H enters/leaves a clean cinematic view. Escape returns to the observatory. D toggles diagnostics. The instrument panel contains all optical controls. Disk-side passage is the off-center near-disk viewpoint requested from the visual reference; Polar preserves the full overview. All presets interpolate in the same scene.

## Scientific scope

Read `public/physics.html`. This is Schwarzschild ray geometry combined with a spin-dependent disk, **not** full Kerr ray tracing. The main caveats are finite midpoint integration, a partially transmitting thin disk, heuristic RGB spectral mapping, approximate Doppler geometry, and an illustrative time scale. Rendering controls do not claim numerical astrophysical predictions.

## Verification

`npx tsc --noEmit` checks TypeScript. `scripts/qa/render_shader.py` compiles and renders the shader using a standalone Mesa EGL context (Python moderngl/numpy/Pillow required only for offline QA). It renders cinematic, polar, equatorial, near-horizon and disk-side views. This is not a browser automation substitute: browser UI and controls are separately checked through the managed preview. The cloud test browser has no WebGL2, so browser interaction QA uses the software fallback; hardware-browser GPU frame rates are not claimed as benchmarked.

No external imagery is used. The central scene is generated from ray integration and procedural emission.

## Desktop application

`desktop/` builds an offline Tauri 2 application from the same observatory interface and renderer. macOS Universal DMG and Windows x64 NSIS workflows, an original dark/platinum optical icon, and a signed in-app update controller are included. See [desktop release status and setup](docs/DESKTOP_RELEASE.md). Native installers and end-to-end updates still require execution and verification on macOS/Windows; a successful frontend build is not an installer.

## White-hole extension

The top object selector switches between BH—01 and WH—02. Both share exterior Schwarzschild optics; WH—02 adds explicitly prescribed outgoing radiance, an outward-moving sheet and optically thin emission. No observed white hole or unique predicted appearance is claimed. Spin is only applied to the BH disk. Formula panel (F) provides live geometry, static-observer quantities and causal-structure notes; formulas and constants live in `lib/observatory/formulas.ts`.

`node --experimental-strip-types scripts/qa/check-formulas.mjs` verifies independent reference scales, mass scaling and finite outputs throughout supported radius/mass ranges. Offline shader QA renders both objects at five inclinations/distances including the side passage and close view. Browser QA covers object selection, formula categories, pause, paths and controls using the software fallback.

## Stellar and scientific revision

ST—03 is a 0.1–40 M☉ empirical main-sequence family. `stellar-data.ts` records the Mamajek dwarf table provenance; `stellar.ts` selects monotone anchors, inserts the solar calibration, interpolates radius/temperature and derives luminosity and other quantities. `star-shader.ts` renders the photosphere with limb darkening and procedural cool-star surface structure. `star-software.js` is the explicit compatibility approximation. No stellar-evolution solver or atmosphere spectrum is claimed.

White-hole factory settings enable an explicitly hypothetical prescribed source so its illustrative outgoing field is visible. That source can be switched off; the white-hole causal branch alone does not prescribe a glowing surface. Causal notes distinguish past from future horizons and explain stability limits.

All panel equations use KaTeX with bundled CSS/fonts and strict validation. `check-stellar.mjs` checks 33 formula expressions, the full supported mass range and independent solar reference values. `render_stars.py` compiles the production stellar shader and renders low/high masses at overview and surface distances with Mesa EGL. Music is original midrange sustained harmony; `audio.ts` owns its Web Audio graph and independent volume.

JET enables a prescribed bipolar exterior emissivity integrated along the same curved rays. Sheath/spine structure, knots and Doppler asymmetry are physically motivated, not GRMHD. It is available for black holes and hypothetical white-hole sources, not ordinary main-sequence stars.

## Ellis passage and stellar framing (September 2026)
`wormhole.ts` defines the ultrastatic metric's ray Hamiltonian, RK4 reference and isometric catenoid embedding; `worm-shader.ts` integrates GPU null rays. `worm-software.js` provides a radial lookup compatibility path. Two procedural skies, not a textured tube, form the optical passage. A synchronized embedding overlay labels the moving observer slice. Signed proper distance, physical throat scale, return, pause and look-back are separate controls. Supporting exotic stress-energy, stability and observer aberration are not simulated.

Stellar physical color remains Planck/CIE based with hue-preserving tone compression. The optional temperature contrast mode is expressly nonliteral. Fine cellular granulation is filtered at the limb. Mass/FOV/viewport changes fit the radius to the smaller angular dimension; manual zoom is respected between these events. The scale bar measures kilometres at the centre plane.

Checks: `node scripts/qa/check-wormhole.mjs` validates null constraints, crossings/turning, symmetry, embedding distances and framing; `node scripts/qa/check-stellar.mjs` checks the empirical range and all 40 strict KaTeX expressions. `python3 scripts/qa/render_wormhole.py` and `render_stars.py` compile the actual shaders with EGL and render the parameter/position limits. These are correctness checks, not consumer-GPU performance benchmarks.

## Orientation and teaching views
Each object now has independent in-session settings and factory reset; numeric controls and switches have individual reset actions. White-hole factory illumination is an explicitly prescribed source, not an observational claim. `orientation.ts` applies source-frame rigid rotations consistently to ray origins/directions and annotations; the jet stays aligned with the disk.

`worm-geometry.ts` adds integrated representative null trajectories (crossing, near critical and returning), plus a separate folded-sheet topological comparison. Optical mode shows a labelled geodesic inset; metric embedding shows the trajectories on its surface. The folded view is schematic beyond its local catenoid and intentionally not claimed to be a global isometric embedding. Cinematic playback eases at the throat, smoothly widens FOV and banks the camera. Stellar texture now includes supergranular modulation, faculae and spot penumbral structure.

`check-orientation.mjs` verifies rigid rotation inverses, camera orthonormality and independent factory states. The shader renderer additionally checks tilted jets. Hardware GPU performance is not certified by the software EGL tests.

## Device-adaptive rendering
Quality no longer caps GPU pixel ratio at 1.5. AUTO starts at the display's native pixel ratio and adjusts spatial resolution using asynchronous GPU duration where supported, otherwise frame timing. Per-scene calibration, warmup, percentile windows and asymmetric recovery reduce oscillation and prevent one expensive scene from permanently degrading others. Geometry budgets stay at 320 Schwarzschild / 420 Ellis steps in AUTO/HIGH/ULTRA. HIGH is fixed native resolution; ULTRA requests 1.25× native per axis before render-scale adjustment. Allocations are bounded to 12 MP (16 MP ULTRA) and reported hardware limits. Large or hidden-tab gaps are excluded; hidden tabs stop rendering. On reaching the floor the readout explicitly reports the device limit rather than promising the target FPS.

The optional GPU timer follows EXT_disjoint_timer_query_webgl2, discarding disjoint results; unavailable timing falls back to frame measurements. CPU compatibility is visibly labelled and has its own adaptive pixel budget (approximately 12 FPS target); selecting HIGH/ULTRA cannot enable missing WebGL. Actual pixel dimensions, rendered pixel ratio, ray budget, FPS and GPU timing are shown in Performance. Quality preferences carry across object selection; object factories still reset current settings. Device-specific 60/90 FPS is a target, not a certification.

`node scripts/qa/check-quality.mjs` checks native/Ultra sizes, bounds, adaptive reduction/recovery, scene isolation and asynchronous query behavior.

## Magnetar and pulsar observatories

MG—05 and PS—06 are a neutron-star family, with independently retained parameters and factory settings. The renderer uses a ray-evaluated procedural crust and optically thin volume emission. Magnetars show 90 twisted closed field curves, current bundles, crustal fractures and a prescribed flare; pulsars use 30 closed curves plus 24 high-L polar segments and rotating cones. The polar segments are a truncated near-zone illustration, not a global open-field solution. Geometry is cached; phase and charge packets animate in shaders. AUTO uses the existing adaptive controller and asynchronous GPU timing for both passes. An explicitly identified Canvas compatibility view shares the same field geometry and axis transforms, with reduced surface/beam modeling; its backing resolution also follows adaptive quality.

The closed near-zone dipole relation is `r = L sin²θ`. A prescribed azimuthal twist deforms magnetar lines; this is not a force-free or MHD solution. Field lines are invisible in nature: emissive lines, advected packets, surface colors, cone brightness and the manually triggered five-second flare are pedagogical enhancements. The flare expands at an illustrative rate, not a measured propagation speed. Radio/high-energy beam geometry is represented by two cones about the magnetic axis. The observer signal is a normalized Gaussian angular response, not a predicted observed flux or measured pulse profile. A rotating source can remain continuously bright while its observer signal pulses. Magnetar and pulsar observational behavior can overlap; these presets are not mutually exclusive physical species.

Physical quantities use SI internally: 1 gauss = 10⁻⁴ tesla; Ω = 2π/P; R_LC = cP/(2π); compactness = 2GM/(Rc²); z = (1 − compactness)⁻¹/² − 1; u_B = B²/(2μ₀). Displayed radius is R★, with a kilometer scale at center distance. Physical spin period and displayed playback factor are separated. Changing spin period changes the phase derivative continuously, not phase itself. The supported 0.02–2 s pulsar and 2–12 s magnetar range keeps the displayed closed shells (≤8.8 R★) inside the light cylinder. Millisecond pulsars, outer winds, open-field topology near the light cylinder, relativistic ray transfer and equation-of-state inference are outside this model.

Research: NASA/Goddard [Neutron Stars](https://imagine.gsfc.nasa.gov/science/objects/neutron_stars1.html), NASA [Pulsar in a Box](https://www.nasa.gov/universe/pulsar-in-a-box-reveals-surprising-picture-of-a-neutron-stars-surroundings/), NASA [magnetar polarization and crust](https://www.nasa.gov/centers-and-facilities/marshall/nasas-ixpe-finds-powerful-magnetic-fields-and-solid-crust-at-neutron-star/).

Validation: `node scripts/qa/check-neutron.mjs` checks surface endpoints, dipole geometry, range safety, light-cylinder bounds, axis normalization, pulse alignment and 47 strict KaTeX expressions. `python3 scripts/qa/render_neutron.py` consumes that check's export, compiles the actual GLSL via EGL and renders both passes, close approaches, rotation, field/beam toggles and flare. This validates rendering, not performance on a consumer device.
