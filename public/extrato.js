const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

const lista = document.getElementById("listaExtrato");

async function carregarExtrato() {
  const resDividas = await fetch(`http://localhost:3000/dividas/${id}`);
  const dividas = await resDividas.json();

  let extrato = [];

  for (let divida of dividas) {
    extrato.push({
      tipo: "divida",
      id: divida.id,
      valor: divida.valor,
      data: divida.data,
    });

    const resPag = await fetch(`http://localhost:3000/pagamentos/${divida.id}`);
    const pagamentos = await resPag.json();

    for (let p of pagamentos) {
      extrato.push({
        tipo: "pagamento",
        divida_id: divida.id,
        valor: p.valor,
        data: p.data,
        metodo: p.metodo,
      });
    }
  }

  extrato.sort((a, b) => new Date(a.data) - new Date(b.data));

  mostrarExtrato(extrato);
}

function mostrarExtrato(listaDados) {
  lista.innerHTML = "";

  let grupos = [];

  // separar dívidas
  listaDados.forEach((item) => {
    if (item.tipo === "divida") {
      grupos.push({
        id: item.id,
        valor: item.valor,
        data: item.data,
        pagamentos: [],
        saldo: item.valor,
      });
    }
  });

  // ordenar dívidas por data (mais antiga)
  grupos.sort((a, b) => new Date(a.data) - new Date(b.data));

  // aplicar pagamentos FIFO
  listaDados.forEach((item) => {
    if (item.tipo === "pagamento") {
      let restante = item.valor;

      for (let grupo of grupos) {
        if (restante <= 0) break;

        if (Math.abs(grupo.saldo) > 0.01) {
          let aplicado = Math.min(grupo.saldo, restante);

          grupo.pagamentos.push({
            valor: aplicado,
            data: item.data,
            metodo: item.metodo,
          });

          grupo.saldo -= aplicado;
          restante -= aplicado;
        }
      }
    }
  });

  // inverter ordem para exibir recente primeiro
  grupos.reverse();

  // renderizar
  grupos.forEach((grupo) => {
    // CARD PRINCIPAL
    const card = document.createElement("div");
    card.classList.add("card");

    const titulo = document.createElement("div");
    titulo.style.fontWeight = "bold";
    titulo.style.marginBottom = "8px";

    if (grupo.saldo <= 0) {
      card.classList.add("quitada");
      titulo.innerText = `🧾 Dívida - R$ ${grupo.valor} - ${grupo.data} → ✅ Quitada`;
    } else {
      card.classList.add("ativa");
      titulo.innerText = `🧾 Dívida - R$ ${grupo.valor} - ${grupo.data} → 🔴 Deve: R$ ${grupo.saldo}`;
    }

    card.appendChild(titulo);

    // LINHAS DE PAGAMENTO
    grupo.pagamentos.forEach((p) => {
      const pEl = document.createElement("div");
      pEl.classList.add("pagamento");

      pEl.innerText = `💸 Pago: R$ ${p.valor} (${p.metodo}) - ${p.data}`;

      card.appendChild(pEl);
    });

    lista.appendChild(card);
  });
}

carregarExtrato();
