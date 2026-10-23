import{n as e,r as t,s as n}from"./dados-DpTqF02S.js";import{t as r}from"./partes-Bg8oNpww.js";function i(i){let a=i.P,o=i.validade.estado===`vencida`,s=a.autor.foto?`<img class="abertura__foto" src="${t(a.autor.foto)}" alt="" width="64" height="64" onerror="this.remove()" />`:``,c=`${t(i.saudacao)}${a.cliente.contato?`, ${t(a.cliente.contato)}`:``}. Esta proposta é para`;return`<section ${r({id:`abertura`,num:`01`,capitulo:`Proposta para ${a.cliente.empresa}`,ato:``,classe:`dobra--cheia`})}>
    <div class="abertura__luz" aria-hidden="true"><span class="abertura__lampada"></span></div>
    <div class="abertura__miolo">
      <p class="abertura__selo">
        <span class="abertura__selo-ponto" aria-hidden="true"></span>
        Proposta comercial
        <span class="abertura__selo-sep" aria-hidden="true"></span>
        <span class="${o?`is-vencida`:``}">${o?`Venceu em`:`Válida até`} ${i.validade.curta}</span>
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
            <p class="abertura__ola">${c}</p>
            <h1 class="capa abertura__nome">${t(a.cliente.empresa)}</h1>
          </div>
          <div class="abertura__lente-txt" aria-hidden="true">
            <p class="abertura__ola">${c}</p>
            <p class="capa abertura__nome-lente">${t(a.cliente.empresa)}</p>
          </div>
        </div>
      </div>
      <p class="lead abertura__promessa">${n(a.promessa)}</p>
      <div class="abertura__info">
        <p class="abertura__autor">${s}<span>Preparada por <b>${t(a.autor.nome)}</b></span></p>
        <span class="abertura__div" aria-hidden="true"></span>
        <p class="mono abertura__dado">${e(i.hoje)}</p>
        <span class="abertura__div" aria-hidden="true"></span>
        <p class="mono abertura__dado">Leitura de ${i.leituraMin} min</p>
      </div>
    </div>
    <p class="abertura__role rotulo" aria-hidden="true"><span>Role para começar</span></p>
  </section>`}function a(e,{gsap:t,SplitText:n,ScrollTrigger:r,reduce:i,fundo:a}){let s=o(e,{gsap:t,SplitText:n,reduce:i});if(!a)return;e.classList.add(`abertura--fluxo`);let c=1,l=()=>{let t=e.getBoundingClientRect(),n=a.altura(),r=Math.max(0,Math.min(1,(t.bottom-n*.1)/(n*.75)));c=r,a.desfazer(1-r)};if(i){r.create({trigger:e,start:`top top`,end:`bottom top`,onUpdate:l,onRefresh:l});return}a.aoQuadro(l);let u=e.querySelector(`.abertura__camadas`);a.passeio=e=>{let t=u.getBoundingClientRect(),n=a.altura();return t.bottom<0||t.top>n?{x:window.innerWidth*(.5+Math.sin(e*.33)*.3),y:n*(.48+Math.sin(e*.47+1.3)*.22)}:{x:t.left+t.width/2+Math.sin(e*.35)*t.width*.36,y:t.top+t.height/2+Math.sin(e*.52+1.3)*t.height*.38}},a.aoQuadro(e=>{let t=u.getBoundingClientRect();u.style.setProperty(`--lx`,`${(e.x-t.left).toFixed(1)}px`),u.style.setProperty(`--ly`,`${(e.y-t.top).toFixed(1)}px`),u.style.setProperty(`--lr`,`${e.r.toFixed(1)}px`)});let d=performance.now();a.aoQuadro(()=>{let e=performance.now(),t=Math.min(.1,(e-d)/1e3);d=e;let n=Math.max(0,Math.min(1,(c-.35)/.4));a.presenca.v+=(n-a.presenca.v)*(1-.004**t)}),(s||t.timeline()).to(a.forca,{v:1,duration:1.2,ease:`expo.out`},s?1.3:0)}function o(e,{gsap:t,SplitText:n,reduce:r}){if(r)return null;let i=e.querySelector(`.abertura__nome`),a=n.create(i,{type:`lines`,mask:`lines`,linesClass:`linha`}).lines,o=n.create(e.querySelector(`.abertura__promessa`),{type:`words`,wordsClass:`palavra`}).words,s=t.timeline({delay:.05});s.from(e.querySelector(`.abertura__luz`),{opacity:0,yPercent:-8,duration:1.6,ease:`power2.out`},0).from(e.querySelector(`.abertura__lampada`),{scaleX:0,duration:.9,ease:`power3.inOut`},.1).from(e.querySelector(`.abertura__selo`),{opacity:0,y:10,duration:.7,ease:`expo.out`},.25).from(e.querySelectorAll(`.quadro__h`),{scaleX:0,duration:1.1,ease:`power3.inOut`,stagger:.08},.3).from(e.querySelectorAll(`.quadro__v`),{scaleY:0,duration:1.1,ease:`power3.inOut`,stagger:.08},.4).from(e.querySelectorAll(`.quadro__p`),{scale:0,opacity:0,duration:.5,ease:`back.out(3)`,stagger:.06},.95).from(e.querySelector(`.abertura__texto .abertura__ola`),{opacity:0,y:14,duration:.7,ease:`expo.out`},.45).from(a,{yPercent:110,duration:1.15,stagger:.1,ease:`expo.out`},.55).from(o,{opacity:0,y:8,duration:.6,stagger:.022,ease:`power2.out`},1.15).from(e.querySelector(`.abertura__info`),{opacity:0,y:10,duration:.7,ease:`power2.out`},1.5).from(e.querySelector(`.abertura__role`),{opacity:0,duration:.6},2);let c=()=>s.progress()<1&&s.progress(1);return window.addEventListener(`wheel`,c,{once:!0,passive:!0}),window.addEventListener(`touchmove`,c,{once:!0,passive:!0}),window.addEventListener(`keydown`,c,{once:!0}),t.to(e.querySelector(`.abertura__luz`),{y:()=>-window.innerHeight*.22,ease:`none`,scrollTrigger:{trigger:e,start:`top top`,end:`bottom top`,scrub:!0}}),s}export{i as html,a as iniciar};