const lista = document.getElementById("listaClientes");
const busca = document.getElementById("busca");

async function carregarClientes() {
  const res = await fetch("http://localhost:3000/clientes");
  const clientes = await res.json();

  mostrarClientes(clientes);
}

function mostrarClientes(clientes) {
  lista.innerHTML = "";

  clientes.forEach(c => {
    const li = document.createElement("li");
    li.innerText = c.nome;

    li.onclick = () => abrirCliente(c.id);

    lista.appendChild(li);
  });
}

busca.addEventListener("input", async () => {
  const res = await fetch("http://localhost:3000/clientes");
  let clientes = await res.json();

  const termo = busca.value.toLowerCase();

  clientes = clientes.filter(c =>
    c.nome.toLowerCase().includes(termo)
  );

  mostrarClientes(clientes);
});

function novoCliente() {
  const nome = prompt("Nome do cliente:");
  const telefone = prompt("Telefone:");

  fetch("http://localhost:3000/clientes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nome, telefone })
  })
  .then(() => carregarClientes());
}

function abrirCliente(id) {
  window.location.href = `cliente.html?id=${id}`;
}

// iniciar
carregarClientes();
carregarDashboard();
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

  // saldo real (receber - pago)
  totalReceber = totalReceber - recebidoTotal;

  // atualizar tela
  document.getElementById("totalReceber").innerText = `R$ ${totalReceber.toFixed(2)}`;
  document.getElementById("recebidoTotal").innerText = `R$ ${recebidoTotal.toFixed(2)}`;
  document.getElementById("recebidoMes").innerText = `R$ ${recebidoMes.toFixed(2)}`;
  document.getElementById("totalClientes").innerText = clientes.length;
}
