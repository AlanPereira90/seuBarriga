const request = require('supertest')
const app = require('../../src/app')

const MAIN_ROUTE = '/v1/transactions'
let user
let account

let user2
let account2

let token

let description = 'Transaction Test'

beforeAll(async() => {
    let name = 'User Test Transaction'
    let mail = `${Date.now()}@mail.com`
    let password = '1234'
    const result = await app.services.user.save({name, mail, password})
    user = {...result[0]}

    const usrl = await app.services.authService.signin({mail,password})
    token = usrl.token

    name = 'User Test Transaction 2'
    mail = `${Date.now()}@mail.com`
    password = '1234'
    const result2 = await app.services.user.save({name, mail, password})
    user2 = {...result2[0]}

    const accs = await app.db('accounts').insert([
        {name: 'acc-1 tansaction test', user_id: user.id},
        {name: 'acc-2 tansaction test', user_id: user2.id}
    ], '*')
    
    account = accs[0]
    account2 = accs[1]
})

test('Deve listar apenas as transações do usuário', async() => {
    await app.db('transactions').insert([
        {description, date: new Date(), ammount: 100, type: 'I', acc_id: account.id},
        {description: 't2', date: new Date(), ammount: 300, type: 'O', acc_id: account2.id}
    ])
    const result = await request(app)
        .get(MAIN_ROUTE)
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(1)
    expect(result.body[0].description).toBe(description)
})