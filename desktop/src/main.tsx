import React,{useEffect,useState,useSyncExternalStore} from 'react';
import {createRoot} from 'react-dom/client';
import {isTauri} from '@tauri-apps/api/core';
import {getVersion} from '@tauri-apps/api/app';
import {getCurrentWindow} from '@tauri-apps/api/window';
import {check} from '@tauri-apps/plugin-updater';
import {relaunch} from '@tauri-apps/plugin-process';
import {openUrl} from '@tauri-apps/plugin-opener';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import Home from '../../app/page';
import {UpdateController} from './update-controller';
import './desktop.css';
const native=isTauri();
const updates=new UpdateController({check:()=>check({timeout:15000}),restart:()=>relaunch()});
function Desktop(){
 const state=useSyncExternalStore(updates.subscribe,updates.getSnapshot,updates.getSnapshot);
 const [open,setOpen]=useState(false),[model,setModel]=useState(false),[version,setVersion]=useState('0.1.0');
 useEffect(()=>{
  if(native){void getVersion().then(setVersion).catch(()=>{});}
  const checkIfReady=()=>{if(native&&__UPDATES_READY__)void updates.check();};
  const initial=setTimeout(checkIfReady,5000),timer=setInterval(checkIfReady,6*60*60*1000);
  const click=(e:MouseEvent)=>{
   const target=e.target instanceof Element?e.target:null;
   if(native&&target?.closest('button[aria-label="Fullscreen"]')){
    e.preventDefault();e.stopPropagation();const window=getCurrentWindow();void window.isFullscreen().then(v=>window.setFullscreen(!v));return;
   }
   const link=target?.closest<HTMLAnchorElement>('a[href]');if(!link)return;
   if(new URL(link.href).pathname==='/physics.html'){e.preventDefault();e.stopPropagation();setModel(true);return;}
   if(native&&/^https?:/.test(link.href)){e.preventDefault();e.stopPropagation();void openUrl(link.href);}
  };
  const escape=(e:KeyboardEvent)=>{if(native&&e.key==='Escape')void getCurrentWindow().setFullscreen(false);};
  document.addEventListener('click',click,true);window.addEventListener('keydown',escape);
  return()=>{clearTimeout(initial);clearInterval(timer);document.removeEventListener('click',click,true);window.removeEventListener('keydown',escape);};
 },[]);
 const busy=state.phase==='checking'||state.phase==='downloading'||state.phase==='installing';
 const label=state.phase==='available'?`UPDATE ${state.version}`:state.phase==='checking'?'CHECKING':busy?'UPDATING':state.phase==='restart-ready'?'RESTART READY':'APP UPDATES';
 const messages={idle:'Automatic checks run after launch and every six hours.',checking:'Checking the signed release channel…',current:'You have the latest published version.',available:`Version ${state.version} is available.`,downloading:'Downloading and verifying the signed update…',installing:'Installing the update…', 'restart-ready':'The update is installed. Restart to continue.',error:'Update service unavailable. Your observatory continues to work offline.'};
 return <><Home/><button className="desktop-update-button" onClick={()=>setOpen(true)} aria-haspopup="dialog">{label}</button>
 <Dialog open={open} onOpenChange={setOpen}><DialogContent className="desktop-update-dialog"><DialogTitle>Observatory updates</DialogTitle><DialogDescription>INTERSTELLAR · Installed version {version}</DialogDescription>
 <p>{!native?'Desktop preview. Native updates are available inside the installed app.':!__UPDATES_READY__?'This development build has no release channel configured.':messages[state.phase]}</p>
 {state.notes&&<p className="update-notes">{state.notes}</p>}
 {(state.phase==='downloading'||state.phase==='installing')&&<><progress max={state.total||1} value={state.total?Math.min(state.bytes,state.total):undefined}/><small>{(state.bytes/1048576).toFixed(1)} MB{state.total?` / ${(state.total/1048576).toFixed(1)} MB`:''}</small></>}
 {state.error&&<details><summary>Details</summary><p>{state.error}</p></details>}
 <div className="desktop-update-actions"><button disabled={!native||!__UPDATES_READY__||busy||state.phase==='restart-ready'} onClick={()=>void updates.check()}>Check for updates</button>{state.phase==='available'&&<button onClick={()=>void updates.install()}>Install & restart</button>}{state.phase==='restart-ready'&&<button onClick={()=>void updates.restart()}>Restart now</button>}</div>
 <small>Downloaded releases are verified before installation. Updating restarts the app and resets the current observation.</small>
 </DialogContent></Dialog>
 <Dialog open={model} onOpenChange={setModel}><DialogContent className="desktop-model-dialog"><DialogTitle>Model & limitations</DialogTitle><DialogDescription>Equations, references and approximation boundaries</DialogDescription><iframe title="Scientific model notes" src="/physics.html" onLoad={e=>{const doc=e.currentTarget.contentDocument;if(!doc)return;doc.addEventListener('click',event=>{const element=event.target as Element|null;const target=element?.nodeType===1?element.closest<HTMLAnchorElement>('a'):null;if(!target)return;event.preventDefault();if(new URL(target.href).pathname==='/'){setModel(false);return;}if(native&&/^https?:/.test(target.href))void openUrl(target.href);else if(/^https?:/.test(target.href))window.open(target.href,'_blank','noopener');});}}/></DialogContent></Dialog>
 </>;
}
createRoot(document.getElementById('root')!).render(<Desktop/>);
