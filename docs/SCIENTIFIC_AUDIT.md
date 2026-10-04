# Scientific audit — review build, 1 October 2026

This audit checks implemented equations, parameter limits and scientific disclosures. Passing the checks is not a claim that the visualization is an exact astrophysical simulation. All six objects remain real-time approximations or explicitly hypothetical models.

## Corrections applied

1. **Finite observer frequency transfer:** black-hole/white-hole disk and jet shaders, and the CPU implementation, now use `sqrt((1 - 1/r_emitter)/(1 - 1/r_observer))`, with radii in Schwarzschild units. This is the static lapse ratio. The local Doppler direction remains approximate. Captured-ray geometry and procedural disk structure are unchanged.
2. **Neutron-star bolometric surface intensity:** uses `g^4`, with `g²=(1-C)/(1-C/r_observer)` and `C=2GM/(Rc²)`. The observer distance is expressed in stellar radii. A fixed illustrative source normalization of 1.9 and adjustable exposure preserve visibility; changing compactness still changes transfer. It is not a calibrated spectral or pulse-profile instrument. No surface gravitational light bending is integrated.
3. **White-hole defaults:** descriptions now agree with the factory settings: prescribed source radiation is enabled for visibility and can be disabled. No observed white hole, unique brightness prediction, interior evolution or stability calculation is claimed.
4. **Ellis embedding notation:** signed proper coordinate `z(l)=a asinh(l/a)` and unsigned branch magnitude `|z|=a arcosh(R/a)` are distinguished.
5. **Stale disclosures:** ray budgets, pulsar field extent, camera lapse and neutron-star intensity notes match the implementation.

## Model boundaries

| Object | Implemented foundation | Limitations and enhancements |
|---|---|---|
| Black hole | Schwarzschild spatial null orbit equation; capture; lensed disk crossings; procedural stars; Kerr prograde ISCO prescription | Hybrid spin model, not Kerr rays. Finite midpoint budget; approximate local Doppler; procedural emitting sheet, not GRMHD. Background stars have angular lensing without full frequency transfer. |
| White hole | Same attractive Schwarzschild exterior; past-horizon causal explanation; prescribed outgoing radiation boundary | Hypothetical and unobserved. Radiation, sheet and filaments are selected sources, not a GR prediction. |
| Main-sequence star | Mamajek empirical dwarf anchors, solar calibration, Stefan–Boltzmann luminosity, Planck/CIE display color | Not stellar evolution or atmosphere spectra. Granulation, activity and corona are procedural; normalized display radiance. |
| Wormhole | Ultrastatic Ellis metric; RK4 null geodesics; equatorial catenoid embedding | Requires exotic stress-energy; existence/stability not established. Folded-sheet view is a topology analogy. Camera playback is prescribed, not a solved spacecraft journey. |
| Magnetar | Near-zone dipole curves, rigid rotation and obliquity, compactness, static surface intensity transfer | Azimuthal twist, crustal fractures, current-bundle emissivity and flare dynamics are schematic, not force-free plasma or MHD. Enhanced warm high-energy palette, not visible-light photography. |
| Pulsar | Oblique rotating magnetic axes, steady source-frame cones and direction-dependent Gaussian observer signal | Sparse closed dipole loops and high-L polar segments ending at 23 R. These do not solve global open fields or outer wind/current sheets. Radio/gamma-ray emission regions and full pulse transfer are not modeled. |

Magnetars and pulsars are both neutron stars; their behavior can overlap. The two visual presets emphasize different mechanisms rather than claiming disjoint classes.

## Visual regression

The actual two-pass neutron-star GLSL was compiled and rendered with EGL/Mesa at landscape and portrait sizes, including rotation, close approaches, field/beam switches and flares. The CPU compatibility renderer was separately exercised. GPU timer and adaptive-resolution numerical checks preserve existing quality ceilings: native HIGH, 1.25× per-axis ULTRA, 12/16 MP allocation budgets.

Black-hole before/after capture masks were exactly identical at cinematic, polar, equatorial, close and disk-side viewpoints. At the fixed cinematic comparison, mean RGB change was 0.235/255; near-observer emission changes more as expected from the lapse correction. This validates preservation of capture geometry, not full image accuracy.

**Browser limitation:** the supervised preview reported running, but its HTTP endpoint returned connection refusal/502. The required browser-control skill is unavailable in this environment. Browser UI, audio/fullscreen and device-specific performance have therefore not been re-certified in this audit. EGL/Mesa timing is not representative of Apple Silicon or discrete GPUs. The review webpage requires user confirmation before desktop packaging/release.

## Checks

- `check-formulas.mjs`: reference constants, Schwarzschild scales, ISCO limits and mass scaling.
- `check-stellar.mjs`: solar references, entire exposed mass range, colors and strict KaTeX.
- `check-wormhole.mjs`: crossing/reflection, null constraint, embedding and framing.
- `check-neutron.mjs`: compactness, g⁴ factor, field geometry, polar extent, observer pulses and strict KaTeX.
- `check-orientation.mjs`: rigid transforms and per-object factory settings.
- `check-quality.mjs`: high-DPI dimensions, allocation limits, adaptation/recovery and GPU queries.
- Actual GLSL and compatibility renders: `render_neutron.py`, `render_neutron_canvas.mjs`, `render_shader.py`.
- TypeScript checking and production build.

## Primary references

- [NASA/Goddard: Neutron stars](https://imagine.gsfc.nasa.gov/science/objects/neutron_stars1.html)
- [NASA: Pulsars](https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-pulsars/)
- [Kaspi & Beloborodov, Magnetars (2017)](https://arxiv.org/abs/1703.00068)
- [Beloborodov, Activated Magnetospheres of Magnetars (2010)](https://arxiv.org/abs/1008.4388)
- [James et al., Gravitational Lensing by Spinning Black Holes (2015)](https://arxiv.org/abs/1502.03808)
- [Gralla, Holz & Wald, Black Hole Shadows, Photon Rings, and Lensing Rings (2019)](https://arxiv.org/abs/1906.00873)
- [James et al., Visualizing Interstellar's Wormhole (2015)](https://arxiv.org/abs/1502.03809)
- [Mamajek mean dwarf sequence](https://www.pas.rochester.edu/~emamajek/EEM_dwarf_UBVIJHK_colors_Teff.txt)
- [Wyman et al., CIE matching function fits (2013)](https://jcgt.org/published/0002/02/01/)
- [Eardley, Death of White Holes (1974)](https://doi.org/10.1103/PhysRevLett.33.442)
