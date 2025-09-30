// frontend/js/admin.js
// Lógica para o Painel Administrativo (Admin) - CRUD Completo e Estatísticas

const API_VEICULOS = 'http://localhost:3000/api/veiculos'; 
const API_MULTAS = 'http://localhost:3000/api/multas'; 

let modalEdicaoVeiculo, modalRegistroMulta;
let veiculosData = [];
let multasData = [];

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
// CARREGAMENTO GERAL DE DADOS E ESTATÍSTICAS
// ==========================================

window.carregarVeiculos = async function() {
    try {
        const response = await fetch(API_VEICULOS);
        if (!response.ok) throw new Error('Erro ao carregar Veículos');
        veiculosData = await response.json();
        renderizarVeiculos(veiculosData);
        popularSelectVeiculos(veiculosData);
        carregarMultas();
    } catch (error) {
        mostrarNotificacao(`Erro ao carregar Veículos: ${error.message}`, 'danger');
        document.getElementById('lista-veiculos').innerHTML = `<tr><td colspan="5" class="text-center text-danger">Falha ao carregar veículos.</td></tr>`;
        atualizarEstatisticas(true);
    }
}

async function carregarMultas() {
    try {
        const response = await fetch(API_MULTAS);
        if (!response.ok) throw new Error('Erro ao carregar Multas');
        multasData = await response.json();
        renderizarMultas(multasData);
        atualizarEstatisticas();
    } catch (error) {
        mostrarNotificacao(`Erro ao carregar Multas: ${error.message}`, 'danger');
        document.getElementById('lista-multas').innerHTML = `<tr><td colspan="7" class="text-center text-danger">Falha ao carregar multas.</td></tr>`;
        atualizarEstatisticas(true);
    }
}

function atualizarEstatisticas(erro = false) {
    if (erro) {
        document.getElementById('total-veiculos').textContent = '!';
        document.getElementById('total-multas').textContent = '!';
        document.getElementById('valor-total-multas').textContent = 'R$ 0,00';
        return;
    }
    
    const totalVeiculos = veiculosData.length;
    const totalMultas = multasData.length;
    const valorTotalMultas = multasData.reduce((acc, multa) => acc + (multa.valor || 0), 0);
    
    document.getElementById('total-veiculos').textContent = totalVeiculos;
    document.getElementById('total-multas').textContent = totalMultas;
    document.getElementById('valor-total-multas').textContent = `R$ ${valorTotalMultas.toFixed(2).replace('.', ',')}`;
}

// ==========================================
// CRUD VEÍCULOS (LISTAR, CRIAR, ALTERAR, EXCLUIR)
// ==========================================

// CREATE (Novo Veículo)
document.addEventListener('DOMContentLoaded', function() {
    const formNovoVeiculo = document.getElementById('form-novo-veiculo');
    if (formNovoVeiculo) {
        formNovoVeiculo.addEventListener('submit', criarNovoVeiculo);
    }
});

async function criarNovoVeiculo(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const veiculo = {
        placa: formData.get('placa'),
        marca: formData.get('marca'),
        modelo: formData.get('modelo'),
        ano: formData.get('ano') ? parseInt(formData.get('ano')) : null,
        proprietario: formData.get('proprietario')
    };
    
    try {
        const response = await fetch(API_VEICULOS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(veiculo)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.mensagem || 'Erro ao criar veículo');
        }
        
        mostrarNotificacao('Veículo criado com sucesso!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('modalCriarVeiculo')).hide();
        event.target.reset();
        carregarVeiculos();
    } catch (error) {
        mostrarNotificacao(`Erro: ${error.message}`, 'danger');
        if (error.message.includes('placa já existe')) {
            document.getElementById('novo-placa-validation-msg').textContent = 'Esta placa já está cadastrada';
        }
    }
}

