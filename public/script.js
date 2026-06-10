const lista = document.getElementById("listaClientes");
const busca = document.getElementById("busca");
const limparBusca = document.getElementById("limparBusca");

let listaClientesGlobal = [];
let listaClientesComSaldo = [];

// ============================
// CARREGAR CLIENTES
// ============================
async function carregarClientes() {
  const res = await fetch("http://localhost:3000/clientes");
  const clientes = await res.json();

  listaClientesGlobal = clientes;

  await calcularSaldos(clientes);
}

// ============================
// CALCULAR SALDOS (IMPORTANTE)
// ============================
async function calcularSaldos(clientes) {
  listaClientesComSaldo = [];

  for (let c of clientes) {
    const resDiv = await fetch(`http://localhost:3000/dividas/${c.id}`);
    const dividas = await resDiv.json();

    let totalDividas = 0;
    let totalPagamentos = 0;

    for (let d of dividas) {
      totalDividas += d.valor;

      const resPag = await fetch(`http://localhost:3000/pagamentos/${d.id}`);
      const pagamentos = await resPag.json();

      for (let p of pagamentos) {
        totalPagamentos += p.valor;
      }
    }

    const saldo = totalDividas - totalPagamentos;

    listaClientesComSaldo.push({
      cliente: c,
      saldo: saldo
    });
  }

  // ordenar por quem deve mais
  listaClientesComSaldo.sort((a, b) => b.saldo - a.saldo);

  renderizarClientes(listaClientesComSaldo);
}

// ============================
// RENDER PRINCIPAL
// ============================

function renderizarClientes(listaDados) {
  lista.innerHTML = "";

  if (listaDados.length === 0) {
    lista.innerHTML = "<p>Nenhum cliente encontrado</p>";
    return;
  }

  listaDados.forEach(item => {
    const c = item.cliente;
    const saldo = item.saldo;

    const card = document.createElement("div");
    card.classList.add("card");

    const classe = saldo > 0 ? "devedor-card" : "quitado-card";
    card.classList.add(classe);

    const nomeDestacado = destacarTexto(c.nome, busca.value);

    card.innerHTML = `
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <strong>${nomeDestacado}</strong>
    <div class="saldo ${saldo > 0 ? "devedor" : "quitado"}">
      R$ ${saldo.toFixed(2)}
    </div>
  </div>
`;

    card.onclick = () => abrirCliente(c.id);

    lista.appendChild(card);
  });
}


// ============================
// BUSCA (AGORA CORRETA ✅)
// ============================
busca.addEventListener("input", () => {
  const termo = busca.value.trim().toLowerCase();

  // mostrar ou esconder X
  limparBusca.style.display = termo ? "block" : "none";

  const filtrados = listaClientesComSaldo.filter(item => {
    const nome = item.cliente.nome || "";
    return nome.toLowerCase().includes(termo);
  });

  renderizarClientes(filtrados);
});

// ✅ BOTÃO LIMPAR
limparBusca.onclick = () => {
  busca.value = "";
  limparBusca.style.display = "none";

  renderizarClientes(listaClientesComSaldo);
};


// ============================
// NOVO CLIENTE
// ============================
function novoCliente() {
  let nome = prompt("Nome do cliente:");
  const telefone = prompt("Telefone:");

  // impedir nome inválido ✅
  if (!nome || nome.trim() === "") {
    alert("Nome é obrigatório");
    return;
  }

  nome = nome.trim();

  fetch("http://localhost:3000/clientes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nome, telefone })
  }).then(() => carregarClientes());
}


// ============================
// ABRIR CLIENTE
// ============================
function abrirCliente(id) {
  window.location.href = `cliente.html?id=${id}`;
}

// ============================
// DASHBOARD
// ============================
async function carregarDashboard() {
  const resClientes = await fetch("http://localhost:3000/clientes");
  const clientes = await resClientes.json();

  let totalReceber = 0;
  let recebidoTotal = 0;
  let recebidoMes = 0;

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  for (let cliente of clientes) {
    const resDividas = await fetch(`http://localhost:3000/dividas/${cliente.id}`);
    const dividas = await resDividas.json();

    for (let divida of dividas) {
      totalReceber += divida.valor;

      const resPag = await fetch(`http://localhost:3000/pagamentos/${divida.id}`);
      const pagamentos = await resPag.json();

      for (let p of pagamentos) {
        recebidoTotal += p.valor;

        const dataPag = new Date(p.data);

        if (
          dataPag.getMonth() === mesAtual &&
          dataPag.getFullYear() === anoAtual
        ) {
          recebidoMes += p.valor;
        }
      }
    }
  }

  totalReceber = totalReceber - recebidoTotal;

  document.getElementById("totalReceber").innerText = `R$ ${totalReceber.toFixed(2)}`;
  document.getElementById("recebidoTotal").innerText = `R$ ${recebidoTotal.toFixed(2)}`;
  document.getElementById("recebidoMes").innerText = `R$ ${recebidoMes.toFixed(2)}`;
  document.getElementById("totalClientes").innerText = clientes.length;
}
//=============================
// Função Destacar texto
//=============================

function destacarTexto(texto, termo) {
  if (!termo) return texto;

  const regex = new RegExp(`(${termo})`, "gi");

  return texto.replace(regex, '<span class="highlight">$1</span>');
}

// ============================
// INICIAR SISTEMA
// ============================
carregarClientes();
carregarDashboard();