const { restart } = require('nodemon')
const request = require('supertest')
const app = require('../../src/app')

const MAIN_ROUTE = '/v1/transfers'
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6LTEsIm5hbWUiOiJVc2VyIDEiLCJtYWlsIjoidXNlcjFAbWFpbC5jb20ifQ.TyFghUALEiHD7kbermx0YfSgY2CK8feJXNf3XzfNEYk'

beforeAll(async() => {
    await app.db.seed.run()
})

test('Deve listar apenas as transferências do usuário', async() => {
    const result = await request(app)
        .get(MAIN_ROUTE)
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(1)
    expect(result.body[0].description).toBe('Transfer User 1')
})

test('Deve inserir uma transferência com sucesso', async() => {
    const result = await request(app)
        .post(MAIN_ROUTE)
        .send({
                description: 'new transfer', 
                user_id: -1, 
                acc_ori_id: -1, 
                acc_dest_id: -2,
                ammount: 100,
                date: new Date()
            })
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(201)
    expect(result.body.description).toBe('new transfer')

    const transactions = await app.db('transactions').where({transfer_id: result.body.id})
    expect(transactions).toHaveLength(2)

    expect(transactions[0].description).toBe('Transfer to acc -2')
    expect(transactions[0].ammount).toBe('-100.00')
    expect(transactions[0].acc_id).toBe(-1)

    expect(transactions[1].description).toBe('Transfer from acc -1')
    expect(transactions[1].ammount).toBe('100.00')
    expect(transactions[1].acc_id).toBe(-2)
})

describe('Ao salvar uma transferência válida', async() => {

    let transferID
    let income
    let outcome

    test('Deve retornar o status 201 e os dados da transferência', async() => {
        const result = await request(app)
            .post(MAIN_ROUTE)
            .send({
                    description: 'new transfer', 
                    user_id: -1, 
                    acc_ori_id: -1, 
                    acc_dest_id: -2,
                    ammount: 100,
                    date: new Date()
                })
            .set('authorization',`bearer ${token}`)
        expect(result.status).toBe(201)
        expect(result.body.description).toBe('new transfer')
        transferID = result.body.id
    })

    test('As transações equivalentes devem ser geradas', async()=> {
        const transactions = await app.db('transactions')
            .where({transfer_id: transferID})
            .orderBy('ammount')
        expect(transactions).toHaveLength(2)

        outcome = transactions[0]
        income = transactions[1]
    })

    test('A transação de saída, deve ser negativa', async() => {
        expect(outcome.description).toBe('Transfer to acc -2')
        expect(outcome.ammount).toBe('-100.00')
        expect(outcome.acc_id).toBe(-1)
        expect(outcome.type).toBe('O')
    })

    test('A transação de entrada, deve ser positiva', async() => {
        expect(income.description).toBe('Transfer from acc -1')
        expect(income.ammount).toBe('100.00')
        expect(income.acc_id).toBe(-2)
        expect(income.type).toBe('I')
    })

    test('As transações devem referenciar a transferência que as originou', async() => {
        expect(income.transfer_id).toBe(transferID)
        expect(outcome.transfer_id).toBe(transferID)
    })
})