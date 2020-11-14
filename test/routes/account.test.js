const request = require('supertest')
const app = require('../../src/app')

const MAIN_ROUTE = '/v1/accounts'
let user
let token

let name = 'acc1'

beforeAll(async() => {
    let name = 'User Test Account'
    let mail = `${Date.now()}@mail.com`
    let password = '1234'
    const result = await app.services.user.save({name, mail, password})
    user = {...result[0]}

    const usrl = await app.services.authService.signin({mail,password})
    token = usrl.token
})

test('Deve inserir uma conta com sucesso', async() => {
    const result = await request(app)
        .post(MAIN_ROUTE)
        .send({name, user_id: user.id})
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(201)
    expect(result.body.name).toBe(name)
})

test('Deve listar todas as contas', async() => {
    await app.db('accounts').insert({name, user_id: user.id})
    const result = await request(app)
        .get(MAIN_ROUTE)
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(200)
    expect(result.body.length).toBeGreaterThan(0)
})

test('Deve retornar uma conta por ID', async() => {
    const account = await app.db('accounts').insert({name, user_id: user.id}, ['id'])
    const result = await request(app)
        .get(`${MAIN_ROUTE}/${account[0].id}`)
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(200)
    expect(result.body.user_id).toBe(user.id)
    expect(result.body.name).toBe(name)
})

test('Deve alterar uma conta', async() => {
    let newName = `${name} updated`
    const account = await app.db('accounts').insert({name, user_id: user.id}, ['id'])
    const result = await request(app)
        .put(`${MAIN_ROUTE}/${account[0].id}`)
        .send({name: newName})
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(201)
    expect(result.body.name).toBe(newName)
})

test('Deve remover uma conta', async() => {
    const account = await app.db('accounts').insert({name, user_id: user.id}, ['id'])
    const result = await request(app)
        .delete(`${MAIN_ROUTE}/${account[0].id}`)
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(204)
})

test('Não deve inserir uma conta sem nome', async() => {
    const result = await request(app)
        .post(MAIN_ROUTE)
        .send({name: '', user_id: user.id})
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(400)
    expect(result.body.error).toBe('Nome é um atributo obrigatório')
})