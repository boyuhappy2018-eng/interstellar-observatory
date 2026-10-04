import {embedded} from './wormhole';
type Point=number[];type Project=(p:Point)=>number[]|null;
/** Representative Ellis null rays. Affine sampling, not ornamental particle trails. */
function orbit(b:number){let l=10,p=-Math.sqrt(1-b*b/101),phi=0;const out:Point[]=[];const d=(x:number,v:number)=>[v,b*b*x/(1+x*x)**2,b/(1+x*x)];for(let i=0;i<2600;i++){out.push([l,phi]);const h=.025,a=d(l,p),c=d(l+h*a[0]/2,p+h*a[1]/2),e=d(l+h*c[0]/2,p+h*c[1]/2),f=d(l+h*e[0],p+h*e[1]);l+=h*(a[0]+2*c[0]+2*e[0]+f[0])/6;p+=h*(a[1]+2*c[1]+2*e[1]+f[1])/6;phi+=h*(a[2]+2*c[2]+2*e[2]+f[2])/6;if(Math.abs(l)>10.05&&l*p>0)break;}return out;}
export const representativeRays=[.55,.998,1.18].map(orbit);
function stroke(ctx:CanvasRenderingContext2D,project:Project,points:Point[],color:string,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();let pen=false;for(const p of points){const q=project(p);if(!q){pen=false;continue;}if(!pen)ctx.moveTo(q[0],q[1]);else ctx.lineTo(q[0],q[1]);pen=true;}ctx.stroke();}
function marker(ctx:CanvasRenderingContext2D,project:Project,p:Point,color:string,size=3){const q=project(p);if(!q)return;ctx.fillStyle=color;ctx.beginPath();ctx.arc(q[0],q[1],size,0,Math.PI*2);ctx.fill();}
export function drawEllisPaths(ctx:CanvasRenderingContext2D,project:Project,time:number){representativeRays.forEach((ray,j)=>{const points=ray.map(([l,phi])=>embedded(l,phi+j*.55)),color=['#e2c492','#f0e8d9','#91acbd'][j];stroke(ctx,project,points,color,1.1);const index=Math.floor((time*.045+j*.22)%1*points.length);marker(ctx,project,points[index],color,3);});}
export function drawPathInset(ctx:CanvasRenderingContext2D,w:number,h:number,time:number){const iw=Math.min(300,w*.27),ih=190,x=35,y=h-370;ctx.fillStyle='rgba(3,6,9,.9)';ctx.fillRect(x,y,iw,ih);ctx.strokeStyle='#454541';ctx.strokeRect(x,y,iw,ih);const project:Project=p=>[x+iw/2+(p[0]*.86+p[2]*.35)*iw/26,y+ih/2-p[1]*19+(p[2]*.85-p[0]*.2)*3.4];for(let l=-10;l<=10;l+=2){const a=[];for(let k=0;k<=72;k++)a.push(embedded(l,k*Math.PI/36));stroke(ctx,project,a,'rgba(132,153,165,.15)',.7);}drawEllisPaths(ctx,project,time);ctx.fillStyle='#b8b5ad';ctx.font='9px Arial';ctx.fillText('NULL GEODESICS · EMBEDDING INSET',x+12,y+18);ctx.fillStyle='#898983';ctx.fillText('CROSSING  /  NEAR-CRITICAL  /  RETURNING',x+12,y+ih-12);}
/** Folded sheet is a topological analogy, deliberately not an isometric metric plot.
 * The throat uses the Ellis catenoid locally; the outer sheets and fold are schematic.
 */
