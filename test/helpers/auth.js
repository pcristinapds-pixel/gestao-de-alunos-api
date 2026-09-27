import { api } from './api.js';

export async function getToken(emailUser, passUser) {
    const loginResposta = await api()
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
            email: emailUser,
            senha: passUser
        });

    return loginResposta.body.token;
}

export async function getTokenAdmin() {
    return getToken(process.env.ADMIN_EMAIL, process.env.ADMIN_SENHA);
}