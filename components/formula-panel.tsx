'use client';
import {useMemo} from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {fundamental,scientific} from '@/lib/observatory/formulas';
import {stellar,solar} from '@/lib/observatory/stellar';
import {isco,Settings} from '@/lib/observatory/state';
export function MathFormula({tex}:{tex:string}){const html=useMemo(()=>katex.renderToString(tex,{displayMode:true,throwOnError:true,strict:'error',output:'htmlAndMathml'}),[tex]);return <div className="equation" dangerouslySetInnerHTML={{__html:html}}/>;}
type Row=[string,string,string,string];
export function FormulaPanel({settings,radius,onClose}:{settings:Settings;radius:number;onClose:()=>void}){
 const f=fundamental(settings.mass,radius),white=settings.object==='white-hole',isStar=settings.object==='star',st=stellar(settings.starMass);
 const geometry:Row[]=isStar?[
 ['Stefan–Boltzmann law',String.raw`L=4\pi R^2\sigma T_{\mathrm{eff}}^4`,`${scientific(st.luminosity)} L☉`,'Luminosity follows from the interpolated empirical radius and effective temperature.'],
 ['Effective temperature',String.raw`T_{\mathrm{eff}}=\left(\frac{L}{4\pi R^2\sigma}\right)^{1/4}`,`${Math.round(st.temperature).toLocaleString()} K`,'An effective temperature, not a single temperature throughout the star.'],
 ['Photospheric radius',String.raw`R=R_\odot\,\mathcal R(M/M_\odot)`,`${scientific(st.radius)} R☉`,'Log interpolation of the Mamajek mean dwarf sequence. Solar point explicitly calibrated.'],
 ['Wien displacement',String.raw`\lambda_{\max}=\frac{b}{T_{\mathrm{eff}}}`,`${Math.round(st.peak*1e9)} nm`,'Peak of spectral radiance per unit wavelength. Color depends on the whole visible spectrum.'],
 ['Mean density',String.raw`\bar\rho=\frac{3M}{4\pi R^3}`,`${scientific(st.density)} kg m⁻³`,'Mean density; not the core density.']
 ]:[
 ['Horizon radius',String.raw`r_{\mathrm s}=\frac{2GM}{c^2}`,`${scientific(f.rs/1000)} km`,'Schwarzschild areal radius, shared by both branches. Not a solid surface.'],
 ['Photon sphere',String.raw`r_{\mathrm{ph}}=\frac{3GM}{c^2}=\frac32r_{\mathrm s}`,`${scientific(f.photonSphere/1000)} km`,'Unstable circular null orbits, not the apparent bright ring.'],
 ['Critical impact parameter',String.raw`b_{\mathrm c}=\frac{3\sqrt3 GM}{c^2}`,`${scientific(f.criticalImpact/1000)} km`,'Asymptotic ray threshold, not the event-horizon radius.'],
 ['Horizon area',String.raw`A=4\pi r_{\mathrm s}^2`,`${scientific(f.area)} m²`,'Geometric area of the horizon.'],
 ['Characteristic light time',String.raw`t_{\mathrm s}=\frac{r_{\mathrm s}}c`,`${scientific(f.lightTime)} s`,'The simulation uses an illustrative animation clock.']
 ];
 if(!isStar&&settings.jets)geometry.push(
 ['Jet Lorentz factor',String.raw`\gamma=\frac{1}{\sqrt{1-\beta^2}}`,(1/Math.sqrt(1-settings.jetSpeed**2)).toFixed(3),`Prescribed bulk speed β = ${settings.jetSpeed.toFixed(2)}. Exterior plasma, not photons or horizon escape.`],
 ['Jet Doppler factor',String.raw`\delta=\frac{1}{\gamma(1-\beta\cos\theta)}`,'','θ is the angle between plasma velocity and the ray toward the observer; evaluated along each bent viewing ray.'],
 ['Continuous-jet beaming',String.raw`I_\nu\propto\delta^{2+\alpha},\qquad\alpha=0.7`,'','Synchrotron-like power-law prescription, with a display cap. Not a solved electron distribution or calibrated spectrum.']);
 const observer:Row[]=isStar?[
 ['Surface gravity',String.raw`g=\frac{GM}{R^2}`,`${scientific(st.gravity)} m s⁻²`,'Newtonian approximation appropriate to ordinary main-sequence stars.'],
 ['Escape speed',String.raw`v_{\mathrm{esc}}=\sqrt{\frac{2GM}R}`,`${scientific(st.escape/1000)} km s⁻¹`,'Surface escape speed, ignoring rotation and radiation pressure.'],
 ['Observer distance',String.raw`d=(d/R_\odot)R_\odot`,`${scientific(radius*solar.radius/1000)} km`,'Camera coordinates use solar radii. Size changes are geometrical, not a luminosity scale.'],
 ['Compactness',String.raw`\mathcal C=\frac{2GM}{Rc^2}`,scientific(st.compactness),'Very small here: the stellar renderer neglects relativistic bending.'],
 ['Lifetime scaling',String.raw`t_{\mathrm{MS}}\sim10^{10}\,\mathrm{yr}\,\frac{M/M_\odot}{L/L_\odot}`,`≈ ${scientific(st.lifetime)} yr`,'Order-of-magnitude fuel/luminosity scaling, not an evolutionary track; especially uncertain for fully convective and massive stars.']
 ]:[
 ['Observer coordinate radius',String.raw`r=(r/r_{\mathrm s})r_{\mathrm s}`,`${scientific(f.r/1000)} km`,'Areal coordinate radius, not proper radial distance.'],
 ['Static clock',String.raw`\frac{d\tau}{dt}=\sqrt{1-\frac{r_{\mathrm s}}r}`,f.clockRatio.toFixed(6),'Static exterior clock relative to Schwarzschild time at infinity.'],
 ['Static frequency transfer',String.raw`\frac{\nu_o}{\nu_e}=\sqrt{\frac{1-r_{\mathrm s}/r_e}{1-r_{\mathrm s}/r_o}}`,`${(1/f.clockRatio).toFixed(4)}× for an infinity source`,'Emitter and observer lapse ratio. Disk and jet frequency factors also include an approximate local Doppler term; this is not full Kerr transfer. Background stars currently receive angular deflection only.'],
 ['Radial null coordinate speed',String.raw`\left|\frac{dr}{dt}\right|=c\left(1-\frac{r_{\mathrm s}}r\right)`,`${scientific(f.outgoingSpeed/1000)} km s⁻¹`,'Coordinate speed; a local inertial observer measures c.'],
 ['Curvature invariant',String.raw`K=R_{abcd}R^{abcd}=\frac{12r_{\mathrm s}^2}{r^6}`,`${scientific(f.curvature)} m⁻⁴`,'Finite at the horizon and divergent at the singularity.'],
 ['Surface gravity',String.raw`\kappa=\frac{c^4}{4GM}`,`${scientific(f.surfaceGravity)} m s⁻²`,'Positive Schwarzschild magnitude normalized at infinity.']
 ];
 const row=([name,tex,value,note]:Row)=><article className="formula-row" key={name}><h3>{name}</h3><MathFormula tex={tex}/>{value&&<output>{value}</output>}<p>{note}</p></article>;
 return <aside className="formula-panel" aria-label="Fundamental formulas"><div className="formula-heading"><div><span className="eyebrow">MATHEMATICAL FIELD NOTES</span><h2>Fundamental formulas</h2></div><button onClick={onClose} aria-label="Hide formulas">×</button></div><p className="formula-inputs">M = {scientific(isStar?settings.starMass:settings.mass)} M☉ <span>{radius.toFixed(2)} {isStar?'R☉':'rₛ'}</span></p>
 <Tabs defaultValue="geometry"><TabsList variant="line" aria-label="Formula category"><TabsTrigger value="geometry">{isStar?'Radiation':'Geometry'}</TabsTrigger><TabsTrigger value="observer">Observer</TabsTrigger><TabsTrigger value="causality">{isStar?'Structure':'Causality'}</TabsTrigger></TabsList><div className="formula-scroll"><TabsContent value="geometry">{geometry.map(row)}{!white&&!isStar&&row(['Hybrid disk ISCO',String.raw`\begin{gathered}r_{\mathrm{ISCO}}=\frac{r_{\mathrm s}}2\left[3+Z_2-\sqrt{(3-Z_1)(3+Z_1+2Z_2)}\right]\\ Z_1=1+\sqrt[3]{1-a_*^2}\left(\sqrt[3]{1+a_*}+\sqrt[3]{1-a_*}\right)\\ Z_2=\sqrt{3a_*^2+Z_1^2}\end{gathered}`,`${isco(settings.spin).toFixed(3)} rₛ`,'Prograde Kerr disk prescription; rendered inner edge clamps at 1.55 rₛ. Ray metric remains Schwarzschild.'])}</TabsContent><TabsContent value="observer">{observer.map(row)}</TabsContent><TabsContent value="causality">
 {isStar?<>
 {row(['Hydrostatic equilibrium',String.raw`\frac{dP}{dr}=-\frac{Gm(r)\rho(r)}{r^2}`,'','Pressure gradient balances gravity. Shown as governing theory; this app does not solve interior stellar structure.'])}
 {row(['Mass continuity',String.raw`\frac{dm}{dr}=4\pi r^2\rho`,'','Enclosed mass grows through concentric layers.'])}
 {row(['Energy generation',String.raw`\frac{dL}{dr}=4\pi r^2\rho\epsilon`,'',st.fuel+'. Transition depends on composition and core temperature.'])}
 {row(['Limb darkening',String.raw`\frac{I(\mu)}{I(1)}=1-u(1-\mu)`,`u = ${settings.limb.toFixed(2)}`,'Linear display law. The limb samples higher, cooler photospheric layers. Coefficient is adjustable, not an atmosphere fit.'])}
 <article className="formula-row"><h3>Model scope</h3><p>{st.structure}. Empirical mean dwarfs at roughly solar composition. No age evolution, metallicity, binary interactions or MHD solution. Surface patterns and enhanced outer atmosphere are illustrative. Auto-normalized radiance preserves visible texture across the luminosity range.</p></article>
 </>:<>
 {row(['Schwarzschild exterior',String.raw`\begin{aligned}ds^2={}&-\left(1-\frac{r_{\mathrm s}}r\right)c^2dt^2\\&+\frac{dr^2}{1-r_{\mathrm s}/r}+r^2d\Omega^2\end{aligned}`,'','Both branches share this exterior. White holes do not reverse gravity.'])}
 {row([white?'Outgoing Eddington–Finkelstein chart':'Future horizon',white?String.raw`\begin{gathered}u=t-r_*/c,\quad r_*=r+r_{\mathrm s}\ln|r/r_{\mathrm s}-1|\\ds^2=-\left(1-\frac{r_{\mathrm s}}r\right)c^2du^2\\-2c\,du\,dr+r^2d\Omega^2\end{gathered}`:String.raw`r<r_{\mathrm s}\;\Rightarrow\;\text{no future escape}`,'',white?'This chart is regular at the past horizon. Future-directed trajectories can emerge from the white-hole interior. An exterior image alone does not determine this global causal structure.':'Causal curves inside the future horizon cannot escape to the exterior.'])}
 {white?<article className="formula-row"><h3>No unique visible appearance</h3><p>Factory settings enable illustrative source emission. The source can be disabled. Illumination supplies a chosen outgoing radiation boundary and exterior sheet; it is not an exact white-hole prediction. Classical white holes can be unstable to infalling perturbations. This renderer neither evolves those perturbations nor solves an interior.</p></article>:row(['Hawking temperature',String.raw`T_{\mathrm H}=\frac{\hbar c^3}{8\pi GMk_{\mathrm B}}`,`${scientific(f.hawkingTemperature)} K`,'Semiclassical nonrotating benchmark, not the disk temperature.'])}
 {row(['Integrated spatial null orbits',String.raw`\frac{d^2\mathbf x}{d\lambda^2}=-\frac{3h^2\mathbf x}{2r^5}`,'','Units rₛ = 1; h² = |x × dx/dλ|². Finite midpoint integration, not full Kerr optics.'])}
 </>}
 </TabsContent></div></Tabs><a href="/physics.html" target="_blank" rel="noreferrer">Research, constants & limitations ↗</a></aside>;
}
