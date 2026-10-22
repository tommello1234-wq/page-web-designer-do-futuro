import{a as e,r as t,s as n,t as r}from"./dados-DpTqF02S.js";import{n as i,t as a}from"./partes-Bg8oNpww.js";function o(o){let s=o.P,c=o.validade.estado===`vencida`,l=o.pagamentos.find(e=>e.id===`cartao`),u=o.pagamentos.find(e=>e.id===`entrada`),d=o.pagamentos.find(e=>e.id===`pix`),f=l?`ou ${l.parcelas}x de ${r(l.parcela)} sem juros no cartão`:u?`ou ${u.resumo}`:``,p=[d?`à vista no Pix`:``,f].filter(Boolean).map(e=>t(e).replace(/R\$ /g,()=>`R$\xA0`)),m=e=>e.map(e=>`<span class="palco__parte">${e}</span>`).join(`<span class="palco__virgula">, </span>`),h=[`Condição ${t(o.validade.texto)}`,t(o.validade.motivo)].filter(Boolean),g=[...e(o.preco)].map(e=>/\d/.test(e)?`<span class="preco__d"><span>${e}</span></span>`:`<span class="preco__s">${e}</span>`).join(``),_=[o.etapas.length&&`<li><b class="num">${o.etapas.length}</b><span>etapas</span></li>`,o.diasUteis&&`<li><b class="num">${o.diasUteis}</b><span>dias úteis</span></li>`].filter(Boolean).join(``);return`<section ${a({id:`investimento`,num:`04`,capitulo:`Investimento`,ato:``,classe:`dobra--cheia`})}>
    <div class="palco">
      <div class="palco__luz" aria-hidden="true"></div>
      <div class="palco__cab">${i(`04`,`Investimento`)}</div>
      <div class="palco__centro">
        <div class="palco__projeto">
          <p class="rotulo palco__rot">O seu projeto</p>
          <h2 class="titulo palco__nome">${n(s.projeto?.nome||`Seu projeto`)}</h2>
          ${s.projeto?.resumo?`<p class="palco__resumo">${n(s.projeto.resumo)}</p>`:``}
          ${_?`<ul class="palco__stats">${_}</ul>`:``}
        </div>
        ${c?`<div class="palco__preco palco__preco--vencida">
                <p class="palco__frase">Os valores desta proposta valiam até ${t(o.validade.curta)}.</p>
                <a class="btn btn--acc" data-wa-vencida target="_blank" rel="noopener">Pedir uma proposta atualizada</a>
              </div>`:`<div class="palco__preco">
                <p class="palco__frase">Investimento:</p>
                <p class="preco" aria-label="${t(r(o.preco))}" style="--preco-n: ${e(o.preco).length}">
                  <span class="preco__moeda" aria-hidden="true">R$</span><span class="preco__num" aria-hidden="true">${g}</span>
                </p>
                ${p.length?`<p class="palco__condicao">${m(p)}</p>`:``}
                <p class="palco__validade rotulo">${m(h)}</p>
              </div>`}
      </div>
    </div>
    ${c?``:`<div class="pag-bloco pag-bloco--so-botao" data-reveal>
      <a class="btn btn--acc pag__seguir" target="_blank" rel="noopener">Aprovar pelo WhatsApp</a>
      <p class="pag__dica">No WhatsApp a gente combina se fica à vista ou parcelado.</p>
    </div>`}
  </section>`}function s(e,t){let{d:n,gsap:r,ScrollTrigger:i,reduce:a,estado:o,GRANDE:s,COMPACTO:l,whatsapp:u}=t,d=n.validade.estado===`vencida`,f=e.querySelector(`.preco`),p=e.querySelector(`[data-wa-vencida]`);p&&(p.href=u(`Oi! A proposta para ${n.P.cliente.empresa} venceu. Pode me mandar uma atualizada?`)),c(e,t);let m=!1,h=()=>{m||(m=!0,o.set(`precoVisto`,!0),!(d||a||!f)&&r.timeline().to(f.querySelector(`.preco__moeda`),{opacity:1,y:0,duration:.5,ease:`power3.out`},0).to(f.querySelectorAll(`.preco__d > span`),{yPercent:0,duration:.95,stagger:.07,ease:`expo.out`},.12).to(f.querySelectorAll(`.preco__s`),{opacity:1,duration:.3},.3).to(e.querySelector(`.palco__condicao`),{opacity:1,y:0,duration:.5,ease:`power2.out`},.75).to(e.querySelector(`.palco__validade`),{opacity:1,duration:.5},`+=0.1`))};if(a){i.create({trigger:e,start:`top 70%`,onEnter:h});return}f&&(r.set(f.querySelector(`.preco__moeda`),{opacity:0,y:14}),r.set(f.querySelectorAll(`.preco__d > span`),{yPercent:115}),r.set(f.querySelectorAll(`.preco__s`),{opacity:0}),r.set(e.querySelectorAll(`.palco__condicao, .palco__validade`),{opacity:0,y:10}));let g=e.querySelector(`.palco`),_=e.querySelector(`.palco__projeto`),v=e.querySelector(`.palco__preco`),y=e.querySelector(`.palco__luz`),b=r.timeline({paused:!0}).from(_.querySelectorAll(`.palco__rot, .palco__nome, .palco__resumo`),{opacity:0,y:30,stagger:.08,duration:.9,ease:`expo.out`}).from(_.querySelectorAll(`.palco__stats li`),{opacity:0,y:18,stagger:.08,duration:.7,ease:`expo.out`},.25);i.create({trigger:e,start:`top 70%`,onEnter:()=>b.play()});let x=r.matchMedia(),S=e=>(r.timeline({scrollTrigger:{trigger:g,start:`top top`,end:e?`+=160%`:`+=120%`,pin:!0,scrub:.7,anticipatePin:1,invalidateOnRefresh:!0,snap:{snapTo:`labelsDirectional`,duration:{min:.2,max:.7},delay:.1,ease:`power1.inOut`}}}).addLabel(`inicio`).from(y,{opacity:.3,duration:.6},0).addLabel(`projeto`).to(y,{opacity:1,scale:1.08,duration:.8,ease:`power1.inOut`},`projeto+=0.15`).to(_,{opacity:e?.42:.8,scale:.94,y:()=>e?-20:-12,duration:.8,ease:`power2.inOut`},`projeto+=0.15`).from(v.querySelector(`.palco__frase`),{opacity:0,y:18,duration:.5},`projeto+=0.5`).call(h,null,`projeto+=0.95`).addLabel(`preco`,`projeto+=1`).to({},{duration:.6}),()=>{});x.add(s,()=>S(!0)),x.add(l,()=>S(!1)),i.create({trigger:e.querySelector(`.pag-bloco`)||e,start:`top 85%`,onEnter:h})}function c(e,{d:t,whatsapp:n}){let r=e.querySelector(`.pag__seguir`);if(!r)return;let i=String(t.P.autor?.nome||``).split(` `)[0],a=String(t.P.projeto?.nome||``).replace(/\*/g,``);r.href=n([`Olá, ${i}! Aceito a proposta para ${t.P.cliente.empresa}.`,a?`Projeto: ${a}`:``,`Vamos combinar a forma de pagamento?`].filter(Boolean).join(`
`))}export{o as html,s as iniciar};