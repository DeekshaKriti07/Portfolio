import{$ as h,I as ot,G as at,V as nt,g as et,r as j,C as Y,L as lt,m as ht,a as st,F as q,S as pt,B as ut,b as gt,T as vt,c as xt,d as yt,f as bt,s as Tt,i as Et,h as Mt,E as Rt,e as wt,t as St,j as Lt,k as At,l as _t,n as It,o as Ut,p as Dt,q as kt,u as Ct}from"./ui-hJOf-9t6.js";const Q=e=>{const f=e.replace("#",""),b=parseInt(f.length===3?f.split("").map(S=>S+S).join(""):f,16);return[(b>>16&255)/255,(b>>8&255)/255,(b&255)/255]},Ht=`#version 300 es
in vec2 p; out vec2 vUv;
void main(){ vUv = p*0.5+0.5; gl_Position = vec4(p,0.,1.); }`,Pt=`#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uA, uB;
uniform vec2 uRes, uVid, uFocus, uPtr;
uniform float uZoom, uMix, uTime, uDpr;
uniform vec3 uLift, uGamma, uGain, uShadow, uMid, uHigh, uHalCol;
uniform float uContrast, uSat, uMap, uGrain, uGrainSize, uHal, uAb, uVig, uDepth, uStyleMix, uStyleScale, uLensR, uPtrOn;
uniform int uStyle, uLens;

vec3 src(vec2 uv, float lod){ return mix(textureLod(uA, uv, lod).rgb, textureLod(uB, uv, lod).rgb, uMix); }
float lum(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float bayer4(vec2 p){
  int x = int(mod(p.x,4.)), y = int(mod(p.y,4.));
  int m[16] = int[16](0,8,2,10, 12,4,14,6, 3,11,1,9, 15,7,13,5);
  return float(m[y*4+x])/16.;
}

void main(){
  float ar = uRes.x/uRes.y, vr = uVid.x/uVid.y;
  vec2 s = ar > vr ? vec2(1., vr/ar) : vec2(ar/vr, 1.);
  vec2 uv = (vUv-.5)*s/uZoom + uFocus;
  vec2 fc = vUv*uRes; // pixel coords (device px)

  // pointer parallax: luminance as cheap depth
  float l0 = lum(src(uv, 1.));
  uv += uPtr*uDepth*(l0-.35);

  // chromatic aberration (radial)
  vec2 d = (vUv-.5);
  vec2 ab = d*uAb*(.4+dot(d,d)*3.);
  vec3 c = vec3(src(uv+ab,0.).r, src(uv,0.).g, src(uv-ab,0.).b);

  // halation: blurred highlights, warm
  if (uHal > 0.001){
    vec3 b = src(uv,4.)*.5 + src(uv,6.)*.5;
    float h = max(lum(b)-.42, 0.);
    c += uHalCol * h * uHal * 1.6;
  }

  // lens (alt look inside a circle around the pointer)
  float lens = 0.;
  if (uLens > 0 && uPtrOn > 0.){
    vec2 q = (vUv - (uPtr*.5+.5)); q.x *= ar;
    float dd = length(q);
    lens = smoothstep(uLensR, uLensR*.72, dd);
  }

  // grade
  c = pow(max(c + uLift, 0.), 1./max(uGamma, .001)) * uGain;
  c = (c-.5)*uContrast + .5;
  float L = lum(c);
  c = mix(vec3(L), c, uSat);
  if (uMap > 0.){
    vec3 gm = L < .5 ? mix(uShadow, uMid, L*2.) : mix(uMid, uHigh, (L-.5)*2.);
    c = mix(c, gm, uMap);
  }

  // style layer
  float sm = uStyleMix;
  int st = uStyle;
  if (uLens == 1) { sm = mix(sm, 1., lens); if (st == 0) st = 1; }
  if (st != 0 && sm > 0.001){
    float cell = max(2., uStyleScale*uDpr);
    float Ls = lum(c);
    vec3 sc = c;
    if (st == 1){
      vec2 g = fc/cell; vec2 f = fract(g)-.5;
      // rotate 45deg like a print screen
      f = mat2(.7071,-.7071,.7071,.7071)*(fract(mat2(.7071,.7071,-.7071,.7071)*g)-.5);
      float r = sqrt(Ls)*.72;
      float dot_ = smoothstep(r+.08, r-.08, length(f));
      sc = mix(uShadow*.6, uHigh, dot_);
    } else if (st == 2){
      float t = bayer4(floor(fc/max(1.,cell*.5)));
      float q = floor(Ls*4. + t)/3.;
      sc = mix(uShadow*.6, uHigh, clamp(q,0.,1.));
    } else {
      float sl = .86 + .14*sin(fc.y*3.14159/max(1.,uDpr*1.5));
      sc = c*sl;
    }
    c = mix(c, sc, sm);
  }
  if (uLens == 2){ // thermal
    float Lt = lum(c);
    vec3 th = Lt < .33 ? mix(vec3(.02,.03,.25), vec3(.8,.1,.35), Lt*3.) : Lt < .66 ? mix(vec3(.8,.1,.35), vec3(1.,.7,.1), (Lt-.33)*3.) : mix(vec3(1.,.7,.1), vec3(1.), (Lt-.66)*3.);
    c = mix(c, th, lens);
  } else if (uLens == 3){ // negative; graded through the palette map when one is set (raw RGB invert turns colours garish)
    float Li = 1. - lum(c);
    vec3 neg = uMap > 0. ? (Li < .5 ? mix(uShadow, uMid, Li*2.) : mix(uMid, uHigh, (Li-.5)*2.)) : vec3(Li);
    c = mix(c, neg, lens*.94);
  }
  if (uLens > 0){ float rim = smoothstep(.0,.012,lens)*(1.-smoothstep(.012,.05,lens)); c += rim*.12; }

  // grain: animated, luminance weighted (strongest in the mids)
  float gs = max(1., floor(uGrainSize*uDpr + .5));
  float tq = floor(uTime*24.);
  float n = hash(floor(fc/gs) + vec2(tq*17.31, tq*7.13)) - .5;
  float Lg = lum(c);
  c += n * uGrain * (.4 + 1.2*(1.-abs(Lg-.5)*2.));

  // vignette
  float v = smoothstep(.95, .25, length(d)*1.15);
  c *= mix(1., v, uVig);

  o = vec4(c, 1.);
}`;async function dt(e,f){const b=window.matchMedia("(prefers-reduced-motion: reduce)").matches,S=Array.isArray(f.src)?f.src:[f.src];let r={focus:[.5,.5],zoom:1,playbackRate:1,crossfade:!0,lift:[0,0,0],gamma:[1,1,1],gain:[1,1,1],contrast:1.05,saturation:1,map:void 0,grain:.06,grainSize:1.6,halation:.35,halationColor:"#ffb48a",aberration:.0015,vignette:.35,style:"none",styleMix:0,styleScale:5,depth:.012,lens:"none",lensRadius:.16,...f};const z=()=>{const a=document.createElement("video");return a.muted=!0,a.loop=!0,a.playsInline=!0,a.preload="auto",a.crossOrigin="anonymous",a.setAttribute("muted",""),a.setAttribute("playsinline",""),a.src=S[0],f.poster&&(a.poster=new URL(f.poster,document.baseURI).href),a},U=!!f.external,v=U||/\.(jpe?g|png|webp|avif)(\?.*)?$/i.test(S[0]),c=v?document.createElement("video"):z(),y=v?document.createElement("video"):z(),d=new Image;let L=!1;v&&!U&&(d.crossOrigin="anonymous",d.src=S[0]);const t=e.getContext("webgl2",{antialias:!1,alpha:!1,powerPreference:"high-performance"}),A=f.pointerTarget||e.parentElement||e;if(!t&&U){const a=e.getContext("2d");return e.style.filter="contrast(1.06) saturate(.9)",{video:c,webgl:!1,set(){},destroy(){},pointer:()=>({x:0,y:0,on:0}),frame(m){if(!a)return;const T=e.getBoundingClientRect();e.width!==Math.round(T.width)&&(e.width=Math.round(T.width),e.height=Math.round(T.height));const J=m.width,O=m.height,D=Math.max(e.width/J,e.height/O);a.drawImage(m,(e.width-J*D)/2,(e.height-O*D)/2,J*D,O*D)}}}if(!t&&v)return d.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:contrast(1.06) saturate(.92)",e.replaceWith(d),{video:c,webgl:!1,set(){},destroy(){},pointer:()=>({x:0,y:0,on:0}),frame(){}};if(!t)return c.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:contrast(1.08) saturate(.92) brightness(.95)",e.replaceWith(c),c.play().catch(()=>{}),f.onReady?.(),{video:c,webgl:!1,set(){},destroy(){c.pause()},pointer:()=>({x:0,y:0,on:0}),frame(){}};const E=(a,m)=>{const T=t.createShader(a);if(t.shaderSource(T,m),t.compileShader(T),!t.getShaderParameter(T,t.COMPILE_STATUS))throw new Error(t.getShaderInfoLog(T)||"shader");return T},M=t.createProgram();t.attachShader(M,E(t.VERTEX_SHADER,Ht)),t.attachShader(M,E(t.FRAGMENT_SHADER,Pt)),t.linkProgram(M),t.useProgram(M);const N=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,N),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);const W=t.getAttribLocation(M,"p");t.enableVertexAttribArray(W),t.vertexAttribPointer(W,2,t.FLOAT,!1,0,0),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!0);const l=a=>t.getUniformLocation(M,a),G=a=>{const m=t.createTexture();return t.activeTexture(t.TEXTURE0+a),t.bindTexture(t.TEXTURE_2D,m),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,new Uint8Array([0,0,0,255])),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),m},k=G(0),R=G(1);t.uniform1i(l("uA"),0),t.uniform1i(l("uB"),1);let u={x:0,y:0,tx:0,ty:0,on:0,idle:0};const B=a=>{const m=e.getBoundingClientRect();u.tx=Math.max(-.92,Math.min(.92,(a.clientX-m.left)/m.width*2-1)),u.ty=Math.max(-.92,Math.min(.92,-((a.clientY-m.top)/m.height*2-1))),u.on=1,u.idle=0};A.addEventListener("pointermove",B,{passive:!0});const H=(a,m,T)=>{t.activeTexture(t.TEXTURE0+m),t.bindTexture(t.TEXTURE_2D,a),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,T),t.generateMipmap(t.TEXTURE_2D)};let C=!1;const w=()=>{C||(C=!0,c.playbackRate=y.playbackRate=r.playbackRate,r.crossfade&&isFinite(c.duration)&&(y.currentTime=c.duration/2),b||(c.play().catch(()=>{}),y.play().catch(()=>{})))};v?U||(d.onload=()=>{for(const[a,m]of[[k,0],[R,1]])t.activeTexture(t.TEXTURE0+m),t.bindTexture(t.TEXTURE_2D,a),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,d),t.generateMipmap(t.TEXTURE_2D);L=!0},d.complete&&d.naturalWidth&&d.onload(null)):(c.addEventListener("loadedmetadata",w),c.load(),y.load(),c.readyState>=1&&w());let _=1,P=1,i=!1,o=0,n=performance.now(),s=n,p=1,I=!1;const x=()=>{p=Math.min(window.devicePixelRatio||1,2);const a=e.getBoundingClientRect();e.width=Math.max(2,Math.round(a.width*p)),e.height=Math.max(2,Math.round(a.height*p)),t.viewport(0,0,e.width,e.height)},g=new ResizeObserver(x);g.observe(e),x();let F=!0;const Z=new IntersectionObserver(a=>{F=a[a.length-1]?.isIntersecting??!0});Z.observe(e);const K=a=>{if(I)return;o=requestAnimationFrame(K);const m=Math.min(.05,(a-n)/1e3);if(n=a,!F||document.hidden)return;u.idle+=m,u.idle>3&&(u.tx=Math.sin(a/2600)*.5,u.ty=Math.sin(a/3700+1.2)*.35,u.on=r.lens==="none"?0:1);const T=1-Math.exp(-5*m);if(u.x+=(u.tx-u.x)*T,u.y+=(u.ty-u.y)*T,!v&&c.readyState>=2&&(H(k,0,c),r.crossfade&&y.readyState>=2&&H(R,1,y)),v&&!L)return;let O=0;const D=c.duration;if(!v&&r.crossfade&&isFinite(D)&&D>0){const it=Math.pow(Math.sin(Math.PI*(c.currentTime%D/D)),2),V=Math.pow(Math.sin(Math.PI*(y.currentTime%D/D)),2);O=y.readyState>=2?V/Math.max(1e-4,it+V):0}const ft={none:0,style:1,thermal:2,invert:3}[r.lens],mt={none:0,halftone:1,dither:2,scan:3}[r.style],X=(it,V)=>t.uniform3f(l(it),V[0],V[1],V[2]);t.uniform2f(l("uRes"),e.width,e.height),t.uniform2f(l("uVid"),U?_:v?d.naturalWidth:c.videoWidth||1920,U?P:v?d.naturalHeight:c.videoHeight||1080),t.uniform2f(l("uFocus"),r.focus[0],r.focus[1]),t.uniform2f(l("uPtr"),u.x,u.y),t.uniform1f(l("uZoom"),v&&!U?r.zoom*(1.04+.03*Math.sin((a-s)/1e3*.17)):r.zoom),t.uniform1f(l("uMix"),O),t.uniform1f(l("uTime"),(a-s)/1e3),t.uniform1f(l("uDpr"),p),X("uLift",r.lift),X("uGamma",r.gamma),X("uGain",r.gain);const $=r.map;X("uShadow",$?Q($.shadow):[0,0,0]),X("uMid",$?Q($.mid):[.5,.5,.5]),X("uHigh",$?Q($.high):[1,1,1]),X("uHalCol",Q(r.halationColor)),t.uniform1f(l("uContrast"),r.contrast),t.uniform1f(l("uSat"),r.saturation),t.uniform1f(l("uMap"),$?$.amount:0),t.uniform1f(l("uGrain"),r.grain),t.uniform1f(l("uGrainSize"),r.grainSize),t.uniform1f(l("uHal"),r.halation),t.uniform1f(l("uAb"),r.aberration),t.uniform1f(l("uVig"),r.vignette),t.uniform1f(l("uDepth"),r.depth),t.uniform1f(l("uStyleMix"),r.styleMix),t.uniform1f(l("uStyleScale"),r.styleScale),t.uniform1f(l("uLensR"),r.lensRadius),t.uniform1f(l("uPtrOn"),u.on),t.uniform1i(l("uStyle"),mt),t.uniform1i(l("uLens"),ft),t.drawArrays(t.TRIANGLES,0,3),!i&&(v||c.readyState>=2)&&(i=!0,f.onReady?.())};return o=requestAnimationFrame(K),{video:c,webgl:!0,pointer:()=>({x:u.x,y:u.y,on:u.on}),frame(a){_=a.width||a.videoWidth||1,P=a.height||a.videoHeight||1;for(const[m,T]of[[k,0],[R,1]])if(t.activeTexture(t.TEXTURE0+T),t.bindTexture(t.TEXTURE_2D,m),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,a),t.generateMipmap(t.TEXTURE_2D),r.crossfade===!1)break;L=!0},set(a){r={...r,...a},a.playbackRate&&(c.playbackRate=y.playbackRate=a.playbackRate)},destroy(){I=!0,cancelAnimationFrame(o),g.disconnect(),Z.disconnect(),A.removeEventListener("pointermove",B),v||(c.pause(),y.pause(),c.removeAttribute("src"),y.removeAttribute("src"))}}}async function Gt(){const e=h(".hero"),f=h(".hero__stage",e),b=h("canvas.stage",e),r=e.clientWidth<760||e.clientWidth/e.clientHeight<1,z=r?960:1920,U=r?1710:1080,v=()=>r?{focus:[.5,.42],zoom:1}:{focus:[.4,.48],zoom:1.25},c=h(".hero__poster",e);r&&(c.src=ot.mobileHero);const y=()=>{const i=v(),o=f.clientWidth,n=f.clientHeight,s=o/n,p=z/U,I=s>p?1:s/p,x=s>p?p/s:1,g=i.zoom*(r?1.055:1);Object.assign(c.style,{width:o*g/I+"px",height:n*g/x+"px",left:((0-i.focus[0])*g/I+.5)*o+"px",top:(1-((1-i.focus[1])*g/x+.5))*n+"px"})};y();let d=null;const L=v();try{d=await dt(b,{src:r?ot.mobileHero:window.innerWidth<1100?nt.heroSm:nt.hero,crossfade:!1,playbackRate:.75,focus:L.focus,zoom:L.zoom,contrast:1.08,saturation:.92,lift:[.01,.008,.012],gamma:[1,1,1],gain:[1.02,1,.97],map:at.map,halation:.6,halationColor:at.halationColor,grain:.08,grainSize:1.7,aberration:.0018,vignette:.45,depth:.028,style:"scan",styleMix:.25,styleScale:3,pointerTarget:e,onReady:()=>e.classList.add("is-live")})}catch(i){console.warn("hero treatment failed, poster stays",i),e.classList.add("is-live","is-fallback")}d&&!d.webgl&&e.classList.add("is-fallback");let t=0;window.addEventListener("resize",()=>{cancelAnimationFrame(t),t=requestAnimationFrame(()=>{const i=v();d?.set({focus:i.focus,zoom:i.zoom}),y(),N()})});const A=h("canvas.scope",e),E=A.getContext("2d");let M=1;const N=()=>{M=Math.min(2,devicePixelRatio||1),A.width=A.clientWidth*M,A.height=A.clientHeight*M};N();const W=h("[data-needle]",e),l=h("[data-freq]",e),G=h("[data-listeners]",e);let k=.5,R=.5,u=.2,B=0,H=0,C=1284;e.addEventListener("pointermove",i=>{const o=e.getBoundingClientRect();R=(i.clientX-o.left)/o.width,u=Math.min(1.4,u+Math.abs(i.clientX-B)/260),B=i.clientX},{passive:!0});let w=!0;new IntersectionObserver(i=>{w=i[0].isIntersecting}).observe(e);let _=0,P=0;et.ticker.add((i,o)=>{if(!w)return;const n=Math.min(.05,o/1e3);_+=n,P+=n,P>3&&!j()&&(R=.5+Math.sin(_*.35)*.32),k+=(R-k)*(1-Math.exp(-5*n)),u+=(.22-u)*(1-Math.exp(-1.6*n)),W.style.transform=`translateX(${(k*100).toFixed(2)}%)`,l.textContent=(88+k*20).toFixed(1);const s=A.width,p=A.height;if(E.clearRect(0,0,s,p),!j()){for(const[I,x]of[[9,.12],[3.2,.35],[1.4,1]]){E.beginPath();for(let g=0;g<=160;g++){const F=g/160,Z=Math.exp(-Math.pow((F-k)*3.2,2)),K=Math.sin(F*22+_*3.1)*.55+Math.sin(F*51-_*5.3)*.25,a=p/2+K*Z*u*p*.42;g?E.lineTo(F*s,a):E.moveTo(0,a)}E.strokeStyle=`rgba(214, 238, 255, ${x})`,E.lineWidth=I*M,E.lineCap="round",E.stroke()}_-H>2.2&&(H=_,C=Math.max(1100,Math.min(1500,C+Math.round((Math.random()-.45)*24))))}}),e.addEventListener("pointermove",()=>{P=0},{passive:!0}),j()||(et.fromTo(".masthead",{yPercent:18,opacity:0},{yPercent:0,opacity:1,duration:1.4,ease:"expo.out",delay:.2,clearProps:"transform"}),et.fromTo(".dial, .scope",{opacity:0},{opacity:1,duration:1,delay:1.4,stagger:.15}))}const tt=[{in:.24,out:.33,pos:"r"},{in:.36,out:.45,pos:"l"},{in:.66,out:.82,pos:"l"},{in:.9,out:1.01,pos:"l"}],rt=[[0,.33],[.33,.62],[.62,1]],ct=e=>`${q.dir}${q.prefix}${String(e+1).padStart(q.pad,"0")}.${q.ext}`;function Bt(){const e=h("#run"),f=h("[data-beats]",e),b=q.count,S=Y.run;f.innerHTML=S.beats.map((i,o)=>`
    <div class="beat beat--${tt[o].pos}" data-beat="${o}">
      <p class="beat__k mono">${i.k}</p>
      <h3 class="beat__t">${ht(i.t)}</h3>
      <p class="beat__b">${i.b}</p>
      ${o===S.beats.length-1?`<div class="chips">${S.platforms.map(n=>`<a class="chip-link" href="${n.h}">${n.l}</a>`).join("")}<a class="chip-link chip-link--red" href="${lt.members}">Get in touch →</a></div>`:""}
    </div>`).join(""),h("[data-rail]",e).innerHTML=S.rail.map((i,o)=>`<li data-ch="${o}"><span class="mono">${String(o+1).padStart(2,"0")}</span>${i}</li>`).join("");const r=st("[data-beat]",e),z=st("[data-ch]",e),U=h("[data-fill]",e),v=h("[data-hud-frame]",e),c=h("[data-hud-time]",e);if(j()){e.classList.add("run--static"),r.forEach((i,o)=>{const n=Math.round((tt[o].in+Math.min(1,tt[o].out))/2*(b-1));i.insertAdjacentHTML("afterbegin",`<img class="beat__img" src="${ct(n)}" alt="" loading="lazy">`)});return}const y=new Array(b).fill(null),d=new Map,L=new Set;let t=!1;const A=async()=>{if(t)return;t=!0;const i=[];for(let s=0;s<b;s+=6)i.push(s);for(let s=0;s<b;s++)s%6&&i.push(s);let o=0;const n=async()=>{for(;o<i.length;){const s=i[o++];try{const p=await fetch(ct(s));p.ok&&(y[s]=await p.blob())}catch{}}};await Promise.all([n(),n(),n(),n()])},E=new IntersectionObserver(i=>{i[0].isIntersecting&&(A(),E.disconnect())},{rootMargin:"150% 0px"});E.observe(e);const M=26,N=i=>{for(let o=-4;o<=12;o++){const n=i+o;n<0||n>=b||d.has(n)||L.has(n)||!y[n]||L.size>3||(L.add(n),createImageBitmap(y[n]).then(s=>{d.set(n,s),L.delete(n)}).catch(()=>L.delete(n)))}if(d.size>M){const o=Array.from(d.keys()).sort((n,s)=>Math.abs(s-i)-Math.abs(n-i));for(const n of o.slice(0,d.size-M))d.get(n).close(),d.delete(n)}},W=i=>{for(let o=0;o<b;o++){if(d.has(i-o))return i-o;if(d.has(i+o))return i+o}return-1},l=h("canvas.run__canvas",e);let G=null;dt(l,{src:"",external:!0,crossfade:!1,focus:e.clientWidth<760?[.5,.52]:[.5,.5],zoom:1,contrast:1.08,saturation:.92,lift:[.01,.008,.012],gamma:[1,1,1],gain:[1.02,1,.97],map:{...at.map,amount:.2},halation:.5,halationColor:at.halationColor,grain:.08,grainSize:1.7,aberration:.0015,vignette:.45,depth:.012,style:"scan",styleMix:.2,styleScale:3,pointerTarget:e}).then(i=>{G=i,C=-1}).catch(i=>console.warn("chapter treatment failed",i));const R=document.createElement("canvas"),u=R.getContext("2d");let B=0,H=0,C=-1,w=0,_=-2;pt.create({trigger:e,start:"top top",end:"bottom bottom",onUpdate:i=>{w=i.progress,B=w*(b-1)}});let P=!1;new IntersectionObserver(i=>{P=i[0].isIntersecting},{rootMargin:"20% 0px"}).observe(e),et.ticker.add((i,o)=>{if(!P)return;const n=Math.min(.05,o/1e3);H+=(B-H)*(1-Math.exp(-n/.07));const s=Math.round(H);N(s);const p=W(s);if(G&&p>=0&&p!==C){const x=d.get(p);R.width!==x.width&&(R.width=x.width,R.height=x.height),u.drawImage(x,0,0),G.frame(R),C=p,e.classList.add("is-live")}v.textContent=String(s+1).padStart(3,"0"),c.textContent=(88+s/(b-1)*20).toFixed(1),U.style.transform=`scaleY(${w.toFixed(4)})`;let I=-1;tt.forEach((x,g)=>{w>=x.in&&w<x.out&&(I=g)}),I!==_&&(_=I,r.forEach((x,g)=>x.classList.toggle("on",g===I))),z.forEach((x,g)=>x.classList.toggle("on",w>=rt[g][0]&&(w<rt[g][1]||g===rt.length-1)))})}document.title=ut.title;gt(vt);xt({...Y,links:lt,brand:ut});yt("home");bt();Tt(Et());Mt();h("[data-stats]").innerHTML=Y.intro.stats.map(e=>`<div><dt><span data-count="${e.v}" data-suffix="${e.s}">${e.v}${e.s}</span></dt><dd>${e.k}</dd></div>`).join("");h("[data-latest]").innerHTML=Rt.filter(e=>!e.members).slice(0,4).map((e,f)=>wt(e,f)).join("");h("[data-kit]").innerHTML=Y.host.kit.map(e=>`<li>${e}</li>`).join("");St("[data-tiers]");h("[data-platforms]").innerHTML=Y.run.platforms.map(e=>`<a class="key key--light" href="${e.h}">${e.l}</a>`).join("");Lt(h("[data-copy-rss]"));At("[data-acc]");{const e=h(".sub__vid");new IntersectionObserver(f=>{f[0].isIntersecting?(e.src||(e.src=e.dataset.src),j()||e.play().catch(()=>{})):e.pause()},{rootMargin:"200px 0px"}).observe(h(".sub"))}_t();Gt();Bt();It();Ut();Dt();kt();Ct();
