const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./abertura-DyYW2vJG.js","./dados-DpTqF02S.js","./partes-Bg8oNpww.js","./combinados-ZfeYh4HE.js","./etapas-CZbi6lby.js","./investimento-_h6VhsQb.js","./motion-CLZi846P.js","./portfolio-YrHX2t-d.js"])))=>i.map(i=>d[i]);
import{i as e,o as t,r as n}from"./dados-DpTqF02S.js";import{a as r,c as i,d as a,f as o,h as s,i as c,l,m as u,n as d,o as f,p,r as m,s as h,t as g,u as _}from"./motion-CLZi846P.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function v(t){let i=t.P,a=document.createElement(`header`);a.className=`cabeca`,a.innerHTML=`
    <a class="cabeca__marca" href="#abertura" aria-label="${n(i.autor.nome)}, voltar ao início">${n(i.autor.nome)}</a>
    <p class="cabeca__cap mono" aria-live="polite"><span class="cabeca__cap-txt">Proposta para ${n(i.cliente.empresa)}</span></p>
    <div class="cabeca__acoes">
      <button class="cabeca__btn" type="button" aria-haspopup="dialog" aria-controls="indice">Índice</button>
      <a class="cabeca__btn cabeca__whats" href="${e(t,`Oi, ${i.autor.nome.split(` `)[0]}! Estou vendo a proposta para ${i.cliente.empresa} e tenho uma dúvida.`)}" target="_blank" rel="noopener">Falar comigo</a>
    </div>
    <span class="cabeca__progresso" aria-hidden="true"></span>`,document.body.prepend(a);let s=[...document.querySelectorAll(`main > section[data-capitulo]`)],c=[];s.forEach(e=>{let t=e.dataset.ato||``;(!c.length||c.at(-1).nome!==t)&&c.push({nome:t,secoes:[]}),c.at(-1).secoes.push(e)});let l=document.createElement(`div`);l.className=`indice`,l.id=`indice`,l.setAttribute(`role`,`dialog`),l.setAttribute(`aria-modal`,`true`),l.setAttribute(`aria-label`,`Índice da proposta`),l.innerHTML=`
    <div class="indice__painel">
      <div class="indice__topo">
        <p class="rotulo">Proposta · ${n(t.validade.texto)}</p>
        <button class="cabeca__btn" type="button" data-fechar>Fechar</button>
      </div>
      <nav class="indice__lista" aria-label="Capítulos">
        ${c.map(e=>`${e.nome?`<p class="indice__ato rotulo">${n(e.nome)}</p>`:``}
            ${e.secoes.map(e=>`<a href="#${e.id}" data-alvo="${e.id}"><span class="rotulo">${n(e.dataset.num||``)}</span>${n(e.dataset.capitulo)}</a>`).join(``)}`).join(``)}
      </nav>
    </div>`,document.body.append(l);let u=a.querySelector(`[aria-controls="indice"]`),d=e=>{l.classList.toggle(`is-aberto`,e),u.setAttribute(`aria-expanded`,String(e)),e?l.querySelector(`a`)?.focus({preventScroll:!0}):u.focus({preventScroll:!0})};return u.addEventListener(`click`,()=>d(!0)),l.addEventListener(`click`,e=>{(e.target===l||e.target.closest(`[data-fechar]`))&&d(!1);let t=e.target.closest(`a[data-alvo]`);t&&(e.preventDefault(),e.stopPropagation(),d(!1),document.dispatchEvent(new CustomEvent(`proposta:pulo`,{detail:{para:t.dataset.alvo}})),r(`#${t.dataset.alvo}`,{duracao:1.6}))}),document.addEventListener(`keydown`,e=>e.key===`Escape`&&l.classList.contains(`is-aberto`)&&d(!1)),{cabeca:a,ligar:()=>{let e=a.querySelector(`.cabeca__cap-txt`),t=[...l.querySelectorAll(`a[data-alvo]`)];s.forEach(n=>{o.create({trigger:n,start:`top 45%`,end:`bottom 45%`,onToggle(r){r.isActive&&(e.textContent=n.dataset.num?`${n.dataset.num} · ${n.dataset.capitulo}`:n.dataset.capitulo,t.forEach(e=>e.classList.toggle(`is-atual`,e.dataset.alvo===n.id)))}})}),o.create({start:80,end:`max`,onToggle:e=>a.classList.toggle(`is-rolou`,e.isActive)}),p.to(a.querySelector(`.cabeca__progresso`),{scaleX:1,ease:`none`,scrollTrigger:{start:0,end:`max`,scrub:.3}})}}}function y(t){let r=t.P,i=t.hoje.getFullYear(),a=document.createElement(`footer`);return a.className=`rodape`,a.innerHTML=`
    <div class="rodape__topo">
      <p class="rodape__marca">${n(r.autor.nome)}</p>
      <div class="rodape__contatos">
        <a href="${e(t)}" target="_blank" rel="noopener">WhatsApp</a>
        ${r.autor.email?`<a href="mailto:${n(r.autor.email)}">${n(r.autor.email)}</a>`:``}
        ${r.autor.instagram?`<a href="https://instagram.com/${n(r.autor.instagram.replace(`@`,``))}" target="_blank" rel="noopener">${n(r.autor.instagram)}</a>`:``}
      </div>
    </div>
    <div class="rodape__base">
      <p>Proposta para ${n(r.cliente.empresa)} · ${n(t.validade.texto)} · © ${i} ${n(r.autor.nome)}</p>
      <p class="rodape__credito">Criada por <a href="https://app.upwardacademy.com.br/app/templates" target="_blank" rel="noopener" referrerpolicy="origin">Upward Academy</a></p>
    </div>`,document.querySelector(`main`).after(a),a}var b=`
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`,x=`
precision highp float;
uniform vec2 uRes;      // tamanho do canvas (px do buffer)
uniform float uTime;
uniform vec3 uLente;    // x, y (px do buffer, origem embaixo) e raio (px)
uniform float uLenteOn; // 0..1
uniform vec2 uLenteVel; // velocidade da lente (alturas/s, y para cima): estica como líquido
uniform vec2 uPont;     // ponteiro (px do buffer, origem embaixo)
uniform vec2 uVel;      // velocidade suavizada do ponteiro (alturas por segundo)
uniform float uEnergia; // 0..1, quanto o mouse está mexendo agora
uniform vec2 uParalaxe; // -0.5..0.5, posição do ponteiro na tela
uniform float uIntensidade; // 1 na abertura; menor nas outras dobras (mais escuro e calmo)
uniform float uDesfaz;      // 0 inteiro → 1 sumido (as faixas encolhem para o preto)
uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3; uniform vec3 c4;

