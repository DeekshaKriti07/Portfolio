import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readProjects} from '../server/content.js';
import {validateProjects} from '../public/assets/project-schema.js';
test('release content has valid unique identifiers and HTTPS links',async()=>{
  const rows=await readProjects();assert.ok(rows.length>0);
  assert.equal(rows.find(p=>p.slug==='campuslink').live,'https://campuslink-rz6d.onrender.com');
});
test('rejects malformed rows, duplicate identities and unsafe URLs',async()=>{
  const [project]=await readProjects();
  for(const value of [null,[],[null],[project,project],[{...project,workflow:null}],[{...project,slug:'bad"id'}],[{...project,live:'javascript:alert(1)'}],[{...project,repo:'https://github.com.evil.example/project'}]])assert.throws(()=>validateProjects(value));
});
