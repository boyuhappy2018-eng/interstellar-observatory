import {Settings} from './state';
import {orient} from './orientation';
export const isNeutron=(object:string)=>object==='magnetar'||object==='pulsar';
export const neutronPresets:Record<string,number[]>={'Magnetosphere':[.65,.26,23],'Beam crossing':[.65,.7,32],'Polar crown':[.5,1.22,24],'Equatorial sweep':[.65,.05,25],'Surface approach':[.4,.2,5.8],'Distant observer':[.6,.3,55]};
export function neutronPhysics(s:Pick<Settings,'nsMass'|'nsRadius'|'period'|'fieldLog'>){
 const G=6.67430e-11,c=299792458,M=s.nsMass*1.98847e30,R=s.nsRadius*1000,omega=2*Math.PI/s.period,rs=2*G*M/c**2,B=10**s.fieldLog;
 const lapse=Math.sqrt(1-rs/R);
 return {M,R,omega,rs,B,compactness:rs/R,lapse,bolometricIntensityFactor:lapse**4,redshift:1/lapse-1,lightCylinder:c/omega,frequency:1/s.period,density:3*M/(4*Math.PI*R**3),equatorialField:B/2};
}
/** Near-zone vacuum dipole: r = L sin²(theta). Twist is an illustrative deformation. */
export function fieldPoint(L:number,theta:number,phi:number,twist=0){const r=L*Math.sin(theta)**2,a=phi+twist*Math.cos(theta);return [r*Math.sin(theta)*Math.cos(a),r*Math.cos(theta),r*Math.sin(theta)*Math.sin(a)];}
export type FieldLine={points:number[][];id:number;shell:number};
export function fieldGeometry(twist:number,kind='magnetar',lightCylinderR=350):FieldLine[]{
 const lines:FieldLine[]=[];const shells=kind==='pulsar'?[2.05,4.8,8.8]:[2.05,3.2,4.8,6.6,8.8],count=kind==='pulsar'?10:18;
 for(let shell=0;shell<shells.length;shell++){const L=shells[shell],start=Math.asin(Math.sqrt(1.015/L));for(let j=0;j<count;j++){const points=[];for(let k=0;k<=112;k++)points.push(fieldPoint(L,start+(Math.PI-2*start)*k/112,j*Math.PI*2/count+shell*.075,twist));lines.push({points,id:j+shell*count,shell});}}
 // Inner polar segments of vacuum dipole lines, ending at 23 R. This is
 // NOT a global open-field/force-free solution or a wind beyond the light cylinder.
 if(kind==='pulsar')for(const sign of [-1,1])for(let j=0;j<12;j++){
  const L=lightCylinderR*(1.05+(j%3)*.6),points=[];
  for(let k=0;k<=112;k++){const r=1.015+(23-1.015)*k/112,theta=Math.asin(Math.sqrt(r/L)),p=fieldPoint(L,theta,j*Math.PI/6);p[1]*=sign;points.push(p);}
  lines.push({points,id:100+j+(sign>0?12:0),shell:-1});
 }
 return lines;
}
export function magneticWorld(p:number[],phase:number,obliquity:number,tilt:number,roll:number){const a=obliquity*Math.PI/180,x=p[0]*Math.cos(a)+p[1]*Math.sin(a),y=-p[0]*Math.sin(a)+p[1]*Math.cos(a);return orient([x*Math.cos(phase)+p[2]*Math.sin(phase),y,-x*Math.sin(phase)+p[2]*Math.cos(phase)],tilt,roll);}
export function observerPulse(eye:number[],s:Settings,phase:number){const axis=magneticWorld([0,1,0],phase,s.obliquity,s.tilt,s.roll),alignment=Math.abs(axis.reduce((a,x,i)=>a+x*eye[i],0)/Math.max(1e-9,Math.hypot(...eye))),angle=Math.acos(Math.min(1,alignment));return s.beams?Math.exp(-.5*(angle/(s.beamAngle*Math.PI/180*.5))**2):0;}

export const neutronHome=(object:string)=>neutronPresets[object==='pulsar'?'Beam crossing':'Magnetosphere'];
