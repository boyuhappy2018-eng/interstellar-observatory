/** Ellis ultrastatic geometry; units throat radius a = c = 1.
 * ds²=-dt²+dl²+(l²+1)dΩ²; ray-plane Hamiltonian H=(p²+b²/(l²+1))/2.
 * E=1. RK4 preserves the null constraint to finite numerical accuracy.
 */
export function traceEllis(l0:number,mu:number,budget=700){
 let l=l0,p=mu,phi=0;const b=Math.sqrt(1+l*l)*Math.sqrt(Math.max(0,1-mu*mu));
 const deriv=(x:number,v:number)=>[v,b*b*x/(1+x*x)**2,b/(1+x*x)];
 for(let i=0;i<budget;i++){const h=Math.min(.8,.045*(1+Math.abs(l)));const k1=deriv(l,p),k2=deriv(l+h*k1[0]/2,p+h*k1[1]/2),k3=deriv(l+h*k2[0]/2,p+h*k2[1]/2),k4=deriv(l+h*k3[0],p+h*k3[1]);l+=h*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6;p+=h*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6;phi+=h*(k1[2]+2*k2[2]+2*k3[2]+k4[2])/6;if(Math.abs(l)>40&&l*p>0)break;}
 return {l,p,phi,b,side:l<0?-1:1,constraint:p*p+b*b/(1+l*l)};
}
export function fitStarDistance(radius:number,fov:number,aspect:number){const half=Math.atan(Math.tan(fov*Math.PI/360)*Math.min(1,aspect));return radius/Math.sin(half*.64);}
/** Proper equatorial distance of the Ellis spatial slice embedded in Euclidean 3-space. */
export function embedded(l:number,phi:number){const r=Math.sqrt(1+l*l);return [r*Math.cos(phi),Math.asinh(l),r*Math.sin(phi)];}
