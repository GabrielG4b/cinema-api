# 🎬 Cinema API

API REST desenvolvida para gerenciamento de **filmes e sessões de cinema**, utilizando Node.js, TypeScript, Express, Supabase e PostgreSQL.

O projeto foi desenvolvido como parte da atividade de **Desenvolvimento de API REST**, com o objetivo de aplicar conceitos de APIs, operações CRUD, relacionamento entre entidades, validação de dados e integração com banco de dados.

---

## 📋 Sobre o projeto

A API permite realizar o cadastro e gerenciamento de filmes e sessões de cinema.

O sistema possui duas entidades principais:

* **Filme**
* **Sessão**

Um filme pode possuir várias sessões, estabelecendo um relacionamento **1:N (um para muitos)** entre as entidades.

```text
FILME 1 ───────── N SESSÃO
```

Cada sessão pertence a um único filme através do campo `filme_id`.

---

## 🛠️ Tecnologias utilizadas

* **Node.js** — ambiente de execução da aplicação
* **TypeScript** — linguagem utilizada no desenvolvimento
* **Express** — framework utilizado para criação da API REST
* **Supabase** — plataforma utilizada para acesso ao banco de dados
* **PostgreSQL** — banco de dados relacional
* **Postman** — ferramenta utilizada para testes das requisições HTTP
* **Git/GitHub** — controle de versão e armazenamento do projeto

---

## 📦 Entidades

### 🎞️ Filme

A entidade `Filme` possui os seguintes campos:

| Campo           | Descrição                    |
| --------------- | ---------------------------- |
| `id`            | Identificador único do filme |
| `titulo`        | Título do filme              |
| `descricao`     | Descrição do filme           |
| `duracao`       | Duração do filme em minutos  |
| `classificacao` | Classificação indicativa     |
| `genero`        | Gênero do filme              |
| `ativo`         | Indica se o filme está ativo |

### 🎟️ Sessão

A entidade `Sessao` possui os seguintes campos:

| Campo        | Descrição                          |
| ------------ | ---------------------------------- |
| `id`         | Identificador único da sessão      |
| `data_hora`  | Data e horário da sessão           |
| `sala`       | Número da sala                     |
| `capacidade` | Capacidade da sala                 |
| `preco`      | Preço do ingresso                  |
| `filme_id`   | Identificador do filme relacionado |

---

## 🔗 Relacionamento entre as entidades

O relacionamento entre `Filme` e `Sessao` é de **1:N**.

```text
┌──────────────┐             ┌───────────────┐
│    FILME     │  1       N  │    SESSÃO     │
├──────────────┤─────────────├───────────────┤
│ id           │◄────────────│ filme_id      │
│ titulo       │             │ id            │
│ descricao    │             │ data_hora     │
│ duracao      │             │ sala          │
│ classificacao│             │ capacidade    │
│ genero       │             │ preco         │
│ ativo        │             │               │
└──────────────┘             └───────────────┘
```

Um filme pode possuir várias sessões, mas cada sessão está relacionada a um único filme.

---

## 📁 Estrutura do projeto

A estrutura final planejada para o projeto é:

