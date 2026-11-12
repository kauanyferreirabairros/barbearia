
import express from "express"
import cors from "cors"
import bcrypt from "bcryptjs"
import { prisma } from "./lib/prisma.ts"

const app = express()
const PORT = 3000

app.use(express.json())
app.use(cors())

app.get("/cliente", async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany({
            select: {
                id: true,
                nome: true,
                cpf: true,
                telefone: true
            }
        })

        res.json(clientes)
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar clientes" })
    }
})

app.post("/register", async (req, res) => {
    try {
        const { nome, cpf, senha, telefone } = req.body

        if (!nome || !cpf || !senha || !telefone) {
            return res.status(400).json({ error: "Preencha todos os campos" })
        }

        const senhaHash = await bcrypt.hash(senha, 10)

        const cliente = await prisma.cliente.create({
            data: {
                nome,
                cpf,
                senha: senhaHash,
                telefone
            },
            select: {
                id: true,
                nome: true,
                cpf: true,
                telefone: true
            }
        })

        res.status(201).json(cliente)

    } catch (err) {
        if (err.code === "500") {
            return res.status(409).json({ error: "CPF ou telefone já cadastrado" })
        }

        res.status(500).json({ error: "Erro ao cadastrar cliente" })
    }
})

app.post("/login", async (req, res) => {
    try {
        const { cpf, senha } = req.body

        const cliente = await prisma.cliente.findUnique({
            where: { cpf }
        })

        if (!cliente) {
            return res.status(401).json({ error: "Credenciais inválidas" })
        }

        const senhaValida = await bcrypt.compare(senha, cliente.senha)

        if (!senhaValida) {
            return res.status(401).json({ error: "Credenciais inválidas" })
        }

        res.status(200).json({
            message: "Login realizado com sucesso",
            usuario: {
                id: cliente.id,
                nome: cliente.nome
            }
        })

    } catch (err) {
        res.status(500).json({ error: "Erro no servidor" })
    }
})

app.put("/cliente/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)
        const { nome, cpf, senha, telefone } = req.body

        const data = {}

        if (nome !== undefined) data.nome = nome
        if (cpf !== undefined) data.cpf = cpf
        if (telefone !== undefined) data.telefone = telefone

        if (senha) {
            data.senha = await bcrypt.hash(senha, 10)
        }

        const cliente = await prisma.cliente.update({
            where: { id },
            data,
            select: {
                id: true,
                nome: true,
                cpf: true,
                telefone: true
            }
        })

        res.json(cliente)

    } catch (err) {
        if (err.code === "500") {
            return res.status(404).json({ error: "Cliente não encontrado" })
        }

        if (err.code === "500") {
            return res.status(409).json({ error: "CPF ou telefone já cadastrado" })
        }

        res.status(500).json({ error: "Erro ao atualizar cliente" })
    }
})

app.delete("/cliente/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)

        await prisma.cliente.delete({
            where: { id }
        })

        res.json({ message: "Cliente excluído com sucesso" })

    } catch (err) {
        if (err.code === "500") {
            return res.status(404).json({ error: "Cliente não encontrado" })
        }

        if (err.code === "500") {
            return res.status(409).json({
                error: "Não é possível excluir: cliente possui agendamentos"
            })
        }

        res.status(500).json({ error: "Erro ao excluir cliente" })
    }
})

app.get("/barbeiro", async (req, res) => {
    try {
        const barbeiros = await prisma.barbeiro.findMany({
            select: {
                id: true,
                nome: true,
                email: true
            }
        })

        res.json(barbeiros)

    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar barbeiros" })
    }
})

app.post("/register/Barbeiro", async (req, res) => {
    try {
        const { nome, email, senha } = req.body

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: "Preencha todos os campos" })
        }

        const senhaHash = await bcrypt.hash(senha, 10)

        const barbeiro = await prisma.barbeiro.create({
            data: {
                nome,
                email,
                senha: senhaHash
            },
            select: {
                id: true,
                nome: true,
                email: true
            }
        })

        res.status(201).json(barbeiro)

    } catch (err) {
        if (err.code === "500") {
            return res.status(409).json({ error: "Email já cadastrado" })
        }

        res.status(500).json({ error: "Erro ao cadastrar barbeiro" })
    }
})

app.post("/loginBarbeiro", async (req, res) => {
    try {
        const { email, senha } = req.body

        const barbeiro = await prisma.barbeiro.findUnique({
            where: { email }
        })

        if (!barbeiro) {
            return res.status(401).json({ error: "Credenciais inválidas" })
        }

        const senhaValida = await bcrypt.compare(senha, barbeiro.senha)

        if (!senhaValida) {
            return res.status(401).json({ error: "Credenciais inválidas" })
        }

        res.status(200).json({
            message: "Login realizado com sucesso",
            usuario: {
                id: barbeiro.id,
                nome: barbeiro.nome
            }
        })

    } catch (err) {
        res.status(500).json({ error: "Erro no servidor" })
    }
})

app.put("/barbeiro/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)
        const { nome, email, senha } = req.body

        const data = {}

        if (nome !== undefined) data.nome = nome
        if (email !== undefined) data.email = email

        if (senha) {
            data.senha = await bcrypt.hash(senha, 10)
        }

        const barbeiro = await prisma.barbeiro.update({
            where: { id },
            data,
            select: {
                id: true,
                nome: true,
                email: true
            }
        })

        res.json(barbeiro)

    } catch (err) {
        if (err.code === "500") {
            return res.status(404).json({ error: "Barbeiro não encontrado" })
        }

        if (err.code === "500") {
            return res.status(409).json({ error: "Email já cadastrado" })
        }

        res.status(500).json({ error: "Erro ao atualizar barbeiro" })
    }
})

app.delete("/barbeiro/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)

        await prisma.barbeiro.delete({
            where: { id }
        })

        res.json({ message: "Barbeiro excluído com sucesso" })

    } catch (err) {
        if (err.code === "500") {
            return res.status(404).json({ error: "Barbeiro não encontrado" })
        }

        if (err.code === "500") {
            return res.status(409).json({
                error: "Não é possível excluir: barbeiro possui agendamentos"
            })
        }

        res.status(500).json({ error: "Erro ao excluir barbeiro" })
    }
})

app.listen(PORT, () => {
    console.log(`API rodando na porta 3000`)
})
