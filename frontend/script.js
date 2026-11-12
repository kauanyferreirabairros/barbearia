
const botaoCad = document.getElementById("btnCad");
const botaoLog = document.getElementById("btnLog");
const botaoLogBarbeiro = document.getElementById("btnLogBarbeiro");
const botaoGet = document.getElementById("btnGet");
const botaoBuscar = document.getElementById("btnBuscar");
const btnPut = document.getElementById("btnPut");
const btnDel = document.getElementById("btnDel");

const botaoCadBarbeiro = document.getElementById("btnCadBarbeiro");
const botaoGetBarbeiro = document.getElementById("btnGetBarbeiro");
const btnPutBarbeiro = document.getElementById("btnPutBarbeiro");
const btnDelBarbeiro = document.getElementById("btnDelBarbeiro");

const botaoLogout = document.getElementById("btnLogout");

const mensagem = document.getElementById("mensagem");
const divGet = document.getElementById("divGet");
const divGetBarbeiro = document.getElementById("divGetBarbeiro");

const login = document.getElementById("login");
const painel = document.getElementById("painel");

botaoLog.addEventListener("click", async () => {
    try {
        const resposta = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cpf: document.getElementById("logCpf").value,
                senha: document.getElementById("logSenha").value
            })
        });

        const data = await resposta.json();

        if (!resposta.ok) {
            mensagem.textContent = data.error;
            return;
        }

        login.hidden = true;
        painel.hidden = false;

        document.getElementById("nomeUsuario").textContent = data.usuario.nome;
        mensagem.textContent = data.message;

    } catch (err) {
        mensagem.textContent = "Erro ao conectar com o servidor";
    }
});

botaoLogBarbeiro.addEventListener("click", async () => {
    try {
        const resposta = await fetch("http://localhost:3000/loginBarbeiro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: document.getElementById("logEmail").value,
                senha: document.getElementById("logSenhaBarbeiro").value
            })
        });

        const data = await resposta.json();

        if (!resposta.ok) {
            mensagem.textContent = data.error;
            return;
        }

        login.hidden = true;
        painel.hidden = false;

        document.getElementById("nomeUsuario").textContent = data.usuario.nome;
        mensagem.textContent = data.message;

    } catch (err) {
        mensagem.textContent = "Erro ao conectar com o servidor";
    }
});

botaoLogout.addEventListener("click", () => {
    login.hidden = false;
    painel.hidden = true;

    document.getElementById("nomeUsuario").textContent = "";
    mensagem.textContent = "Sessão encerrada";
});

botaoCad.addEventListener("click", async () => {
    try {
        const resposta = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: document.getElementById("cadNome").value,
                cpf: document.getElementById("cadCpf").value,
                senha: document.getElementById("cadSenha").value,
                telefone: document.getElementById("cadTelefone").value
            })
        });

        const data = await resposta.json();
        mensagem.textContent = data.error || "Cliente cadastrado com sucesso";

    } catch (err) {
        mensagem.textContent = "Erro ao cadastrar cliente";
    }
});

botaoGet.addEventListener("click", async () => {
    try {
        const resposta = await fetch("http://localhost:3000/cliente");
        const data = await resposta.json();

        divGet.textContent = JSON.stringify(data);

    } catch (err) {
        mensagem.textContent = "Erro ao buscar clientes";
    }
});

botaoBuscar.addEventListener("click", async () => {
    try {
        const resposta = await fetch("http://localhost:3000/cliente");
        const data = await resposta.json();

        const termo = document.getElementById("buscaCliente").value.toLowerCase();

        const resultado = data.filter(cliente =>
            cliente.nome.toLowerCase().includes(termo) ||
            cliente.cpf.includes(termo) ||
            cliente.telefone.includes(termo)
        );

        divGet.textContent = JSON.stringify(resultado);

    } catch (err) {
        mensagem.textContent = "Erro ao buscar clientes";
    }
});

btnPut.addEventListener("click", async () => {
    try {
        const id = document.getElementById("putId").value;

        const resposta = await fetch(`http://localhost:3000/cliente/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: document.getElementById("putNome").value,
                cpf: document.getElementById("putCpf").value,
                senha: document.getElementById("putSenha").value,
                telefone: document.getElementById("putTelefone").value
            })
        });

        const data = await resposta.json();
        mensagem.textContent = data.error || "Cliente atualizado com sucesso";

    } catch (err) {
        mensagem.textContent = "Erro ao atualizar cliente";
    }
});

btnDel.addEventListener("click", async () => {
    try {
        const id = document.getElementById("delId").value;

        const resposta = await fetch(`http://localhost:3000/cliente/${id}`, {
            method: "DELETE"
        });

        const data = await resposta.json();
        mensagem.textContent = data.error || "Cliente excluído com sucesso";

    } catch (err) {
        mensagem.textContent = "Erro ao excluir cliente";
    }
});

botaoCadBarbeiro.addEventListener("click", async () => {
    try {
        const resposta = await fetch("http://localhost:3000/register/Barbeiro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: document.getElementById("cadNomeBarbeiro").value,
                email: document.getElementById("cadEmailBarbeiro").value,
                senha: document.getElementById("cadSenhaBarbeiro").value
            })
        });

        const data = await resposta.json();
        mensagem.textContent = data.error || "Barbeiro cadastrado com sucesso";

    } catch (err) {
        mensagem.textContent = "Erro ao cadastrar barbeiro";
    }
});

botaoGetBarbeiro.addEventListener("click", async () => {
    try {
        const resposta = await fetch("http://localhost:3000/barbeiro");
        const data = await resposta.json();

        divGetBarbeiro.textContent = JSON.stringify(data);

    } catch (err) {
        mensagem.textContent = "Erro ao buscar barbeiros";
    }
});

btnPutBarbeiro.addEventListener("click", async () => {
    try {
        const id = document.getElementById("putIdBarbeiro").value;

        const resposta = await fetch(`http://localhost:3000/barbeiro/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: document.getElementById("putNomeBarbeiro").value,
                email: document.getElementById("putEmailBarbeiro").value,
                senha: document.getElementById("putSenhaBarbeiro").value
            })
        });

        const data = await resposta.json();
        mensagem.textContent = data.error || "Barbeiro atualizado com sucesso";

    } catch (err) {
        mensagem.textContent = "Erro ao atualizar barbeiro";
    }
});

btnDelBarbeiro.addEventListener("click", async () => {
    try {
        const id = document.getElementById("delIdBarbeiro").value;

        const resposta = await fetch(`http://localhost:3000/barbeiro/${id}`, {
            method: "DELETE"
        });

        const data = await resposta.json();
        mensagem.textContent = data.error || "Barbeiro excluído com sucesso";

    } catch (err) {
        mensagem.textContent = "Erro ao excluir barbeiro";
    }
});
