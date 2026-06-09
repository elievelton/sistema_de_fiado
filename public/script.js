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