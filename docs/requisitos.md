# ServiceDesk — Especificação de Requisitos Funcionais

**Versão:** 2.0  
**Sistema:** ServiceDesk

## 1. Atores

- **Solicitante:** usuário responsável por registrar uma solicitação de suporte.
- **Agente de suporte:** usuário responsável por executar atividades de atendimento.
- **Administrador:** usuário responsável por administrar a configuração do sistema.

**Nota de escopo:** os atores são mantidos conforme a definição original. O MVP não implementará autenticação ou operações de escrita na API. As funcionalidades disponíveis serão restritas à consulta dos registros fornecidos pelo JSONPlaceholder.

## 2. Requisitos funcionais

### 2.1. Consulta de chamados

**RF-001.** O sistema deverá permitir ao agente de suporte consultar a lista de registros disponibilizados pela API.

- **RF-001.1.** O sistema deverá permitir ao agente de suporte pesquisar registros pelo título.
- **RF-001.2.** O sistema deverá permitir ao agente de suporte ordenar a lista de registros pelo identificador.
- **RF-001.3.** O sistema deverá permitir ao agente de suporte navegar entre as páginas da lista de registros.
- **RF-001.4.** O sistema deverá informar ao usuário quando a consulta não retornar registros.
- **RF-001.5.** O sistema deverá informar ao usuário quando ocorrer uma falha na consulta.

**RF-002.** O sistema deverá permitir ao agente de suporte consultar um registro pelo seu identificador.

### 2.2. Indicadores operacionais

**RF-003.** O sistema deverá permitir ao agente de suporte consultar a quantidade de registros disponibilizados pela API.

- **RF-003.1.** O sistema deverá apresentar a quantidade de registros retornados pela consulta.
- **RF-003.2.** O sistema deverá apresentar a quantidade de resultados correspondentes aos critérios de pesquisa aplicados, quando houver pesquisa.

### 2.3. Navegação e feedback

**RF-004.** O sistema deverá permitir ao agente de suporte acessar a página de detalhes de um registro a partir de sua identificação na lista.

**RF-005.** O sistema deverá informar ao usuário quando a consulta de detalhes não encontrar um registro correspondente ao identificador informado.

**RF-006.** O sistema deverá informar ao usuário quando ocorrer uma falha na consulta de detalhes.

## 3. Regras de negócio

**RN-001.** O identificador de cada registro deverá corresponder ao campo `id` disponibilizado pela API.

**RN-002.** O título de cada registro deverá corresponder ao campo `title` disponibilizado pela API.

**RN-003.** A descrição apresentada nos detalhes de cada registro deverá corresponder ao campo `body` disponibilizado pela API.

**RN-004.** O identificador do usuário associado a cada registro deverá corresponder ao campo `userId` disponibilizado pela API.

**RN-005.** A pesquisa pelo título deverá considerar os registros carregados pela aplicação.

**RN-006.** A ordenação deverá utilizar os valores do campo selecionado nos registros carregados.

**RN-007.** A paginação deverá operar sobre o conjunto de registros definido para a listagem.

**RN-008.** O sistema não deverá apresentar status, prioridade, categoria, responsável ou datas de abertura como dados fornecidos pela API quando esses campos não estiverem disponíveis na resposta.

**RN-009.** O sistema deverá distinguir uma consulta concluída sem resultados de uma consulta que tenha falhado.

## 4. Requisitos não funcionais

**RNF-001.** O sistema deverá ser implementado com Angular e TypeScript.

**RNF-002.** O sistema deverá utilizar o modo estrito do TypeScript.

**RNF-003.** O sistema deverá disponibilizar uma interface responsiva para navegadores desktop e dispositivos móveis.

**RNF-004.** O sistema deverá permitir a navegação por teclado nas funcionalidades operacionais.

**RNF-005.** O sistema deverá apresentar uma indicação visual de carregamento durante uma consulta assíncrona em andamento.

**RNF-006.** O sistema deverá tratar falhas HTTP sem interromper a execução da aplicação.

**RNF-007.** O sistema deverá permitir a execução automatizada de testes unitários, de componentes e de integração.

**RNF-008.** Os testes automatizados não deverão depender da disponibilidade de uma API externa.

**RNF-009.** O repositório deverá conter instruções para instalação, execução e teste da aplicação.

## 5. Restrições do MVP

**RE-001.** O MVP não deverá exigir autenticação real para executar os fluxos de demonstração.

**RE-002.** O MVP deverá utilizar dados fictícios para representar os atores do sistema.

**RE-003.** O MVP deverá limitar as operações sobre os registros às funcionalidades de consulta, pesquisa, ordenação e paginação.

**RE-004.** O MVP não deverá apresentar operações simuladas como operações persistidas em um servidor remoto.

**RE-005.** O MVP não deverá implementar integração com serviços de notificação externos.

**RE-006.** O MVP deverá utilizar o JSONPlaceholder como fonte externa dos registros consultados.

**RE-007.** O MVP deverá tratar os registros da API como publicações utilizadas para demonstração, sem afirmar que representam chamados reais de suporte.
