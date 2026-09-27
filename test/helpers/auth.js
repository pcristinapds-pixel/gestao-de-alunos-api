import request from 'supertest';
import 'dotenv/config'
import app from '../../src/app.js'

export async function getToken(emailUser, passUser) {
    const loginResposta = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
            email: emailUser,
            senha: passUser
        });

    return loginResposta.body.token;
}

export async function getTokenAdmin() {
    const loginResposta = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
            email: process.env.ADMIN_EMAIL,
            senha: process.env.ADMIN_SENHA
        });

    return loginResposta.body.token;
}
