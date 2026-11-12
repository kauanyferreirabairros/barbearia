
const botaoCad = document.getElementById("btnCad");
const botaoCadBarbeiro = document.getElementById("btnCadBarbeiro");
const mensagem = document.getElementById("mensagem");

botaoCad.addEventListener("click", async () => {
    try {
        const resposta = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: document.getElementById("cadNome").value,
                cpf: document.getElementById("cadCpf").value,
                telefone: document.getElementById("cadTelefone").value,
                senha: document.getElementById("cadSenha").value
            })
        });

        const data = await resposta.json();

        if (!resposta.ok) {
            mensagem.textContent = data.error;
            return;
        }

        mensagem.textContent = "Cliente cadastrado com sucesso!";

    } catch (err) {
        mensagem.textContent = "Erro ao conectar com o servidor";
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

        if (!resposta.ok) {
            mensagem.textContent = data.error;
            return;
        }

        mensagem.textContent = "Barbeiro cadastrado com sucesso!";

    } catch (err) {
        mensagem.textContent = "Erro ao conectar com o servidor";
    }
});
