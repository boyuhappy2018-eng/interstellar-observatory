import fs from 'node:fs';import assert from 'node:assert/strict';import katex from 'katex';
// Transpile only pure numerical modules for independent numerical checks.
import ts from 'typescript';
const tmp='/workspace/scratch/181e94992846/stellar-check';fs.mkdirSync(tmp,{recursive:true});
for(const file of ['stellar-data','formulas','stellar']){let src=fs.readFileSync(`lib/observatory/${file}.ts`,'utf8').replaceAll("'./stellar-data'","'./stellar-data.mjs'").replaceAll("'./formulas'","'./formulas.mjs'");fs.writeFileSync(`${tmp}/${file}.mjs`,ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText);}
const {stellar,solar}=await import(`${tmp}/stellar.mjs`);
const sun=stellar(1);assert(Math.abs(sun.temperature-5772)<1e-8);assert.equal(sun.radius,1);assert(Math.abs(sun.luminosity-1)<.001);assert(Math.abs(sun.gravity-274.2)<1);assert(Math.abs(sun.escape/1000-617.7)<1);
let previous=stellar(.1);for(let m=.101;m<=40;m*=1.007){const s=stellar(m);for(const k of ['temperature','radius','luminosity','gravity','escape','lifetime','compactness'])assert(Number.isFinite(s[k])&&s[k]>0,`${m} ${k}`);assert(s.temperature>=previous.temperature*.998);assert(s.radius>=previous.radius*.998);assert(s.color.every(x=>x>=0&&x<=1));previous=s;}
for(const m of [.1,.15,.7,1,2,8,30,40]){const s=stellar(m);console.log(m,s.spectral,Math.round(s.temperature),s.radius.toFixed(3),s.luminosity.toFixed(3));}
const source=fs.readFileSync('components/formula-panel.tsx','utf8')+fs.readFileSync('components/wormhole-formulas.tsx','utf8');let count=0;for(const match of source.matchAll(/String\.raw`([^`]*)`/g)){katex.renderToString(match[1],{throwOnError:true,strict:'error'});count++;}assert(count>20);console.log(`PASS: solar references, entire mass range, color limits, ${count} strict KaTeX formulas`);