function renderizarVeiculos(veiculos) {
    const tbody = document.getElementById('lista-veiculos');
    tbody.innerHTML = ''; 

    if (veiculos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum veículo cadastrado.</td></tr>`;
        return;
    }

    veiculos.forEach(veiculo => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>#${veiculo.id}</td>
            <td><span class="badge bg-primary placa-badge">${veiculo.placa}</span></td>
            <td>${veiculo.marca || 'N/A'} / ${veiculo.modelo}</td>
            <td>${veiculo.proprietario}</td>
            <td>
                <button class="btn btn-sm btn-info text-white" onclick="abrirModalEdicaoVeiculo(${veiculo.id})">
                    ✏️ Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmarExclusaoVeiculo(${veiculo.id}, '${veiculo.placa}')">
                    🗑️ Excluir
                </button>
            </td>
        `;
    });
}

// UPDATE (Abre Modal)
window.abrirModalEdicaoVeiculo = function(id) {
    const veiculo = veiculosData.find(v => v.id === id);
    if (!veiculo) return mostrarNotificacao('Veículo não encontrado.', 'danger');
    
    document.getElementById('edit-id-display').textContent = veiculo.id;
    document.getElementById('edit-id').value = veiculo.id;
    document.getElementById('edit-placa').value = veiculo.placa;
    document.getElementById('edit-marca').value = veiculo.marca || '';
    document.getElementById('edit-modelo').value = veiculo.modelo;
    document.getElementById('edit-ano').value = veiculo.ano || '';
    document.getElementById('edit-proprietario').value = veiculo.proprietario;
    document.getElementById('edit-placa-validation-msg').textContent = '';
    
    modalEdicaoVeiculo.show();
};