export function drawFold(ctx:CanvasRenderingContext2D,project:Project,depth:(p:Point)=>number,l:number,time:number,paths:boolean,w:number,h:number){
 const unshifted=project;project=p=>{const q=unshifted(p);return q?[q[0],q[1]-h*.09]:null;};ctx.fillStyle='#05080b';ctx.fillRect(0,0,w,h);const H=Math.asinh(Math.sqrt(15)),polys:{p:Point[];shade:number;depth:number}[]=[];
 const quad=(p:Point[],shade:number)=>polys.push({p,shade,depth:p.reduce((a,q)=>a+depth(q),0)/p.length});
 for(const sign of [-1,1])for(let j=0;j<64;j++)for(let k=0;k<14;k++){
 const sheet=(theta:number,t:number)=>{const c=Math.cos(theta),s=Math.sin(theta),limit=Math.min((c>=0?8:-12)/c,7/Math.abs(s)),r=4+(limit-4)*t;return [3+r*c,sign*H,r*s];};
 const a=j*Math.PI/32,b=(j+1)*Math.PI/32;quad([sheet(a,k/14),sheet(a,(k+1)/14),sheet(b,(k+1)/14),sheet(b,k/14)],sign>0?43:26);}
 for(let i=0;i<32;i++){const t=i/32*Math.PI,t1=(i+1)/32*Math.PI;for(let z=-7;z<7;z+=1)quad([[-9-H*Math.sin(t),H*Math.cos(t),z],[-9-H*Math.sin(t1),H*Math.cos(t1),z],[-9-H*Math.sin(t1),H*Math.cos(t1),z+1],[-9-H*Math.sin(t),H*Math.cos(t),z+1]],26+22*Math.sin(t));}
 const tube=(u:number,phi:number)=>{const p=embedded(u,phi);p[0]+=3;return p;};
 for(let u=-Math.sqrt(15);u<Math.sqrt(15);u+=.24)for(let j=0;j<64;j++){const a=j*Math.PI/32,b=(j+1)*Math.PI/32;quad([tube(u,a),tube(Math.min(Math.sqrt(15),u+.24),a),tube(Math.min(Math.sqrt(15),u+.24),b),tube(u,b)],33+18*Math.cos(a-.4));}
 polys.sort((a,b)=>b.depth-a.depth);for(const poly of polys){const q=poly.p.map(project);if(q.some(p=>!p))continue;ctx.beginPath();q.forEach((p,i)=>i?ctx.lineTo(p![0],p![1]):ctx.moveTo(p![0],p![1]));ctx.closePath();const v=Math.round(poly.shade);ctx.fillStyle=`rgb(${v-3},${v+1},${v+4})`;ctx.fill();ctx.strokeStyle='rgba(154,172,183,.11)';ctx.lineWidth=.45;ctx.stroke();}
 const outer:Point[]=[];for(let x=8;x>=-9;x-=.15)outer.push([x,H+.035,0]);for(let t=0;t<=Math.PI;t+=.015)outer.push([-9-(H+.035)*Math.sin(t),(H+.035)*Math.cos(t),0]);for(let x=-9;x<=8;x+=.15)outer.push([x,-H-.035,0]);
 const short:Point[]=[[8,H+.05,0],[7,H+.05,0]];for(let u=Math.sqrt(15);u>=-Math.sqrt(15);u-=.025){const p=tube(u,0);p[0]+=.035;short.push(p);}short.push([8,-H-.05,0]);
 stroke(ctx,project,outer,'#819eae',2);stroke(ctx,project,short,'#e6c286',2.4);marker(ctx,project,[8,H+.04,0],'#f4dcaf',4);marker(ctx,project,[8,-H-.04,0],'#f4dcaf',4);
 marker(ctx,project,short[Math.floor(((time*.06)%1+1)%1*short.length)],'#fff3d7',4);marker(ctx,project,outer[Math.floor(((time*.025)%1+1)%1*outer.length)],'#aec5d3',3);
 const observer=tube(Math.max(-Math.sqrt(15),Math.min(Math.sqrt(15),l)),Math.PI*.5);marker(ctx,project,observer,'#fff9ed',4);
 ctx.font='11px Arial';ctx.fillStyle='#d8c8ac';for(const [p,label]of [[[8,H,0],'A · ENTRY'],[[8,-H,0],'B · EXIT'],[[4,0,0],'THROAT']] as [Point,string][]){const q=project(p);if(q)ctx.fillText(label,q[0]+13,q[1]-8);}
 ctx.textAlign='center';ctx.fillStyle='#b5b3ac';ctx.fillText('FOLDED SPACE · TOPOLOGICAL ANALOGY · NOT A LITERAL VIEW OF 3D SPACE',w/2,h*.18);ctx.fillStyle='#819eae';ctx.fillText('LONG EXTERIOR ROUTE',w/2-100,h*.23);ctx.fillStyle='#e6c286';ctx.fillText('SHORTCUT THROUGH THROAT',w/2+110,h*.23);ctx.textAlign='left';
 if(paths)drawPathInset(ctx,w,h,time);
}
