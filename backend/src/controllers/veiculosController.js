// backend/src/controllers/veiculosController.js

const Veiculo = require('../models/Veiculo');

// LISTAR TODOS (GET /api/veiculos)
exports.listarVeiculos = async (req, res) => {
    try {
        const lista = await Veiculo.listar();
        res.json(lista);
    } catch (error) {
        console.error("Erro ao listar veículos:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor ao buscar dados." });
    }
};

// BUSCAR UM (GET /api/veiculos/{id})
exports.buscarVeiculo = async (req, res) => {
    try {
        const id = req.params.id;
        const veiculo = await Veiculo.buscarPorId(id);

        if (veiculo) {
            res.json(veiculo);
        } else {
            res.status(404).json({ mensagem: "Veículo não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao buscar veículo:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

// CRIAR (POST /api/veiculos)
exports.criarVeiculo = async (req, res) => {
    try {
        const novoVeiculo = req.body;
        
        // Validação básica (Requisito: Validações)
        if (!novoVeiculo.placa || !novoVeiculo.modelo || !novoVeiculo.proprietario) {
            return res.status(400).json({ mensagem: "Placa, Modelo e Proprietário são obrigatórios." });
        }

        const veiculoCriado = await Veiculo.criar(novoVeiculo);
        res.status(201).json(veiculoCriado);
    } catch (error) {
        console.error("Erro ao criar veículo:", error);
        // Captura o erro específico de validação de placa única (Requisito: Validações de Negócio)
        if (error.message.includes("Placa já cadastrada")) {
            return res.status(409).json({ mensagem: error.message });
        }
        res.status(500).json({ mensagem: "Erro interno do servidor ao criar o veículo." });
    }
};

// ATUALIZAR (PUT /api/veiculos/{id})
exports.atualizarVeiculo = async (req, res) => {
    try {
        const id = req.params.id;
        const dadosAtualizados = req.body;

        if (Object.keys(dadosAtualizados).length === 0) {
            return res.status(400).json({ mensagem: "Corpo da requisição vazio." });
        }

        const veiculoAtualizado = await Veiculo.atualizar(id, dadosAtualizados);

        if (veiculoAtualizado) {
            res.json(veiculoAtualizado);
        } else {
            res.status(404).json({ mensagem: "Veículo não encontrado para atualização." });
        }
    } catch (error) {
        console.error("Erro ao atualizar veículo:", error);
        // Captura o erro específico de validação de placa única (Requisito: Validações de Negócio)
        if (error.message.includes("Nova placa já cadastrada")) {
            return res.status(409).json({ mensagem: error.message });
        }
        res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

// EXCLUIR (DELETE /api/veiculos/{id})
exports.excluirVeiculo = async (req, res) => {
    try {
        const id = req.params.id;
        const sucesso = await Veiculo.excluir(id);

        if (sucesso) {
            res.status(204).send(); 
        } else {
            res.status(404).json({ mensagem: "Veículo não encontrado para exclusão." });
        }
    } catch (error) {
        console.error("Erro ao excluir veículo:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};