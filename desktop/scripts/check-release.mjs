// This is a structural and download-integrity check, not a substitute for an
// installed-app signature verification / OS installation smoke test.
import {createHash} from 'node:crypto';
const repository=process.env.GITHUB_REPOSITORY,version=process.env.RELEASE_VERSION;
if(!/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(repository||'')||!/^\d+\.\d+\.\d+$/.test(version||''))throw Error('Missing repository/version.');
const headers={Authorization:`Bearer ${process.env.GH_TOKEN}`,'X-GitHub-Api-Version':'2022-11-28',Accept:'application/vnd.github+json'};
const api=async(url,binary=false)=>{
 const response=await fetch(url,{headers:{...headers,...(binary?{Accept:'application/octet-stream'}:{})},signal:AbortSignal.timeout(120000)});
 if(!response.ok)throw Error(`GitHub response ${response.status}`);return binary?Buffer.from(await response.arrayBuffer()):response.json();
};
const releases=await api(`https://api.github.com/repos/${repository}/releases?per_page=100`);
const release=releases.find(r=>r.tag_name===`desktop-v${version}`);
if(!release||!release.draft)throw Error('Expected a draft release.');
const assets=await api(`${release.url}/assets?per_page=100`);
const manifestAsset=assets.find(a=>a.name==='latest.json');
if(!manifestAsset)throw Error('Missing latest.json.');
const manifest=JSON.parse((await api(manifestAsset.url,true)).toString());
if(manifest.version!==version)throw Error('Manifest version mismatch.');
for(const platform of ['darwin-aarch64','darwin-x86_64','windows-x86_64']){
 const entry=manifest.platforms?.[platform];
 if(!entry||typeof entry.signature!=='string'||entry.signature.length<60)throw Error(`Missing signed channel: ${platform}`);
 const url=new URL(entry.url);
 if(url.origin!=='https://github.com'||!url.pathname.startsWith(`/${repository}/releases/download/desktop-v${version}/`))throw Error(`Invalid update URL: ${platform}`);
 const name=decodeURIComponent(url.pathname.split('/').at(-1));
 const asset=assets.find(a=>a.name===name),signatureAsset=assets.find(a=>a.name===`${name}.sig`);
 if(!asset||asset.size<=0||!signatureAsset)throw Error(`Missing update payload/signature: ${platform}`);
 const signature=(await api(signatureAsset.url,true)).toString().trim();
 if(signature!==entry.signature.trim())throw Error(`Signature manifest mismatch: ${platform}`);
 if(platform.startsWith('darwin')&&!name.endsWith('.app.tar.gz'))throw Error('macOS updater must use the app archive.');
 if(platform==='windows-x86_64'&&!name.endsWith('-setup.exe'))throw Error('Windows updater must use the NSIS installer.');
}
for(const suffix of ['.dmg','-setup.exe']){
 const asset=assets.find(a=>a.name.endsWith(suffix));if(!asset)throw Error(`Missing installer: ${suffix}`);
 const bytes=await api(asset.url,true);if(bytes.length!==asset.size)throw Error(`Incomplete download: ${asset.name}`);
 const digest=createHash('sha256').update(bytes).digest('hex');console.log(`${asset.name}  SHA256 ${digest}`);
}
console.log('Draft assets and three platform update entries verified. Install and update smoke tests are still required before publishing this draft.');
