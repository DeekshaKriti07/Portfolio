import{$ as n,a as L,B as K}from"./ui-hJOf-9t6.js";import{b as U,s as z}from"./common-CXaJzYHh.js";
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const ext=h=>/^https?:/.test(h);

U("skills",`Skills — ${K.name}`);
const empty=n("[data-skill-empty]");
let data=null;
try{data=await(await fetch("skills/skills.json")).json()}catch(e){}
if(!data){empty.hidden=!1;empty.textContent="Skills could not be loaded.";z()}
else{
  const cats=data.categories,all=cats.flatMap(c=>c.skills),tags=new Set(all.flatMap(s=>s.tags));
  n("[data-skills-note]").textContent=data.note;
  n("[data-skills-stats]").innerHTML=[[all.length,"skills"],[cats.length,"areas"],[tags.size,"projects, events and certificates"]].map(([v,k])=>`<div><b>${v}</b><small>${k}</small></div>`).join("");
  const a=(l,cls)=>`<a class="key key--sm ${cls}" href="${esc(l.href)}"${ext(l.href)?' target="_blank" rel="noopener"':""}>${esc(l.label)}</a>`;
  const p=data.project;
  n("[data-spot]").innerHTML=`<section class="spot" id="ruraldoc"><div><p class="kicker">${esc(p.kicker)}</p><h2>${esc(p.title)}</h2><p class="spot__lead">${esc(p.lead)}</p>
    <div class="spot__blocks">${p.blocks.map(b=>`<div><h4>${esc(b.h)}</h4><p>${esc(b.p)}</p></div>`).join("")}</div>
    <div class="spot__actions">${p.links.map((l,i)=>a(l,i?"key--outline":"key--red")).join("")}</div></div>
    <aside class="spot__side"><div class="spot__stats">${p.stats.map(s=>`<div><b>${esc(s.v)}</b><small>${esc(s.k)}</small></div>`).join("")}</div>
    <div><h4>Stack</h4><div class="spot__stack">${p.stack.map(s=>`<span>${esc(s)}</span>`).join("")}</div></div></aside></section>`;
  n("[data-skill-sections]").innerHTML=cats.map((c,i)=>`<section class="skillsec" id="${esc(c.id)}" data-cat="${esc(c.id)}">
    <header class="skillsec__head"><span class="skillsec__num">${String(i+1).padStart(2,"0")}</span><h2>${esc(c.label)}</h2><p class="skillsec__lead">${esc(c.lead)}</p></header>
    <div class="skillgrid">${c.skills.map(s=>`<article class="skillcard" data-text="${esc((s.name+" "+s.summary+" "+s.detail+" "+s.tags.join(" ")).toLowerCase())}">
      <div class="skillcard__tags">${s.tags.map(t=>`<span class="skilltag">${esc(t)}</span>`).join("")}</div>
      <h3>${esc(s.name)}</h3><p class="skillcard__sum">${esc(s.summary)}</p><p class="skillcard__detail">${esc(s.detail)}</p>
      <div class="skillcard__ev">${s.evidence.map(l=>a(l,"key--outline")).join("")}</div></article>`).join("")}</div></section>`).join("");
  const chips=n("[data-skill-topics]");
  chips.innerHTML=[{id:"",label:"All",n:all.length},...cats.map(c=>({id:c.id,label:c.label,n:c.skills.length}))].map((c,i)=>`<button type="button" class="chip" data-cat="${esc(c.id)}" aria-pressed="${i===0}">${esc(c.label)} <small>${c.n}</small></button>`).join("");
  let cat="";const q=n("[data-skill-search]"),count=n("[data-skill-count]");
  const apply=()=>{const t=q.value.trim().toLowerCase();let total=0;
    L(".skillsec").forEach(sec=>{let v=0;const inCat=!cat||sec.dataset.cat===cat;
      L(".skillcard",sec).forEach(card=>{const ok=inCat&&(!t||card.dataset.text.includes(t));card.hidden=!ok;ok&&v++});
      sec.hidden=v===0;total+=v});
    n("[data-spot]").hidden=!!cat||!!t;empty.hidden=total>0;count.textContent=`${total} skill${total===1?"":"s"}`};
  q.addEventListener("input",apply);
  chips.addEventListener("click",e=>{const b=e.target.closest("[data-cat]");b&&(cat=b.dataset.cat,L("[data-cat]",chips).forEach(x=>x.setAttribute("aria-pressed",String(x===b))),apply())});
  apply();z();
  let h="";try{h=decodeURIComponent(location.hash.slice(1))}catch{}
  if(h){const el=document.getElementById(h);el&&setTimeout(()=>el.scrollIntoView({behavior:"auto",block:"start"}),400)}
}
