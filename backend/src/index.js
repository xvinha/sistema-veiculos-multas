// backend/src/index.js

const express = require('express');
const cors = require('cors'); 
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); 

// Definição das Rotas
const veiculosRoutes = require('./routes/veiculosRoutes');
const multasRoutes = require('./routes/multasRoutes');

app.use('/api/veiculos', veiculosRoutes); // Rotas para Veículos
app.use('/api/multas', multasRoutes);     // Rotas para Multas

// Inicia o Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`API Veículos: http://localhost:${PORT}/api/veiculos`);
    console.log(`API Multas: http://localhost:${PORT}/api/multas`);
});