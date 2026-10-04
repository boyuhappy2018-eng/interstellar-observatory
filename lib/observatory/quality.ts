/** Per-scene dynamic resolution, with slow recovery and hysteresis.
 * Native pixels are a ceiling for AUTO, never a fixed device-name whitelist.
 * Geometry budgets stay constant while AUTO changes only spatial sampling.
 */
export class AdaptiveResolution {
 factor=1;reason='Calibrating at native resolution';private samples:number[]=[];private last=0;private warmUntil=0;private key='';private profiles=new Map<string,number>();private recoveryAt=0;
 select(key:string,now:number){if(key===this.key)return;this.profiles.set(this.key,this.factor);this.key=key;this.factor=this.profiles.get(key)??1;this.samples=[];this.last=now;this.warmUntil=now+1800;this.reason='Calibrating this scene';}
 reset(now:number){this.profiles.clear();this.factor=1;this.samples=[];this.last=now;this.warmUntil=now+1800;this.reason='Recalibrating at native resolution';}
 sample(ms:number,now:number,target:number,floor:number,gpu:boolean){
  if(!Number.isFinite(ms)||ms<=0||ms>2000||now<this.warmUntil)return;
  this.samples.push(ms);if(now-this.last<1800||this.samples.length<4)return;
  const sorted=this.samples.sort((a,b)=>a-b),p=sorted[Math.floor(sorted.length*.7)];this.samples=[];this.last=now;
  const budget=1000/target,over=gpu?budget*.94:budget*1.18,under=gpu?budget*.67:budget*1.04;
  if(p>over){const next=Math.max(floor,this.factor*Math.max(.78,Math.min(.94,Math.sqrt(budget*.83/p))));this.factor=Math.min(1,next);this.recoveryAt=now+7000;this.reason=this.factor<=floor+.001?'Device limit · resolution floor reached':'Adapting to rendering load';}
  else if(p<under&&now>this.recoveryAt&&this.factor<1){this.factor=Math.min(1,this.factor*1.08);this.recoveryAt=now+3500;this.reason='Recovering detail';}
  else this.reason=this.factor>=.999?'Native resolution':'Stable adaptive resolution';
 }
}
export function renderDimensions(width:number,height:number,dpr:number,factor:number,pixels=12000000,limit=16384){const ratio=Math.min(Math.max(.1,dpr*factor),Math.sqrt(pixels/Math.max(1,width*height)),limit/Math.max(1,width),limit/Math.max(1,height));return {w:Math.max(1,Math.floor(width*ratio)),h:Math.max(1,Math.floor(height*ratio)),ratio};}
/** Optional asynchronous GPU queries; browsers without this extension use frame timing. */
export class GpuTimer{
 private ext:{TIME_ELAPSED_EXT:number;GPU_DISJOINT_EXT:number}|null;private pending:WebGLQuery[]=[];private active:WebGLQuery|null=null;private counter=0;ms=0;
 constructor(private gl:WebGL2RenderingContext){this.ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');}
 get supported(){return !!this.ext;}
 begin(){if(!this.ext||this.pending.length>=4||this.counter++%4!==0)return;this.active=this.gl.createQuery();if(this.active)this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT,this.active);}
 end(){if(this.active&&this.ext){this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);this.pending.push(this.active);this.active=null;}}
 poll(){if(!this.ext||!this.pending.length)return null;const g=this.gl;if(g.getParameter(this.ext.GPU_DISJOINT_EXT)){this.pending.forEach(q=>g.deleteQuery(q));this.pending=[];this.ms=0;return null;}const q=this.pending[0];if(!g.getQueryParameter(q,g.QUERY_RESULT_AVAILABLE))return null;const ms=Number(g.getQueryParameter(q,g.QUERY_RESULT))/1e6;g.deleteQuery(q);this.pending.shift();if(ms>0&&ms<2000){this.ms=ms;return ms;}return null;}
 destroy(){this.pending.forEach(q=>this.gl.deleteQuery(q));this.pending=[];}
}
