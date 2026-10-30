# ServiceDesk

Protótipo de central de atendimento feito com Angular e TypeScript. Permite abrir e acompanhar tickets no navegador, organizar uma fila demonstrativa de suporte e importar publicações do JSONPlaceholder como dados fictícios.

## Funcionalidades

- Painel com total de tickets, status operacionais e tickets críticos.
- Abertura de tickets com validação de campos, e-mail e feedback de criação.
- Consulta com pesquisa por título, descrição, solicitante ou ID; filtros combinados por status, prioridade e categoria; ordenação e paginação.
- Página de detalhes com dados do solicitante, responsável, datas e histórico completo.
- Alteração de status e prioridade, atribuição de agente, comentários, resolução, fechamento e exclusão local.
- Fila de atendimento com visualizações de todos os tickets, tickets atribuídos ao agente demonstrativo e tickets sem responsável.
- Importação idempotente de publicações do JSONPlaceholder, preservando tickets locais e identificando a origem demonstrativa.
- Persistência versionada em `localStorage`, com validação ao recuperar dados e proteção contra sobrescrita de conteúdo corrompido ou incompatível.
- Páginas legadas de consulta às publicações mantidas em `/posts` e `/posts/:id`.

## Tecnologias

- Angular 21, componentes standalone, Router e formulários reativos.
- TypeScript em modo estrito e RxJS.
- Vitest pelo executor de testes do Angular CLI.
- Playwright Test para fluxos ponta a ponta em Chromium.
- JSONPlaceholder como fonte externa somente de leitura para os dados de demonstração.

Não foram adicionadas dependências para implementar o ServiceDesk.

## Instalação e execução

Requisitos: Node.js compatível com Angular 21 e npm. Na raiz do projeto:

```bash
npm install
npm start
```

A aplicação fica disponível em `http://localhost:4200/`. A rota inicial abre o painel. A importação de exemplos exige conexão com a internet, pois consulta `GET https://jsonplaceholder.typicode.com/posts`.

## Rotas principais

| Rota                    | Conteúdo                                               |
| ----------------------- | ------------------------------------------------------ |
| `/dashboard`            | Indicadores, tickets recentes e importação de exemplos |
| `/tickets`              | Pesquisa, filtros, ordenação e paginação               |
| `/tickets/new`          | Formulário para abrir um ticket                        |
| `/tickets/:id`          | Detalhes, histórico e ações do atendimento             |
| `/service`              | Fila de atendimento demonstrativa                      |
| `/posts` e `/posts/:id` | Consulta legada das publicações da API                 |

## Modelo e comportamento dos dados

Um ticket possui identificador, título, descrição, solicitante, e-mail, categoria, prioridade, status, responsável opcional, datas de criação e atualização, origem e histórico de eventos. As categorias são Hardware, Software, Rede, Acesso e permissões e Outros. As prioridades são Baixa, Média, Alta e Crítica. Os status são Aberto, Em atendimento, Aguardando solicitante, Resolvido e Fechado.

Criação, mudança de status ou prioridade, atribuição, comentários, resolução e fechamento atualizam `updatedAt` e acrescentam um evento ao histórico. As operações passam pelo `TicketService`; as páginas não acessam diretamente `localStorage` nem `HttpClient`.

## JSONPlaceholder e persistência

A aplicação consulta somente `GET /posts` para importar dados e mantém `GET /posts` e `GET /posts/:id` nas páginas legadas. O mapeamento transforma o `id` da publicação em referência externa, `title` em título, `body` em descrição e `userId` em uma referência de solicitante demonstrativo. Categoria, prioridade, status inicial, e-mail fictício e datas são dados gerados pela aplicação; não são apresentados como informações fornecidas pela API.

As publicações importadas recebem origem `jsonplaceholder` e referência `externalPostId`. Uma nova importação ignora referências já importadas e não altera tickets locais. O sistema não usa POST, PUT, PATCH ou DELETE no JSONPlaceholder.

Tickets e alterações ficam na chave versionada `ng-servicedesk.tickets` do `localStorage` do navegador. Eles não são sincronizados entre navegadores ou dispositivos. Se os dados forem inválidos ou incompatíveis, o sistema preserva o conteúdo e bloqueia alterações que poderiam sobrescrevê-lo.

## Limitações do protótipo

- Não há backend, autenticação, autorização ou compartilhamento de tickets.
- O perfil ativo é fixo e fictício: John Doe, agente de suporte.
- Os registros importados são publicações demonstrativas, não chamados reais; alguns campos do ticket são valores fictícios criados para permitir a demonstração do fluxo.
- A aplicação não envia notificações e não substitui um ServiceDesk de produção.

## Arquitetura

```text
src/app/
├── core/
│   ├── data/                   # Atores demonstrativos
│   ├── models/                 # Tipos, fábrica e validação de Ticket
│   └── services/               # Abstração do armazenamento local
├── features/
│   └── tickets/
│       ├── components/         # Paginação
│       ├── pages/              # Dashboard, lista, formulário, detalhe e fila
│       └── services/           # API, importação, repositório e regras de tickets
└── shared/
    ├── components/             # Espaço reservado para componentes compartilhados
    └── pipes/                  # Espaço reservado para pipes compartilhados
```

`PostApiService` cuida da consulta externa e valida as respostas como `unknown`. `DemoPostImportService` converte publicações em tickets demonstrativos. `TicketRepositoryService` isola a persistência local e `TicketService` centraliza as operações e o histórico. As páginas usam esses serviços e apresentam os estados resultantes.

## Testes e build

```bash
npm test -- --watch=false
npm run build
```

Os testes unitários e de integração usam respostas e armazenamento simulados; não dependem da disponibilidade do JSONPlaceholder. A suíte cobre os modelos, validação e persistência, importação, serviço HTTP, navegação legada, filtros, ordenação, paginação e fluxos de tela. Os testes E2E usam Chromium e interceptam a resposta da API.

### Testes ponta a ponta

Instale o Chromium usado pelo Playwright uma vez e execute os fluxos no navegador:

```bash
npm run test:e2e:install
npm run test:e2e
```

O Playwright inicia o servidor Angular durante a execução. Os testes cobrem abertura e validação, atualização e persistência do histórico, pesquisa/filtros/ordenação/paginação, fila de atendimento e importação idempotente. A resposta de `/posts` é interceptada dentro do teste, portanto os fluxos E2E não dependem de acesso ao JSONPlaceholder. Para acompanhar os passos interativamente, use `npm run test:e2e:ui`.
