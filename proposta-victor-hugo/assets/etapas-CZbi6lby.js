import{r as e}from"./dados-DpTqF02S.js";import{n as t,t as n}from"./partes-Bg8oNpww.js";var r=e=>String(e).padStart(2,`0`),i=e=>e===1?`1 dia útil`:`${e} dias úteis`;function a(t){let n=Math.max(1,Number(t.dias)||1),a=/^nada\.?$/i.test(String(t.precisoDeVoce||``).trim());return`<li class="etapa">
      <span class="etapa__no" aria-hidden="true"></span>
      <div class="etapa__corpo">
        <p class="etapa__topo mono"><span class="etapa__n">${r(t.n)}</span></p>
        <h3 class="etapa__titulo">${e(t.titulo)}</h3>
        <p class="etapa__dur mono">${e(t.duracao||i(n))}</p>
        <dl class="etapa__trocas">
          ${t.voceRecebe?`<div><dt class="rotulo">Você recebe</dt><dd>${e(t.voceRecebe)}</dd></div>`:``}
          ${t.precisoDeVoce&&!a?`<div><dt class="rotulo">Preciso de você</dt><dd>${e(t.precisoDeVoce)}</dd></div>`:``}
        </dl>
      </div>
    </li>`}function o(e){let r=e.etapas.length>0;return`<section ${n({id:`etapas`,num:`03`,capitulo:`A nossa jornada`,ato:``})}>
    ${t(`03`,`A nossa jornada`)}
    <div class="etapas__cab">
      <h2 class="titulo dobra__titulo etapas__titulo" data-split>A nossa <em>jornada</em></h2>
      ${r?`<dl class="etapas__resumo" data-reveal>
        <div><dt class="rotulo">Prazo</dt><dd>${e.diasUteis} dias úteis</dd></div>
        <div><dt class="rotulo">Etapas</dt><dd>${e.etapas.length}</dd></div>
      </dl>`:``}
    </div>
    <p class="etapas__obs" data-reveal>O prazo começa a contar quando você aprova. Fins de semana e feriados não contam.</p>
    ${r?`<div class="etapas__trilha" style="--n:${e.etapas.length}">
      <div class="etapas__pontas mono" aria-hidden="true">
        <span>Você aprova</span>
        <span>Site no ar · ${e.diasUteis} dias úteis</span>
      </div>
      <span class="etapas__linha" aria-hidden="true"><span class="etapas__linha-cheia"></span></span>
      <ol class="etapas__lista">${e.etapas.map(a).join(``)}</ol>
    </div>`:``}
  </section>`}function s(e,{gsap:t,ScrollTrigger:n,reduce:r,GRANDE:i,COMPACTO:a}){let o=e.querySelector(`.etapas__trilha`);if(!o)return;let s=o.querySelector(`.etapas__linha-cheia`),c=[...o.querySelectorAll(`.etapa`)];if(r){t.set(s,{scale:1}),c.forEach(e=>e.classList.add(`is-ativa`));return}let l=t.matchMedia(),u=e=>{t.set(s,{scaleX:+!e,scaleY:+!!e});let n=c.length;return t.timeline({scrollTrigger:{trigger:o,start:e?`top 78%`:`top 70%`,end:e?`bottom 75%`:`bottom 60%`,scrub:.6,onUpdate:e=>{c.forEach((t,r)=>t.classList.toggle(`is-ativa`,e.progress>=(r+.35)/n||e.progress>.98))}}}).to(s,e?{scaleX:1,ease:`none`}:{scaleY:1,ease:`none`}),t.from(c.map(e=>e.querySelector(`.etapa__corpo`)),{opacity:0,y:24,duration:.9,stagger:.08,ease:`expo.out`,scrollTrigger:{trigger:o,start:`top 85%`,toggleActions:`play none none none`}}),()=>c.forEach(e=>e.classList.remove(`is-ativa`))};l.add(i,()=>u(!0)),l.add(a,()=>u(!1))}export{o as html,s as iniciar};