// Ruído simplex 3D (Ashima / Ian McEwan, domínio público)
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<4;i++){ s+=a*snoise(p); p*=2.02; a*=0.5; } return s; }

// Rampa: preto → azul profundo → azul claro → cobre → cobre escuro
// (faixas estreitas de azul entre o preto e o cobre, como na monopo)
vec3 rampa(float t){
  t=clamp(t,0.0,1.0);
  vec3 c=mix(c0,c1,smoothstep(0.40,0.50,t));
  c=mix(c,c2,smoothstep(0.50,0.555,t));
  c=mix(c,c3,smoothstep(0.555,0.64,t));
  c=mix(c,c4,smoothstep(0.80,1.0,t));
  return c;
}

// Campo de cor: formas grandes e macias (baixa frequência, distorção leve)
float campo(vec2 q, float t){
  vec2 w=vec2(snoise(vec3(q*0.42, t)), snoise(vec3(q*0.42+vec2(5.2,1.3), t*0.9)));
  float f=snoise(vec3(q*0.34+0.95*w, t*1.1));
  f+=0.28*snoise(vec3(q*0.75+0.6*w+vec2(1.7,9.2), t*1.4));
  return 0.5+0.5*f;
}

void main(){
  vec2 frag=gl_FragCoord.xy;
  vec2 p=(frag-0.5*uRes)/uRes.y;
  float t=uTime*0.045;

  // Lente de vidro líquido (como o Liquid Glass da Apple):
  // centro quase limpo com uma lupa leve; a borda chanfrada curva o fundo para
  // dentro e separa as cores; estica um pouco na direção do movimento.
  vec2 m=(uLente.xy-0.5*uRes)/uRes.y;
  float r=max(uLente.z/uRes.y, 0.0001);
  vec2 rel=p-m;
  float vlen=length(uLenteVel);
  vec2 vdir=vlen>0.0001 ? uLenteVel/vlen : vec2(1.0,0.0);
  vec2 vperp=vec2(-vdir.y,vdir.x);
  float est=clamp(vlen*0.1,0.0,0.13);
  vec2 relE=vec2(dot(rel,vdir)/(1.0+est), dot(rel,vperp)*(1.0+est*0.55));
  float s=length(relE)/r;                       // 0 no centro, 1 na borda
  float dentro=(1.0-smoothstep(0.985,1.0,s))*uLenteOn;
  vec2 n=rel/max(length(rel),0.0001);
  float bisel=smoothstep(0.58,1.0,s);
  vec2 desloc=-n*r*(0.05*s+0.46*bisel*bisel);
  vec2 q=mix(p, m+rel*0.93+desloc, dentro);
  vec2 sep=n*r*0.045*bisel*dentro;

  // Reação ao mouse:
  // 1) arraste: perto do ponteiro, as cores vão junto com o movimento
  // 2) redemoinho: girando em volta do ponteiro, mais forte quanto mais rápido
  // 3) paralaxe: o campo inteiro desliza de leve com a posição do mouse
  vec2 pm=(uPont-0.5*uRes)/uRes.y;
  vec2 dm=q-pm;
  float infl=exp(-dot(dm,dm)/0.11);
  q-=uVel*infl*0.2;
  float ang=uEnergia*infl*0.55;
  float ca=cos(ang), sa=sin(ang);
  q=pm+mat2(ca,-sa,sa,ca)*(q-pm);
  q+=uParalaxe*0.1;

  // Ao sair da abertura (uDesfaz): as faixas de cor vão diminuindo,
  // encolhendo para o preto (desloca a rampa) até sumir
  float apaga=(1.0-uIntensidade)*0.22+uDesfaz*0.5;
  vec3 col;
  col.r=rampa(campo(q+sep, t)-apaga).r;
  col.g=rampa(campo(q, t)-apaga).g;
  col.b=rampa(campo(q-sep, t)-apaga).b;
  col*=mix(0.3,1.0,uIntensidade);


  // Vidro: um pouco mais claro dentro, com brilho de espessura perto da borda
  col=mix(col, col*1.07+0.02, dentro);
  col+=vec3(0.92,0.9,0.88)*smoothstep(0.72,0.98,s)*0.07*dentro;
  // Reflexos de luz (vindo de cima, à esquerda) e um contorno fino
  vec2 L=normalize(vec2(-0.55,0.83));
  float aro=smoothstep(0.88,0.975,s)*(1.0-smoothstep(0.975,1.0,s))*uLenteOn;
  float esp=pow(max(dot(n,L),0.0),3.0)+0.4*pow(max(dot(n,-L),0.0),5.0);
  col+=vec3(1.0,0.97,0.93)*esp*aro*0.95;
  float linha=smoothstep(0.972,0.988,s)*(1.0-smoothstep(0.988,1.004,s))*uLenteOn;
  col+=vec3(0.28)*linha;
  // Sombra suave logo abaixo da lente (volume)
  float sSombra=length(relE-vec2(0.0,-0.022))/r;
  float sombra=(1.0-smoothstep(1.0,1.32,sSombra))*step(1.0,s)*uLenteOn;
  col*=1.0-0.28*sombra;

  // Vinheta leve para o texto respirar nas bordas
  float v=smoothstep(1.35,0.25,length(p*vec2(0.85,1.0)));
  col*=mix(0.55,1.0,v);
  gl_FragColor=vec4(col,1.0);
}
`,S=e=>{let t=parseInt(e.replace(`#`,``),16);return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]};function C(e,{cores:t,escala:n=.5,parado:r=!1}={}){let i=e.getContext(`webgl`,{antialias:!1,alpha:!1,premultipliedAlpha:!1,powerPreference:`high-performance`});if(!i)return null;let a=(e,t)=>{let n=i.createShader(e);if(i.shaderSource(n,t),i.compileShader(n),!i.getShaderParameter(n,i.COMPILE_STATUS))throw Error(i.getShaderInfoLog(n));return n},o=i.createProgram();try{i.attachShader(o,a(i.VERTEX_SHADER,b)),i.attachShader(o,a(i.FRAGMENT_SHADER,x))}catch(e){return console.warn(`[fluxo] shader`,e),null}if(i.linkProgram(o),!i.getProgramParameter(o,i.LINK_STATUS))return null;i.useProgram(o);let s=i.createBuffer();i.bindBuffer(i.ARRAY_BUFFER,s),i.bufferData(i.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),i.STATIC_DRAW);let c=i.getAttribLocation(o,`p`);i.enableVertexAttribArray(c),i.vertexAttribPointer(c,2,i.FLOAT,!1,0,0);let l=e=>i.getUniformLocation(o,e),u=l(`uRes`),d=l(`uTime`),f=l(`uLente`),p=l(`uLenteOn`),m=l(`uLenteVel`),h=l(`uPont`),g=l(`uVel`),_=l(`uEnergia`),v=l(`uParalaxe`),y=l(`uIntensidade`),C=l(`uDesfaz`);[`c0`,`c1`,`c2`,`c3`,`c4`].forEach((e,n)=>i.uniform3fv(l(e),S(t[n])));let w=0,T=0,E=1,D=()=>{let t=e.getBoundingClientRect();E=Math.min(window.devicePixelRatio||1,1.5)*n,w=Math.max(2,Math.round(t.width*E)),T=Math.max(2,Math.round(t.height*E)),(e.width!==w||e.height!==T)&&(e.width=w,e.height=T,i.viewport(0,0,w,T)),i.uniform2f(u,w,T)};D(),new ResizeObserver(D).observe(e);let O={x:-999,y:-999,r:0,on:0,vx:0,vy:0},k={x:-9999,y:-9999,vx:0,vy:0,energia:0,px:0,py:0},A=1,j=0,M=e=>{i.uniform1f(d,e),i.uniform3f(f,O.x*E,T-O.y*E,O.r*E),i.uniform1f(p,O.on),i.uniform2f(m,O.vx,-O.vy),i.uniform2f(h,k.x*E,T-k.y*E),i.uniform2f(g,k.vx,-k.vy),i.uniform1f(_,k.energia),i.uniform2f(v,k.px,-k.py),i.uniform1f(y,A),i.uniform1f(C,j),i.drawArrays(i.TRIANGLE_STRIP,0,4)},N=!1,P=0,F=40,I=0,L=e=>{if(!N)return;let t=I?Math.min(.05,(e-I)/1e3):.016;I=e,F+=t*(1+k.energia*1.6),M(F),P=requestAnimationFrame(L)},R={lente(e,t,n,i=1,a=0,o=0){O.x=e,O.y=t,O.r=n,O.on=i,O.vx=a,O.vy=o,r&&M(40)},ponteiro(e,t,n,r,i,a,o){Object.assign(k,{x:e,y:t,vx:n,vy:r,energia:i,px:a,py:o})},intensidade(e){A=Math.max(0,Math.min(1,e)),r&&M(40)},desfazer(e){j=Math.max(0,Math.min(1,e)),r&&M(40)},ligar(){if(r)return M(40);N||(N=!0,I=0,P=requestAnimationFrame(L))},parar(){N=!1,cancelAnimationFrame(P)}};return R.ligar(),R}var w=[`#050505`,`#1b2f8f`,`#9fb8ff`,`#ec6a2c`,`#b8441a`];function T(){let e=document.createElement(`canvas`);e.className=`fundo-vivo`,e.setAttribute(`aria-hidden`,`true`);let t=document.createElement(`span`);t.className=`fundo-grao`,t.setAttribute(`aria-hidden`,`true`),document.body.prepend(t),document.body.prepend(e);let n=!i,r=null;try{r=C(e,{cores:w,escala:n?.36:.5,parado:l})}catch(e){console.warn(`[fundo] WebGL`,e)}if(!r)return e.remove(),t.remove(),null;document.documentElement.classList.add(`tem-fundo-vivo`),document.addEventListener(`visibilitychange`,()=>document.hidden?r.parar():r.ligar());let a=new Set,o={fluxo:r,forca:{v:0},presenca:{v:1},raio:()=>window.innerWidth<700?82:Math.min(160,window.innerWidth*.105),passeio:null,intensidade:e=>r.intensidade(e),aoQuadro:e=>a.add(e),desfazer(n){let i=Math.max(0,Math.min(1,n));r.desfazer(i);let a=i>=.995;e.style.visibility=a?`hidden`:``,t.style.opacity=((1-i)*.5).toFixed(3),a?r.parar():document.hidden||r.ligar()}};if(l)return o;let s={x:window.innerWidth*.62,y:window.innerHeight*.5},c={x:s.x,y:s.y,ativo:!1},u={x:0,y:0},d={x:s.x,y:s.y,vx:0,vy:0,energia:0,px:0,py:0,ax:s.x,ay:s.y},f=0;window.addEventListener(`pointermove`,e=>{if(e.pointerType!==`mouse`)return;let t=o.raio();c.x=Math.min(Math.max(e.clientX,t*.6),window.innerWidth-t*.6),c.y=Math.min(Math.max(e.clientY,t*.6),window.innerHeight-t*.6),c.ativo=!0});let m=e=>({x:window.innerWidth*(.5+Math.sin(e*.33)*.3),y:window.innerHeight*(.48+Math.sin(e*.47+1.3)*.22)});return p.ticker.add((e,t)=>{let i=Math.max(.001,t/1e3);f+=i;let l=c.ativo?c:n?(o.passeio||m)(f):c,p=1-(c.ativo?8e-4:.04)**i,h=s.x,g=s.y;s.x+=(l.x-s.x)*p,s.y+=(l.y-s.y)*p;let _=window.innerHeight,v=1-.002**i;u.x+=((s.x-h)/i/_-u.x)*v,u.y+=((s.y-g)/i/_-u.y)*v;let y=o.forca.v*o.presenca.v,b=o.raio()*y;r.lente(s.x,s.y,Math.max(b,.01),y,u.x,u.y);let x=c.ativo?c.x:s.x,S=c.ativo?c.y:s.y,C=(x-d.ax)/i/_,w=(S-d.ay)/i/_;d.ax=x,d.ay=S;let T=1-.02**i;d.vx+=(C-d.vx)*T,d.vy+=(w-d.vy)*T;let E=Math.min(1,Math.hypot(d.vx,d.vy)*.3);d.energia+=(E-d.energia)*(E>d.energia?1-.001**i:1-.25**i),d.x+=(x-d.x)*(1-5e-4**i),d.y+=(S-d.y)*(1-5e-4**i),d.px+=(d.x/window.innerWidth-.5-d.px)*(1-.05**i),d.py+=(d.y/_-.5-d.py)*(1-.05**i);let D=e=>Math.max(-1.4,Math.min(1.4,e)),O=o.presenca.v;r.ponteiro(d.x,d.y,D(d.vx)*O,D(d.vy)*O,d.energia*O,d.px*O,d.py*O);let k={x:s.x,y:s.y,r:b};a.forEach(e=>e(k))}),o}var E=`modulepreload`,D=function(e,t){return new URL(e,t).href},O={},k=function(e){return e.pathname.endsWith(`.css`)},A=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},j=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=D(t,n);let r=s(t),i=k(r);return A(O,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:E,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{t.addEventListener(`load`,e),t.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${r}`)))})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},M=Object.assign({"./dobras/abertura.js":()=>j(()=>import(`./abertura-DyYW2vJG.js`),__vite__mapDeps([0,1,2]),import.meta.url),"./dobras/combinados.js":()=>j(()=>import(`./combinados-ZfeYh4HE.js`),__vite__mapDeps([3,1,2]),import.meta.url),"./dobras/etapas.js":()=>j(()=>import(`./etapas-CZbi6lby.js`),__vite__mapDeps([4,1,2]),import.meta.url),"./dobras/investimento.js":()=>j(()=>import(`./investimento-_h6VhsQb.js`),__vite__mapDeps([5,1,6,2]),import.meta.url),"./dobras/portfolio.js":()=>j(()=>import(`./portfolio-YrHX2t-d.js`),__vite__mapDeps([7,1,2]),import.meta.url)}),N=[`abertura`,`portfolio`,`etapas`,`investimento`,`combinados`];window.__UPW__=Object.freeze({template:`UPW-PROPOSTA-EYY5`,licenca:`__UPW_LICENCA__`,autor:`Upward Academy`,site:`https://app.upwardacademy.com.br/app/templates`}),console.info(`%cProposta Comercial · template criado por Upward Academy · UPW-PROPOSTA-EYY5`,`color:#e0a458`);var P=window.PROPOSTA,F=document.getElementById(`conteudo`);if(!P)throw F.innerHTML=`<p class="sem-js">O arquivo <b>proposta.js</b> não carregou ou tem um erro de digitação. Abra o console do navegador para ver a linha.</p>`,document.documentElement.classList.add(`estilos-ok`),Error(`window.PROPOSTA não encontrado`);var I=t(P),L=u(P.numero);s.set(`pagamento`,I.pagamentos.some(e=>e.id===L?.pagamento)?L.pagamento:I.pagamentoPadrao),s.set(`aprovado`,L?.aprovado||null),s.set(`precoVisto`,!1);var R=await Promise.allSettled(N.map(e=>M[`./dobras/${e}.js`]?.())),z=N.map((e,t)=>{let n=R[t];return n.status===`rejected`&&console.error(`[dobra ${e}] não carregou`,n.reason),{id:e,mod:n.status===`fulfilled`?n.value:null}}).filter(e=>e.mod);F.innerHTML=z.map(({id:e,mod:t})=>{try{return t.html(I)}catch(t){return console.error(`[dobra ${e}] html`,t),``}}).join(``),y(I);var B={el:document.body,barra:document.body,imprimir(){},remover(){},imprimirTodas:()=>0,impressas:()=>new Set,mostrar(){},esconder(){},ligar(){},desligar(){},ligado:()=>!1,definirTotal(){},alvo:()=>new DOMRect},V=v(I);if(P.exemplo){let e=document.createElement(`p`);e.className=`faixa-exemplo`,e.innerHTML=`Dados de exemplo<span class="faixa-exemplo__mais">&nbsp;· troque em proposta.js e mude exemplo para false</span>`,document.body.prepend(e),document.documentElement.classList.add(`com-faixa`)}document.documentElement.classList.add(`estilos-ok`),window.__movimentoOk=!0,c(),f();var H=T(),U={d:I,P,estado:s,recibo:B,gsap:p,ScrollTrigger:o,SplitText:a,Flip:_,reduce:l,GRANDE:d,COMPACTO:g,grande:m,irPara:r,fundo:H,whatsapp:t=>e(I,t)};z.forEach(({id:e,mod:t})=>{let n=document.getElementById(e);if(n&&typeof t.iniciar==`function`)try{t.iniciar(n,U)}catch(t){console.error(`[dobra ${e}]`,t)}}),h(),V.ligar(),document.fonts?.ready.then(()=>o.refresh()),window.addEventListener(`load`,()=>o.refresh());var W;new ResizeObserver(()=>{clearTimeout(W),W=setTimeout(()=>o.refresh(),200)}).observe(F),window.addEventListener(`beforeprint`,()=>{document.querySelectorAll(`details`).forEach(e=>{e.dataset.estavaFechado=e.open?``:`1`,e.open=!0})}),window.addEventListener(`afterprint`,()=>{document.querySelectorAll(`details[data-estava-fechado="1"]`).forEach(e=>e.open=!1)}),window.__proposta={d:I,estado:s,recibo:B,irPara:r,grande:m,reduce:l,fundo:H,gsap:p,ScrollTrigger:o};