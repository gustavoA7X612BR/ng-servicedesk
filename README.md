# ServiceDesk

Aplicação de demonstração construída com Angular. Ela consulta publicações fictícias do [JSONPlaceholder](https://jsonplaceholder.typicode.com/) para demonstrar uma listagem pesquisável e paginada e uma página de detalhes. Os registros não representam chamados reais de suporte.

## Funcionalidades

- Listagem de publicações com pesquisa por título, ordenação por ID e paginação local.
- Exibição dos detalhes de uma publicação pela rota `/posts/:id`.
- Estados de carregamento, lista vazia, registro não encontrado e falha de consulta.
- Validação em tempo de execução das respostas recebidas da API.

## Tecnologias

- Angular 21 e TypeScript em modo estrito.
- Angular Router e `HttpClient`.
- RxJS para consultas e controle do ciclo de vida das inscrições.
- Vitest pelo executor de testes do Angular CLI.

## Pré-requisitos e instalação

Instale Node.js e npm em versões compatíveis com Angular 21. O projeto declara `npm@11.11.0` como gerenciador e inclui `package-lock.json`.

Na raiz do repositório, instale as dependências:

```bash
npm install
```

## Executar localmente

```bash
npm start
```

Abra [http://localhost:4200/](http://localhost:4200/). A rota inicial mostra a listagem. Selecione o título de uma publicação para abrir `/posts/:id`.

## Testes e build

Execute os testes em modo não interativo:

```bash
npm test -- --watch=false
```

O projeto contém testes unitários do serviço HTTP, testes das páginas e do componente de paginação, além de um teste de navegação entre listagem e detalhes. Os testes substituem a API por respostas locais simuladas e não dependem da disponibilidade do JSONPlaceholder. Não há configuração de testes end-to-end neste momento.

Gere o build de produção:

```bash
npm run build
```

## Arquitetura e organização

```text
src/app/
├── core/
│   ├── models/                 # Contrato TypeScript da publicação
│   └── services/               # Serviços transversais, quando necessários
├── features/
│   └── tickets/
│       ├── components/         # Componentes específicos da funcionalidade
│       ├── pages/              # PostsListPage e PostDetailPage
│       └── services/           # PostApiService e seus testes
└── shared/
    ├── components/             # Componentes compartilhados, quando necessários
    └── pipes/                  # Pipes compartilhados, quando necessários
```

As páginas coordenam os estados e a apresentação. `PostApiService` concentra as chamadas HTTP e valida o formato dos dados antes de retorná-los aos modelos internos. A paginação, por enquanto, é um componente de apresentação específico da funcionalidade de publicações.

## Integração com JSONPlaceholder

A aplicação consulta somente:

- `GET https://jsonplaceholder.typicode.com/posts` para a listagem.
- `GET https://jsonplaceholder.typicode.com/posts/:id` para os detalhes.

Cada publicação usa os campos `userId` e `id` (números), `title` e `body` (strings). Respostas fora desse formato geram `InvalidPostPayloadError`; falhas HTTP permanecem erros HTTP, incluindo o status 404.

A listagem carrega a coleção e aplica pesquisa, ordenação por ID e paginação no cliente. As publicações do JSONPlaceholder são fictícias. Embora o serviço aceite operações de escrita simuladas, este projeto não as utiliza e não apresenta alterações persistidas.

## Limitações dos dados demonstrativos

Os registros são publicações de exemplo, não chamados reais. A API não fornece status, prioridade, categoria, responsável ou datas de abertura para esses dados. A aplicação não implementa autenticação, gravação de alterações nem integração com serviços externos de notificação.
