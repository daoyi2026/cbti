import fs from 'node:fs';
import {personas} from '../data.js';
import {codes} from '../scoring.js';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=['index.html','app.js','viewer.js','effects.js','adoptions.js','data.js','questions.js','scoring.js','adoption-snapshot.js','assets/vendor/GLTFLoader.js','assets/vendor/DRACOLoader.js','assets/vendor/BufferGeometryUtils.js'];
let references=0;
for(const relative of files){const full=path.join(root,relative),source=fs.readFileSync(full,'utf8');assert.ok(!/\/Users\/|\/cat6\/|\/cat-batch-motion\//.test(source),'External workspace dependency: '+relative);const refs=[...source.matchAll(/from\s+['"]([^'"]+)['"]|(?:src|href)="(\.\/[^"]+)"/g)];for(const match of refs){const ref=(match[1]||match[2]).split('?')[0];if(ref.startsWith('.')){assert.ok(fs.existsSync(path.resolve(path.dirname(full),ref)),relative+' -> '+ref);references++;}}}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/models/manifest.json'),'utf8'));assert.equal(manifest.length,11);
assert.deepEqual(personas.map(p=>p.code),codes);assert.equal(personas.filter(p=>p.hidden).length,1);for(const persona of personas)assert.ok(manifest.some(m=>m.file===persona.model+'-motion.glb'),'Missing model for '+persona.code);
for(const model of manifest){const bytes=fs.readFileSync(path.join(root,'assets/models',model.file));assert.ok(bytes.length<10_000_000);assert.equal(bytes.length,model.bytes);assert.equal(bytes.toString('ascii',0,4),'glTF');assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),model.sha256);}
for(const file of ['draco_decoder.js','draco_wasm_wrapper.js','draco_decoder.wasm','LICENSE.txt'])assert.ok(fs.statSync(path.join(root,'assets/vendor/draco',file)).size>0);
fs.mkdirSync(path.join(root,'reports'),{recursive:true});console.log(`Checked ${references} local references and all ${manifest.length} model hashes/sizes.`);
