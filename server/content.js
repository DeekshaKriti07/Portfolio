import {validateProjects} from '../public/assets/project-schema.js';
import {readFile} from 'node:fs/promises';
export async function readProjects() {
  return validateProjects(JSON.parse(await readFile(new URL('../public/data/projects.json', import.meta.url), 'utf8')));
}

export async function migrate(db) {
  await db.query(await readFile(new URL('../database/schema.sql', import.meta.url),'utf8'));
}
export async function seed(db) {
  const rows = await readProjects();
  await db.query('BEGIN');
  try {
    for (const [i, row] of rows.entries()) await db.query('INSERT INTO projects (slug, position, content) VALUES ($1, $2, $3::jsonb) ON CONFLICT (slug) DO UPDATE SET position = EXCLUDED.position, content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP',[row.slug,i,JSON.stringify(row)]);
    await db.query('COMMIT');
  } catch (error) { await db.query('ROLLBACK'); throw error; }
}
