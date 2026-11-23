# TP1 — DCC603 - Engenharia de Software

## 👥 Integrantes

| Nome completo | Papel |
|---|---|
| Guilherme Martins Dijan Domênico | Fullstack |
| Mateus Ribeiro Quintão | Fullstack |
| Lucas Soares Benfica | Fullstack |

---

## 🎯 Objetivo do Sistema

O StudySync é uma plataforma web integrada voltada para a organização da vida acadêmica, unificando a gestão de avaliações, trabalhos em equipe e hábitos diários. O sistema visa combater a desorganização causada pela dispersão de informações, permitindo priorizar prazos críticos e rotinas de estudo. Através de um calendário interativo, contagens regressivas e visões analíticas, o aluno consegue coordenar seu tempo de forma eficiente. Dessa forma, o objetivo central é centralizar a rotina do estudante em um único ecossistema, promovendo consistência e reduzindo o estresse com entregas.

---

## 🛠️ Tecnologias

* **Frontend:** React + Tailwind CSS
* **Backend:** Node.js (com Fastify)
* **Banco de Dados:** PostgreSQL (com Prisma ORM)
* **Infraestrutura:** Docker e Docker Compose
* **Agentes de IA/LLM:** Codex, Claude Code, ChatGPT (LLM), Gemini

---

## 📖 Histórias de Usuário

1. **Como** estudante, **quero** registrar minhas provas com informações de disciplina e peso, **para** ter uma contagem regressiva automática dos dias restantes.
2. **Como** estudante, **quero** cadastrar trabalhos em grupo e identificar os membros, **para** facilitar a divisão de escopo e o controle de status das entregas.
3. **Como** estudante, **quero** configurar hábitos e tarefas recorrentes (ex: monitorias), **para** acompanhar minha consistência por meio de um checklist diário.
4. **Como** estudante, **quero** visualizar todos os meus compromissos em um calendário interativo com filtros por cor, **para** organizar meu planejamento mensal e semanal.
5. **Como** estudante, **quero** acessar abas dedicadas como "Próximas Provas" e "Meu Dia", **para** focar rapidamente no que é mais urgente.
6. **Como** estudante, **quero** receber alertas e notificações programadas via e-mail ou app, **para** nunca perder o prazo de uma avaliação ou entrega crítica.
7. **Como** estudante, **quero** anexar links úteis e diretrizes dos professores aos trabalhos, **para** centralizar todo o material necessário para a execução.
8. **Como** estudante, **quero** que meu checklist de hábitos resete automaticamente à meia-noite, **para** que eu possa iniciar um novo ciclo diário sem esforço manual.

---

## 📐 Diagramas UML (Preliminar)

Conforme os requisitos do projeto, abaixo estão os diagramas arquiteturais do sistema.

### 1. Diagrama de Casos de Uso (Mermaid)

```mermaid
flowchart LR
    E((Estudante))
    
    UC1([Registrar Provas])
    UC2([Cadastrar Trabalhos em Grupo])
    UC3([Configurar Hábitos Diários])
    UC4([Visualizar Calendário e Prazos])
    UC5([Receber Alertas e Notificações])
    
    E --> UC1
    E --> UC2
    E --> UC3
    E --> UC4
    E --> UC5
```

### 2. Diagrama de Classes (Mermaid)

`Estudante` deixou de ser ilustrativo: com a autenticação implementada, toda `Avaliacao`, `TrabalhoGrupo` e `Habito` tem um dono de verdade no banco, e cada estudante só vê/edita os próprios dados.

```mermaid
classDiagram
    class Estudante {
        +String nome
        +String email
        +String senhaHash
        +cadastrar()
        +login()
    }

    class Avaliacao {
        +String disciplina
        +Float peso
        +Date dataRealizacao
        +int calcularDiasRestantes()
    }

    class TrabalhoGrupo {
        +String titulo
        +Date prazoEntrega
        +List~String~ linksUteis
        +adicionarMembro()
    }

    class Habito {
        +String descricao
        +String recorrencia
        +Boolean concluidoHoje
        +resetarDiariamente()
    }

    class MembroGrupo {
        +String nome
        +String escopo
    }

    Estudante "1" -- "*" Avaliacao : gerencia >
    Estudante "1" -- "*" TrabalhoGrupo : gerencia >
    Estudante "1" -- "*" Habito : acompanha >
    TrabalhoGrupo "1" *-- "1..*" MembroGrupo : contem >
```

