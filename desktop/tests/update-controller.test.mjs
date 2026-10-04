import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compiled=ts.transpileModule(readFileSync(new URL('../src/update-controller.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {UpdateController}=await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};

test('concurrent checks coalesce and a failed network request can be retried',async()=>{
 const pending=deferred();let checks=0;
 const u=new UpdateController({check:()=>{checks++;return checks===1?pending.promise:Promise.resolve(null);},restart:async()=>{}});
 const first=u.check();await u.check();assert.equal(checks,1);assert.equal(u.getSnapshot().phase,'checking');
 pending.reject(Error('offline'));await first;assert.equal(u.getSnapshot().phase,'error');
 await u.check();assert.equal(checks,2);assert.equal(u.getSnapshot().phase,'current');assert.equal(u.getSnapshot().error,'');
});
test('download progress, duplicate install suppression and restart sequence',async()=>{
 const pending=deferred();let downloads=0,restarts=0,closes=0;const phases=[];
 const handle={version:'0.2.0',body:'New optics',close:async()=>{closes++;},downloadAndInstall:async cb=>{downloads++;cb({event:'Started',data:{contentLength:1024}});cb({event:'Progress',data:{chunkLength:512}});await pending.promise;cb({event:'Progress',data:{chunkLength:512}});cb({event:'Finished'});}};
 const u=new UpdateController({check:async()=>handle,restart:async()=>{restarts++;}});u.subscribe(()=>phases.push(u.getSnapshot().phase));
 await u.check();assert.equal(u.getSnapshot().version,'0.2.0');const install=u.install();await u.install();await u.check();
 assert.equal(downloads,1);assert.equal(u.getSnapshot().bytes,512);pending.resolve();await install;
 assert.equal(u.getSnapshot().bytes,1024);assert.equal(u.getSnapshot().phase,'restart-ready');assert.ok(phases.includes('installing'));assert.equal(restarts,1);assert.equal(closes,1);
});
test('failed signature/download never restarts the app and releases its handle',async()=>{
 let restarts=0,closes=0;const u=new UpdateController({check:async()=>({version:'0.2.0',close:async()=>{closes++;},downloadAndInstall:async()=>{throw Error('signature verification failed');}}),restart:async()=>{restarts++;}});
 await u.check();await u.install();assert.equal(u.getSnapshot().phase,'error');assert.match(u.getSnapshot().error,/signature/);assert.equal(restarts,0);assert.equal(closes,1);
});
test('installed update retains a manual restart when relaunch fails',async()=>{
 let tries=0;const u=new UpdateController({check:async()=>({version:'0.2.0',close:async()=>{},downloadAndInstall:async()=>{}}),restart:async()=>{if(++tries===1)throw Error('busy');}});
 await u.check();await u.install();assert.equal(u.getSnapshot().phase,'restart-ready');assert.match(u.getSnapshot().error,/Installed successfully/);await u.restart();assert.equal(tries,2);
});
test('rechecking closes the old resource; subscriptions can be removed',async()=>{
 let closes=0,notifications=0;const u=new UpdateController({check:async()=>({version:'0.2.0',close:async()=>{closes++;},downloadAndInstall:async()=>{}}),restart:async()=>{}});
 const unsubscribe=u.subscribe(()=>notifications++);await u.check();unsubscribe();const count=notifications;await u.check();assert.equal(closes,1);assert.equal(notifications,count);await u.dispose();assert.equal(closes,2);
});
