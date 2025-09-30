// backend/src/models/Multa.js

const db = require('../database'); 

class Multa {

    // CONSULTA DE MULTAS FLEXÍVEL (para o Cliente)
    static buscarMultasCliente(criterios) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    m.id, m.veiculo_id, m.dataHora, m.local, m.gravidade, m.valor,
                    v.placa, v.modelo, v.marca, v.proprietario
                FROM MULTAS m
                INNER JOIN VEICULOS v ON m.veiculo_id = v.id
                WHERE 1=1 
            `;
            const params = [];
            
            // Adiciona critérios de busca de forma dinâmica
            if (criterios.placa) {
                sql += ` AND UPPER(v.placa) = UPPER(?)`;
                params.push(criterios.placa.trim());
            }
            if (criterios.proprietario) {
                sql += ` AND UPPER(v.proprietario) LIKE UPPER(?)`;
                params.push(`%${criterios.proprietario.trim()}%`);
            }
            if (criterios.modelo) {
                sql += ` AND UPPER(v.modelo) LIKE UPPER(?)`;
                params.push(`%${criterios.modelo.trim()}%`);
            }
            
            sql += ` ORDER BY m.dataHora DESC`;

            db.all(sql, params, (err, rows) => { 
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }
    
    // LISTAR (GET /api/multas) - Junta multas com dados do veículo
    static listar() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    m.id, m.veiculo_id, m.dataHora, m.local, m.gravidade, m.valor,
                    v.placa, v.modelo, v.marca, v.proprietario
                FROM MULTAS m
                INNER JOIN VEICULOS v ON m.veiculo_id = v.id
                ORDER BY m.dataHora DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    // BUSCAR POR ID (GET /api/multas/{id})
    static buscarPorId(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    m.*, v.placa, v.modelo, v.marca, v.proprietario
                FROM MULTAS m
                INNER JOIN VEICULOS v ON m.veiculo_id = v.id
                WHERE m.id = ?
            `;
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row); 
                }
            });
        });
    }

    // CRIAR (POST /api/multas)
    static criar(novaMulta) {
        const sql = 'INSERT INTO MULTAS (veiculo_id, dataHora, local, gravidade, valor) VALUES (?,?,?,?,?)';
        const params = [
            novaMulta.veiculo_id,
            novaMulta.dataHora || new Date().toISOString(),
            novaMulta.local,
            novaMulta.gravidade || 'Média',
            novaMulta.valor
        ];
        
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) { 
                if (err) {
                    reject(err);
                } else {
                    Multa.buscarPorId(this.lastID)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }
    
    // ATUALIZAR (PUT /api/multas/{id})
    static atualizar(id, dadosAtualizados) {
        const sql = `UPDATE MULTAS SET 
                        veiculo_id = COALESCE(?,veiculo_id), 
                        dataHora = COALESCE(?,dataHora), 
                        local = COALESCE(?,local), 
                        gravidade = COALESCE(?,gravidade),
                        valor = COALESCE(?,valor)
                    WHERE id = ?`;
        
        const params = [
            dadosAtualizados.veiculo_id || null,
            dadosAtualizados.dataHora || null,
            dadosAtualizados.local || null,
            dadosAtualizados.gravidade || null,
            dadosAtualizados.valor || null,
            id
        ];

        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    resolve(null); 
                } else {
                    Multa.buscarPorId(id).then(resolve).catch(reject);
                }
            });
        });
    }

    // EXCLUIR (DELETE /api/multas/{id})
    static excluir(id) {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM MULTAS WHERE id = ?", [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0); 
                }
            });
        });
    }
}

module.exports = Multa;