### 3. Diagrama de Sequência — Autenticação (Mermaid)

Mostra o cadastro/login (que devolvem um token) e como esse token protege as rotas de dados a partir daí — o mesmo padrão vale para provas, trabalhos, hábitos e calendário.

```mermaid
sequenceDiagram
    actor E as Estudante
    participant F as Frontend (React)
    participant A as API (Fastify)
    participant B as PostgreSQL

    E->>F: Preenche cadastro (nome, email, senha)
    F->>A: POST /api/auth/cadastro
    A->>A: Valida campos e gera hash da senha (bcrypt)
    A->>B: Cria Estudante
    A-->>F: token (JWT) + dados do usuario
    F->>F: Guarda o token no localStorage
    F-->>E: Entra logado, Home vazia

    Note over E,B: Numa sessão futura — login com conta existente
    E->>F: Preenche login (email, senha)
    F->>A: POST /api/auth/login
    A->>B: Busca Estudante pelo email
    A->>A: Compara a senha com o hash salvo
    A-->>F: token (JWT) + dados do usuario

    Note over E,B: Toda requisição a dados (provas, trabalhos, hábitos, calendário)
    F->>A: GET /api/avaliacoes  (Authorization: Bearer token)
    A->>A: Verifica o token, extrai o id do estudante
    A->>B: Busca só as avaliações desse estudanteId
    A-->>F: Lista (nunca a de outro estudante)
```

---

## 🚀 Como Rodar o Projeto

Pré-requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e aberto.

1. Clonar o repositório e entrar na pasta.
2. Copiar o arquivo de variáveis de ambiente: `cp .env.example .env` (no Windows: `copy .env.example .env`).
3. Subir os containers: `docker compose up --build`
4. Acessar:
   * Frontend: http://localhost:5173
   * API: http://localhost:3000/api/health
   * Postgres: `localhost:5432` (usuário/senha: `studysync`/`studysync123`)
5. (Opcional) Popular com dados de exemplo: `docker compose exec backend npm run db:seed` → cria a conta demo `demo@studysync.com` / `demo123` já com provas, trabalhos e hábitos de exemplo.
6. Parar os containers: `docker compose down` (os dados continuam salvos no volume `pgdata`; use `docker compose down -v` para apagar tudo e recomeçar do zero).

### ✉️ Ativando as notificações por e-mail (opcional)

Sem esses passos o app funciona 100% normal — só não envia e-mail de verdade (fallback silencioso). Para ativar:

