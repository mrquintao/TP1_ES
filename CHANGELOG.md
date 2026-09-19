# 📈 Progresso do TP1 - StudySync (Changelog & To-Do)

Marquem com um `[x]` as tarefas e histórias de usuário que já foram implementadas. O que o **Guilherme** e as IAs já fizeram está marcado abaixo.

## 📖 Histórias de Usuário (Features)

- [x] **História 1:** Registrar provas com disciplina e peso, com contagem regressiva automática. *(Concluído: Backend CRUD e Página "Provas")*
- [x] **História 2:** Cadastrar trabalhos em grupo e identificar os membros. *(Concluído: Backend CRUD e Página "Trabalhos")*
- [x] **História 3:** Configurar hábitos e tarefas recorrentes para acompanhamento num checklist diário. *(Concluído: Backend CRUD e Página "Hábitos")*
- [x] **História 5:** Acessar abas dedicadas como "Meu Dia" e "Próximas Provas". *(Concluído: Página "Home / Meu Dia")*
- [ ] **História 4:** Visualizar compromissos em um calendário interativo com filtros por cor.
- [ ] **História 6:** Receber alertas e notificações programadas via e-mail ou app.
- [ ] **História 7:** Anexar links úteis e diretrizes dos professores aos trabalhos. *(Modelagem do DB já suporta, falta finalizar na UI)*
- [ ] **História 8:** Checklist de hábitos reseta automaticamente à meia-noite. *(Rota `/api/habitos/reset` pronta no backend, falta o cron job/agendador para disparar sozinho)*

## 🛠️ Infraestrutura, Base e Integração

- [x] Repositório inicializado, `.gitignore` e `README.md` configurados.
- [x] Definição estrita das Regras de IA (`AI_RULES.md`, `.cursorrules`, etc.).
- [x] Estrutura Monorepo (pastas `frontend/` e `backend/`).
- [x] Ambiente de dev via Docker Compose (`docker-compose.yml` e scripts de healthcheck).
- [x] Banco de dados PostgreSQL configurado com Prisma ORM e Schema montado.
- [x] Backend Scaffolded (Node.js + Fastify + CORS).
- [x] Frontend Scaffolded (React + Vite + Tailwind CSS).
- [x] Integração API: Frontend consumindo o Backend via Axios (`services/api.js`).
- [x] Roteamento de telas no Frontend (`react-router-dom`).
- [ ] Sistema de Autenticação de Usuários (Login/Cadastro com JWT e vinculação de dados ao usuário).

## 📐 Documentação de Engenharia de Software

- [x] Nome dos membros e objetivo do sistema descritos no README.
- [x] Regras da disciplina incorporadas (limite de 100 LOC/commit, Conventional Commits).
- [x] Diagrama de Casos de Uso preliminar incluído no README (sintaxe Mermaid).
- [x] Diagrama de Classes preliminar incluído no README (sintaxe Mermaid).
