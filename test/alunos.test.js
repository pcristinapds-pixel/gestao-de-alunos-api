import { expect } from 'chai';
import { api } from './helpers/api.js';
import { getTokenAdmin } from './helpers/auth.js';
import { novoAluno } from './factories/alunosFactory.js';

describe('POST /api/admin/alunos', () => {
    let tokenAdmin;

    beforeEach(async () => {
        tokenAdmin = await getTokenAdmin();
    });

    it('deve cadastrar um aluno com dados gerados pela factory', async () => {
        const aluno = novoAluno();

        const cadastroAlunoResposta = await api()
            .post('/api/admin/alunos')
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send(aluno);

        expect(cadastroAlunoResposta.status).to.equal(201);
          expect(cadastroAlunoResposta.body.nome).to.equal(aluno.nome);
          expect(cadastroAlunoResposta.body.email).to.equal(aluno.email);
          expect(cadastroAlunoResposta.body.matricula).to.equal(aluno.matricula);
    });
});