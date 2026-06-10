const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

const lista = document.getElementById("listaExtrato");

async function carregarExtrato() {
  const resDividas = await fetch(`http://localhost:3000/dividas/${id}`);
  const dividas = await resDividas.json();

  let listaDados = [];

  for (let divida of dividas) {
    // adicionar dívida
    listaDados.push({
      tipo: "divida",
      id: divida.id,
      valor: divida.valor,
      data: divida.data
    });

    // buscar pagamentos
    const resPag = await fetch(`http://localhost:3000/pagamentos/${divida.id}`);
    const pagamentos = await resPag.json();

    for (let p of pagamentos) {
      listaDados.push({
        tipo: "pagamento",
        divida_id: divida.id,
        valor: p.valor,
        data: p.data,
        metodo: p.metodo
      });
    }
  }

  mostrarExtrato(listaDados);
}

function mostrarExtrato(listaDados) {
  lista.innerHTML = "";

  let grupos = [];

  // 1. criar grupos de dívida
  listaDados.forEach(item => {
    if (item.tipo === "divida") {
      grupos.push({
        id: item.id,
        valor: item.valor,
        data: item.data,
        pagamentos: [],
        saldo: item.valor
      });
    }
  });

  // ordenar dívidas mais antigas primeiro
  grupos.sort((a, b) => new Date(a.data) - new Date(b.data));

  // 2. aplicar pagamentos (FIFO)
  listaDados.forEach(item => {
    if (item.tipo === "pagamento") {
      let restante = item.valor;

      for (let grupo of grupos) {
        if (restante <= 0) break;

        if (grupo.saldo > 0) {
          let aplicado = Math.min(grupo.saldo, restante);

          grupo.pagamentos.push({
            valor: aplicado,
            data: item.data,
            metodo: item.metodo
          });

          grupo.saldo -= aplicado;
          restante -= aplicado;
        }
      }
    }
  });

  // inverter para mostrar mais recente primeiro
  grupos.reverse();

  // 3. renderizar
  grupos.forEach(grupo => {

    const card = document.createElement("div");
    card.classList.add("card");

    const titulo = document.createElement("div");
    titulo.style.fontWeight = "bold";
    titulo.style.marginBottom = "8px";

    if (Math.abs(grupo.saldo) < 0.01) {
      card.classList.add("quitada");
      titulo.innerText = `🧾 Dívida - R$ ${grupo.valor} - ${grupo.data} → ✅ Quitada`;
    } else {
      card.classList.add("ativa");
      titulo.innerText = `🧾 Dívida - R$ ${grupo.valor} - ${grupo.data} → 🔴 Deve: R$ ${grupo.saldo.toFixed(2)}`;
    }

    card.appendChild(titulo);

    // caso não tenha pagamento
    if (grupo.pagamentos.length === 0) {
      const info = document.createElement("div");
      info.style.color = "#999";
      info.innerText = "Nenhum pagamento registrado";
      card.appendChild(info);
    }

// botão expandir (só se tiver pagamentos)
if (grupo.pagamentos.length > 0) {

  // criar botão
  const botao = document.createElement("button");
  botao.classList.add("botao-detalhe");
  botao.innerText = "▼ Ver detalhes";

  // criar container de detalhes
  const detalhes = document.createElement("div");
  detalhes.classList.add("detalhes");
  detalhes.style.maxHeight = "0px"; // inicia fechado

  // evento de clique
  botao.onclick = () => {
    if (detalhes.style.maxHeight !== "0px") {
      detalhes.style.maxHeight = "0px";
      botao.innerText = "▼ Ver detalhes";
    } else {
      detalhes.style.maxHeight = detalhes.scrollHeight + "px";
      botao.innerText = "▲ Ocultar";
    }
  };

  // adicionar botão no card
  card.appendChild(botao);

  // adicionar pagamentos dentro do container
  grupo.pagamentos.forEach(p => {
    const pEl = document.createElement("div");
    pEl.classList.add("pagamento");

    pEl.innerText = `💸 Pago: R$ ${p.valor} (${p.metodo || "manual"}) - ${p.data}`;

    detalhes.appendChild(pEl);
  });

  // adicionar detalhes no card
  card.appendChild(detalhes);
}

    lista.appendChild(card);
});
}

// iniciar
carregarExtrato();