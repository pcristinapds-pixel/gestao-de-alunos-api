import { expect } from 'chai';
import { api } from './helpers/api.js';
import { getTokenAdmin, getToken } from './helpers/auth.js';
import { removerAluno, removerDisciplina } from './helpers/limpar.js';
import testesDeEntregaTrabalho from './fixtures/entrega-trabalhos.json' with { type: 'json' };

describe('Fluxo de cadastro de aluno e entrega de trabalho', () => {
    let tokenAdmin;
    let tokenAluno;

        before(async () => {
        const token = await getTokenAdmin();

        for (const testeDeEntregaTrabalho of testesDeEntregaTrabalho) {
            await removerAluno(token, testeDeEntregaTrabalho.dadosAluno.email);
            await removerDisciplina(token, testeDeEntregaTrabalho.dadosDisciplina.codigo);
        }
    });

    beforeEach(async () => {
        tokenAdmin = await getTokenAdmin();
    });

    testesDeEntregaTrabalho.forEach(testeDeEntregaTrabalho => {
        it(testeDeEntregaTrabalho.testTitle, async () => {
            const cadastroAlunoResposta = await api()
                .post('/api/admin/alunos')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send(testeDeEntregaTrabalho.dadosAluno);

            const alunoId = cadastroAlunoResposta.body.id;

            const cadastroDisciplinaResposta = await api()
                .post('/api/admin/disciplinas')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send(testeDeEntregaTrabalho.dadosDisciplina);

            const disciplinaId = cadastroDisciplinaResposta.body.id;

            await api()
                .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ alunoId: alunoId });

            tokenAluno = await getToken(testeDeEntregaTrabalho.dadosAluno.email, testeDeEntregaTrabalho.dadosAluno.senha);

            const respostaEntregaTrabalho = await api()
                .post(`/api/alunos/${alunoId}/trabalhos`)
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${tokenAluno}`)
                .send({
                    disciplinaId: disciplinaId,
                    titulo: testeDeEntregaTrabalho.dadosTrabalho.titulo,
                    descricao: testeDeEntregaTrabalho.dadosTrabalho.descricao
                });

            expect(respostaEntregaTrabalho.status).to.equal(testeDeEntregaTrabalho.statusCodeEsperado);
                       expect(respostaEntregaTrabalho.body.alunoId).to.equal(alunoId);
              expect(respostaEntregaTrabalho.body.disciplinaId).to.equal(disciplinaId);
              expect(respostaEntregaTrabalho.body.titulo).to.equal(testeDeEntregaTrabalho.dadosTrabalho.titulo);
              expect(respostaEntregaTrabalho.body.descricao).to.equal(testeDeEntregaTrabalho.dadosTrabalho.descricao);
              expect(respostaEntregaTrabalho.body.status).to.equal('entregue');
        });
    });

});