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

test('Deve inserir uma transação com sucesso', async() => {
    const result = await request(app)
        .post(MAIN_ROUTE)
        .send({description, date: new Date(), ammount: 150, type: 'I', acc_id: account.id})
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(201)
    expect(result.body.acc_id).toBe(account.id)
})

test('Deve retornar uma transação por ID', async() => {
    const transaction = await app.db('transactions')
        .insert({description, date: new Date(), ammount: 100, type: 'I', acc_id: account.id}, ['id'])

    const result = await request(app)
        .get(`${MAIN_ROUTE}/${transaction[0].id}`)
        .set('authorization',`bearer ${token}`)

    expect(result.status).toBe(200)
    expect(result.body.id).toBe(transaction[0].id)
    expect(result.body.description).toBe(description)
})

test('Deve alterar uma transação', async() => {
    const transaction = await app.db('transactions')
        .insert({description, date: new Date(), ammount: 100, type: 'I', acc_id: account.id}, ['id'])

    const newDescription = `${description} updated` 

    const result = await request(app)
        .put(`${MAIN_ROUTE}/${transaction[0].id}`)
        .send({description: newDescription})
        .set('authorization',`bearer ${token}`)

    expect(result.status).toBe(201)
    expect(result.body.description).toBe(newDescription)
})

test('Deve remover uma transação', async() => {
    const transaction = await app.db('transactions')
    .insert({description, date: new Date(), ammount: 100, type: 'I', acc_id: account.id}, ['id']) 

    const result = await request(app)
        .delete(`${MAIN_ROUTE}/${transaction[0].id}`)
        .set('authorization',`bearer ${token}`)

    expect(result.status).toBe(204)
})

test('Não deve remover uma conta com transacao', async() => {
    const transaction = await app.db('transactions')
        .insert({description, date: new Date(), ammount: 100, type: 'I', acc_id: account.id}, ['id']) 

    const result = await request(app)
        .delete(`/v1/accounts/${account.id}`)
        .set('authorization',`bearer ${token}`)

    expect(result.status).toBe(400)
    expect(result.body.error).toBe('Esta conta possui transações associadas')
})

test('Não deve manipular transação de outro usuário', async() => {
    const transaction = await app.db('transactions')
        .insert({description, date: new Date(), ammount: 100, type: 'I', acc_id: account2.id}, ['id']) 

    const result = await request(app)
        .delete(`${MAIN_ROUTE}/${transaction[0].id}`)
        .set('authorization',`bearer ${token}`)

    expect(result.status).toBe(403)
    expect(result.body.error).toBe('Recurso não pertence ao usuário')
})

test('Transações de entrada devem ser positivas', async() => {
    const result = await request(app)
        .post(MAIN_ROUTE)
        .send({description, date: new Date(), ammount: -150, type: 'I', acc_id: account.id})
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(201)
    expect(result.body.ammount).toBe('150.00')
})

test('Transações de saída devem ser negativas', async() => {
    const result = await request(app)
        .post(MAIN_ROUTE)
        .send({description, date: new Date(), ammount: 150, type: 'O', acc_id: account.id})
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(201)
    expect(result.body.ammount).toBe('-150.00')
})

describe('Ao tentar inserir uma transação', async() => {

    const validTransaction = {description, date: new Date(), ammount: 150, type: 'I', acc_id: 123}

    const testTemplate = async(newData, errorMessage) => {
        const result = await request(app)
            .post(MAIN_ROUTE)
            .send({...validTransaction, ...newData})
            .set('authorization',`bearer ${token}`)
        expect(result.status).toBe(400)
        expect(result.body.error).toBe(errorMessage) 
    }

    test('Não deve inserir sem descrição', async() => {
        testTemplate({description:''},'Descrição é um atributo obrigatório')
    })
    
    test('Não deve inserir uma transação sem valor', async() => {
        testTemplate({ammount:null},'Valor é um atributo obrigatório')
    })
    
    test('Não deve inserir uma transação sem data', async() => {
        testTemplate({date:null},'Data é um atributo obrigatório')
    })
    
    test('Não deve inserir uma transação sem conta', async() => {
        testTemplate({acc_id:null},'Conta é um atributo obrigatório')
    })
    
    test('Não deve inserir uma transação sem tipo', async() => {
        testTemplate({type:null},'Tipo é um atributo obrigatório')
    })
    
    test('Não deve inserir uma transação com tipo inválido', async() => {
        testTemplate({type:'J'},'Tipo inválido')
    })
})

