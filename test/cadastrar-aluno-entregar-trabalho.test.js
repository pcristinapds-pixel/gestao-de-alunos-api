import 'dotenv/config';
import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { getTokenAdmin, getToken } from './helpers/auth.js';
import testesDeEntregaTrabalho from './fixtures/entrega-trabalhos.json' with { type: 'json' };

describe('Fluxo de Cadastro de Trabalho por um novo aluno', () => {
    let tokenAdmin;
    let tokenAluno;

    beforeEach(async () => {
        tokenAdmin = await getTokenAdmin();
    });

    after(async () => {
        await mongoose.connection.close();
    });

    testesDeEntregaTrabalho.forEach(testeDeEntregaTrabalho => {
        it(testeDeEntregaTrabalho.testTitle, async () => {
            const cadastroAlunoResposta = await request(app)
                .post('/api/admin/alunos')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send(testeDeEntregaTrabalho.dadosAluno);

            expect(cadastroAlunoResposta.status).to.equal(201);
            expect(cadastroAlunoResposta.body.nome).to.equal(testeDeEntregaTrabalho.dadosAluno.nome);
            expect(cadastroAlunoResposta.body.email).to.equal(testeDeEntregaTrabalho.dadosAluno.email);
            expect(cadastroAlunoResposta.body.matricula).to.equal(testeDeEntregaTrabalho.dadosAluno.matricula);

            const alunoId = cadastroAlunoResposta.body.id;

            const cadastroDisciplinaResposta = await request(app)
                .post('/api/admin/disciplinas')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send(testeDeEntregaTrabalho.dadosDisciplina);

            expect(cadastroDisciplinaResposta.status).to.equal(201);

            const disciplinaId = cadastroDisciplinaResposta.body.id;

            const cadastroMatriculaRespostas = await request(app)
                .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ alunoId: alunoId });

            expect(cadastroMatriculaRespostas.status).to.equal(201);

            tokenAluno = await getToken(testeDeEntregaTrabalho.dadosAluno.email, testeDeEntregaTrabalho.dadosAluno.senha);

            const respostaEntregaTrabalho = await request(app)
                .post(`/api/alunos/${alunoId}/trabalhos`)
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
