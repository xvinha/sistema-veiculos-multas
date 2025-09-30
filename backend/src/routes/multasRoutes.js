// backend/src/routes/multasRoutes.js

const express = require('express');
const router = express.Router();
const multasController = require('../controllers/multasController');

// ---------------------------
// CONSULTA FLEXÍVEL (CLIENTE)
// ---------------------------
router.get('/consulta', multasController.consultarMultasCliente);

// ---------------------------
// CRUD BÁSICO (ADMIN)
// ---------------------------
router.get('/', multasController.listarMultas);        // LISTAR TODAS
router.post('/', multasController.criarMulta);         // CRIAR
router.get('/:id', multasController.buscarMulta);      // BUSCAR UMA
router.put('/:id', multasController.atualizarMulta);   // ATUALIZAR
router.delete('/:id', multasController.excluirMulta);  // EXCLUIR

module.exports = router;
