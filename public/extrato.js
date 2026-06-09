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
      valor: divida.valor,
      data: divida.data
    });

    const resPag = await fetch(`http://localhost:3000/pagamentos/${divida.id}`);
    const pagamentos = await resPag.json();

    for (let p of pagamentos) {
      extrato.push({
        tipo: "pagamento",
        valor: p.valor,
        data: p.data,
        metodo: p.metodo
      });
    }
  }

  extrato.sort((a, b) => new Date(b.data) - new Date(a.data));

  mostrarExtrato(extrato);
}

function mostrarExtrato(listaDados) {
  lista.innerHTML = "";

  for (let item of listaDados) {
    const li = document.createElement("li");

    if (item.tipo === "divida") {
      li.innerText = `🧾 Dívida - R$ ${item.valor} - ${item.data}`;
    } else {
      li.innerText = `💸 Pagamento - R$ ${item.valor} (${item.metodo}) - ${item.data}`;
    }

    lista.appendChild(li);
  }
}

carregarExtrato();