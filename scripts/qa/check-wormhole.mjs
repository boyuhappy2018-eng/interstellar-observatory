import fs from 'node:fs';import ts from 'typescript';import assert from 'node:assert/strict';
const src=ts.transpileModule(fs.readFileSync('lib/observatory/wormhole.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {traceEllis,fitStarDistance,embedded}=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
let maxError=0;for(const l of [0, .01,1,3,12,-12])for(const mu of [-1,-.999,-.99,-.8,-.2,0,.2,.8,.99,1]){const r=traceEllis(l,mu);assert(Number.isFinite(r.phi));maxError=Math.max(maxError,Math.abs(r.constraint-1));assert(Math.abs(r.constraint-1)<.0001);}
for(const b of [0,.5,.98,1.02,1.2,3]){const r=traceEllis(12,-Math.sqrt(1-b*b/145));assert.equal(r.side,b<1?-1:1);const mirror=traceEllis(-12,Math.sqrt(1-b*b/145));assert(Math.abs(r.l+mirror.l)<1e-9);}
for(const aspect of [.4,1,1.7,3])for(const r of [.13,1,11]){const d=fitStarDistance(r,44,aspect);assert(d>r);const half=Math.atan(Math.tan(22*Math.PI/180)*Math.min(1,aspect));assert(Math.asin(r/d)<half*.65);}
for(const l of [-10,-1,0,1,10]){const h=1e-4,p=embedded(l,0),q=embedded(l+h,0);assert(Math.abs(Math.hypot(...p.map((v,i)=>(q[i]-v)/h))-1)<.001);}
console.log('PASS: Ellis crossing/turning, reflection symmetry, embedding metric, portrait/landscape fit. Max null constraint error',maxError);
