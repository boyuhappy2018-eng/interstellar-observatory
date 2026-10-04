import test from 'node:test';
import assert from 'node:assert/strict';
import {buildReleaseConfig} from '../scripts/prepare-release.mjs';
// Structurally valid fixture only; this key does not authenticate any release.
const bytes=Buffer.alloc(42);bytes.write('Ed');
const pubkey=Buffer.from(`untrusted comment: test fixture\n${bytes.toString('base64')}\n`).toString('base64');
const env={GITHUB_REPOSITORY:'example/interstellar',RELEASE_VERSION:'0.1.0',TAURI_UPDATER_PUBLIC_KEY:pubkey};
test('release includes a HTTPS public channel and updater artifacts',()=>{
 const config=buildReleaseConfig(env);assert.equal(config.bundle.createUpdaterArtifacts,true);assert.equal(config.plugins.updater.endpoints[0],'https://github.com/example/interstellar/releases/latest/download/latest.json');assert.equal(config.version,'0.1.0');assert.ok(!JSON.stringify(config).includes('PRIVATE'));
});
test('rejects malformed repositories, versions and public keys',()=>{
 for(const invalid of [{GITHUB_REPOSITORY:'https://github.com/foo/bar'},{GITHUB_REPOSITORY:'foo/..'},{RELEASE_VERSION:'0.1.0; rm'},{RELEASE_VERSION:'01.2.3'},{TAURI_UPDATER_PUBLIC_KEY:'placeholder'}])assert.throws(()=>buildReleaseConfig({...env,...invalid}));
});
test('valid platform signing config is emitted without private material',()=>{
 const config=buildReleaseConfig({...env,WINDOWS_CERTIFICATE_THUMBPRINT:'a'.repeat(40),APPLE_SIGNING_IDENTITY:'Developer ID Application: Example',TAURI_SIGNING_PRIVATE_KEY:'secret'});
 assert.equal(config.bundle.windows.digestAlgorithm,'sha256');assert.equal(config.bundle.macOS.signingIdentity,'Developer ID Application: Example');assert.ok(!JSON.stringify(config).includes('secret'));assert.throws(()=>buildReleaseConfig({...env,WINDOWS_CERTIFICATE_THUMBPRINT:'x'}));
});
