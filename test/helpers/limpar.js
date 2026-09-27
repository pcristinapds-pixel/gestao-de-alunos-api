import { api } from './api.js';

export async function removerAluno(tokenAdmin, email) {
    const listaResposta = await api()
        .get('/api/admin/alunos')
        .set('Authorization', `Bearer ${tokenAdmin}`);

    const aluno = listaResposta.body.find(aluno => aluno.email === email);

    if (aluno) {
        await api()
            .delete(`/api/admin/alunos/${aluno.id}`)
            .set('Authorization', `Bearer ${tokenAdmin}`);
    }
}

export async function removerDisciplina(tokenAdmin, codigo) {
    const listaResposta = await api()
        .get('/api/admin/disciplinas')
        .set('Authorization', `Bearer ${tokenAdmin}`);

    const disciplina = listaResposta.body.find(disciplina => disciplina.codigo === codigo);

    if (disciplina) {
        await api()
            .delete(`/api/admin/disciplinas/${disciplina.id}`)
            .set('Authorization', `Bearer ${tokenAdmin}`);
    }
}