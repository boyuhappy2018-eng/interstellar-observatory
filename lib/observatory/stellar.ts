import {sequence} from './stellar-data';
import {constants} from './formulas';
export const solar={radius:6.957e8,luminosity:3.828e26,temperature:5772,sigma:5.670374419e-8};
/** Log interpolation of empirical mean dwarfs, not a stellar-evolution solver. */
export function stellar(mass:number){
 mass=Math.max(.1,Math.min(40,mass));
 const anchors=["M7V","M6V","M5V","M4V","M3V","M2V","M0V","K5V","K0V","F5V","F0V","A0V","B5V","B2V","B0V","O9V","O5V","O3V"];
 const rows=[...sequence.filter(a=>anchors.includes(a[3])),[1,5772,1,'G2V'] as [number,number,number,string]].sort((a,b)=>a[0]-b[0]);
 let i=0;while(i<rows.length-2&&rows[i+1][0]<mass)i++;
 const a=rows[i],b=rows[i+1],w=Math.log(mass/a[0])/Math.log(b[0]/a[0]);
 const lerp=(j:number)=>Math.exp(Math.log(Number(a[j]))*(1-w)+Math.log(Number(b[j]))*w);
 const temperature=lerp(1),radius=lerp(2),R=radius*solar.radius,M=mass*constants.solarMass;
 const luminosity=4*Math.PI*R*R*solar.sigma*temperature**4/solar.luminosity;
 return {mass,radius,temperature,luminosity,spectral:sequence.reduce((best,row)=>Math.abs(row[1]-temperature)<Math.abs(best[1]-temperature)?row:best,sequence[0])[3],gravity:constants.G*M/R**2,escape:Math.sqrt(2*constants.G*M/R),density:M/(4/3*Math.PI*R**3),peak:2.897771955e-3/temperature,lifetime:1e10*mass/luminosity,compactness:2*constants.G*M/(constants.c**2*R),fuel:mass<1.3?'pp-chain dominated':'CNO increasingly dominant',structure:mass<.35?'Fully convective':mass<1.3?'Radiative core · convective envelope':'Convective core · radiative envelope',color:planckColor(temperature)};
}
/** Approximate CIE 1931 analytic matching functions integrated against Planck's law (380–780 nm). */
export function planckColor(t:number){let X=0,Y=0,Z=0;const gauss=(l:number,mu:number,left:number,right:number)=>Math.exp(-.5*((l-mu)*(l<mu?left:right))**2);
 for(let l=380;l<=780;l+=5){const B=1/(Math.pow(l/550,5)*Math.expm1(1.438776877e7/(l*t)));X+=B*(1.056*gauss(l,599.8,.0264,.0323)+.362*gauss(l,442,.0624,.0374)-.065*gauss(l,501.1,.049,.0382));Y+=B*(.821*gauss(l,568.8,.0213,.0247)+.286*gauss(l,530.9,.0613,.0322));Z+=B*(1.217*gauss(l,437,.0845,.0278)+.681*gauss(l,459,.0385,.0725));}
 const rgb=[3.2406*X-1.5372*Y-.4986*Z,-.9689*X+1.8758*Y+.0415*Z,.0557*X-.204*Y+1.057*Z];const max=Math.max(...rgb);return rgb.map(x=>Math.max(0,x/max));
}
export const starPresets:Record<string,number[]>={'Distant observer':[.45,.23,12],'Polar':[.45,1.48,5],'Equatorial':[.45,.035,5],'Cinematic':[.45,.16,5],'Surface passage':[.6,.07,1.8,-.55,.04],'Photosphere':[.45,.22,1.3]};
