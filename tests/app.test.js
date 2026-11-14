import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {createApp} from '../server/app.js';
import {migrate,seed} from '../server/content.js';
let db,server,base;
before(async()=>{
  db=new PGlite();await db.waitReady;await migrate(db);await seed(db);
  server=createApp(db).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  base=`http://127.0.0.1:${server.address().port}`;
});
after(async()=>{await new Promise(resolve=>server.close(resolve));await db.close();});
test('seed is idempotent and returns every detailed story',async()=>{
  await seed(db);
  const response=await fetch(`${base}/api/projects`);assert.equal(response.status,200);
  const {projects}=await response.json();assert.equal(projects.length,7);assert.equal(projects[0].slug,'jarvis-ai');
  assert.ok(projects.every(p=>p.problem&&p.solution&&p.output));
  assert.equal(projects.find(p=>p.slug==='civicshield').repo,'https://github.com/DeekshaKriti07/CivicShield');
});
test('project detail uses a validated parameter and handles missing records',async()=>{
  const response=await fetch(`${base}/api/projects/jarvis-ai`);assert.equal(response.status,200);assert.equal((await response.json()).title,'Jarvis AI');
  assert.equal((await fetch(`${base}/api/projects/not-present`)).status,404);
  assert.equal((await fetch(`${base}/api/projects/${encodeURIComponent("' OR 1=1 --")}`)).status,400);
});
test('database content is served instead of the bundled snapshot',async()=>{
  await db.query("UPDATE projects SET content = jsonb_set(content, '{title}', '\"Database edit\"') WHERE slug = $1",['jarvis-ai']);
  assert.equal((await (await fetch(`${base}/api/projects/jarvis-ai`)).json()).title,'Database edit');await seed(db);
});
test('both health endpoints pass and unseeded database is unready',async()=>{
  assert.equal((await fetch(`${base}/health/live`)).status,200);assert.equal((await fetch(`${base}/health/ready`)).status,200);
  await db.query('BEGIN');await db.query('DELETE FROM projects');assert.equal((await fetch(`${base}/health/ready`)).status,503);await db.query('ROLLBACK');
});
test('serves public pages and protects backend files and write routes',async()=>{
  for(const path of ['/','/episodes.html','/certifications.html','/skills.html','/support.html']) assert.equal((await fetch(base+path)).status,200);
  for(const path of ['/server/db.js','/.env','/package.json','/missing-page'])assert.equal((await fetch(base+path)).status,404);
  assert.equal((await fetch(`${base}/api/projects`,{method:'POST',body:'{}'})).status,404);
});
test('security and cache headers allow future content updates',async()=>{
  const response=await fetch(`${base}/assets/projects.js`);assert.match(response.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.doesNotMatch(response.headers.get('cache-control'),/immutable/);assert.equal(response.headers.get('x-powered-by'),null);
});
test('a failed database returns a safe 503 without leaking internals',async()=>{
  const failing=createApp({query:async()=>{throw new Error('private-database-password');}}).listen(0,'127.0.0.1');
  await new Promise(resolve=>failing.once('listening',resolve));
  try{const response=await fetch(`http://127.0.0.1:${failing.address().port}/api/projects`);assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/private/);}finally{await new Promise(resolve=>failing.close(resolve));}
});
