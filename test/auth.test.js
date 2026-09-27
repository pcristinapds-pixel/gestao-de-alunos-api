import 'dotenv/config';
import request from 'supertest';
import { expect } from 'chai';
import sinon from 'sinon';
import app from '../src/app.js';
import authService from '../src/services/auth.service.js';
import testesDeLogin from './fixtures/login.json' with { type: 'json' };

describe('POST /api/auth/login', () => {
  afterEach(() => {
    sinon.restore();
  });

  testesDeLogin.credenciaisValidas.forEach(testeDeLogin => {
    it(testeDeLogin.testTitle, async () => {
      const resposta = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(testeDeLogin.dadosLogin);

      expect(resposta.status).to.equal(200);
      expect(resposta.body).to.have.property('token');
    });
  });

  testesDeLogin.credenciaisInvalidas.forEach(testeDeLogin => {
    it(testeDeLogin.testTitle, async () => {
      const resposta = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(testeDeLogin.dadosLogin);

      expect(resposta.status).to.equal(testeDeLogin.statusCodeEsperado);
      expect(resposta.body.error).to.equal(testeDeLogin.mensagemEsperada);
    });
  });

  it('deve retornar 500 quando ocorrer um erro inesperado no serviço de login', async () => {
    sinon.stub(authService, 'login').throws(new Error('Falha simulada no serviço de login'));

    const resposta = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'admin@escola.com', senha: 'admin123' });

    expect(resposta.status).to.equal(500);
    expect(resposta.body.error).to.equal('Erro interno do servidor.');
  });
});