1. Criar uma conta gratuita em [sendgrid.com](https://sendgrid.com).
2. **Settings → Sender Authentication → Single Sender Verification** → cadastrar um e-mail remetente e confirmar pelo link que chega na caixa de entrada dele.
3. **Settings → API Keys → Create API Key** → escolher "Restricted Access" e liberar só a permissão **Mail Send**.
4. No `.env` da raiz, preencher:
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxx
   SENDGRID_FROM=<e-mail verificado no passo 2>
   ```
5. Reiniciar só o backend para carregar as novas variáveis: `docker compose up -d backend`

A partir daí, todo dia às 08h (horário de Brasília) cada estudante recebe — se tiver ativado em **Configurações** — um lembrete dos prazos dos próximos 3 dias e um aviso de quais itens acabaram de entrar em "Urgentes".

---

## 🧪 Testes Automatizados

| Tipo | Onde | O que cobre |
|---|---|---|
| Unitários (backend) | `backend/test/urgencia.test.js`, `html.test.js`, `email.test.js`, `jobs.test.js` | Regra de urgência/atraso no fuso de Brasília, escape de HTML, envio pelo SendGrid (com o SendGrid simulado) e os agendadores da meia-noite e das 8h |
| Unitários (frontend) | `frontend/test/*.test.js` | Regra de "Urgentes", sugestão de alarme, datas sem o bug do "dia anterior", grade do calendário, links e token de login |
| Componentes (frontend) | `frontend/test/components/*.test.jsx` | Grade, controles e modal do calendário, formulários de prova e trabalho, links úteis, seção "Urgentes", rota protegida e navbar, renderizados no jsdom |
| Integração (API + banco) | `backend/test/auth*.test.js`, `isolamento`, `crud`, `habitos`, `calendario`, `validacao`, `entrada`, `notificacoes*` | Cadastro/login e rate limit, isolamento entre estudantes, CRUD completo, reset manual só dos próprios hábitos, calendário (expansão de hábitos), validações e o conteúdo/regras do e-mail de notificação |
| E2E (Playwright) | `e2e/tests/` | 5 fluxos pela interface (abaixo) |

Os testes unitários e de integração usam o `node:test` do próprio Node (**Node 22 ou mais novo**) e a cobertura é medida com o [c8](https://github.com/bcoe/c8). O mínimo configurado é **80%** de linhas, branches, funções e statements: abaixo disso, `npm run test:coverage` falha.

**Frontend** (não precisa de banco):

```bash
cd frontend
npm test                           # utils, com node:test
npm run test:coverage              # cobertura de src/utils (c8)
npm run test:components            # componentes React, com Vitest + Testing Library
npm run test:components:coverage   # cobertura de src/components (mínimo de 80%)
```

Os componentes rodam no Vitest porque o `node:test` não entende JSX. O relatório HTML deles fica em `frontend/coverage/components/index.html`.

**Backend:** os testes de integração usam um PostgreSQL real, num banco **separado** (`studysync_test`), pra nunca mexer nos dados do app. Uma vez só, com o compose no ar:

```bash
docker compose exec db psql -U studysync -c "CREATE DATABASE studysync_test"
cd backend
DATABASE_URL=postgresql://studysync:studysync123@localhost:5432/studysync_test npx prisma db push
```

Depois, sempre que quiser rodar:

```bash
cd backend
DATABASE_URL=postgresql://studysync:studysync123@localhost:5432/studysync_test npm run test:coverage
```

Sem `DATABASE_URL`, `npm test` roda só os unitários e pula os de integração. Os usuários criados nos testes têm e-mail começando com `it-` e são apagados ao final. O relatório HTML de cobertura fica em `coverage/index.html` (backend e frontend).

**E2E** (precisa do sistema no ar com `docker compose up`):

```bash
cd e2e
npm install
npx playwright install chromium
npm test              # ou npm run test:headed para ver o navegador
```

| Teste | Fluxo |
|---|---|
| `trabalho-calendario` | Cria um trabalho e o encontra no calendário, com os detalhes |
| `autenticacao` | Sair, rota protegida, uma conta não vê os dados da outra, senha errada recusada, login de volta |
| `urgentes` | Alarme coloca o trabalho em "Urgente" e a prova vencida em "Atrasado"; concluir o trabalho o tira da lista |
| `habitos-configuracoes` | Marcar hábito atualiza o progresso e persiste; "Resetar Dia" desmarca; preferências de e-mail ficam salvas |

> Cadastro e login têm limite de 20 tentativas por minuto por IP (proteção contra força bruta). Cada execução dos E2E faz ~8 cadastros/logins: rodar várias vezes seguidas em menos de 1 minuto pode estourar o limite. Basta esperar 1 minuto.

---

## 🎤 Roteiro de Testes — Apresentação do TP2

Passo a passo para subir o ambiente, rodar todos os testes e mostrar os resultados (apresentação de 12 min). Os comandos são para o **PowerShell** (Windows), a partir da raiz do repositório. No Git Bash/Linux/macOS, troque `$env:DATABASE_URL="..."; comando` por `DATABASE_URL=... comando`.

### 0. Pré-requisitos

* **Docker Desktop** instalado e **aberto** (o ícone da baleia sem "starting").
* **Node.js 22 ou mais novo** (`node --version`). Os testes do backend usam `mock.module` do `node:test`, que não existe no Node 20.
* Repositório atualizado: `git pull`.

### 1. Preparação (uma vez só, de preferência antes da aula)

```bash
cd backend; npm install; cd ..
cd frontend; npm install; cd ..
cd e2e; npm install; npx playwright install chromium; cd ..
```

Subir o ambiente e criar o banco de testes (separado do banco do app, para os testes nunca mexerem nos dados de demonstração):

```bash
docker compose up -d
docker compose exec db psql -U studysync -c "CREATE DATABASE studysync_test"
cd backend; $env:DATABASE_URL="postgresql://studysync:studysync123@127.0.0.1:5432/studysync_test"; npx prisma db push; cd ..
```

Se o `CREATE DATABASE` responder `already exists`, tudo certo: o banco já existe.

### 2. No dia: subir e conferir o ambiente (~1 min, antes de começar)

```bash
docker compose up -d
docker compose ps
```

Os três serviços (`studysync-db`, `studysync-backend`, `studysync-frontend`) devem estar `Up`, e o banco `healthy`. Conferir também:

* API: http://localhost:3000/api/health → `{"status":"ok", ...}`
* App: http://localhost:5173 → tela de login

> ⚠️ **Não pule esta conferência.** Com o Docker parado, os testes de integração não mostram "sem conexão": a API responde erro 500 e aparecem dezenas de falhas de asserção, o que confunde na hora.

### 3. Parte 1 — Testes de unidade/integração + cobertura (~2 min)

**Backend** (86 testes: unidade + integração com PostgreSQL real):

```bash
cd backend; $env:DATABASE_URL="postgresql://studysync:studysync123@127.0.0.1:5432/studysync_test"; npm run test:coverage; cd ..
```

**Frontend: funções utilitárias** (33 testes, `node:test` + c8):

```bash
cd frontend; npm run test:coverage; cd ..
```

**Frontend: componentes React** (30 testes, Vitest + Testing Library no jsdom):

```bash
cd frontend; npm run test:components:coverage; cd ..
```

**Mostrar os relatórios visuais de cobertura** (linhas não testadas aparecem em vermelho, dá pra clicar em cada arquivo):

```bash
start backend\coverage\index.html
start frontend\coverage\components\index.html
```

Os três comandos de cobertura **falham sozinhos se qualquer métrica cair abaixo de 80%**, então "passou" já significa "cobertura mínima atingida".

### 4. Parte 2 — Testes E2E com Playwright (~4 min)

Com o ambiente no ar (passo 2), rodar com o navegador visível:

```bash
cd e2e; npm run test:headed; cd ..
```

Depois, o relatório do Playwright, com cada passo de cada teste:

```bash
cd e2e; npm run report; cd ..
```

| Teste | O que acontece na tela |
|---|---|
| `trabalho-calendario` | Cadastra um usuário, cria um trabalho e o encontra no calendário, abrindo os detalhes |
| `autenticacao` | Conta A cria uma prova e sai; páginas internas redirecionam para o login; conta B não vê a prova de A; senha errada é recusada; A entra de novo e vê a prova |
| `urgentes` | Trabalho com alarme hoje aparece como **Urgente** e prova vencida como **Atrasado** na Home; concluir o trabalho o tira de "Urgentes" |
| `habitos-configuracoes` (2 testes) | Marcar hábito atualiza o progresso e persiste após recarregar; "Resetar Dia" desmarca; desligar o lembrete por e-mail em Configurações fica salvo |

> ⚠️ **Rode os E2E uma vez só.** Cadastro/login aceitam 20 tentativas por minuto por IP e cada execução usa ~8. Se aparecer falha logo no cadastro (a página não sai de `/cadastro`), espere 1 minuto e rode de novo.

### 5. Resultados esperados

| Comando | Testes | Linhas | Branches | Funções |
|---|---|---|---|---|
| Backend `test:coverage` | 86 ✅ | 94% | 91% | 97,7% |
| Frontend `test:coverage` (utils) | 33 ✅ | 100% | 100% | 100% |
| Frontend `test:components:coverage` | 30 ✅ | 100% | 98,5% | 100% |
| E2E (Playwright) | 5 ✅ | — | — | — |

No backend a cobertura conta **todos** os arquivos de `src/` (`all: true` no c8), inclusive os que nenhum teste importa. Só fica de fora o `server.js`, que apenas sobe o servidor.

### 6. Parte 3 — Comentários sobre o uso de IA (~5 min): pontos para discutir

* **Ferramentas:** Claude Code, Codex, ChatGPT e Gemini (as mesmas do TP1, seguindo o [AI_RULES.md](./AI_RULES.md)).
* **Positivo, os testes acharam bugs reais:** o título de item urgente era escapado duas vezes no e-mail (`P&D` virava `P&amp;amp;D`), e a data do lembrete saía um dia antes em servidor com fuso de Brasília. Os dois foram corrigidos em commits próprios.
* **Positivo, testes de mutação:** quebrar de propósito regras importantes (recorrência semanal, isolamento do reset de hábitos, reenvio de notificação, regra de atraso) e confirmar que algum teste falha. É a forma de checar se os testes cobrem casos importantes, e não só linhas.
* **Ponto de atenção, a métrica de cobertura engana:** a cobertura nativa do Node só conta arquivos importados por algum teste; ela mostrava 81,8% enquanto a real, com todos os arquivos, era 77,3%. Trocar para o c8 com `all: true` resolveu.
* **Ponto de atenção, compatibilidade:** um teste gerado usava uma opção do `mock.module` que só existe em Node mais novo; no Node 22 o arquivo inteiro nem carregava.
* **Ponto de atenção, E2E frágil:** o `check()` do Playwright falhava porque os checkboxes só mudam depois que a API confirma; a solução foi `click()` + `expect(...).toBeChecked()`, que espera.
* **Todos os testes foram revisados, entendidos e rodados pelo grupo** antes de cada commit.

### 7. Parte 4 — Divisão do trabalho (~1 min)

Coincide com a autoria dos commits no repositório:

| Integrante | Contribuição no TP2 |
|---|---|
| **Guilherme** | Base dos testes (`buildApp`, helpers), testes de integração de autenticação, isolamento e validação, testes unitários iniciais, e as correções de segurança que vieram com eles (rate limit, validação de entrada, escape de HTML) |
| **Mateus** | Configuração do Playwright e o primeiro E2E; testes de componentes React com Vitest + Testing Library (calendário, formulários, Urgentes, rota protegida, navbar) |
| **Lucas** | Banco de testes separado, cobertura com c8 e mínimo de 80%, testes de CRUD, calendário, hábitos, agendadores e e-mail de notificação, testes das funções do frontend, 3 E2E (autenticação, urgentes, hábitos/configurações) e as 2 correções de bugs achados pelos testes |

### 8. Se algo der errado

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Dezenas de falhas no backend, com `500` ou `.map is not a function` | Docker/banco parado | `docker compose up -d` e esperar o `db` ficar `healthy` |
| `bad option: --experimental-test-module-mocks` | Node antigo | Usar Node 22+ |
| `database "studysync_test" does not exist` | Banco de testes não criado | Rodar o passo 1 |
| E2E falha logo no cadastro | Limite de 20 cadastros/logins por minuto | Esperar 1 minuto |
| E2E não abre a página | Frontend ou backend fora do ar | Conferir http://localhost:5173 e http://localhost:3000/api/health |
| `Executable doesn't exist` no Playwright | Chromium não instalado | `cd e2e; npx playwright install chromium; cd ..` |

---

## 📱 Tutorial Rápido — Funcionalidades

1. **Cadastro / Login** (`/cadastro`, `/login`) — crie uma conta com nome, e-mail e senha. Cada conta só enxerga os próprios dados (provas, trabalhos e hábitos de outro estudante nunca aparecem).
2. **Meu Dia** (`/`) — visão do dia: checklist de hábitos e a seção **🚨 Urgentes**, que reúne provas/trabalhos com o alarme já ativo, marcando em vermelho "Atrasado" quando o prazo passou sem o item ser concluído.
3. **Provas** (`/provas`) — cadastro com disciplina, peso e data da prova. O campo "alarme" é opcional: se deixado em branco, o sistema sugere automaticamente uma data alguns dias antes do prazo.
4. **Trabalhos** (`/trabalhos`) — trabalhos em grupo com membros (nome + parte de que cada um é responsável), status (pendente / em andamento / concluído) e links úteis (enunciados, materiais de apoio).
5. **Hábitos** (`/habitos`) — tarefas recorrentes (diárias ou semanais) com checklist que reseta sozinho à meia-noite (fuso de Brasília); os semanais resetam toda segunda-feira.
6. **Calendário** (`/calendario`) — visão mensal e semanal de tudo, com filtros por tipo (prova / trabalho / hábito).
7. **Configurações** (`/configuracoes`) — liga/desliga, individualmente, o lembrete diário por e-mail e o aviso de itens que entraram em "Urgentes".

---

## 🤖 Regras de IA do Projeto

Este repositório possui diretrizes estritas que qualquer LLM ou Agente de IA que gerar/alterar código **deve** seguir, baseadas na documentação oficial da disciplina.
As regras completas para IAs estão localizadas em: **[AI_RULES.md](./AI_RULES.md)** (também replicadas em arquivos como `.cursorrules` e `.clinerules`).

*Principais regras:* Commits com máximo de 100 LOC (exceto com justificativa documentada), uso obrigatório de **Conventional Commits**, geração de código legível e limpo voltado para aprovação humana e não perder tempo criando testes automatizados no escopo do TP1.
