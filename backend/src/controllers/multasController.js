// backend/src/controllers/multasController.js

const Multa = require('../models/Multa');
const Veiculo = require('../models/Veiculo'); 

// NOVO: CONSULTA DE MULTAS FLEXÍVEL (Para o Cliente)
exports.consultarMultasCliente = async (req, res) => {
    try {
        const criterios = req.query; 
        
        // Validação: Pelo menos um campo deve ser preenchido (Requisito)
        if (!criterios.placa && !criterios.proprietario && !criterios.modelo) {
            return res.status(400).json({ mensagem: "Forneça pelo menos a Placa, o Proprietário ou o Modelo para a consulta." });
        }
        
        // Busca as multas baseadas nos critérios
        const multas = await Multa.buscarMultasCliente(criterios);
        
        // Se a busca for pela Placa, tentamos recuperar o Veículo para dar um feedback mais claro
        let veiculoInfo = null;
        if (criterios.placa) {
            veiculoInfo = await Veiculo.buscarPorPlaca(criterios.placa);
        }
        
        // Retorna os dados do veículo (se encontrado) e a lista de multas
        res.json({ 
            veiculo: veiculoInfo, 
            multas: multas 
        });

    } catch (error) {
        console.error("Erro ao consultar multas do cliente:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

// LISTAR TODOS (GET /api/multas) - USADO PELO ADMIN
exports.listarMultas = async (req, res) => {
    try {
        const lista = await Multa.listar();
        res.json(lista);
    } catch (error) {
        console.error("Erro ao listar multas:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor ao buscar dados." });
    }
};

// BUSCAR POR ID (GET /api/multas/{id})
exports.buscarMulta = async (req, res) => {
    try {
        const id = req.params.id;
        const multa = await Multa.buscarPorId(id);

        if (multa) {
            res.json(multa);
        } else {
            res.status(404).json({ mensagem: "Multa não encontrada" });
        }
    } catch (error) {
        console.error("Erro ao buscar multa:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

// CRIAR (POST /api/multas)
exports.criarMulta = async (req, res) => {
    try {
        const novaMulta = req.body;
        
        // Validação básica
        if (!novaMulta.veiculo_id || !novaMulta.local || !novaMulta.valor) {
            return res.status(400).json({ mensagem: "Veículo, Local e Valor são obrigatórios." });
        }

        // Verifica se o veículo existe
        const veiculo = await Veiculo.buscarPorId(novaMulta.veiculo_id);
        if (!veiculo) {
            return res.status(404).json({ mensagem: "Veículo não encontrado." });
        }

        const multaCriada = await Multa.criar(novaMulta);
        res.status(201).json(multaCriada);
    } catch (error) {
        console.error("Erro ao criar multa:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor ao criar a multa." });
    }
};

// ATUALIZAR (PUT /api/multas/{id})
exports.atualizarMulta = async (req, res) => {
    try {
        const id = req.params.id;
        const dadosAtualizados = req.body;

        if (Object.keys(dadosAtualizados).length === 0) {
            return res.status(400).json({ mensagem: "Corpo da requisição vazio." });
        }

        const multaAtualizada = await Multa.atualizar(id, dadosAtualizados);

        if (multaAtualizada) {
            res.json(multaAtualizada);
        } else {
            res.status(404).json({ mensagem: "Multa não encontrada para atualização." });
        }
    } catch (error) {
        console.error("Erro ao atualizar multa:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

// EXCLUIR (DELETE /api/multas/{id})
exports.excluirMulta = async (req, res) => {
    try {
        const id = req.params.id;
        const sucesso = await Multa.excluir(id);

        if (sucesso) {
            res.status(204).send(); 
        } else {
            res.status(404).json({ mensagem: "Multa não encontrada para exclusão." });
        }
    } catch (error) {
        console.error("Erro ao excluir multa:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};