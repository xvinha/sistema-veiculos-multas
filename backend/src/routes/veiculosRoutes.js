// backend/src/routes/veiculosRoutes.js

const express = require('express');
const router = express.Router();
const veiculosController = require('../controllers/veiculosController');

// Rotas CRUD para /api/veiculos (Usadas pelo Admin)
router.get('/', veiculosController.listarVeiculos); // LISTAR
router.post('/', veiculosController.criarVeiculo); // INCLUIR
router.get('/:id', veiculosController.buscarVeiculo);   // CONSULTAR
router.put('/:id', veiculosController.atualizarVeiculo); // ALTERAR
router.delete('/:id', veiculosController.excluirVeiculo); // EXCLUIR

module.exports = router;