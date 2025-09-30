// backend/src/database.js

const sqlite3 = require('sqlite3').verbose();
const DB_SOURCE = "veiculos_multas.db"; 

let db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error("Erro ao conectar ao DB:", err.message);
        throw err;
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        
        // Cria a tabela VEICULOS (Placa Única)
        db.run(`CREATE TABLE IF NOT EXISTS VEICULOS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            placa TEXT NOT NULL UNIQUE,
            marca TEXT,
            modelo TEXT NOT NULL,
            ano INTEGER,
            proprietario TEXT NOT NULL,
            dataCadastro TEXT
        )`, (err) => {
            if (err) {
                console.log("Erro ao criar tabela VEICULOS:", err.message);
            } else {
                console.log("Tabela VEICULOS verificada/criada.");
                
                // Cria a tabela MULTAS (Com Foreign Key)
                db.run(`CREATE TABLE IF NOT EXISTS MULTAS (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    veiculo_id INTEGER NOT NULL,
                    dataHora TEXT NOT NULL,
                    local TEXT NOT NULL,
                    gravidade TEXT DEFAULT 'Média',
                    valor REAL NOT NULL,
                    FOREIGN KEY(veiculo_id) REFERENCES VEICULOS(id) ON DELETE CASCADE
                )`, (err) => {
                    if (err) {
                        console.log("Erro ao criar tabela MULTAS:", err.message);
                    } else {
                        console.log("Tabela MULTAS verificada/criada.");
                    }
                });
            }
        });  
    }
});

module.exports = db;