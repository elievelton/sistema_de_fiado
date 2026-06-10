const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

const nomeEl = document.getElementById("nomeCliente");
const saldoEl = document.getElementById("saldo");
async function novaDivida() {
  const valorInput = document.getElementById("valorDivida");
  const valor = valorInput.value;

  if (!valor || isNaN(valor)) {
    alert("Valor inválido");
    return;
  }

  const data = new Date().toISOString().split("T")[0];

  await fetch("http://localhost:3000/dividas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      cliente_id: id,
      valor: Number(valor),
      data: data
    })
  });

  alert("Dívida cadastrada ✅");

  valorInput.value = ""; // limpa campo

  calcularSaldo();
}
//Novo Pagamento
async function novoPagamento() {
  const valorInput = document.getElementById("valorPagamento");
  let valor = valorInput.value;

  if (!valor || isNaN(valor)) {
    alert("Valor inválido");
    return;
  }

  valor = Number(valor);
  const data = new Date().toISOString().split("T")[0];

  const resDividas = await fetch(`http://localhost:3000/dividas/${id}`);
  let dividas = await resDividas.json();

  if (dividas.length === 0) {
    alert("Cliente não possui dívidas");
    return;
  }

  // FIFO
  dividas = dividas.sort((a, b) => new Date(a.data) - new Date(b.data));

  let restante = valor;

  for (let divida of dividas) {
    if (restante <= 0) break;

    const resPag = await fetch(`http://localhost:3000/pagamentos/${divida.id}`);
    const pagamentos = await resPag.json();

    let totalPago = 0;
    for (let p of pagamentos) {
      totalPago += p.valor;
    }

    const saldoDivida = divida.valor - totalPago;

    if (saldoDivida <= 0) continue;

    const valorPagar = Math.min(restante, saldoDivida);

    await fetch("http://localhost:3000/pagamentos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        divida_id: divida.id,
        valor: valorPagar,
        data: data,
        metodo: "manual"
      })
    });

    // atualizar status se quitou
    const novoSaldo = saldoDivida - valorPagar;

    if (novoSaldo <= 0) {
      await fetch(`http://localhost:3000/dividas/${divida.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "quitada"
        })
      });
    }

    restante -= valorPagar;
  }

  alert("Pagamento registrado ✅");

  valorInput.value = ""; // limpa campo

  calcularSaldo();
}

async function carregarCliente() {
  // buscar cliente
  const res = await fetch("http://localhost:3000/clientes");
  const clientes = await res.json();

  const cliente = clientes.find(c => c.id == id);

  if (!cliente) {
    nomeEl.innerText = "Cliente não encontrado";
    return;
  }

  nomeEl.innerText = cliente.nome;

  calcularSaldo();
}

async function calcularSaldo() {
  // buscar todas as dívidas do cliente
  const resDividas = await fetch(`http://localhost:3000/dividas/${id}`);
  const dividas = await resDividas.json();

  let totalDividas = 0;
  let totalPagamentos = 0;

  for (let divida of dividas) {
    totalDividas += divida.valor;

    // buscar pagamentos dessa dívida
    const resPag = await fetch(`http://localhost:3000/pagamentos/${divida.id}`);
    const pagamentos = await resPag.json();

    for (let p of pagamentos) {
      totalPagamentos += p.valor;
    }
  }

  const saldo = totalDividas - totalPagamentos;


  saldoEl.innerText = `R$ ${saldo.toFixed(2)}`;

  if (saldo > 0) {
    saldoEl.className = "saldo devedor";
  } else {
    saldoEl.className = "saldo quitado";
  }

  if (saldo > 0) {
    saldoEl.style.color = "red";
  } else {
    saldoEl.style.color = "green";
  }

}
//Ver Extrato
function abrirExtrato() {
  window.location.href = `extrato.html?id=${id}`;
}

// iniciar
carregarCliente();