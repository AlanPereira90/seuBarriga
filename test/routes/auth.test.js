const request = require('supertest')
const app = require('../../src/app')

const MAIN_ROUTE = '/auth'
let user

beforeAll(async() => {
    let name = 'User Test Auth'
    let mail = `${Date.now()}@mail.com`
    let password = '1234'
    const result = await app.services.user.save({name, mail, password})
    user = {...result[0]}
})

test('Deve receber token ao logar', async() => {
    const {mail} = user
    const result = await request(app).post(`${MAIN_ROUTE}/signin`).send({mail, password: '1234'})
    expect(result.status).toBe(200)
    expect(result.body).toHaveProperty('token')
})

test('Não deve autenticar usuário com senha errada', async() => {
    const {mail} = user
    const result = await request(app).post(`${MAIN_ROUTE}/signin`).send({mail, password: '4321'})
    expect(result.status).toBe(400)
    expect(result.body.error).toBe('Não foi possível autenticar, usuário e/ou senha inválido')
})

test('Não deve autenticar usuário com usuário inexistente', async() => {
    const {mail} = user
    const result = await request(app).post(`${MAIN_ROUTE}/signin`).send({mail:'naoexiste@mail.com', password: '1234'})
    expect(result.status).toBe(400)
    expect(result.body.error).toBe('Não foi possível autenticar, usuário e/ou senha inválido')
})


