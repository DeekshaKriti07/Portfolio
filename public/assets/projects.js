import {validateProjects} from './project-schema.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = value => { try { const u = new URL(value, location.origin); return ['http:', 'https:'].includes(u.protocol) ? escape(u.href) : ''; } catch { return ''; } };
const container = document.querySelector('[data-projects]');
const search = document.querySelector('[data-project-search]');
let projects = [];
function render() {
  const query = search.value.trim().toLowerCase();
  const items = projects.filter(p => JSON.stringify(p).toLowerCase().includes(query));
  document.querySelector('[data-project-count]').textContent = `${items.length} stories`;
  container.innerHTML = items.length ? items.map((p, i) => `<article class="project-story" id="${escape(p.slug)}">
    <div class="project-story__heading"><span class="project-story__number">${String(i+1).padStart(2,'0')}</span><div><p class="kicker">${escape(p.event)}</p><h3>${escape(p.title)}</h3><span class="project-story__status">${escape(p.status)}</span></div></div>
    <p class="project-story__summary">${escape(p.summary)}</p>
    <div class="project-story__grid"><section><h4>Problem statement</h4><p>${escape(p.problem)}</p></section><section><h4>Proposed solution</h4><p>${escape(p.solution)}</p></section></div>
    ${p.workflow.length ? `<section class="project-story__workflow"><h4>Workflow</h4><ol>${p.workflow.map(step=>`<li>${escape(step)}</li>`).join('')}</ol></section>` : ''}
    <section class="project-story__output"><h4>Output &amp; outcome</h4><p>${escape(p.output)}</p></section>
    <ul class="project-story__tags" aria-label="Technologies">${p.technologies.map(t=>`<li>${escape(t)}</li>`).join('')}</ul>
    <div class="project-story__actions">${p.live && safeUrl(p.live) ? `<a class="key key--sm key--red" href="${safeUrl(p.live)}" target="_blank" rel="noopener noreferrer">Open live application ↗</a>` : ''}${p.repo && safeUrl(p.repo) ? `<a class="key key--sm key--red" href="${safeUrl(p.repo)}" target="_blank" rel="noopener noreferrer">View source on GitHub ↗</a>`:''}${p.certificate ? `<a class="key key--sm key--outline" href="certifications.html#${escape(p.certificate)}">View certificate →</a>`:''}</div>
    <p class="project-story__scope">${escape(p.scope)}</p>
  </article>`).join('') : '<p class="empty">No matching project. Try an event name or technology.</p>';
}
async function load() {
  try {
    const response = await fetch('/api/projects', {signal:AbortSignal.timeout(6000)});
    if (!response.ok) throw new Error('API unavailable');
    const data = await response.json();
    if (!Array.isArray(data.projects)) throw new Error('Invalid response');
    projects = validateProjects(data.projects);
  } catch {
    try {
      const response = await fetch('data/projects.json');
      if (!response.ok) throw new Error('Snapshot unavailable');
      projects = validateProjects(await response.json());
    } catch {
      container.innerHTML = '<p role="alert">Project stories could not be loaded. Please refresh the page or get in touch by email.</p>';
      return;
    }
  }
  render();
  let id = '';
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({behavior:'instant',block:'start'}));
}
search.addEventListener('input', render);
load();
