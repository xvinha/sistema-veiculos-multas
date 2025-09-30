// frontend/js/cliente.js
// Lógica para o Portal de Consulta (Cliente) - Busca Flexível

const API_CONSULTA = 'http://localhost:3000/api/multas/consulta'; 

// ==========================================
// UTILITÁRIOS
// ==========================================

function formatarData(dataString) {
    if (!dataString) return 'N/A';
    try {
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR');
    } catch (e) {
        return 'Data inválida';
    }
}

function getGravidadeColor(gravidade) {
    const cores = {
        'Gravíssima': 'dark',
        'Grave': 'danger', 
        'Média': 'warning',
        'Leve': 'info'
    };
    return cores[gravidade] || 'secondary';
}

function mostrarNotificacao(mensagem, tipo = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    
    toast.className = `toast align-items-center text-white bg-${tipo} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${mensagem}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}


// ==========================================
// CONSULTA DE MULTAS
// ==========================================

async function consultarMultas(criterios) {
    const feedbackDiv = document.getElementById('feedback-consulta');
    const veiculoInfoCard = document.getElementById('veiculo-info');
    const multasListContainer = document.getElementById('multas-list-container');
    const listaMultasTbody = document.getElementById('lista-multas');
    
    // 1. Limpa e mostra estado de busca
    feedbackDiv.style.display = 'none';
    veiculoInfoCard.style.display = 'none';
    multasListContainer.style.display = 'none';
    listaMultasTbody.innerHTML = '';
    
    feedbackDiv.className = 'alert alert-info text-center';
    feedbackDiv.textContent = 'Buscando multas...';
    feedbackDiv.style.display = 'block';

    try {
        // Constrói a Query String (busca flexível)
        const params = new URLSearchParams();
        if (criterios.placa) params.append('placa', criterios.placa.trim().toUpperCase());
        if (criterios.proprietario) params.append('proprietario', criterios.proprietario.trim());
        if (criterios.modelo) params.append('modelo', criterios.modelo.trim());
        
        const response = await fetch(`${API_CONSULTA}?${params.toString()}`);
        const result = await response.json();

        if (!response.ok) {
            feedbackDiv.className = 'alert alert-danger text-center';
            feedbackDiv.textContent = result.mensagem || `Erro HTTP ${response.status} - Erro Desconhecido.`;
            return;
        }

        const { veiculo, multas } = result;
        
        // 2. Exibe Detalhes do Veículo (APENAS se buscar por PLACA e o veículo existir)
        if (veiculo && criterios.placa) {
            document.getElementById('placa-display').textContent = veiculo.placa;
            document.getElementById('modelo-marca-display').textContent = `${veiculo.modelo} (${veiculo.marca || 'N/A'})`;
            document.getElementById('proprietario-display').textContent = veiculo.proprietario;
            veiculoInfoCard.style.display = 'block';
        }
        
        // 3. Exibe Resultados das Multas
        if (multas.length === 0) {
            // Requisito: Informar que não há multa registrada
            feedbackDiv.className = 'card shadow no-fines p-4 text-center';
            
            if (veiculo && criterios.placa) {
                feedbackDiv.innerHTML = `<h4 class="mb-0">✅ PARABÉNS!</h4><p class="mb-0">O veículo **${veiculo.placa}** não possui multas registradas.</p>`;
            } else {
                feedbackDiv.innerHTML = `<h4 class="mb-0">🚫 NENHUMA MULTA ENCONTRADA</h4><p class="mb-0">Nenhum registro de multa corresponde aos critérios informados.</p>`;
            }
            feedbackDiv.style.display = 'block';
            
        } else {
            // Requisito: Aparecer as informações das multas
            multas.forEach(multa => {
                const row = listaMultasTbody.insertRow();
                row.innerHTML = `
                    <td>${multa.id}</td>
                    <td><span class="badge bg-danger placa-badge">${multa.placa}</span></td>
                    <td><span class="badge bg-${getGravidadeColor(multa.gravidade)}">${multa.gravidade}</span></td>
                    <td>R$ ${multa.valor.toFixed(2).replace('.', ',')}</td>
                    <td>${formatarData(multa.dataHora)}</td>
                `;
            });
            multasListContainer.style.display = 'block';
            feedbackDiv.style.display = 'none'; 
        }

        mostrarNotificacao(`Consulta concluída. ${multas.length} multas encontradas.`, 'success');

    } catch (error) {
        console.error("❌ Erro na consulta:", error);
        feedbackDiv.className = 'alert alert-danger text-center';
        feedbackDiv.textContent = `Erro ao realizar consulta: ${error.message}`;
        feedbackDiv.style.display = 'block';
    }
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    
    // Configurar Formulário de Consulta
    const formConsulta = document.getElementById('form-consulta');
    if (formConsulta) {
        formConsulta.addEventListener('submit', (event) => {
            event.preventDefault(); 
            
            const formData = new FormData(formConsulta);
            const criterios = Object.fromEntries(formData);
            
            // Validação de pelo menos um campo preenchido
            if (Object.values(criterios).every(val => val.trim() === '')) {
                mostrarNotificacao('Preencha pelo menos um campo para realizar a consulta.', 'warning');
                return;
            }
            
            consultarMultas(criterios);
        });
    }
    
    mostrarNotificacao('Portal de Consulta inicializado.', 'success');
});