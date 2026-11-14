/* Home page "Skills" section: renders skills/skills.json (the same file the Skills page uses). */
import{g as G}from"./ui-hJOf-9t6.js";
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const ext=h=>/^https?:/.test(h);

const mount=document.querySelector("[data-skillcats]");
if(mount){
  try{
    const data=await(await fetch("skills/skills.json")).json();
    const CAP=5;
    mount.innerHTML=data.categories.map(c=>{
      const shown=c.skills.slice(0,CAP);
      const rest=c.skills.length-shown.length;
      return `<article class="skillcat">
      <span class="skillcat__count">${c.skills.length} skills</span>
      <h3>${esc(c.label)}</h3>
      <p class="skillcat__lead">${esc(c.lead)}</p>
      <ul class="skilllist">${shown.map(s=>`<li><b>${esc(s.name)}</b><span>${esc(s.summary)}</span></li>`).join("")}</ul>
      ${rest>0?`<p class="skilllist__more">+${rest} more</p>`:""}
      <a class="link-line" href="skills.html#${esc(c.id)}">Details →</a></article>`}).join("")
      +`<article class="skillcat skillcat--cta"><h3>Every skill, in detail</h3><p>What I did, what the project used, what I learned, and the certificate or paper that backs each one up.</p><a class="key key--red" href="skills.html">Open the Skills page →</a></article>`;
    requestAnimationFrame(()=>{try{const ST=G.core.globals().ScrollTrigger;ST&&ST.refresh()}catch(e){}window.dispatchEvent(new Event("resize"))});
  }catch(e){mount.innerHTML='<p class="empty">Skills could not be loaded. <a class="link-line" href="skills.html">Open the Skills page</a></p>'}
}
