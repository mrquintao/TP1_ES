# Regras para IAs e Agentes de Código

Ao codificar, alterar ou interagir com este repositório, você (IA) deve **estritamente** seguir as regras estabelecidas para o trabalho prático (TP1) de Engenharia de Software:

1. **Tamanho Máximo de Commits:** O limite para qualquer commit é de **100 Linhas de Código (LOC)**. 
   - *Atenção:* Se houver uma necessidade absoluta de ultrapassar esse limite, você **deve** incluir a justificativa detalhada na própria mensagem do commit. Divida o trabalho em commits menores sempre que possível.

2. **Padrão de Commits:** Siga rigorosamente o padrão **Conventional Commits** em todas as mensagens.
   - *Exemplos válidos:* `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`, `style: ...`, `test: ...`, `perf: ...`, `build: ...`, `chore: ...`, `revert: ...`.

3. **Foco na Legibilidade e Aprendizado Humano:** Todo o código gerado será revisado e precisa ser compreendido pelos membros do grupo (já que todos devem dominar a arquitetura, o banco de dados, etc.). 
   - Produza código limpo e adicione comentários úteis em lógicas complexas para facilitar a aprovação do grupo.

4. **UML no README:** O arquivo `README.md` deve conter uma documentação preliminar em UML.
   - Utilize obrigatoriamente a sintaxe **Mermaid**.
   - Inclua **pelo menos dois tipos diferentes de diagramas** (ex: Caso de Uso, Classes, Sequência, etc). Sempre que alterar a arquitetura, atualize os diagramas no README se necessário.

5. **Testes Automatizados:** Para este primeiro escopo (TP1), testes automatizados serão **desconsiderados**. Concentre-se nas funcionalidades e na interface web (Backend + API + DB e Frontend Web).

6. **⚠️ OBRIGATÓRIO: Testar ANTES de fazer Push:** Nenhum `git push` pode ser executado sem que a IA tenha **rodado e verificado** o projeto antes. Antes de qualquer push, você **DEVE** executar no mínimo:
   - `npm install` no backend e no frontend (garantir que as dependências instalam sem erro).
   - `npx vite build` no frontend (garantir que compila com 0 erros).
   - `npx prisma generate` no backend (garantir que o Prisma Client é gerado).
   - Se o Docker Desktop estiver disponível: `docker-compose up --build` (garantir que todos os serviços sobem).
   - Verificar que o dev server do frontend abre corretamente (`http://localhost:5173`).
   - **Se qualquer etapa falhar, corrija o problema ANTES de fazer push.** Nunca envie código quebrado para o repositório remoto. Os companheiros de equipe dependem de um código funcional.
