import assert from 'node:assert/strict';
import {fundamental,scientific,constants} from '../../lib/observatory/formulas.ts';
import {isco} from '../../lib/observatory/state.ts';
const sun=fundamental(1,3.2),supermassive=fundamental(1e8,38);
assert.ok(Math.abs(sun.rs/1000-2.95334)<.00002,'one-solar-mass horizon reference');
assert.ok(Math.abs(sun.hawkingTemperature-6.17e-8)<2e-10,'Hawking temperature benchmark');
assert.equal(isco(0),3,'Schwarzschild ISCO');
assert.ok(isco(.98)>0&&isco(.98)<3,'prograde spin reduces ISCO');
assert.ok(Math.abs(supermassive.rs/sun.rs-1e8)<1e-6,'mass scaling');
assert.ok(Math.abs(supermassive.photonSphere/supermassive.rs-1.5)<1e-14);
assert.ok(Math.abs(supermassive.criticalImpact/supermassive.rs-Math.sqrt(27)/2)<1e-14);
assert.ok(Math.abs(fundamental(1,2).clockRatio-Math.SQRT1_2)<1e-14);
assert.ok(Math.abs(fundamental(1,2).outgoingSpeed/constants.c-.5)<1e-14);
assert.ok(Math.abs(fundamental(1,1).curvature*sun.rs**4-12)<1e-12,'finite horizon curvature');
for(const mass of [1e6,1e8,1e9])for(const radius of [3.2,5,38,180]){
 const f=fundamental(mass,radius);assert.ok(Object.values(f).every(Number.isFinite));assert.ok(f.clockRatio>0&&f.clockRatio<1);assert.ok(f.outgoingSpeed<constants.c);assert.ok(!scientific(f.curvature).includes('undefined'));
}
console.log('PASS: independent reference values, SI units, Schwarzschild/Kerr limits, mass scaling and camera extremes.');
console.log(JSON.stringify({mass:1e8,rs_km:supermassive.rs/1000,lightTime_s:supermassive.lightTime,clockRatio_at38rs:supermassive.clockRatio}));
