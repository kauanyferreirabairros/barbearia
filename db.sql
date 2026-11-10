CREATE TABLE clientes (
	id SERIAL PRIMARY KEY NOT NULL,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	senha VARCHAR(100) NOT NULL, 
	cpf VARCHAR(11) UNIQUE NOT NULL
);

CREATE TABLE barbeiros (
	id SERIAL PRIMARY KEY NOT NULL,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	senha VARCHAR(100) NOT NULL, 
	cpf VARCHAR(11) UNIQUE NOT NULL
);

CREATE TABLE servicos (
    id SERIAL PRIMARY KEY,
    nome_servico VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    duracao INT NOT NULL -- em minutos
);

CREATE TABLE gerenciamento (
	id SERIAL PRIMARY KEY, 
	id_servicos INT NOT NULL,
	id_barbeiros INT NOT NULL, 
	id_clientes INT NOT NULL,
	data DATE NOT NULL,
	horario TIME NOT NULL,

	FOREIGN KEY (id_servicos) REFERENCES servicos(id),
	FOREIGN KEY (id_barbeiros) REFERENCES barbeiros(id),
	FOREIGN KEY (id_clientes) REFERENCES clientes(id),
	-- um barbeiro não pode ter dois clientes no mesmo dia e horário
	UNIQUE (id_barbeiros, data, horario)
);

-- As senhas dos clientes abaixo já estão com hash bcrypt (para o login funcionar).
-- Senhas originais: nicborges23 / fafakurrle021 / heliovasconselhos478
INSERT INTO clientes (nome, email, senha, cpf) VALUES 
('Nicole Borges', 'nicoleborges@gmail.com', '$2b$10$yAJbSV5M4rhLd0kYOx/6p.CyBcDBjV8.N42Z5IRtxRL5mMDZlsx/G', '22587496320'),
('Fabricio Kurrle', 'fafakurrle@gmail.com', '$2b$10$Yxv683kFvGpC0GghvT2Fkurj7GbGG6JnhJVx5AMx5USKbimga.hfS', '88745201308'),
('Helio Vasconselhos', 'vasconselhoshelio@gmail.com', '$2b$10$L4hoTp4lTtJT.dEgR8sXIe0hlDSaAihigHx4Y.Piyh.r0ZB5c.Ot2', '78740201386');

INSERT INTO barbeiros (nome, email, senha, cpf) VALUES 
('Rogerio Lodi', 'rogeriolodi@gmail.com', 'bololo785', '58963201478'),
('Barbara Cascaes', 'barbaracascaes@gmail.com', 'cascaes52', '29775204308'),
('Victor da Silva', 'victorsilva@gmail.com', 'victorsilva542', '52003601986');

INSERT INTO servicos (nome_servico, preco, duracao) VALUES
('Corte de cabelo', 40.00, 30),
('Barba', 30.00, 20),
('Corte + Barba', 65.00, 50),
('Sobrancelha', 15.00, 10);
