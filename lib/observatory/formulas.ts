/** SI constants. Solar mass is a conventional mass estimate; all displayed values derive from this same table. */
export const constants = {G:6.67430e-11,c:299792458,solarMass:1.98847e30,hbar:1.054571817e-34,kB:1.380649e-23};
export function fundamental(massSolar:number,radiusRs:number){
 const {G,c,solarMass,hbar,kB}=constants;
 const M=massSolar*solarMass,rs=2*G*M/(c*c),r=radiusRs*rs;
 return {M,rs,r,photonSphere:1.5*rs,criticalImpact:Math.sqrt(27)/2*rs,area:4*Math.PI*rs*rs,lightTime:rs/c,surfaceGravity:c*c/(2*rs),clockRatio:Math.sqrt(1-1/radiusRs),outgoingSpeed:c*(1-1/radiusRs),curvature:12*rs*rs/(r**6),hawkingTemperature:hbar*c/(4*Math.PI*rs*kB)};
}
export function scientific(value:number,digits=3){if(!Number.isFinite(value))return '—';if(value===0)return '0';const exponent=Math.floor(Math.log10(Math.abs(value)));if(exponent>=-2&&exponent<4)return value.toLocaleString('en-US',{maximumSignificantDigits:digits});return `${(value/10**exponent).toFixed(digits-1)} × 10${superscript(exponent)}`;}
function superscript(n:number){const map:Record<string,string>={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};return String(n).split('').map(x=>map[x]).join('');}
