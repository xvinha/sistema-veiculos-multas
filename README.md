Este projeto implementa um sistema de gerenciamento de veículos e multas com uma arquitetura backend (API RESTful em Node.js com Express e SQLite) e um frontend (HTML/CSS/JS simples).

🛠️ Tecnologias Utilizadas
O projeto utiliza as seguintes tecnologias:

Backend (API)

Node.js

Express.js (Framework web)

SQLite3 (Banco de dados)

body-parser e cors (Middleware)

Frontend (Interface Web)

HTML5, CSS, JavaScript

Bootstrap 5.3.3 (Para estilização)

⚙️ Instalação e Execução (Backend)
O servidor de API roda na porta 3000.

Instale as dependências do Node.js:

cd backend
npm install
Inicie o servidor:

npm start
Após iniciar, o servidor exibirá as seguintes URLs:

Servidor rodando na porta 3000

API Veículos: http://localhost:3000/api/veiculos

API Multas: http://localhost:3000/api/multas

📝 Estrutura do Banco de Dados
O banco de dados utilizado é o SQLite, armazenado no arquivo veiculos_multas.db. As tabelas principais são VEICULOS e MULTAS.

Tabela VEICULOS
Armazena os dados dos veículos. A placa é um campo único.

Coluna	Tipo	Notas
id	INTEGER	Chave Primária, Auto Incremental
placa	TEXT	Não Nulo, Único
marca	TEXT	
modelo	TEXT	Não Nulo
ano	INTEGER	
proprietario	TEXT	Não Nulo
dataCadastro	TEXT	

Tabela MULTAS
Armazena os registros de multas, com uma chave estrangeira para a tabela VEICULOS.

Coluna	Tipo	Notas
id	INTEGER	Chave Primária, Auto Incremental
veiculo_id	INTEGER	Não Nulo, Foreign Key referenciando VEICULOS(id) (com exclusão em cascata)
dataHora	TEXT	Não Nulo
local	TEXT	Não Nulo
gravidade	TEXT	Padrão: 'Média'
valor	REAL	Não Nulo

🌐 Endpoints da API (Backend)
A API RESTful está estruturada nas rotas /api/veiculos e /api/multas.

Rotas de Veículos (/api/veiculos) - (Uso Administrativo)
Método	URL	Descrição	Controller
GET	/api/veiculos	Lista todos os veículos	veiculosController.listarVeiculos
POST	/api/veiculos	Cria um novo veículo	veiculosController.criarVeiculo
GET	/api/veiculos/:id	Busca um veículo por ID	veiculosController.buscarVeiculo
PUT	/api/veiculos/:id	Atualiza um veículo por ID	veiculosController.atualizarVeiculo
DELETE	/api/veiculos/:id	Exclui um veículo por ID	veiculosController.excluirVeiculo

Rotas de Multas (/api/multas)
Método	URL	Descrição	Uso	Controller
GET	/api/multas/consulta	Consulta Flexível (Cliente): Permite consultar multas por placa, proprietário ou modelo	Cliente	multasController.consultarMultasCliente
GET	/api/multas	Lista todas as multas	Admin	multasController.listarMultas
POST	/api/multas	Cria um novo registro de multa	Admin	multasController.criarMulta
GET	/api/multas/:id	Busca uma multa por ID	Admin	multasController.buscarMulta
PUT	/api/multas/:id	Atualiza uma multa por ID	Admin	multasController.atualizarMulta
DELETE	/api/multas/:id	Exclui uma multa por ID	Admin	multasController.excluirMulta

💻 Interface Web (Frontend)
O frontend oferece dois portais principais:

Portal do Cliente (cliente.html): Utilizado para consulta de multas por diferentes critérios (placa, proprietário, modelo).

Área Administrativa (admin.html): Para gerenciamento completo de veículos e multas (incluindo cadastro e edição).

O arquivo principal para acessar a aplicação é o frontend/index.html