// UPDATE (Salva Edição)
async function salvarEdicaoVeiculo(event) {
    event.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const dadosAtualizados = {
        placa: document.getElementById('edit-placa').value.trim().toUpperCase(),
        marca: document.getElementById('edit-marca').value.trim(),
        modelo: document.getElementById('edit-modelo').value.trim(),
        ano: document.getElementById('edit-ano').value.trim() ? parseInt(document.getElementById('edit-ano').value.trim()) : null,
        proprietario: document.getElementById('edit-proprietario').value.trim(),
    };
    
    try {
        const response = await fetch(`${API_VEICULOS}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados), 
        });

        const result = await response.json();
        document.getElementById('edit-placa-validation-msg').textContent = '';

        if (!response.ok) {
            if (response.status === 409) {
                document.getElementById('edit-placa-validation-msg').textContent = result.mensagem;
            }
            throw new Error(result.mensagem || `Erro HTTP ${response.status}`);
        }

        mostrarNotificacao(`Veículo #${id} atualizado com sucesso!`, 'success');
        modalEdicaoVeiculo.hide();
        await carregarVeiculos();
        
    } catch (error) {
        if (!document.getElementById('edit-placa-validation-msg').textContent) {
            mostrarNotificacao(`Erro ao atualizar veículo: ${error.message}`, 'danger');
        }
    }
}

// DELETE
window.confirmarExclusaoVeiculo = function(id, placa) {
    if (confirm(`⚠️ ATENÇÃO!\n\nDeseja realmente excluir o veículo ${placa} e TODAS as multas relacionadas (ON DELETE CASCADE)?\n\nEsta ação não pode ser desfeita.`)) {
        excluirVeiculo(id);
    }
};

async function excluirVeiculo(id) {
    try {
        const response = await fetch(`${API_VEICULOS}/${id}`, { method: 'DELETE' });

        if (response.status === 204) {
            mostrarNotificacao(`Veículo #${id} excluído com sucesso!`, 'warning');
            await carregarVeiculos(); 
        } else {
            const result = await response.json();
            throw new Error(result.mensagem || `Erro HTTP ${response.status}`);
        }

    } catch (error) {
        mostrarNotificacao(`Erro ao excluir veículo: ${error.message}`, 'danger');
    }
}


// ==========================================
// CRUD MULTAS (LISTAR, INCLUIR, EXCLUIR)
// ==========================================

function popularSelectVeiculos(veiculos) {
    const select = document.getElementById('multa-veiculo-id');
    select.innerHTML = '<option value="">Selecione o Veículo...</option>';
    
    veiculos.forEach(v => {
        const option = document.createElement('option');
        option.value = v.id;
        option.textContent = `${v.placa} - ${v.modelo} (${v.proprietario})`;
        select.appendChild(option);
    });
}

function renderizarMultas(multas) {
    const tbody = document.getElementById('lista-multas');
    tbody.innerHTML = ''; 

    if (multas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Nenhuma multa registrada.</td></tr>`;
        return;
    }

    multas.forEach(multa => {
        const row = tbody.insertRow();
        
        row.insertCell().textContent = multa.id;
        row.insertCell().innerHTML = `<span class="badge bg-danger placa-badge">${multa.placa}</span>`;
        row.insertCell().textContent = `${multa.modelo} (${multa.proprietario})`;
        row.insertCell().textContent = `R$ ${multa.valor.toFixed(2).replace('.', ',')}`;
        row.insertCell().textContent = multa.local;
        row.insertCell().textContent = formatarData(multa.dataHora);

        const acoesCell = row.insertCell();
        acoesCell.innerHTML = `
            <button class="btn btn-sm btn-outline-danger" onclick="confirmarExclusaoMulta(${multa.id}, '${multa.placa}')">
                🗑️ Excluir
            </button>
        `;
    });
}

// CREATE
async function criarMulta(dados) {
    try {
        const response = await fetch(API_MULTAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados), 
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.mensagem || `Erro HTTP ${response.status}`);
        }

        mostrarNotificacao(`Multa #${result.id} aplicada com sucesso!`, 'success');
        document.getElementById('form-nova-multa').reset();
        modalRegistroMulta.hide();
        await carregarMultas(); 
        
    } catch (error) {
        console.error("❌ Erro ao criar multa:", error);
        mostrarNotificacao(`Erro ao aplicar multa: ${error.message}`, 'danger');
    }
}

// DELETE
window.confirmarExclusaoMulta = function(id, placa) {
    if (confirm(`⚠️ Deseja realmente excluir a Multa #${id} do veículo ${placa}?`)) {
        excluirMulta(id);
    }
};

async function excluirMulta(id) {
    try {
        const response = await fetch(`${API_MULTAS}/${id}`, { method: 'DELETE' });

        if (response.status === 204) {
            mostrarNotificacao(`Multa #${id} excluída com sucesso!`, 'warning');
            await carregarMultas(); 
        } else {
            const result = await response.json();
            throw new Error(result.mensagem || `Erro HTTP ${response.status}`);
        }

    } catch (error) {
        mostrarNotificacao(`Erro ao excluir multa: ${error.message}`, 'danger');
    }
}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializar Modais Bootstrap
    modalEdicaoVeiculo = new bootstrap.Modal(document.getElementById('modalEdicaoVeiculo'));
    modalRegistroMulta = new bootstrap.Modal(document.getElementById('modalRegistroMulta'));
    
    // 2. Configurar Event Listeners
    document.getElementById('form-edicao-veiculo').addEventListener('submit', salvarEdicaoVeiculo);
    
    document.getElementById('form-nova-multa').addEventListener('submit', (event) => {
        event.preventDefault(); 
        
        const formData = new FormData(document.getElementById('form-nova-multa'));
        const dados = Object.fromEntries(formData);
        
        // Tratamento e Validação
        dados.veiculo_id = parseInt(dados.veiculo_id);
        dados.valor = parseFloat(dados.valor);
        dados.local = dados.local.trim();

        if (isNaN(dados.veiculo_id) || isNaN(dados.valor) || dados.valor <= 0 || !dados.local) {
            mostrarNotificacao('Selecione o veículo e preencha o valor/local corretamente.', 'warning');
            return;
        }
        
        if (!dados.dataHora) {
            dados.dataHora = new Date().toISOString();
        }
        
        criarMulta(dados);
    });

    // 3. Carregar dados iniciais
    await carregarVeiculos();
    
    mostrarNotificacao('Painel Administrativo carregado!', 'success');
});