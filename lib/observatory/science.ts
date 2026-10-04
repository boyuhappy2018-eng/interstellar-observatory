export const concepts=[
 {name:'Black-hole shadow',point:[0,0,0],text:'The dark region consists of captured viewing rays. For a distant Schwarzschild observer its critical impact parameter is 3√3/2 Schwarzschild radii. It is larger than the event horizon.'},
 {name:'Event horizon',point:[0,1,0],text:'The Schwarzschild horizon lies at r = rₛ = 2GM/c². It is not a material surface and is not directly outlined by the image. This marker gives its coordinate location, not its observed boundary.'},
 {name:'Photon region',point:[2.6,0,0],text:'In Schwarzschild spacetime, unstable circular photon orbits lie at r = 1.5 rₛ. Their distant critical curve appears at about 2.598 rₛ. Near-critical rays wind around the hole before escaping or being captured.'},
 {name:'Accretion disk',point:[-9,0,0],text:'Differentially rotating emission is evaluated at ray–disk crossings. A thin-disk inspired radial temperature law and shearing procedural density field supply the light. This is not a fluid simulation.'},
 {name:'ISCO',point:[3,0,0],text:'The innermost stable circular orbit sets the emitting inner edge. Spin uses the prograde Kerr ISCO formula, but light paths remain Schwarzschild. The inner edge is clamped at 1.55 rₛ to keep this hybrid model outside its photon sphere.'},
 {name:'Relativistic beaming',point:[7,0,1],text:'The approaching side is enhanced with a local special-relativistic Doppler factor. Specific intensity is scaled by g³ and the color temperature by g; this is a qualitative spectral rendering, not band-integrated radiative transfer.'},
 {name:'Lensed disk image',point:[0,3.8,0],text:'Rays may cross the disk several times after bending around the hole. Those crossings create secondary disk images. The thin sheet is partially transparent to make these paths visible; finite integration resolution limits higher-order rings.'},
];

export const whiteConcepts=[
 {name:'Emergent radiation',point:[0,0,0],text:'Only with the optional source enabled do backward viewing rays receive prescribed outward radiance. Factory settings enable this illustrative source; disabling it gives an unilluminated view. A white hole has no uniquely predicted visible brightness. This is a hypothetical source boundary, not a white solid sphere.'},
 {name:'Past event horizon',point:[0,1,0],text:'The white-hole interior is the time-reversed black-hole region in the extended Schwarzschild geometry. Future-directed causal paths can emerge from it; paths from the exterior cannot enter that past-horizon region.'},
 {name:'Photon sphere',point:[2.6,0,0],text:'The exterior geometry is still Schwarzschild. The photon sphere remains at 1.5 rₛ, with distant critical impact parameter 2.598 rₛ. White holes do not require repulsive gravity.'},
 {name:'Outgoing sheet',point:[-9,0,0],text:'An illustrative thin radiation sheet supplies visible material flowing outward. Its density, temperature and velocity are chosen boundary conditions, not a consequence or observation of a white hole.'},
 {name:'Emission boundary',point:[1.001,0,0],text:'The numerical outgoing-radiation boundary sits just outside rₛ. This avoids a coordinate singularity. It does not model the white-hole interior or predict its energy source.'},
 {name:'Outflow beaming',point:[7,0,1],text:'A radial outward velocity is used for the illustrative emitting sheet. Local Doppler brightening and frequency shifts depend on the angle to the viewing ray. This is approximate radiative transfer.'},
 {name:'Lensed outgoing light',point:[0,3.8,0],text:'Outgoing radiation is viewed through the same gravitational ray integrator as the black-hole disk. The lensing geometry persists even though the radiation boundary and time direction differ.'},
];
export const starConcepts=[
{name:'Photosphere',point:[0,0,1],text:'The visible layer is optically thick plasma, not a solid crust. Its effective temperature follows the empirical mean dwarf sequence.'},
{name:'Limb darkening',point:[.9,.3,0],text:'Near the limb, sightlines sample higher and cooler layers. A linear limb-darkening law approximates the intensity; its coefficient is a display parameter.'},
{name:'Convective granulation',point:[-.4,.5,.7],text:'Bright cells and darker lanes illustrate surface convection in cool stars. This procedural field is not a hydrodynamic calculation. It fades above the cool-star regime.'},
{name:'Stellar radius',point:[-1,0,0],text:'Radius and temperature interpolate mean main-sequence data. Changing mass compares distinct equilibrium stars at roughly solar composition, rather than evolving a single star.'},
{name:'Magnetic activity',point:[.3,.4,.8],text:'Dark spot patterns illustrate cooler magnetic regions. Their distribution and activity setting are artistic controls, not a prediction based on mass alone.'}];
export const wormConcepts=[{name:'Ellis traversable geometry',point:[1,0,0],text:'Two asymptotically flat regions are joined at a minimum-area throat. The optical view integrates null geodesics through this geometry. Structure displays an equatorial spatial embedding, not physical walls. Its existence is hypothetical and requires matter violating the null energy condition; stability is not modeled.'}];
export const conceptsFor=(object:string)=>(object==='magnetar'||object==='pulsar')?neutronConcepts:object==='wormhole'?wormConcepts:object==='star'?starConcepts:object==='white-hole'?whiteConcepts:concepts;
export const neutronConcepts=[
{name:'Neutron-star crust',point:[0,0,1],text:'A roughly city-sized star contains about a solar mass of matter. The rendered thermal map is illustrative; the hot emission peaks outside visible wavelengths.'},
{name:'Magnetic polar caps',point:[0,1,0],text:'The two magnetic poles are hotter emitting regions in this model. The magnetic axis may be inclined to the rotation axis. Visibility changes continuously as the star rotates.'},
{name:'Closed dipole field',point:[-5,0,0],text:'Near-zone dipole lines follow r = L sin²θ. Magnetic fields are not luminous wires. The visible lines and moving packets are a teaching overlay, with amplified brightness.'},
{name:'Radiation cones',point:[0,6,0],text:'Beams sweep around the rotation axis. A pulse is seen only when a beam intersects the observer’s line of sight. Beam width is illustrative; detailed radio and gamma-ray emission zones differ.'},
{name:'Inner magnetosphere',point:[6,0,0],text:'Closed loops reach 8.8 stellar radii. Pulsar polar dipole segments extend to 23 radii. Both remain inside the light cylinder throughout the exposed period range. The polar segments are not a global open-field solution; outer current sheets and winds are not solved.'}
];
