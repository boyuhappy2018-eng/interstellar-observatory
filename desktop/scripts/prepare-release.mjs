import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// The public key is embedded in the binary. Private signing material remains in
// the release runner's environment and is consumed only by the Tauri CLI.
export function buildReleaseConfig(env) {
 const repository=env.GITHUB_REPOSITORY||'';
 if(!/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(repository)||repository.split('/')[1]==='..')throw Error('GITHUB_REPOSITORY must be owner/repository.');
 const version=env.RELEASE_VERSION||'';
 if(!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version))throw Error('RELEASE_VERSION must be a stable semantic version, for example 0.1.0.');
 const pubkey=(env.TAURI_UPDATER_PUBLIC_KEY||'').trim();
 if(!/^[A-Za-z0-9+/]+={0,2}$/.test(pubkey))throw Error('A Tauri updater public key is required.');
 const lines=Buffer.from(pubkey,'base64').toString('utf8').trim().split(/\r?\n/);
 const key=Buffer.from(lines[1]||'','base64');
 if(lines.length!==2||!lines[0].startsWith('untrusted comment:')||key.length!==42||key.subarray(0,2).toString()!=='Ed')throw Error('Invalid Tauri updater public-key format.');
 const config={version,bundle:{createUpdaterArtifacts:true},plugins:{updater:{pubkey,endpoints:[`https://github.com/${repository}/releases/latest/download/latest.json`]}}};
 const thumbprint=(env.WINDOWS_CERTIFICATE_THUMBPRINT||'').replace(/\s/g,'');
 if(thumbprint){
  if(!/^[0-9A-Fa-f]{40}$/.test(thumbprint))throw Error('Invalid Windows certificate thumbprint.');
  config.bundle.windows={certificateThumbprint:thumbprint,digestAlgorithm:'sha256',timestampUrl:'http://timestamp.digicert.com'};
 }
 if(env.APPLE_SIGNING_IDENTITY)config.bundle.macOS={signingIdentity:env.APPLE_SIGNING_IDENTITY};
 return config;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const config=buildReleaseConfig(process.env);
  const output=fileURLToPath(new URL('../src-tauri/tauri.release.conf.json',import.meta.url));
  writeFileSync(output,JSON.stringify(config,null,2)+'\n');
  console.log(`Release configuration prepared for ${config.version}. No private key is written to disk.`);
 }catch(error){console.error(error.message);process.exitCode=1;}
}
