import{d as e,l as t,r as n,u as r}from"./motion-DTtLhP7r.js";var i=window.matchMedia(`(pointer: coarse)`).matches;function a(e){t||(o(e),s(e),requestAnimationFrame(()=>requestAnimationFrame(()=>d(e))))}function o(t){let n=e=>t.querySelector(e),i=document.querySelector(`.nav__barra`),a=t.querySelectorAll(`.abertura__vidro`),o=[i,n(`.abertura__selo`),n(`.abertura__sub`),n(`.abertura__acoes`),n(`.abertura__garantias`),n(`.abertura__moldura`),...a].filter(Boolean);n(`.abertura__cena`)?.style.setProperty(`animation`,`none`);let s=performance.now()>3200;if(s&&(e.set(o,{opacity:1,y:0,scale:1}),e.set(n(`.abertura__cena`),{"--inclina-extra":0}),n(`.abertura__titulo`)?.removeAttribute(`data-split`)),o.forEach(e=>e.style.animation=`none`),!s){let r=e.timeline({defaults:{ease:`expo.out`,duration:1}});i&&r.to(i,{opacity:1,y:0,duration:1.1},.05),r.to(n(`.abertura__selo`),{opacity:1,y:0,duration:.9},0).fromTo(n(`.abertura__sub`),{filter:`blur(8px)`},{opacity:1,y:0,filter:`blur(0px)`},.34).to(n(`.abertura__acoes`),{opacity:1,y:0},.44).to(n(`.abertura__garantias`),{opacity:1,y:0},.54).to(n(`.abertura__moldura`),{opacity:1,y:0,duration:1.4},.42).to(n(`.abertura__cena`),{"--inclina-extra":0,duration:1.8},.42).to(a,{opacity:1,scale:1,stagger:.1,duration:1},.8).add(()=>t.classList.add(`is-varre`),.9).add(()=>n(`.abertura__sub`)?.style.removeProperty(`filter`))}let c=[...a].map((t,n)=>e.to(t,{y:-7,duration:3.2+n*.7,ease:`sine.inOut`,yoyo:!0,repeat:-1,delay:1.6+n*.5})),l=e=>c.forEach(t=>e.isActive?t.resume():t.pause());r.create({trigger:t,start:`top bottom`,end:`bottom top`,onToggle:l,onRefresh:l})}function s(t){let r=t.querySelector(`.abertura__cena`);e.fromTo(r,{"--inclina":()=>n()?14:11},{"--inclina":0,ease:`none`,scrollTrigger:{trigger:t,start:`top top`,end:()=>`+=${Math.round(window.innerHeight*.85)}`,scrub:.5,invalidateOnRefresh:!0}});let i={banco:-90,checkout:-150,ar:-210};t.querySelectorAll(`.abertura__cartao`).forEach(r=>{let a=[...r.classList].find(e=>e.startsWith(`abertura__cartao--`))?.split(`--`)[1];e.to(r,{y:()=>n()?i[a]??-120:0,ease:`none`,scrollTrigger:{trigger:t,start:`top top`,end:`bottom top`,scrub:.6,invalidateOnRefresh:!0}})})}var c=`attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`,l=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTempo;
uniform float uIntro;
uniform vec2 uCentro;
uniform float uRaio;
uniform float uPx;
uniform vec4 uCalmo;
uniform vec3 uMouse;
const vec3 FUNDO = vec3(0.0275, 0.0235, 0.051);
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float ruido(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
// 1 dentro da caixa (x0, y0, x1, y1), caindo suave até 0 fora dela
float zona(vec2 fc, vec4 caixa, float suave) {
  vec2 c = (caixa.xy + caixa.zw) * 0.5;
  vec2 h = abs(caixa.zw - caixa.xy) * 0.5;
  vec2 q = abs(fc - c) - h;
  float dd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  return 1.0 - smoothstep(-suave * 0.4, suave, dd);
}
vec3 finalizar(vec3 col, vec2 fc) {
  col = 1.0 - exp(-col * 1.3);
  vec3 c = FUNDO + col * (1.0 - FUNDO);
  return c + (hash(fc + 7.3) - 0.5) / 255.0;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 d = (fc - uCentro) / uRaio;
  float r = length(d);
  vec2 dir = d / max(r, 0.0001);
  float t = uTempo;
  float px = uPx / uRaio;

  // respiração: raio e brilho sobem e descem devagar
  float resp = sin(t * 0.7);
  float abre = mix(0.82, 1.0, uIntro);
  float r1 = abre * (1.0 + 0.013 * resp);
  float r2 = abre * (0.83 + 0.015 * sin(t * 0.7 + 1.3));
  float o1 = ruido(dir * 1.6 + vec2(t * 0.08, 3.1)) - 0.5;
  float o2 = ruido(dir * 2.0 + vec2(9.4, -t * 0.06)) - 0.5;
  float d1 = r - r1 - o1 * 0.010;
  float d2 = r - r2 - o2 * 0.012;

  // intensidade em volta: laterais e alto mais fortes, dois brilhos girando e o do cursor
  float lat = pow(abs(dir.x), 1.2);
  float alto = smoothstep(-0.2, 1.0, dir.y);
  float gira1 = pow(max(dot(dir, vec2(cos(t * 0.26), sin(t * 0.26))), 0.0), 6.0);
  float gira2 = pow(max(dot(dir, vec2(cos(2.4 - t * 0.2), sin(2.4 - t * 0.2))), 0.0), 6.0);
  float cursor = pow(max(dot(dir, uMouse.xy), 0.0), 10.0) * uMouse.z;
  float pulso = 0.88 + 0.12 * resp;
  float i1 = (0.28 + 0.5 * lat + 0.25 * alto + 0.45 * gira1 + 0.7 * cursor) * pulso;
  float i2 = (0.2 + 0.4 * lat + 0.12 * alto + 0.4 * gira2 + 0.45 * cursor) * pulso;

  float grao = hash(floor(fc) * 1.37 + 5.0);
  float grao2 = hash(floor(fc) + 91.7);

  float n1 = exp(-pow(d1 / (1.15 * px), 2.0));
  float n2 = exp(-pow(d2 / (0.95 * px), 2.0));
  float b1 = exp(-pow(d1 / (5.0 * px), 2.0));
  float b2 = exp(-pow(d2 / (4.0 * px), 2.0));
  float h1 = exp(-pow(d1 / (d1 > 0.0 ? 0.075 : 0.022), 2.0));
  float h2 = exp(-pow(d2 / (d2 > 0.0 ? 0.055 : 0.02), 2.0));
  float nevoa = exp(-pow((r - r1 - 0.06) / 0.26, 2.0));

  vec3 violeta = vec3(0.486, 0.227, 0.929);
  vec3 lilas = vec3(0.655, 0.545, 0.98);
  vec3 indigo = vec3(0.4, 0.38, 0.96);
  vec3 claro = vec3(0.94, 0.92, 1.0);
  vec3 tom = mix(indigo, violeta, smoothstep(-0.9, 0.9, dir.x));

  vec3 col = vec3(0.0);
  col += claro * (n1 * i1 * 1.2 + n2 * i2 * 0.9);
  col += lilas * (b1 * i1 * 0.35 + b2 * i2 * 0.25);
  col += mix(tom, lilas, 0.25) * (h1 * i1 * 0.7 + h2 * i2 * 0.5) * (0.3 + 1.4 * grao);
  col += tom * nevoa * (0.03 + 0.07 * lat) * (0.2 + 1.6 * grao2);
  col += violeta * 0.03 * exp(-r * r * 0.8);

  // leitura: a luz baixa atrás do texto
  col *= mix(1.0, 0.2, zona(fc, uCalmo, 70.0 * uPx));
  col *= mix(0.6, 1.0, smoothstep(0.15, 0.8, r));
  // cantos de cima mais escuros (a luz mora nos anéis, não no céu inteiro)
  vec2 uv = fc / uRes;
  col *= 1.0 - 0.45 * smoothstep(0.45, 1.0, uv.y) * smoothstep(0.25, 0.75, abs(uv.x - 0.5) * 2.0);
  col *= smoothstep(0.02, 0.34, fc.y / uRes.y);
  col *= uIntro;
  gl_FragColor = vec4(finalizar(col, fc), 1.0);
}
`;function u(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)&&!e.isContextLost()?(console.warn(`[abertura] shader:`,e.getShaderInfoLog(r)),e.deleteShader(r),null):r}function d(e){let t=e.querySelector(`.abertura__gl`),n=e.querySelector(`.abertura__fundo`),a=e.querySelector(`.abertura__conteudo`),o=e.querySelector(`.abertura__titulo`),s=[`.abertura__sub`,`.abertura__acoes`,`.abertura__garantias`].map(t=>e.querySelector(t)).filter(Boolean);if(!t||!n)return;let d={alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:`low-power`,failIfMajorPerformanceCaveat:!0},f=null;try{f=t.getContext(`webgl`,d)||t.getContext(`experimental-webgl`,d)}catch{f=null}if(!f)return;let p={};function m(){let e=u(f,f.VERTEX_SHADER,c),t=u(f,f.FRAGMENT_SHADER,l);if(!e||!t)return!1;let n=f.createProgram();if(f.attachShader(n,e),f.attachShader(n,t),f.linkProgram(n),!f.getProgramParameter(n,f.LINK_STATUS))return!1;f.useProgram(n);let r=f.createBuffer();f.bindBuffer(f.ARRAY_BUFFER,r),f.bufferData(f.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),f.STATIC_DRAW);let i=f.getAttribLocation(n,`a`);return f.enableVertexAttribArray(i),f.vertexAttribPointer(i,2,f.FLOAT,!1,0,0),p={},[`uRes`,`uTempo`,`uIntro`,`uCentro`,`uRaio`,`uPx`,`uCalmo`,`uMouse`].forEach(e=>p[e]=f.getUniformLocation(n,e)),!0}if(!m())return;let h={larg:1,alt:1,escala:1,cx:0,cy:0,r:300,calmo:[0,0,0,0]};function g(){let e=t.getBoundingClientRect();if(!e.width||!e.height)return;let n=Math.min(window.devicePixelRatio||1,2);h.escala=Math.min(n,Math.sqrt((i?9e5:14e5)/(e.width*e.height))),h.larg=Math.max(1,Math.round(e.width*h.escala)),h.alt=Math.max(1,Math.round(e.height*h.escala)),(t.width!==h.larg||t.height!==h.alt)&&(t.width=h.larg,t.height=h.alt),f.viewport(0,0,h.larg,h.alt);let r=a.getBoundingClientRect(),c=o.getBoundingClientRect(),l=e.width<768,u=l?c.top+c.height*.5-e.top:r.top+r.height*.5-e.top,d=l?e.width*.58:Math.min(Math.max(r.height*.64,e.width*.3),540);h.cx=e.width/2*h.escala,h.cy=(e.height-u)*h.escala,h.r=d*h.escala;let p=1/0,m=1/0,g=-1/0,_=-1/0;if(s.forEach(e=>{let t=e.getBoundingClientRect();p=Math.min(p,t.left),g=Math.max(g,t.right),m=Math.min(m,t.top),_=Math.max(_,t.bottom)}),Number.isFinite(p)){let t=h.escala;h.calmo=[(p-e.left-24)*t,(e.bottom-_-16)*t,(g-e.left+24)*t,(e.bottom-m+10)*t]}}let _={x:0,y:1,f:0,ax:0,ay:1,af:0,px:0,py:0,mudou:!1};i||(e.addEventListener(`pointermove`,e=>{_.px=e.clientX,_.py=e.clientY,_.af=1,_.mudou=!0}),e.addEventListener(`pointerleave`,()=>_.af=0));function v(){if(_.mudou){_.mudou=!1;let e=t.getBoundingClientRect(),n=_.px-(e.left+h.cx/h.escala),r=e.top+(h.alt-h.cy)/h.escala-_.py,i=Math.hypot(n,r)||1;_.ax=n/i,_.ay=r/i}_.x+=(_.ax-_.x)*.06,_.y+=(_.ay-_.y)*.06,_.f+=(_.af-_.f)*.03;let e=Math.hypot(_.x,_.y)||1;return[_.x/e,_.y/e,_.f]}let y=0,b=!0,x=!1,S=0,C=0;function w(t){if(y=0,!b||document.hidden||f.isContextLost()||(y=requestAnimationFrame(w),i&&t-C<31))return;C=t,S||=t;let n=(t-S)/1e3,r=Math.min(n/1.9,1);f.uniform2f(p.uRes,h.larg,h.alt),f.uniform1f(p.uTempo,n+20),f.uniform1f(p.uIntro,1-(1-r)**3),f.uniform2f(p.uCentro,h.cx,h.cy),f.uniform1f(p.uRaio,h.r),f.uniform1f(p.uPx,h.escala),f.uniform4f(p.uCalmo,...h.calmo),f.uniform3f(p.uMouse,...v()),f.drawArrays(f.TRIANGLES,0,3),x||(x=!0,parseFloat(getComputedStyle(a,`::before`).opacity)>.02&&e.classList.add(`is-gl-suave`),e.classList.add(`is-gl`))}let T=()=>{!y&&b&&!document.hidden&&(y=requestAnimationFrame(w))};g(),new ResizeObserver(()=>g()).observe(t),r.addEventListener(`refresh`,g),document.fonts?.ready.then(g);let E=e=>{b=e.isActive,T()};r.create({trigger:n,start:`top bottom`,end:`bottom top`,onToggle:E,onRefresh:E}),document.addEventListener(`visibilitychange`,T),t.addEventListener(`webglcontextlost`,t=>{t.preventDefault(),cancelAnimationFrame(y),y=0,e.classList.remove(`is-gl`),x=!1}),t.addEventListener(`webglcontextrestored`,()=>{m()&&(g(),T())}),T()}export{a as default};