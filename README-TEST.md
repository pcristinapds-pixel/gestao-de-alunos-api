# Testes

Este documento explica como executar os testes da API localmente e como eles são executados na pipeline do GitHub Actions.

## Como os testes funcionam

Os testes são testes de integração escritos com:

- **Mocha** — execução e organização dos testes;
- **Chai** — asserções;
- **Supertest** — chamadas HTTP diretamente contra a aplicação Express;
- **MongoDB/Mongoose** — persistência usada pela aplicação durante os testes.

O comando configurado no `package.json` é:

```bash
npm test
```

Esse comando executa todos os arquivos que correspondem a `test/**/*.test.js` e encerra o processo ao final (`--exit`). Atualmente, a suíte cobre:

- autenticação do administrador com credenciais válidas e inválidas;
- cadastro de aluno e disciplina pelo administrador;
- matrícula do aluno na disciplina;
- login do aluno;
- registro de entrega de trabalho pelo aluno autenticado.

## Execução local

### Pré-requisitos

- Node.js 18 ou superior;
- MongoDB em execução e acessível;
- npm.

### 1. Instalar as dependências

Na raiz do projeto, execute:

```bash
npm ci
```

Também é possível usar `npm install` quando o `package-lock.json` precisar ser atualizado.

### 2. Configurar o ambiente

Crie um arquivo `.env` na raiz do projeto. Para executar os testes localmente, use uma base
separada da base de desenvolvimento:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/gestao-de-alunos-test
ADMIN_EMAIL=admin@escola.com
ADMIN_SENHA=admin123
```

O `MONGODB_URI` também pode ser definido diretamente no terminal. A aplicação usa a base padrão `gestao-de-alunos` quando essa variável não está definida, por isso é recomendável informar uma base exclusiva para os testes.

Na primeira execução em uma base vazia, o seed cria o administrador e os dados iniciais usados pela suíte. Os testes também criam registros próprios durante a execução. Como alguns cenários usam dados fixos, a base de testes deve estar limpa antes de uma nova execução completa.

Para limpar somente a base local de testes usando o MongoDB Shell:

```bash
mongosh mongodb://127.0.0.1:27017/gestao-de-alunos-test --eval "db.dropDatabase()"
```

Depois de limpar a base, execute novamente `npm test`.

### 3. Executar os testes

Com o MongoDB disponível, execute:

```bash
npm test
```

Para executar somente um arquivo:

```bash
npx mocha test/auth.test.js --exit
npx mocha test/cadastrar-aluno-entregar-trabalho.test.js --exit
```

Os testes usam o `app` diretamente com o Supertest, portanto não é necessário executar `npm start` ou iniciar o servidor HTTP separadamente. Se os testes já tiverem sido executados anteriormente na mesma base, limpe-a antes de repetir a suíte completa.

## Pipeline do GitHub Actions

O workflow está em `.github/workflows/tests.yml` e é executado quando:

- há `push` nas branches `main` ou `automatizar-testes-servicos`;
- há `pull_request` com destino à branch `main`.

O job roda em `ubuntu-latest` e segue estas etapas:

1. Faz checkout do código com `actions/checkout@v4`.
2. Configura o Node.js 20 com `actions/setup-node@v4` e habilita o cache do npm.
3. Inicia um serviço MongoDB 7 na porta `27017`.
4. Verifica a saúde do MongoDB usando `mongosh` e o comando `ping`.
5. Instala exatamente as dependências do lockfile com `npm ci`.
6. Executa `npm test`.

Durante o job, a variável abaixo aponta os testes para uma base isolada do ambiente de desenvolvimento:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/gestao-de-alunos-test
```

As credenciais do administrador devem ser cadastradas no GitHub como **Repository secrets**, em
**Settings > Secrets and variables > Actions > New repository secret**:

- `ADMIN_EMAIL`: e-mail do administrador;
- `ADMIN_SENHA`: senha do administrador.

O workflow disponibiliza esses secrets para o passo de testes desta forma:

```yaml
env:
  MONGODB_URI: mongodb://127.0.0.1:27017/gestao-de-alunos-test
  ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
  ADMIN_SENHA: ${{ secrets.ADMIN_SENHA }}
```

Os valores das credenciais não devem ser gravados diretamente no arquivo YAML ou no repositório.

Se qualquer etapa falhar, especialmente a instalação das dependências, a disponibilidade do MongoDB ou algum teste, o job é marcado como falho e o `push` ou `pull request` não passa na validação configurada pelo workflow.

