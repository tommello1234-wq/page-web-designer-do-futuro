import{a as e,r as t,s as n,t as r}from"./dados-DpTqF02S.js";import{g as i,l as a,p as o}from"./motion-CLZi846P.js";import{n as s,t as c}from"./partes-Bg8oNpww.js";function l(e,t=0,{centavos:n=`auto`}={}){e.classList.add(`odometro`);let i=null,s=t=>{let i=r(t,{centavos:n});e.innerHTML=``;let a=document.createElement(`span`);a.className=`odometro__vis`,a.setAttribute(`aria-hidden`,`true`),[...i].forEach(e=>{if(/\d/.test(e)){let t=document.createElement(`span`);t.className=`odometro__col`;let n=document.createElement(`span`);n.className=`odometro__fita`,n.innerHTML=`0123456789`.split(``).map(e=>`<span>${e}</span>`).join(``),t.append(n),t.dataset.d=e,o.set(n,{yPercent:-Number(e)*10}),a.append(t)}else{let t=document.createElement(`span`);t.className=e===` `?`odometro__esp`:`odometro__sep`,t.textContent=e===` `?`\xA0`:e,a.append(t)}});let s=document.createElement(`span`);s.className=`sr-only`,s.textContent=i,e.append(a,s)},c=t=>{if(t===i)return;let c=r(t,{centavos:n}),l=i===null?null:r(i,{centavos:n});if(i=t,!l||l.replace(/\d/g,`0`)!==c.replace(/\d/g,`0`)||a){s(t),l&&!a&&o.from(e.querySelector(`.odometro__vis`),{yPercent:40,opacity:0,duration:.45,ease:`power3.out`});return}let u=[...e.querySelectorAll(`.odometro__col`)],d=c.replace(/\D/g,``).split(``);u.forEach((e,t)=>{let n=d[t];e.dataset.d!==n&&(e.dataset.d=n,o.to(e.firstChild,{yPercent:-Number(n)*10,duration:.6,ease:`power3.out`,delay:(u.length-1-t)*.04}))}),e.querySelector(`.sr-only`).textContent=c};return c(t),{ir:c,get valor(){return i}}}function u(i){let a=i.P,o=i.validade.estado===`vencida`,l=i.pagamentos.find(e=>e.id===`cartao`),u=i.pagamentos.find(e=>e.id===`entrada`),d=i.pagamentos.find(e=>e.id===`pix`),f=l?`ou ${l.parcelas}x de ${r(l.parcela)} sem juros no cartão`:u?`ou ${u.resumo}`:``,p=[d?`à vista no Pix`:``,f].filter(Boolean).join(`, `),m=[...e(i.preco)].map(e=>/\d/.test(e)?`<span class="preco__d"><span>${e}</span></span>`:`<span class="preco__s">${e}</span>`).join(``),h=[i.etapas.length&&`<li><b class="num">${i.etapas.length}</b><span>etapas</span></li>`,i.diasUteis&&`<li><b class="num">${i.diasUteis}</b><span>dias úteis</span></li>`].filter(Boolean).join(``),g=e=>{if(e.id===`pix`)return{valor:r(e.total),nota:`à vista, no Pix`,extra:e.desconto>0?`você economiza ${r(e.desconto)}`:``};if(e.id===`cartao`)return{valor:`${e.parcelas}x ${r(e.parcela)}`,nota:`sem juros no cartão`,extra:`total ${r(e.total)}`};let[t,n]=e.partes;return{valor:e.partes.length===2&&Math.abs(t.valor-n.valor)<.01?`2x ${r(t.valor)}`:`${r(t.valor)} + ${e.partes.length-1}`,nota:e.partes.map(e=>`${r(e.valor)} ${e.quando}`).join(`
`),extra:`total ${r(e.total)}`}},_=i.pagamentos.map(e=>{let n=g(e);return`<label class="pag__op" data-id="${e.id}">
        <input class="sr-only" type="radio" name="pagamento" value="${e.id}" />
        <span class="pag__luz" aria-hidden="true"></span>
        <span class="pag__topo">
          <span class="pag__rot">${t(e.rotulo)}</span>
          <span class="pag__marca" aria-hidden="true"></span>
        </span>
        ${e.selo?`<span class="pag__selo mono">${t(e.selo)}</span>`:``}
        <span class="pag__valor num">${t(n.valor)}</span>
        <span class="pag__nota">${t(n.nota).replace(/\n/g,`<br>`)}</span>
        ${n.extra?`<span class="pag__extra mono">${t(n.extra)}</span>`:``}
      </label>`}).join(``);return`<section ${c({id:`investimento`,num:`04`,capitulo:`Investimento`,ato:``,classe:`dobra--cheia`})}>
    <div class="palco">
      <div class="palco__luz" aria-hidden="true"></div>
      <div class="palco__cab">${s(`04`,`Investimento`)}</div>
      <div class="palco__centro">
        <div class="palco__projeto">
          <p class="rotulo palco__rot">O seu projeto</p>
          <h2 class="titulo palco__nome">${n(a.projeto?.nome||`Seu projeto`)}</h2>
          ${a.projeto?.resumo?`<p class="palco__resumo">${n(a.projeto.resumo)}</p>`:``}
          ${h?`<ul class="palco__stats">${h}</ul>`:``}
        </div>
        ${o?`<div class="palco__preco palco__preco--vencida">
                <p class="palco__frase">Os valores desta proposta valiam até ${t(i.validade.curta)}.</p>
                <a class="btn btn--acc" data-wa-vencida target="_blank" rel="noopener">Pedir uma proposta atualizada</a>
              </div>`:`<div class="palco__preco">
                <p class="palco__frase">Investimento:</p>
                <p class="preco" aria-label="${t(r(i.preco))}">
                  <span class="preco__moeda" aria-hidden="true">R$</span><span class="preco__num" aria-hidden="true">${m}</span>
                </p>
                ${p?`<p class="palco__condicao">${t(p)}</p>`:``}
                <p class="palco__validade rotulo">Condição ${t(i.validade.texto)}${i.validade.motivo?`, ${t(i.validade.motivo)}`:``}</p>
              </div>`}
      </div>
    </div>
    ${o||!i.pagamentos.length?``:`<div class="pag-bloco">
      <h3 class="sr-only">Formas de pagamento</h3>
      <fieldset class="pag" data-reveal data-reveal-grupo>
        <legend class="sr-only">Forma de pagamento</legend>
        ${_}
      </fieldset>
      <div class="pag__resumo" data-reveal data-reveal-delay=".15">
        <div class="pag__resumo-txt">
          <p class="rotulo">Você investe</p>
          <p class="pag__total num"></p>
          <p class="pag__detalhe" aria-live="polite"></p>
        </div>
        <a class="btn btn--acc pag__seguir" target="_blank" rel="noopener">Aprovar pelo WhatsApp</a>
      </div>
    </div>`}
  </section>`}function d(e,t){let{d:n,gsap:r,ScrollTrigger:i,reduce:a,estado:o,GRANDE:s,COMPACTO:c,whatsapp:l}=t,u=n.validade.estado===`vencida`,d=e.querySelector(`.preco`),p=e.querySelector(`[data-wa-vencida]`);p&&(p.href=l(`Oi! A proposta para ${n.P.cliente.empresa} venceu. Pode me mandar uma atualizada?`)),f(e,t);let m=!1,h=()=>{m||(m=!0,o.set(`precoVisto`,!0),!(u||a||!d)&&r.timeline().to(d.querySelector(`.preco__moeda`),{opacity:1,y:0,duration:.5,ease:`power3.out`},0).to(d.querySelectorAll(`.preco__d > span`),{yPercent:0,duration:.95,stagger:.07,ease:`expo.out`},.12).to(d.querySelectorAll(`.preco__s`),{opacity:1,duration:.3},.3).to(e.querySelector(`.palco__condicao`),{opacity:1,y:0,duration:.7,ease:`power2.out`},`+=0.55`).to(e.querySelector(`.palco__validade`),{opacity:1,duration:.6},`+=0.2`))};if(a){i.create({trigger:e,start:`top 70%`,onEnter:h});return}d&&(r.set(d.querySelector(`.preco__moeda`),{opacity:0,y:14}),r.set(d.querySelectorAll(`.preco__d > span`),{yPercent:115}),r.set(d.querySelectorAll(`.preco__s`),{opacity:0}),r.set(e.querySelectorAll(`.palco__condicao, .palco__validade`),{opacity:0,y:10}));let g=e.querySelector(`.palco`),_=e.querySelector(`.palco__projeto`),v=e.querySelector(`.palco__preco`),y=e.querySelector(`.palco__luz`),b=r.timeline({paused:!0}).from(_.querySelectorAll(`.palco__rot, .palco__nome, .palco__resumo`),{opacity:0,y:30,stagger:.08,duration:.9,ease:`expo.out`}).from(_.querySelectorAll(`.palco__stats li`),{opacity:0,y:18,stagger:.08,duration:.7,ease:`expo.out`},.25);i.create({trigger:e,start:`top 70%`,onEnter:()=>b.play()});let x=r.matchMedia(),S=e=>(r.timeline({scrollTrigger:{trigger:g,start:`top top`,end:e?`+=160%`:`+=120%`,pin:!0,scrub:.7,anticipatePin:1,invalidateOnRefresh:!0,snap:{snapTo:`labelsDirectional`,duration:{min:.2,max:.7},delay:.1,ease:`power1.inOut`}}}).addLabel(`inicio`).from(y,{opacity:.3,duration:.6},0).addLabel(`projeto`).to(y,{opacity:1,scale:1.08,duration:.8,ease:`power1.inOut`},`projeto+=0.15`).to(_,{opacity:.42,scale:.94,y:()=>e?-20:-12,duration:.8,ease:`power2.inOut`},`projeto+=0.15`).from(v.querySelector(`.palco__frase`),{opacity:0,y:18,duration:.5},`projeto+=0.5`).call(h,null,`projeto+=0.95`).addLabel(`preco`,`projeto+=1`).to({},{duration:.6}),()=>{});x.add(s,()=>S(!0)),x.add(c,()=>S(!1)),i.create({trigger:e.querySelector(`.pag-bloco`)||e,start:`top 85%`,onEnter:h})}function f(e,{d:t,estado:n,whatsapp:r}){let a=e.querySelector(`.pag__total`);if(!a)return;let o=e.querySelector(`.pag__seguir`),s=String(t.P.autor?.nome||``).split(` `)[0],c=e.querySelector(`.pag__detalhe`),u=[...e.querySelectorAll(`input[name="pagamento"]`)],d=()=>t.pagamentos.find(e=>e.id===n.get(`pagamento`))||t.pagamentos[0],f=l(a,d().total),p=e=>{if(u.forEach(t=>{t.checked=t.value===e.id,t.closest(`.pag__op`).classList.toggle(`is-ativo`,t.checked)}),f.ir(e.total),c.textContent=e.resumo.charAt(0).toUpperCase()+e.resumo.slice(1),o){let n=String(t.P.projeto?.nome||``).replace(/\*/g,``);o.href=r([`Olá, ${s}! Aceito a proposta para ${t.P.cliente.empresa} e quero pagar assim:`,e.id===`entrada`?`${e.rotulo}: ${e.resumo}`:e.resumo.charAt(0).toUpperCase()+e.resumo.slice(1),n?`Projeto: ${n}`:``].filter(Boolean).join(`
`))}};u.forEach(e=>e.addEventListener(`change`,()=>{e.checked&&(n.set(`pagamento`,e.value),i(t.P.numero,{pagamento:e.value}))})),n.on(`pagamento`,()=>p(d())),p(d())}export{u as html,d as iniciar};