# 🏭 Sistema de Etiquetagem e Controle de Produção

API REST desenvolvida em **Node.js, Express, Prisma ORM e SQLite** para registrar peças produzidas, controlar ordens de produção e gerenciar os registros de etiquetas associados a cada peça.

O projeto está sendo desenvolvido para automatizar o registro da produção ao final da linha industrial, preparando a integração com um CLP Siemens LOGO! e com o sistema de etiquetagem já utilizado pela empresa.

## 📌 Sumário

* [Sobre o projeto](#-sobre-o-projeto)
* [Objetivos](#-objetivos)
* [Tecnologias utilizadas](#-tecnologias-utilizadas)
* [Arquitetura do sistema](#-arquitetura-do-sistema)
* [Estrutura do projeto](#-estrutura-do-projeto)
* [Pré-requisitos](#-pré-requisitos)
* [Instalação e execução](#-instalação-e-execução)
* [Rotas da API](#-rotas-da-api)
* [Testes com Postman](#-testes-com-postman)
* [Regras de negócio validadas](#-regras-de-negócio-validadas)
* [Modelo de dados](#-modelo-de-dados)
* [Dashboard](#-dashboard)
* [Estado atual do projeto](#-estado-atual-do-projeto)
* [Próximas etapas](#-próximas-etapas)

## 📖 Sobre o projeto

O Sistema de Etiquetagem e Controle de Produção tem como finalidade centralizar o registro das peças produzidas e acompanhar o andamento das ordens de produção.

Atualmente, o sistema de etiquetagem da empresa já possui um modelo de etiqueta configurado e utiliza uma impressora Zebra. O objetivo deste projeto não é recriar esse modelo, mas desenvolver uma API capaz de receber os eventos de produção, armazenar as informações no banco de dados e preparar a comunicação com o sistema de etiquetagem existente.

A proposta é reduzir a dependência de ações manuais no final da linha de produção, permitindo que a conclusão de uma peça seja detectada pelo CLP e registrada automaticamente no sistema.

**Importante:** a API e o dashboard estão em desenvolvimento. Os testes atuais utilizam requisições simuladas pelo Postman; a comunicação física com o CLP e a integração com o sistema de impressão ainda precisam ser implementadas e validadas.

## 🎯 Objetivos

* Registrar ordens de produção e associá-las aos respectivos produtos.
* Controlar o status das ordens de produção.
* Registrar a quantidade de peças produzidas.
* Associar cada registro de produção à ordem correspondente.
* Criar registros de etiquetas vinculados à produção.
* Impedir o registro de produção em ordens já concluídas.
* Evitar duplicidade quando um evento identificado é enviado novamente.
* Atualizar automaticamente o andamento das ordens de produção.
* Disponibilizar informações para um dashboard de acompanhamento.
* Preparar a integração futura com um CLP Siemens LOGO! e com o sistema de etiquetagem existente.

## 🛠️ Tecnologias utilizadas

| Tecnologia   | Finalidade                                             |
| ------------ | ------------------------------------------------------ |
| Node.js      | Ambiente de execução JavaScript no servidor            |
| Express.js   | Criação do servidor HTTP e das rotas REST              |
| Prisma ORM   | Acesso e manipulação dos dados do banco                |
| SQLite       | Banco de dados relacional utilizado no desenvolvimento |
| JavaScript   | Implementação da API e do dashboard                    |
| HTML e CSS   | Estrutura e apresentação da interface                  |
| Postman      | Testes das requisições HTTP                            |
| Git e GitHub | Versionamento e hospedagem do código                   |

## 🔄 Arquitetura do sistema

O fluxo planejado para o ambiente industrial é:

```text
CLP Siemens LOGO!
        |
        | Detecta a conclusão de uma peça
        v
API REST - Node.js / Express
        |
        | Valida o evento e registra a produção
        v
Banco de dados - SQLite / Prisma
        |
        | Disponibiliza os registros
        v
Dashboard de produção

Integração futura:
API REST -> Sistema de etiquetagem existente -> Impressora Zebra
```

O dashboard consulta a API para exibir as informações de produção. A integração com o CLP e com o sistema de impressão será desenvolvida em etapas separadas.

## 📁 Estrutura do projeto

A organização geral do projeto inclui os seguintes diretórios e arquivos:

```text
sistema-etiquetas/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── index.html
│   ├── registro-op.html
│   ├── detalhes-op.html
│   └── js/
│       ├── app.js
│       ├── registro-op.js
│       └── detalhes-op.js
├── src/
│   ├── controllers/
│   │   ├── ordens.controller.js
│   │   └── producoes.controller.js
│   ├── database/
│   │   └── prisma/
│   ├── routes/
│   │   ├── ordens.router.js
│   │   └── producoes.router.js
│   ├── services/
│   │   ├── ordens.service.js
│   │   └── producoes.service.js
│   └── app.js
├── prisma.config.ts
├── server.js
├── package.json
├── package-lock.json
└── .gitignore
```

*Observação: a estrutura acima representa a organização geral do projeto; os nomes e caminhos devem ser ajustados caso tenham sido alterados no repositório.*

## ⚙️ Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

* [Node.js](https://nodejs.org/)
* npm, instalado junto com o Node.js
* [Git](https://git-scm.com/), para clonar o repositório
* [Postman](https://www.postman.com/), para testar as rotas

## 🚀 Instalação e execução

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
cd sistema-etiquetas
```

Substitua `URL_DO_REPOSITORIO` pela URL real do repositório GitHub.

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar o banco de dados

O projeto utiliza SQLite e Prisma. Configure o arquivo `.env` de acordo com a configuração local do projeto.

Exemplo de URL utilizada no desenvolvimento:

```env
DATABASE_URL="file:./dev.db"
```

O projeto também utiliza `prisma.config.ts`, conforme a configuração do Prisma 7.

**Atenção:** a localização efetiva do arquivo do banco depende da configuração do Prisma. Confira o arquivo `prisma.config.ts` antes de criar ou migrar o banco.

### 4. Gerar o Prisma Client

```bash
npx prisma generate
```

### 5. Aplicar as migrações

Em um ambiente de desenvolvimento com as migrações existentes:

```bash
npx prisma migrate dev
```

Não utilize comandos de reset do banco sem necessidade: eles podem apagar os dados existentes.

### 6. Iniciar o servidor

```bash
node server.js
```

Quando iniciado corretamente, o servidor informa que está disponível em:

```text
http://localhost:3000
```

A partir daí, as rotas podem ser testadas pelo Postman e o dashboard pode ser acessado pelo navegador, conforme a configuração de arquivos estáticos do servidor.

## 🌐 Rotas da API

As rotas abaixo correspondem aos endpoints implementados e utilizados nos testes do projeto.

Todas as requisições que enviam JSON devem utilizar o cabeçalho:

```http
Content-Type: application/json
```

### 1. Verificar o servidor

**GET `/`**

Verifica se a API está funcionando.

Exemplo de resposta:

```json
{
  "sistema": "Sistema de Etiquetagem",
  "status": "online"
}
```

### 2. Listar ordens de produção

**GET `/api/ordens`**

Retorna as ordens de produção cadastradas, incluindo os dados do produto relacionado.

Utilizada pelo dashboard para consultar as ordens e acompanhar seus status.

**Exemplo de uso:**

```http
GET http://localhost:3000/api/ordens
```

### 3. Cadastrar uma ordem de produção

**POST `/api/ordens`**

Cria uma nova ordem de produção associada a um produto cadastrado.

Exemplo de corpo da requisição, considerando os campos utilizados pelo serviço:

```json
{
  "quantidade": 10,
  "status": "EM_PRODUCAO",
  "produtoId": 1
}
```

O `produtoId` deve corresponder a um produto existente no banco.

O serviço gera o número da ordem a partir do ID criado no banco, seguindo o padrão `OP-001`, `OP-002` e assim por diante.

Se já existir outra ordem com status `EM_PRODUCAO`, uma nova ordem solicitando esse mesmo status deve ser recusada.

### 4. Listar registros de produção

**GET `/api/producoes`**

Retorna os registros de produção, incluindo a ordem de produção associada e as etiquetas vinculadas.

**Exemplo de uso:**

```http
GET http://localhost:3000/api/producoes
```

Essa rota é utilizada pelo dashboard para calcular a quantidade produzida e exibir o histórico de produção de cada ordem.

### 5. Registrar uma produção finalizada

**POST `/api/producoes`**

Registra uma produção associada a uma ordem de produção e cria o registro de etiqueta correspondente.

Exemplo de requisição:

```json
{
  "quantidade": 1,
  "ordemProducaoId": 2,
  "eventoId": "LOGO-EVENTO-000127"
}
```

**Descrição dos campos:**

| Campo             | Descrição                                           |
| ----------------- | --------------------------------------------------- |
| `quantidade`      | Quantidade de peças representada pelo evento        |
| `ordemProducaoId` | ID da ordem de produção no banco de dados           |
| `eventoId`        | Identificador único e estável do evento de produção |

No cenário previsto para a integração industrial, cada evento válido de conclusão representará uma peça, com `quantidade: 1`.

O `eventoId` do exemplo é ilustrativo. Ele deverá ser gerado pela origem do evento ou por um mecanismo intermediário confiável, não inventado novamente pela API a cada recebimento.

**Respostas esperadas:**

* `201 Created`: novo evento registrado com sucesso.
* `200 OK`: evento já registrado anteriormente, reconhecido como duplicado.
* `400 Bad Request`: erro de validação ou tentativa de registrar produção em uma ordem que não pode receber novas peças.

A resposta exata em caso de erro depende da validação acionada pelo serviço.

## 🧪 Testes com Postman

Os testes foram realizados utilizando o Postman para simular requisições que futuramente poderão ser enviadas pelo CLP.

### Teste 1 — Consultar ordens

```http
GET http://localhost:3000/api/ordens
```

**Resultado validado:** a API retorna as ordens cadastradas e seus dados relacionados.

### Teste 2 — Cadastrar ordem de produção

```http
POST http://localhost:3000/api/ordens
```

Exemplo de corpo:

```json
{
  "quantidade": 10,
  "status": "EM_PRODUCAO",
  "produtoId": 1
}
```

**Resultado validado:** o cadastro de ordem foi testado com sucesso, e o sistema gera seu número a partir do ID do registro.

### Teste 3 — Registrar uma peça

```http
POST http://localhost:3000/api/producoes
```

```json
{
  "quantidade": 1,
  "ordemProducaoId": 2,
  "eventoId": "TESTE-OP002-001"
}
```

**Resultado validado:** a API registrou a produção e criou uma etiqueta associada.

### Teste 4 — Reenviar o mesmo evento

Enviar novamente o mesmo corpo, mantendo exatamente o mesmo `eventoId`.

**Resultado validado:** a API retornou `200 OK` e não criou outro registro de produção nem outra etiqueta.

Esse teste comprova o comportamento de idempotência para eventos identificados: o mesmo evento não deve ser processado duas vezes.

### Teste 5 — Impedir produção em ordem concluída

Enviar um evento novo para uma ordem cujo status seja `CONCLUIDA`.

**Resultado validado:** a API retornou `400 Bad Request`, impedindo o registro de novas peças naquela ordem.

### Teste 6 — Concluir uma ordem e ativar a próxima

Foi testado o fluxo em que uma ordem atinge a quantidade prevista.

**Resultado validado:** a ordem que atingiu a meta passa para `CONCLUIDA`, e a próxima ordem que estiver aguardando passa para `EM_PRODUCAO`.

### Teste 7 — Consultar o histórico de produção

```http
GET http://localhost:3000/api/producoes
```

**Resultado validado:** a rota retornou os registros de produção e as etiquetas relacionadas, permitindo conferir os dados usados no dashboard.

> Os testes acima validam os fluxos descritos no ambiente de desenvolvimento. Eles não substituem testes de integração com o CLP, testes de carga ou validação em ambiente industrial.

## 📏 Regras de negócio validadas

### 1. Uma única ordem em produção

O sistema verifica se já existe uma ordem com status `EM_PRODUCAO`.

Uma nova ordem solicitando esse status não deve ser criada enquanto outra estiver ativa.

### 2. Numeração automática das ordens

As ordens recebem números no padrão:

```text
OP-001
OP-002
OP-003
```

O número é gerado a partir do ID do registro no banco, evitando depender de numeração manual.

### 3. Registro de produção vinculado a uma ordem

Cada registro de produção deve estar associado a uma ordem de produção existente.

A rota de registro utiliza o campo `ordemProducaoId` para identificar a ordem à qual a peça será vinculada.

### 4. Quantidade de produção válida

A quantidade deve ser um número inteiro positivo.

Valores inválidos, como zero, números negativos ou valores não inteiros, devem ser recusados pela validação do serviço.

### 5. Limite de produção por ordem

O sistema soma a quantidade já produzida e impede que uma nova produção ultrapasse a quantidade prevista na ordem.

### 6. Conclusão automática da ordem

Quando a quantidade produzida atinge a meta, o status da ordem muda para `CONCLUIDA`.

A ordem concluída permanece registrada no banco para consulta do histórico.

### 7. Ativação automática da próxima ordem

Ao concluir uma ordem, o sistema procura uma ordem com status `AGUARDANDO` e ativa a próxima conforme a ordem de cadastro prevista pela implementação.

### 8. Criação de etiqueta vinculada à produção

Ao registrar uma nova produção, o serviço cria um registro de etiqueta relacionado à produção.

A numeração das etiquetas segue um padrão como:

```text
ETQ-000001
ETQ-000002
ETQ-000003
```

Esses registros representam o controle de etiquetas no banco. A integração que efetivamente aciona a impressão física ainda precisa ser implementada.

### 9. Proteção contra eventos duplicados

O campo `eventoId` é opcional no modelo de dados, mas, quando fornecido, é usado como identificador único do evento.

O banco possui uma restrição de unicidade para esse campo. Quando um evento já processado é reenviado com o mesmo identificador, o sistema reconhece a duplicata e evita gerar uma nova produção ou etiqueta.

Essa proteção depende de a origem reutilizar o mesmo `eventoId` ao reenviar o mesmo evento.

### 10. Consistência das operações

O registro da produção, a criação da etiqueta e as atualizações relacionadas à ordem são executados por meio de uma transação de banco de dados.

A intenção é impedir que apenas parte das alterações seja persistida caso uma etapa falhe.

## 🗃️ Modelo de dados

O banco de dados utiliza quatro entidades principais.

### Produto

Armazena as informações dos produtos fabricados.

Campos principais:

* `id`
* `codigo`
* `nome`
* `descricao`

O código do produto é único.

### OrdemProducao

Representa uma ordem de produção.

Campos principais:

* `id`
* `numero`
* `quantidade`
* `status`
* `produtoId`

Cada ordem está associada a um produto.

### Producao

Representa um registro de produção.

Campos principais:

* `id`
* `quantidade`
* `dataHora`
* `eventoId`
* `ordemProducaoId`

O `id` é gerado pelo banco. Já o `eventoId` é usado para identificar o evento recebido e ajudar a impedir registros duplicados.

### Etiqueta

Representa uma etiqueta vinculada a um registro de produção.

Campos principais:

* `id`
* `codigo`
* `dataHora`
* `status`
* `producaoId`

O código da etiqueta é único, e cada etiqueta está associada a uma produção.

### Relacionamentos

```text
Produto
   |
   | 1:N
   v
OrdemProducao
   |
   | 1:N
   v
Producao
   |
   | 1:N
   v
Etiqueta
```

Um produto pode possuir várias ordens; uma ordem pode possuir vários registros de produção; e cada registro de produção pode possuir etiquetas relacionadas.

## 📊 Dashboard

O projeto possui uma interface web para consultar e acompanhar a produção.

As funcionalidades desenvolvidas incluem:

* Listagem das ordens de produção.
* Visualização dos detalhes de uma ordem.
* Exibição da quantidade produzida.
* Comparação entre quantidade produzida e quantidade prevista.
* Cálculo do percentual de conclusão.
* Exibição da quantidade restante.
* Histórico de produções e etiquetas relacionadas.
* Atualização periódica das informações a cada cinco segundos nas telas implementadas com esse mecanismo.

A atualização periódica consulta a API novamente para exibir os dados mais recentes. Isso não é uma conexão em tempo real por WebSocket, mas uma estratégia de consulta periódica (*polling*).

## ✅ Estado atual do projeto

### Implementado e testado

* [x] Servidor Node.js e Express em funcionamento.
* [x] Persistência de dados com Prisma e SQLite.
* [x] Cadastro e consulta de ordens de produção.
* [x] Consulta dos registros de produção.
* [x] Registro de produção por meio de requisição HTTP.
* [x] Criação de registros de etiquetas vinculados à produção.
* [x] Validação do status da ordem.
* [x] Impedimento de ultrapassar a quantidade prevista.
* [x] Conclusão automática de ordens.
* [x] Ativação da próxima ordem aguardando.
* [x] Tratamento de eventos repetidos com `eventoId`.
* [x] Consulta de dados pelo dashboard.
* [x] Atualização periódica das informações nas telas implementadas.
* [x] Versionamento do projeto com Git e GitHub.

### Ainda não integrado ou validado

* [ ] Comunicação física entre o CLP Siemens LOGO! e a API.
* [ ] Geração confiável de um identificador único para cada evento real do CLP.
* [ ] Tratamento de sinais contínuos, bordas de subida e reenvios do CLP.
* [ ] Recuperação confiável de eventos após reinicializações ou falhas de rede.
* [ ] Integração com o Six Quiosque e/ou com o ambiente TOTVS Datasul.
* [ ] Acionamento real da impressão na impressora Zebra.
* [ ] Testes completos de integração e operação na linha de produção.

## 🔜 Próximas etapas

1. **Identificar o CLP:** confirmar o modelo do Siemens LOGO! e suas possibilidades de comunicação.
2. **Configurar a comunicação:** verificar conectividade de rede e definir como o CLP enviará o sinal de peça concluída.
3. **Integrar o CLP à API:** substituir as requisições simuladas no Postman por eventos reais.
4. **Garantir a identificação dos eventos:** definir uma estratégia que evite duplicidade inclusive após falhas de comunicação.
5. **Integrar o sistema de etiquetagem existente:** verificar com a equipe responsável quais interfaces ou mecanismos de integração estão disponíveis no Six Quiosque e/ou no ambiente Datasul.
6. **Validar a impressão física:** confirmar que cada peça elegível aciona o processo de impressão correto sem duplicar etiquetas.
7. **Realizar testes industriais:** validar o fluxo completo, a recuperação após falhas e a consistência dos registros.

## 👨‍💻 Considerações finais

O Sistema de Etiquetagem e Controle de Produção está sendo desenvolvido de forma incremental. A primeira etapa concentra-se na API, nas regras de negócio, na persistência de dados e no acompanhamento pelo dashboard.

A etapa seguinte é conectar o sistema ao equipamento industrial e, posteriormente, ao mecanismo de etiquetagem existente, preservando o modelo de etiqueta já utilizado pela empresa.

O objetivo final é estabelecer um fluxo confiável entre a conclusão da peça na linha de produção, o registro no sistema e o acionamento do processo de etiquetagem, com rastreabilidade e prevenção de duplicidades.
