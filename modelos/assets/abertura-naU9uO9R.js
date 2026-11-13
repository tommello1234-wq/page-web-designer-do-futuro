import{n as e,r as t,s as n}from"./dados-CsOf0Zum.js";import{t as r}from"./partes-CI8-ojiq.js";function i(i){if(i.modo===`portfolio`)return a(i);let o=i.P,s=i.validade.estado===`vencida`,c=o.autor.foto?`<img class="abertura__foto" src="${t(o.autor.foto)}" alt="" width="64" height="64" onerror="this.remove()" />`:``,l=`${t(i.saudacao)}${o.cliente.contato?`, ${t(o.cliente.contato)}`:``}. Esta proposta é para`;return`<section ${r({id:`abertura`,num:`01`,capitulo:`Proposta para ${o.cliente.empresa}`,ato:``,classe:`dobra--cheia`})}>
    <div class="abertura__luz" aria-hidden="true"><span class="abertura__lampada"></span></div>
    <div class="abertura__miolo">
      <p class="abertura__selo">
        <span class="abertura__selo-ponto" aria-hidden="true"></span>
        Proposta comercial
        <span class="abertura__selo-sep" aria-hidden="true"></span>
        <span class="${s?`is-vencida`:``}">${s?`Venceu em`:`Válida até`} ${i.validade.curta}</span>
      </p>
      <div class="abertura__quadro">
        <span class="quadro__h quadro__h--a" aria-hidden="true"></span>
        <span class="quadro__h quadro__h--b" aria-hidden="true"></span>
        <span class="quadro__v quadro__v--a" aria-hidden="true"></span>
        <span class="quadro__v quadro__v--b" aria-hidden="true"></span>
        <span class="quadro__p quadro__p--1" aria-hidden="true"></span>
        <span class="quadro__p quadro__p--2" aria-hidden="true"></span>
        <span class="quadro__p quadro__p--3" aria-hidden="true"></span>
        <span class="quadro__p quadro__p--4" aria-hidden="true"></span>
        <div class="abertura__camadas">
          <div class="abertura__texto">
            <p class="abertura__ola">${l}</p>
            <h1 class="capa abertura__nome">${t(o.cliente.empresa)}</h1>
          </div>
          <div class="abertura__lente-txt" aria-hidden="true">
            <p class="abertura__ola">${l}</p>
            <p class="capa abertura__nome-lente">${t(o.cliente.empresa)}</p>
          </div>
        </div>
      </div>
      <p class="lead abertura__promessa">${n(o.promessa)}</p>
      <div class="abertura__info">
        <p class="abertura__autor">${c}<span>Preparada por <b>${t(o.autor.nome)}</b></span></p>
        <span class="abertura__div" aria-hidden="true"></span>
        <p class="mono abertura__dado">${e(i.hoje)}</p>
        <span class="abertura__div" aria-hidden="true"></span>
        <p class="mono abertura__dado">Leitura de ${i.leituraMin} min</p>
      </div>
    </div>
    <p class="abertura__role rotulo" aria-hidden="true"><span>Role para começar</span></p>
  </section>`}function a(e){let i=e.P,a=n(i.revelacao||i.titulo||i.autor?.nome||``);return`<section ${r({id:`abertura`,num:`01`,capitulo:i.selo||`Início`,ato:``,classe:`dobra--cheia abertura--frase`})}>
    <div class="abertura__luz" aria-hidden="true"><span class="abertura__lampada"></span></div>
    <div class="abertura__miolo">
      ${i.selo?`<p class="abertura__selo"><span class="abertura__selo-ponto" aria-hidden="true"></span>${t(i.selo)}</p>`:``}
      <div class="abertura__quadro">
        <span class="quadro__h quadro__h--a" aria-hidden="true"></span>
        <span class="quadro__h quadro__h--b" aria-hidden="true"></span>
        <span class="quadro__v quadro__v--a" aria-hidden="true"></span>
        <span class="quadro__v quadro__v--b" aria-hidden="true"></span>
        <span class="quadro__p quadro__p--1" aria-hidden="true"></span>
        <span class="quadro__p quadro__p--2" aria-hidden="true"></span>
        <span class="quadro__p quadro__p--3" aria-hidden="true"></span>
        <span class="quadro__p quadro__p--4" aria-hidden="true"></span>
        <div class="abertura__camadas">
          <div class="abertura__texto">
            <h1 class="capa abertura__nome">${a}</h1>
          </div>
          <div class="abertura__lente-txt" aria-hidden="true">
            <p class="capa abertura__nome-lente">${a}</p>
          </div>
        </div>
      </div>
      ${i.promessa?`<p class="lead abertura__promessa">${n(i.promessa)}</p>`:``}
    </div>
    <p class="abertura__role rotulo" aria-hidden="true"><span>Role para ver</span></p>
  </section>`}function o(e,{gsap:t,SplitText:n,ScrollTrigger:r,reduce:i,fundo:a}){let o=c(e,{gsap:t,SplitText:n,reduce:i});if(!a)return;e.classList.add(`abertura--fluxo`),e.classList.contains(`abertura--frase`)&&s(e);let l=1,u=()=>{let t=e.getBoundingClientRect(),n=a.altura(),r=Math.max(0,Math.min(1,(t.bottom-n*.1)/(n*.75)));l=r,a.desfazer(1-r)};if(i){r.create({trigger:e,start:`top top`,end:`bottom top`,onUpdate:u,onRefresh:u});return}a.aoQuadro(u);let d=e.querySelector(`.abertura__camadas`);a.passeio=e=>{let t=d.getBoundingClientRect(),n=a.altura();return t.bottom<0||t.top>n?{x:window.innerWidth*(.5+Math.sin(e*.33)*.3),y:n*(.48+Math.sin(e*.47+1.3)*.22)}:{x:t.left+t.width/2+Math.sin(e*.35)*t.width*.36,y:t.top+t.height/2+Math.sin(e*.52+1.3)*t.height*.38}},a.aoQuadro(e=>{let t=d.getBoundingClientRect();d.style.setProperty(`--lx`,`${(e.x-t.left).toFixed(1)}px`),d.style.setProperty(`--ly`,`${(e.y-t.top).toFixed(1)}px`),d.style.setProperty(`--lr`,`${e.r.toFixed(1)}px`)});let f=performance.now();a.aoQuadro(()=>{let e=performance.now(),t=Math.min(.1,(e-f)/1e3);f=e;let n=Math.max(0,Math.min(1,(l-.35)/.4));a.presenca.v+=(n-a.presenca.v)*(1-.004**t)}),(o||t.timeline()).to(a.forca,{v:1,duration:1.2,ease:`expo.out`},o?1.3:0)}function s(e){let n=e.querySelector(`.abertura__nome-lente`),r=e.querySelector(`.abertura__camadas`),i=[...e.querySelectorAll(`.abertura__nome .linha`)];if(!n||!r||!i.length)return;let a=()=>{let e=r.getBoundingClientRect();n.innerHTML=i.map(n=>{let r=n.parentElement.getBoundingClientRect(),i=[],a=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);for(let n=a.nextNode();n;n=a.nextNode()){let r=/\S+/g,a;for(;a=r.exec(n.textContent);){let r=document.createRange();r.setStart(n,a.index),r.setEnd(n,a.index+a[0].length);let o=r.getBoundingClientRect();i.push(`<span class="abertura__lente-palavra" style="left:${(o.left+o.width/2-e.left).toFixed(1)}px">${t(a[0])}</span>`)}}return`<span class="abertura__lente-linha" style="top:${(r.top-e.top).toFixed(1)}px;height:${r.height.toFixed(1)}px">${i.join(``)}</span>`}).join(``)};a(),document.fonts?.ready.then(a);let o;new ResizeObserver(()=>{clearTimeout(o),o=setTimeout(a,120)}).observe(r)}function c(e,{gsap:t,SplitText:n,reduce:r}){if(r)return null;let i=e.querySelector(`.abertura__nome`),a=n.create(i,{type:`lines`,mask:`lines`,linesClass:`linha`}).lines,o=e.querySelector(`.abertura__promessa`),s=o?n.create(o,{type:`words`,wordsClass:`palavra`}).words:[],c=t.timeline({delay:.05}),l=(e,t,n)=>{e&&(e.length===void 0||e.length)&&c.from(e,t,n)};l(e.querySelector(`.abertura__luz`),{opacity:0,yPercent:-8,duration:1.6,ease:`power2.out`},0),l(e.querySelector(`.abertura__lampada`),{scaleX:0,duration:.9,ease:`power3.inOut`},.1),l(e.querySelector(`.abertura__selo`),{opacity:0,y:10,duration:.7,ease:`expo.out`},.25),l(e.querySelectorAll(`.quadro__h`),{scaleX:0,duration:1.1,ease:`power3.inOut`,stagger:.08},.3),l(e.querySelectorAll(`.quadro__v`),{scaleY:0,duration:1.1,ease:`power3.inOut`,stagger:.08},.4),l(e.querySelectorAll(`.quadro__p`),{scale:0,opacity:0,duration:.5,ease:`back.out(3)`,stagger:.06},.95),l(e.querySelector(`.abertura__texto .abertura__ola`),{opacity:0,y:14,duration:.7,ease:`expo.out`},.45),l(a,{yPercent:110,duration:1.15,stagger:.1,ease:`expo.out`},.55),l(s,{opacity:0,y:8,duration:.6,stagger:.022,ease:`power2.out`},1.15),l(e.querySelector(`.abertura__info`),{opacity:0,y:10,duration:.7,ease:`power2.out`},1.5),l(e.querySelector(`.abertura__role`),{opacity:0,duration:.6},2);let u=()=>c.progress()<1&&c.progress(1);return window.addEventListener(`wheel`,u,{once:!0,passive:!0}),window.addEventListener(`touchmove`,u,{once:!0,passive:!0}),window.addEventListener(`keydown`,u,{once:!0}),t.to(e.querySelector(`.abertura__luz`),{y:()=>-window.innerHeight*.22,ease:`none`,scrollTrigger:{trigger:e,start:`top top`,end:`bottom top`,scrub:!0}}),c}export{i as html,o as iniciar};