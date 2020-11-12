const request = require('supertest')
const app = require('../../src/app')

const MAIN_ROUTE = '/accounts'
let user

let name = 'acc1'

beforeAll(async() => {
    let name = 'User Test Account'
    let mail = `${Date.now()}@mail.com`
    let password = '1234'
    const result = await app.services.user.save({name, mail, password})
    user = {...result[0]}
})

test('Deve inserir uma conta com sucesso', async() => {
    const result = await request(app).post(MAIN_ROUTE).send({name, user_id: user.id})
    expect(result.status).toBe(201)
    expect(result.body.name).toBe(name)
})

test('Deve listar todas as contas', async() => {
    await app.db('accounts').insert({name, user_id: user.id})
    const result = await request(app).get(MAIN_ROUTE)
    expect(result.status).toBe(200)
    expect(result.body.length).toBeGreaterThan(0)
})

test('Deve retornar uma conta por ID', async() => {
    const account = await app.db('accounts').insert({name, user_id: user.id}, ['id'])
    const result = await request(app).get(`${MAIN_ROUTE}/${account[0].id}`)
    expect(result.status).toBe(200)
    expect(result.body.user_id).toBe(user.id)
    expect(result.body.name).toBe(name)
})