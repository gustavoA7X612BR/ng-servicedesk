# ServiceDesk — Requisitos do protótipo

**Versão:** 3.0  
**Sistema:** ServiceDesk demonstrativo

## 1. Atores e limites

- **Solicitante:** registra solicitações de suporte.
- **Agente de suporte:** consulta, organiza e atualiza tickets.
- **Administrador:** ator fictício reservado para evolução futura.

O protótipo não implementa autenticação ou autorização. A interface usa um perfil de agente demonstrativo fixo. Não existe backend; tickets e alterações ficam no armazenamento local do navegador.

## 2. Requisitos funcionais

### 2.1. Abertura e consulta

- **RF-001.** Permitir criar tickets com título, descrição, nome e e-mail do solicitante, categoria e prioridade.
- **RF-002.** Validar campos obrigatórios e formato do e-mail, apresentar mensagens claras e levar o usuário aos detalhes após salvar.
- **RF-003.** Permitir pesquisar tickets por título, descrição, solicitante e identificador.
- **RF-004.** Permitir filtrar por status, prioridade e categoria em combinação.
- **RF-005.** Permitir ordenar por data de criação ou prioridade e navegar entre páginas.
- **RF-006.** Informar totais geral e filtrado, além de diferenciar lista vazia de pesquisa sem resultados.
- **RF-007.** Exibir detalhes do ticket e seu histórico completo de eventos.

### 2.2. Acompanhamento e atendimento

- **RF-008.** Permitir alterar status e prioridade do ticket.
- **RF-009.** Permitir atribuir ou remover o agente responsável.
- **RF-010.** Permitir incluir comentários, resolver e fechar o ticket.
- **RF-011.** Registrar criação e cada alteração em um histórico com tipo, descrição, autor e data.
- **RF-012.** Disponibilizar fila com todos os tickets, tickets atribuídos ao agente ativo e tickets sem responsável.
- **RF-013.** Permitir ao agente atribuir tickets a si e atualizar seu status pela fila.
- **RF-014.** Apresentar no painel total de tickets, abertos, em atendimento, aguardando solicitante, resolvidos e críticos.

### 2.3. Dados demonstrativos

- **RF-015.** Permitir importar publicações por `GET /posts` do JSONPlaceholder como tickets demonstrativos.
- **RF-016.** Identificar a origem importada e evitar importar novamente uma referência já presente.
- **RF-017.** Preservar tickets criados localmente durante importações.
- **RF-018.** Manter a consulta de publicações em `/posts` e `/posts/:id` para compatibilidade com o fluxo demonstrativo anterior.

## 3. Modelo e regras de negócio

O modelo `Ticket` possui identificador, título, descrição, solicitante, e-mail, categoria, prioridade, status, agente opcional, datas de criação e atualização, origem e histórico.

Categorias: Hardware, Software, Rede, Acesso e permissões e Outros. Prioridades: Baixa, Média, Alta e Crítica. Status: Aberto, Em atendimento, Aguardando solicitante, Resolvido e Fechado.

- **RN-001.** Novos tickets locais recebem status Aberto e um evento de criação.
- **RN-002.** Toda alteração de atendimento atualiza `updatedAt` e registra um evento com autor e data.
- **RN-003.** A ordenação opera sobre uma cópia da coleção para não modificar o estado mantido pelo serviço.
- **RN-004.** Pesquisa, filtros, ordenação e paginação operam sobre os tickets carregados localmente; uma alteração dos critérios volta à primeira página.
- **RN-005.** Na importação, `id` da publicação é guardado como referência externa, `title` como título, `body` como descrição e `userId` como referência do solicitante demonstrativo.
- **RN-006.** Status, prioridade, categoria, responsável, e-mail fictício e datas gerados para demonstração não são descritos como dados fornecidos pelo JSONPlaceholder.
- **RN-007.** Operações locais não usam POST, PUT, PATCH ou DELETE na API externa.

## 4. Persistência e erros

- **RNF-001.** Persistir tickets em `localStorage` com envelope versionado.
- **RNF-002.** Validar a estrutura recuperada antes de disponibilizá-la à aplicação.
- **RNF-003.** Preservar valores corrompidos ou incompatíveis e bloquear gravações que poderiam sobrescrevê-los.
- **RNF-004.** Tratar indisponibilidade do armazenamento e falhas HTTP com mensagens de interface.
- **RNF-005.** O armazenamento é local ao navegador e não oferece sincronização entre dispositivos.

## 5. Interface e acessibilidade

- **RNF-006.** Implementar com Angular e TypeScript strict, sem backend próprio ou dependências de validação adicionais.
- **RNF-007.** Disponibilizar navegação lateral, painel, lista, formulário, detalhes e fila em desktop e dispositivos móveis.
- **RNF-008.** Usar elementos semânticos, rótulos visíveis, estados acessíveis, foco visível e controles operáveis por teclado.
- **RNF-009.** Distinguir status e prioridade visualmente e manter contraste e hierarquia de leitura.
- **RNF-010.** Permitir testes automatizados sem depender de disponibilidade externa da API.

## 6. Limitações

Este protótipo não implementa autenticação, autorização, backend, sincronização, notificações externas ou dados reais de suporte. Os agentes são fictícios e o perfil ativo é fixo. O JSONPlaceholder é somente a fonte de publicações demonstrativas; a persistência de tickets ocorre exclusivamente no navegador.
