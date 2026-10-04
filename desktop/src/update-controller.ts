export type Phase='idle'|'checking'|'current'|'available'|'downloading'|'installing'|'restart-ready'|'error';
export type Progress={event:'Started';data:{contentLength?:number}}|{event:'Progress';data:{chunkLength:number}}|{event:'Finished'};
export interface UpdateHandle{version:string;body?:string;downloadAndInstall:(onEvent:(event:Progress)=>void,options:{timeout:number})=>Promise<void>;close:()=>Promise<void>}
export type Snapshot={phase:Phase;version:string;notes:string;bytes:number;total:number|null;error:string};
export class UpdateController{
 private state:Snapshot={phase:'idle',version:'',notes:'',bytes:0,total:null,error:''};
 private update:UpdateHandle|null=null;
 private listeners=new Set<()=>void>();
 constructor(private adapter:{check:()=>Promise<UpdateHandle|null>;restart:()=>Promise<void>}){}
 getSnapshot=()=>this.state;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
 private set(patch:Partial<Snapshot>){this.state={...this.state,...patch};for(const listener of this.listeners)listener();}
 private get busy(){return ['checking','downloading','installing','restart-ready'].includes(this.state.phase);}
 async check(){
  if(this.busy)return;
  this.set({phase:'checking',error:'',bytes:0,total:null});
  const previous=this.update;this.update=null;
  try{await previous?.close();}catch{/* Backend resource disposal must not prevent a new check. */}
  try{this.update=await this.adapter.check();this.set({phase:this.update?'available':'current',version:this.update?.version||'',notes:this.update?.body||''});}
  catch(e){this.set({phase:'error',error:String(e)});}
 }
 async install(){
  if(this.state.phase!=='available'||!this.update)return;
  const update=this.update;this.set({phase:'downloading',bytes:0,total:null,error:''});
  try{
   await update.downloadAndInstall(event=>{
    if(event.event==='Started')this.set({total:event.data.contentLength||null});
    if(event.event==='Progress')this.set({bytes:this.state.bytes+event.data.chunkLength});
    if(event.event==='Finished')this.set({phase:'installing'});
   },{timeout:120000});
   // Windows exits when its installer launches. macOS reaches this state.
   this.set({phase:'restart-ready'});
   await this.restart();
  }catch(e){this.set({phase:'error',error:String(e)});}
  finally{this.update=null;try{await update.close();}catch{/* Resource may disappear during app exit. */}}
 }
 async restart(){
  if(this.state.phase!=='restart-ready')return;
  try{await this.adapter.restart();}catch(e){this.set({error:`Installed successfully. Restart failed: ${String(e)}`});}
 }
 async dispose(){this.listeners.clear();const u=this.update;this.update=null;if(!this.busy)await u?.close();}
}
