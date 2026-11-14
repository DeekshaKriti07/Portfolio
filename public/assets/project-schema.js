const fields = ['title', 'event', 'status', 'summary', 'problem', 'solution', 'output', 'scope'];
export function validateProjects(rows) {
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 200) throw new Error('Expected a non-empty project list');
  const seen = new Set();
  for (const row of rows) {
    if (!row || typeof row !== 'object' || typeof row.slug !== 'string' || row.slug.length > 100 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(row.slug) || seen.has(row.slug)) throw new Error('Invalid or duplicate project identifier');
    seen.add(row.slug);
    for (const key of fields) if (typeof row[key] !== 'string' || !row[key].trim() || row[key].length > 20000) throw new Error(`Invalid project field: ${key}`);
    for (const key of ['workflow', 'technologies']) if (!Array.isArray(row[key]) || row[key].length > 50 || row[key].some(value => typeof value !== 'string' || !value.trim() || value.length > 5000)) throw new Error(`Invalid project list: ${key}`);
    for (const key of ['repo', 'live']) {
      if (row[key] === undefined || row[key] === '') continue;
      if (typeof row[key] !== 'string') throw new Error(`Invalid project link: ${key}`);
      const url = new URL(row[key]);
      if (url.protocol !== 'https:' || url.username || url.password || (key === 'repo' && url.hostname !== 'github.com')) throw new Error(`Invalid project link: ${key}`);
    }
    if (typeof row.certificate !== 'string' || (row.certificate && !/^cert-[a-z0-9-]+$/.test(row.certificate))) throw new Error('Invalid certificate identifier');
  }
  return rows;
}
