import express from "express"
import pool from "./db.js"
import cors from "cors"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const app = express()
const PORT = 3000
const JWT_SECRET = process.env.JWT_SECRET || "segredo-barbearia-troque-isto"

app.use(express.json())
app.use(cors())
app.use(express.static('front')) //chama o arquivo do front

// Middleware: exige token válido (enviado no header Authorization: Bearer <token>)
function autenticar(req, res, next) {
    const header = req.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.slice(7) : null

    if (!token) {
        return res.status(401).json({ erro: "Token não informado" })
    }

    try {
        req.usuario = jwt.verify(token, JWT_SECRET)
        next()
    } catch {
        return res.status(401).json({ erro: "Token inválido ou expirado" })
    }
}

// ======================================= CLIENTES ==========================================================================================
app.get('/clientes', autenticar, async (req, res) => {
    try {
        // nunca devolve a senha
        const clientes = await pool.query('SELECT id, nome, email, cpf FROM clientes ORDER BY nome')
        res.json(clientes.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ erro: "Erro ao buscar clientes" })
    }
})

app.post('/register', async (req, res) => {
    const { nome, email, senha, cpf } = req.body

    if (!nome || !email || !senha || !cpf) {
        return res.status(400).json({ erro: "Preencha nome, email, senha e cpf" })
    }
    if (!/^\d{11}$/.test(cpf)) {
        return res.status(400).json({ erro: "CPF deve ter 11 números, sem pontos ou traço" })
    }

    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(senha, salt)

        const novoCliente = await pool.query(
            'INSERT INTO clientes (nome, email, senha, cpf) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, cpf',
            [nome, email, hashedPassword, cpf]
        )
        res.status(201).json(novoCliente.rows[0])
    } catch (err) {
        if (err.code === '23505') { // violação de UNIQUE
            return res.status(409).json({ erro: "Email ou CPF já cadastrado" })
        }
        console.error(err)
        res.status(500).json({ erro: "Erro ao cadastrar cliente" })
    }
})

app.post('/login', async (req, res) => {
    const { email, senha } = req.body

    if (!email || !senha) {
        return res.status(400).json({ erro: "Informe email e senha" })
    }

    try {
        const result = await pool.query('SELECT * FROM clientes WHERE email = $1', [email])
        const user = result.rows[0]

        if (!user) {
            return res.status(401).json({ erro: "Credenciais inválidas" })
        }

        const senhaCorreta = await bcrypt.compare(senha, user.senha)
        if (!senhaCorreta) {
            return res.status(401).json({ erro: "Credenciais inválidas" })
        }

        const token = jwt.sign({ id: user.id, nome: user.nome }, JWT_SECRET, { expiresIn: "2h" })
        res.json({ token, cliente: { id: user.id, nome: user.nome, email: user.email } })
    } catch (err) {
        console.error(err)
        res.status(500).json({ erro: "Erro ao fazer login" })
    }
})

// ======================================= BARBEIROS ==========================================================================================
app.get('/barbeiros', async (req, res) => {
    try {
        const barbeiros = await pool.query('SELECT id, nome FROM barbeiros ORDER BY nome')
        res.json(barbeiros.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ erro: "Erro ao buscar barbeiros" })
    }
})

// ======================================= SERVIÇOS ==========================================================================================
app.get('/servicos', async (req, res) => {
    try {
        const servicos = await pool.query('SELECT * FROM servicos ORDER BY nome_servico')
        res.json(servicos.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ erro: "Erro ao buscar serviços" })
    }
})

// ======================================= GERENCIAMENTO (AGENDAMENTOS) ======================================================================
// Lista os agendamentos do cliente logado
app.get('/agendamentos', autenticar, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT g.id,
                    to_char(g.data, 'YYYY-MM-DD') AS data,
                    to_char(g.horario, 'HH24:MI') AS horario,
                    s.nome_servico, s.preco, s.duracao,
                    b.nome AS barbeiro
               FROM gerenciamento g
               JOIN servicos s  ON s.id = g.id_servicos
               JOIN barbeiros b ON b.id = g.id_barbeiros
              WHERE g.id_clientes = $1
              ORDER BY g.data, g.horario`,
            [req.usuario.id]
        )
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ erro: "Erro ao buscar agendamentos" })
    }
})

// Cria um agendamento
app.post('/agendamentos', autenticar, async (req, res) => {
    const { id_servicos, id_barbeiros, data, horario } = req.body

    if (!id_servicos || !id_barbeiros || !data || !horario) {
        return res.status(400).json({ erro: "Preencha serviço, barbeiro, data e horário" })
    }

    try {
        // o barbeiro não pode ter outro cliente no mesmo dia e horário
        const conflito = await pool.query(
            'SELECT 1 FROM gerenciamento WHERE id_barbeiros = $1 AND data = $2 AND horario = $3',
            [id_barbeiros, data, horario]
        )
        if (conflito.rows.length > 0) {
            return res.status(409).json({ erro: "Esse barbeiro já tem um cliente nesse horário" })
        }

        const novo = await pool.query(
            `INSERT INTO gerenciamento (id_servicos, id_barbeiros, id_clientes, data, horario)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [id_servicos, id_barbeiros, req.usuario.id, data, horario]
        )
        res.status(201).json(novo.rows[0])
    } catch (err) {
        if (err.code === '23503') { // FK inexistente
            return res.status(400).json({ erro: "Serviço ou barbeiro inválido" })
        }
        console.error(err)
        res.status(500).json({ erro: "Erro ao criar agendamento" })
    }
})

// Cancela um agendamento (somente o dono)
app.delete('/agendamentos/:id', autenticar, async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM gerenciamento WHERE id = $1 AND id_clientes = $2 RETURNING id',
            [req.params.id, req.usuario.id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Agendamento não encontrado" })
        }
        res.json({ mensagem: "Agendamento cancelado" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ erro: "Erro ao cancelar agendamento" })
    }
})

app.listen(PORT, () => {
    console.log("API rodando em http://localhost:3000")
})
