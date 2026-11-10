// ---------- estado ----------
let token = localStorage.getItem("token")
let cliente = JSON.parse(localStorage.getItem("cliente") || "null")

// ---------- elementos ----------
const $ = (id) => document.getElementById(id)
const mensagem = $("mensagem")

// ---------- utilidades ----------
function avisar(texto) {
    mensagem.textContent = texto
}

// Escapa texto vindo da API antes de colocar em innerHTML
function esc(valor) {
    const div = document.createElement("div")
    div.textContent = valor
    return div.innerHTML
}

function dinheiro(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function dataBR(iso) {
    const [a, m, d] = iso.split("-")
    return `${d}/${m}/${a}`
}

async function api(url, opcoes = {}) {
    const headers = { "Content-Type": "application/json" }
    if (token) headers.Authorization = "Bearer " + token

    const resposta = await fetch(url, { ...opcoes, headers })
    const corpo = await resposta.json().catch(() => ({}))

    if (resposta.status === 401 && token) {
        sair()
        throw new Error("Sua sessão expirou. Entre novamente.")
    }
    if (!resposta.ok) {
        throw new Error(corpo.erro || "Erro inesperado")
    }
    return corpo
}

// ---------- telas ----------
function mostrarTela() {
    const logado = Boolean(token && cliente)
    $("area-visitante").hidden = logado
    $("area-cliente").hidden = !logado

    if (logado) {
        $("nome-cliente").textContent = cliente.nome
        carregarAgendamentos()
    }
}

function sair() {
    token = null
    cliente = null
    localStorage.removeItem("token")
    localStorage.removeItem("cliente")
    mostrarTela()
}

// ---------- serviços e barbeiros ----------
let servicos = []
let barbeiros = []

async function carregarCatalogo() {
    try {
        servicos = await api("/servicos")
        barbeiros = await api("/barbeiros")
    } catch (e) {
        avisar(e.message)
        return
    }

    $("tabela-servicos").innerHTML = servicos.map(s => `
        <tr>
            <td>${esc(s.nome_servico)}</td>
            <td>${dinheiro(s.preco)}</td>
            <td>${s.duracao} min</td>
        </tr>`).join("")

    $("lista-barbeiros").innerHTML = barbeiros.map(b => `<li>${esc(b.nome)}</li>`).join("")

    $("ag-servico").innerHTML = servicos.map(s =>
        `<option value="${s.id}">${esc(s.nome_servico)} - ${dinheiro(s.preco)}</option>`).join("")
    $("ag-barbeiro").innerHTML = barbeiros.map(b =>
        `<option value="${b.id}">${esc(b.nome)}</option>`).join("")
}

// ---------- agendamentos ----------
async function carregarAgendamentos() {
    try {
        const lista = await api("/agendamentos")

        $("sem-agendamentos").hidden = lista.length > 0
        $("tabela-agendamentos").innerHTML = lista.map(a => `
            <tr>
                <td>${dataBR(a.data)}</td>
                <td>${a.horario}</td>
                <td>${esc(a.nome_servico)}</td>
                <td>${esc(a.barbeiro)}</td>
                <td>${dinheiro(a.preco)}</td>
                <td><button type="button" data-cancelar="${a.id}">Cancelar</button></td>
            </tr>`).join("")
    } catch (e) {
        avisar(e.message)
    }
}

$("tabela-agendamentos").addEventListener("click", async (evento) => {
    const id = evento.target.dataset.cancelar
    if (!id) return
    if (!confirm("Cancelar este agendamento?")) return

    try {
        await api("/agendamentos/" + id, { method: "DELETE" })
        avisar("Agendamento cancelado.")
        carregarAgendamentos()
    } catch (e) {
        avisar(e.message)
    }
})

$("form-agendamento").addEventListener("submit", async (evento) => {
    evento.preventDefault()

    try {
        await api("/agendamentos", {
            method: "POST",
            body: JSON.stringify({
                id_servicos: Number($("ag-servico").value),
                id_barbeiros: Number($("ag-barbeiro").value),
                data: $("ag-data").value,
                horario: $("ag-horario").value
            })
        })
        avisar("Agendamento realizado com sucesso!")
        evento.target.reset()
        carregarAgendamentos()
    } catch (e) {
        avisar(e.message)
    }
})

// ---------- login / cadastro ----------
$("form-login").addEventListener("submit", async (evento) => {
    evento.preventDefault()

    try {
        const dados = await api("/login", {
            method: "POST",
            body: JSON.stringify({
                email: $("login-email").value,
                senha: $("login-senha").value
            })
        })
        token = dados.token
        cliente = dados.cliente
        localStorage.setItem("token", token)
        localStorage.setItem("cliente", JSON.stringify(cliente))
        evento.target.reset()
        avisar("")
        mostrarTela()
    } catch (e) {
        avisar(e.message)
    }
})

$("form-cadastro").addEventListener("submit", async (evento) => {
    evento.preventDefault()

    try {
        await api("/register", {
            method: "POST",
            body: JSON.stringify({
                nome: $("cad-nome").value,
                email: $("cad-email").value,
                cpf: $("cad-cpf").value,
                senha: $("cad-senha").value
            })
        })
        evento.target.reset()
        avisar("Conta criada! Agora é só entrar com seu e-mail e senha.")
    } catch (e) {
        avisar(e.message)
    }
})

$("btn-sair").addEventListener("click", sair)

// ---------- início ----------
carregarCatalogo()
mostrarTela()