```text
cinema-api/
│
├── src/
│   ├── config/
│   │   └── supabase.ts
│   │
│   ├── controllers/
│   │   ├── filme.controller.ts
│   │   └── sessao.controller.ts
│   │
│   ├── models/
│   │   ├── filme.model.ts
│   │   └── sessao.model.ts
│   │
│   ├── routes/
│   │   ├── filme.routes.ts
│   │   └── sessao.routes.ts
│   │
│   └── server.ts
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

### Responsabilidade das camadas

**Routes**

Responsáveis por definir os endpoints da API e direcionar as requisições para os controllers.

**Controllers**

Responsáveis por receber as requisições HTTP, realizar as validações necessárias e retornar as respostas para o cliente.

**Models**

Responsáveis pelas operações relacionadas aos dados e comunicação com o banco de dados.

**Config**

Responsável pela configuração da conexão com o Supabase.

**Server**

Responsável pela inicialização do Express e configuração geral da aplicação.

---

## 🚀 Instalação

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

### 2. Entrar na pasta

```bash
cd cinema-api
```

### 3. Instalar as dependências

```bash
npm install
```

---

## 🔐 Configuração das variáveis de ambiente

Crie um arquivo chamado `.env` na raiz do projeto:

```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase
```

A aplicação utiliza essas variáveis para realizar a conexão com o Supabase.

> **Importante:** o arquivo `.env` não deve ser enviado para o GitHub, pois contém informações de acesso ao banco de dados.

Para facilitar a configuração por outros integrantes, pode ser utilizado o arquivo `.env.example`:

```env
SUPABASE_URL=
SUPABASE_KEY=
```

---

## ▶️ Executando o projeto

Para iniciar a aplicação em modo de desenvolvimento:

```bash
npm run dev
```

O servidor será iniciado em:

```text
http://localhost:3000
```

Ao acessar a rota inicial:

```http
GET /
```

a API retorna:

```text
Filmes em cartaz e sessões
```

---

# 📡 Endpoints

## 🎞️ Filmes

### Listar todos os filmes

```http
GET /filmes
```

Retorna todos os filmes cadastrados.

---

### Buscar filme por ID

```http
GET /filmes/:id
```

Exemplo:

```http
GET /filmes/UUID_DO_FILME
```

---

### Cadastrar filme

```http
POST /filmes
```

Corpo da requisição:

```json
{
  "titulo": "Homem-Aranha",
  "descricao": "Um jovem ganha poderes especiais.",
  "duracao": 148,
  "classificacao": "12",
  "genero": "Ação",
  "ativo": true
}
```

Resposta esperada:

```http
201 Created
```

---

### Atualizar filme

```http
PUT /filmes/:id
```

Exemplo:

```http
PUT /filmes/UUID_DO_FILME
```

Corpo:

```json
{
  "titulo": "Homem-Aranha",
  "descricao": "Um jovem desenvolve poderes especiais.",
  "duracao": 148,
  "classificacao": "12",
  "genero": "Ação",
  "ativo": true
}
```

---

### Excluir filme

```http
DELETE /filmes/:id
```

Um filme que possua sessões cadastradas não pode ser excluído enquanto essas sessões existirem.

---

### Listar sessões de um filme

```http
GET /filmes/:id/sessoes
```

Retorna todas as sessões relacionadas ao filme informado.

---

# 🎟️ Sessões

### Listar todas as sessões

```http
GET /sessoes
```

---

### Buscar sessão por ID

```http
GET /sessoes/:id
```

---

### Cadastrar sessão

```http
POST /sessoes
```

Corpo da requisição:

```json
{
  "data_hora": "2026-10-15T19:30:00",
  "sala": 3,
  "capacidade": 120,
  "preco": 25.00,
  "filme_id": "UUID_DO_FILME"
}
```

O `filme_id` deve corresponder a um filme existente no banco de dados.

Resposta esperada:

```http
201 Created
```

---

### Atualizar sessão

```http
PUT /sessoes/:id
```

Exemplo:

```http
PUT /sessoes/UUID_DA_SESSAO
```

Corpo:

```json
{
  "data_hora": "2026-10-16T20:00:00",
  "sala": 4,
  "capacidade": 150,
  "preco": 30.00,
  "filme_id": "UUID_DO_FILME"
}
```

---

### Excluir sessão

```http
DELETE /sessoes/:id
```

---

# 📊 Códigos HTTP utilizados

| Código | Significado           | Utilização                                    |
| ------ | --------------------- | --------------------------------------------- |
| `200`  | OK                    | Consulta e atualização realizadas com sucesso |
| `201`  | Created               | Registro criado com sucesso                   |
| `204`  | No Content            | Registro excluído com sucesso                 |
| `400`  | Bad Request           | Dados enviados são inválidos                  |
| `404`  | Not Found             | Registro não encontrado                       |
| `409`  | Conflict              | Conflito com relacionamento ou banco de dados |
| `500`  | Internal Server Error | Erro interno do servidor                      |

---

# ✅ Validações

A API realiza validações antes de enviar os dados ao banco.

### Filme

São verificados:

* título obrigatório;
* descrição;
* duração maior que zero;
* classificação obrigatória;
* gênero obrigatório;
* campo `ativo` como booleano.

### Sessão

São verificados:

* data e hora válidas;
* sala maior que zero;
* capacidade maior que zero;
* preço maior ou igual a zero;
* existência do `filme_id`.

Caso existam erros de validação, a API retorna:

```http
400 Bad Request
```

acompanhado de uma lista de erros.

---

# 🧪 Testes

Os endpoints podem ser testados utilizando o **Postman**.

Fluxo recomendado de teste:

```text
1. Criar um filme
        ↓
2. Consultar o filme
        ↓
3. Criar uma sessão utilizando o filme_id
        ↓
4. Consultar as sessões
        ↓
5. Consultar as sessões de um filme
        ↓
6. Atualizar filme/sessão
        ↓
7. Tentar excluir o filme que possui sessão
        ↓
8. Excluir a sessão
        ↓
9. Excluir o filme
```

---

# 🔒 Segurança

Informações de acesso ao Supabase são armazenadas através de variáveis de ambiente.

O arquivo `.env` deve permanecer fora do controle de versão através do `.gitignore`.

---

# 👥 Equipe

* Gabriel Alberto Garcia
* Gabriella kaylane

---

# 📚 Objetivo acadêmico

O projeto tem como objetivo aplicar na prática conceitos de:

* Desenvolvimento de APIs REST;
* Node.js;
* TypeScript;
* Express;
* Operações CRUD;
* Banco de dados relacional;
* PostgreSQL;
* Supabase;
* Relacionamentos entre entidades;
* Validação de dados;
* Métodos HTTP;
* Códigos de resposta HTTP;
* Controle de versão com Git e GitHub.
