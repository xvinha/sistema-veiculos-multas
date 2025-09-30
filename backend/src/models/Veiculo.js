// backend/src/models/Veiculo.js

const db = require('../database'); 

class Veiculo {

    // Helper: Verifica se a placa já existe no sistema (Validação de Negócio)
    static verificarPlacaUnica(placa, id = null) {
        return new Promise((resolve, reject) => {
            let sql = "SELECT id FROM VEICULOS WHERE placa = ?";
            let params = [placa];
            
            if (id) {
                sql += " AND id != ?";
                params.push(id);
            }
            
            db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!row); 
                }
            });
        });
    }

    // BUSCAR POR PLACA (Usado no Controller de Consulta)
    static buscarPorPlaca(placa) {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM VEICULOS WHERE placa = ?", [placa.toUpperCase()], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row); 
                }
            });
        });
    }

    // LISTAR (GET /api/veiculos)
    static listar() {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM VEICULOS ORDER BY placa", [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // BUSCAR POR ID (GET /api/veiculos/{id})
    static buscarPorId(id) {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM VEICULOS WHERE id = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row); 
                }
            });
        });
    }

    // CRIAR (POST /api/veiculos) - Somente Admin
    static async criar(novoVeiculo) {
        if (await this.verificarPlacaUnica(novoVeiculo.placa)) {
            throw new Error("Placa já cadastrada no sistema.");
        }
        
        const sql = 'INSERT INTO VEICULOS (placa, marca, modelo, ano, proprietario, dataCadastro) VALUES (?,?,?,?,?,?)';
        const params = [
            novoVeiculo.placa.toUpperCase(),
            novoVeiculo.marca,
            novoVeiculo.modelo,
            novoVeiculo.ano,
            novoVeiculo.proprietario,
            new Date().toISOString()
        ];
        
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) { 
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ...novoVeiculo, dataCadastro: params[5] });
                }
            });
        });
    }

    // ATUALIZAR (PUT /api/veiculos/{id})
    static async atualizar(id, dadosAtualizados) {
        if (dadosAtualizados.placa) {
            if (await this.verificarPlacaUnica(dadosAtualizados.placa, id)) {
                throw new Error("Nova placa já cadastrada em outro veículo.");
            }
        }
        
        const sql = `UPDATE VEICULOS SET 
                        placa = COALESCE(?,placa), 
                        marca = COALESCE(?,marca), 
                        modelo = COALESCE(?,modelo), 
                        ano = COALESCE(?,ano),
                        proprietario = COALESCE(?,proprietario)
                    WHERE id = ?`;
        
        const params = [
            dadosAtualizados.placa ? dadosAtualizados.placa.toUpperCase() : null,
            dadosAtualizados.marca,
            dadosAtualizados.modelo,
            dadosAtualizados.ano,
            dadosAtualizados.proprietario,
            id
        ];

        return new Promise((resolve, reject) => {
            db.run(sql, params, async function (err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    resolve(null); 
                } else {
                    Veiculo.buscarPorId(id).then(resolve).catch(reject);
                }
            });
        });
    }

    // EXCLUIR (DELETE /api/veiculos/{id})
    static excluir(id) {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM VEICULOS WHERE id = ?", [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0); 
                }
            });
        });
    }
}

module.exports = Veiculo;