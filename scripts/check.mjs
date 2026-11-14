import {readFile,readdir,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readProjects} from '../server/content.js';
const root=fileURLToPath(new URL('../',import.meta.url));
process.chdir(root);
async function walk(folder) {const entries=await readdir(folder,{withFileTypes:true});return(await Promise.all(entries.map(e=>e.isDirectory()?walk(`${folder}/${e.name}`):`${folder}/${e.name}`))).flat();}
for(const folder of ['server','scripts','public/assets']) for(const file of await walk(folder)) if(/\.(js|mjs)$/.test(file)) {
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(result.status!==0)throw new Error(`Syntax check failed: ${file}\n${result.stderr}`);
}
const projects=await readProjects();
for(const file of (await readdir('public')).filter(f=>f.endsWith('.html'))) {
  const html=await readFile(`public/${file}`,'utf8');
  for(const [,value] of html.matchAll(/\s(?:src|href)="([^"]+)"/g)) {
    if(/^(?:https?:|mailto:|tel:|#|data:|blob:)/.test(value))continue;
    await access(resolve(root,'public',value.split(/[?#]/)[0]||'.'));
  }
  if(/\b(?:year\s+2|second-year)\b/i.test(html))throw new Error(`Inconsistent year label: ${file}`);
}
for(const project of projects)if(project.certificate) {
  const source=await readFile('public/assets/certifications.js','utf8');
  if(!source.includes(`"${project.certificate}"`))throw new Error(`Missing certificate: ${project.certificate}`);
}
const lock=JSON.parse(await readFile('package-lock.json','utf8'));
const pkg=JSON.parse(await readFile('package.json','utf8'));
if(lock.packages[''].version!==pkg.version)throw new Error('Refresh package-lock.json using npm install');
console.log(`Checked JavaScript syntax, local page assets and ${projects.length} project records.`);
