import{i as e,r as t,s as n}from"./dados-DpTqF02S.js";import{n as r,t as i}from"./partes-Bg8oNpww.js";var a=e=>String(e).padStart(2,`0`);function o(n){let r=n.validade,i=r.motivo?`, ${t(r.motivo)}`:``,a=`<em>${t(r.curta)}</em>`;if(r.estado===`vencida`){let i=`Oi, ${String(n.P.autor?.nome||``).split(` `)[0]}! A proposta para ${n.P.cliente.empresa} venceu em ${r.curta}. Pode atualizar os valores para mim?`;return`<div class="comb__validade is-vencida" data-reveal>
        <p class="rotulo">Validade</p>
        <p class="comb__validade-frase">Os valores valiam até ${a}. Quer que eu atualize?</p>
        <a class="btn btn--acc" href="${t(e(n,i))}" target="_blank" rel="noopener">Pedir valores atualizados</a>
      </div>`}let o=`até ${a}`;return r.estado===`ultimos`&&(o=r.restamDias===0?`até hoje, ${a}`:r.restamDias===1?`até amanhã, ${t(r.semana)}, ${a}`:`até ${t(r.semana)}, ${a}`),`<div class="comb__validade${r.estado===`ultimos`?` is-ultimos`:``}" data-reveal>
      <p class="rotulo">Validade</p>
      <p class="comb__validade-frase">Esta proposta vale ${o}${i}.</p>
    </div>`}function s(s){let c=s.P.combinados||{},l=(c.incluso||[]).filter(Boolean),u=(c.naoIncluso||[]).filter(Boolean),d=(c.garantias||[]).filter(e=>e&&(e.titulo||e.texto)),f=(c.duvidas||[]).filter(e=>e&&e.p),p=String(s.P.autor?.nome||``).split(` `)[0],m=(e,t,r)=>r.length?`<div class="comb__col comb__col--${e}">
          <p class="comb__col-cab"><span class="rotulo">${t}</span><span class="mono comb__col-qtd">${a(r.length)}</span></p>
          <ul class="comb__lista" data-reveal data-reveal-grupo>
            ${r.map(e=>`<li><span class="comb__marca" aria-hidden="true"></span><span>${n(e)}</span></li>`).join(``)}
          </ul>
        </div>`:``;return`<section ${i({id:`combinados`,num:`05`,capitulo:`Combinados`,ato:``})}>
    ${r(`05`,`Combinados`)}
    <h2 class="titulo dobra__titulo" data-split>Sem letra <em>miúda</em></h2>
    <p class="lead dobra__intro" data-reveal>${u.length?`O que está no projeto, o que fica de fora e o que eu garanto, antes de você aprovar.`:`O que está no projeto e o que eu garanto, antes de você aprovar.`}</p>

    ${l.length||u.length?`<div class="comb__escopo${l.length>=6&&u.length?` comb__escopo--largo`:``}${!l.length||!u.length?` comb__escopo--unico`:``}">
      ${m(`sim`,`Está incluso`,l)}
      ${m(`nao`,`Não está incluso`,u)}
    </div>`:``}

    ${d.length?`<div class="comb__garantias">
      <div class="comb__garantias-cab" data-reveal>
        <p class="rotulo">Meus compromissos</p>
        <h3 class="comb__garantias-titulo">O que eu <em>garanto</em></h3>
      </div>
      <ol class="comb__garantias-lista" data-reveal data-reveal-grupo>
        ${d.map((e,t)=>`<li class="comb__garantia">
            <span class="comb__garantia-n mono">${a(t+1)}</span>
            <h3 class="comb__garantia-titulo">${n(e.titulo||``)}</h3>
            ${e.texto?`<p class="comb__garantia-texto">${n(e.texto)}</p>`:``}
          </li>`).join(``)}
      </ol>
    </div>`:``}

    ${f.length?`<div class="comb__duvidas">
      <div class="comb__duvidas-cab" data-reveal>
        <h3 class="comb__duvidas-titulo">Dúvidas comuns</h3>
        ${s.whatsapp?`<p class="comb__duvidas-txt">Ficou outra? <a class="link-seta" href="${t(e(s,`Oi, ${p}! Estou lendo a proposta para ${s.P.cliente.empresa} e tenho uma dúvida.`))}" target="_blank" rel="noopener">Me chama no WhatsApp</a></p>`:``}
      </div>
      <div class="comb__sanfona" data-reveal data-reveal-grupo>
        ${f.map((e,r)=>`<details class="duvida"${r===0?` open`:``}>
            <summary class="duvida__p"><span class="duvida__n mono" aria-hidden="true">${a(r+1)}</span><span class="duvida__txt">${t(e.p)}</span><span class="duvida__icone" aria-hidden="true"></span></summary>
            <div class="duvida__r"><p>${n(e.r||``)}</p></div>
          </details>`).join(``)}
      </div>
    </div>`:``}

    ${o(s)}
  </section>`}function c(e,{gsap:t,reduce:n}){n||e.querySelectorAll(`.duvida`).forEach(e=>{let n=e.querySelector(`.duvida__r > p`);e.addEventListener(`toggle`,()=>{if(!e.open)return t.set(n,{clearProps:`opacity,transform`});t.fromTo(n,{opacity:0,y:-8},{opacity:1,y:0,duration:.5,ease:`power2.out`,overwrite:!0,clearProps:`opacity,transform`})})})}export{s as html,c as iniciar};