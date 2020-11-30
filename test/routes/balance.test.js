const moment = require('moment')

const request = require('supertest')
const app = require('../../src/app')


const MAIN_ROUTE = '/v1/balance'
const TRANSACTION_ROUTE = '/v1/transactions'
const TRANSFER_ROUTE = '/v1/transfers'
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6LTEwMSwibmFtZSI6IlVzZXIgMyIsIm1haWwiOiJ1c2VyM0BtYWlsLmNvbSJ9.4s8X0R3DaFwMaLcT9OXvRlWYiy1YuaQuBIxhMS7axzk'

beforeAll(async() => {
    await app.db.seed.run()
})

describe('Ao calcular o saldo do usuário...', async() => {

    test('Deve retornar apenas as contas com alguma transação', async() => {
        const result = await request(app)
            .get(MAIN_ROUTE)
            .set('authorization',`bearer ${token}`)
        
        expect(result.status).toBe(200)
        expect(result.body).toHaveLength(0)
    })

    test('Deve adicionar valores de entrada', async() => {
        await request(app)
            .post(TRANSACTION_ROUTE)
            .send({description: '1', date: new Date(), ammount: 100, type: 'I', acc_id: -101, status: true})
            .set('authorization',`bearer ${token}`)

        const result = await request(app)
            .get(MAIN_ROUTE)
            .set('authorization',`bearer ${token}`)

            expect(result.status).toBe(200)
            expect(result.body).toHaveLength(1)
            expect(result.body[0].acc_id).toBe(-101)
            expect(result.body[0].sum).toBe('100.00')
    })

    test('Deve subtrair valores de saída', async() => {
        await request(app)
            .post(TRANSACTION_ROUTE)
            .send({description: '1', date: new Date(), ammount: 50, type: 'O', acc_id: -101, status: true})
            .set('authorization',`bearer ${token}`)

        const result = await request(app)
            .get(MAIN_ROUTE)
            .set('authorization',`bearer ${token}`)

            expect(result.status).toBe(200)
            expect(result.body).toHaveLength(1)
            expect(result.body[0].acc_id).toBe(-101)
            expect(result.body[0].sum).toBe('50.00')
    })

    test('Não deve considerar transações pendentes', async() => {
        await request(app)
            .post(TRANSACTION_ROUTE)
            .send({description: '1', date: new Date(), ammount: 50, type: 'O', acc_id: -101, status: false})
            .set('authorization',`bearer ${token}`)

        const result = await request(app)
            .get(MAIN_ROUTE)
            .set('authorization',`bearer ${token}`)

            expect(result.status).toBe(200)
            expect(result.body).toHaveLength(1)
            expect(result.body[0].acc_id).toBe(-101)
            expect(result.body[0].sum).toBe('50.00')
    })

    test('Não deve considerar saldo de contas distintas', async() => {
        await request(app)
            .post(TRANSACTION_ROUTE)
            .send({description: '1', date: new Date(), ammount: 30, type: 'I', acc_id: -102, status: true})
            .set('authorization',`bearer ${token}`)

        const result = await request(app)
            .get(MAIN_ROUTE)
            .set('authorization',`bearer ${token}`)

            expect(result.status).toBe(200)
            expect(result.body).toHaveLength(2)
            expect(result.body[0].acc_id).toBe(-101)
            expect(result.body[0].sum).toBe('50.00')
            expect(result.body[1].acc_id).toBe(-102)
            expect(result.body[1].sum).toBe('30.00')
    })

    test('Não deve considerar contas de outros usuários', async() => {
        await request(app)
            .post(TRANSACTION_ROUTE)
            .send({description: '1', date: new Date(), ammount: 30, type: 'I', acc_id: -103, status: true})
            .set('authorization',`bearer ${token}`)

        const result = await request(app)
            .get(MAIN_ROUTE)
            .set('authorization',`bearer ${token}`)

            expect(result.status).toBe(200)
            expect(result.body).toHaveLength(2)
            expect(result.body[0].acc_id).toBe(-101)
            expect(result.body[0].sum).toBe('50.00')
            expect(result.body[1].acc_id).toBe(-102)
            expect(result.body[1].sum).toBe('30.00')
    })

    test('Deve considerar transação passada', async() => {
        await request(app)
            .post(TRANSACTION_ROUTE)
            .send({description: '1', date: moment().subtract({days: 5}), ammount: 30, type: 'O', acc_id: -101, status: true})
            .set('authorization',`bearer ${token}`)

        const result = await request(app)
            .get(MAIN_ROUTE)
            .set('authorization',`bearer ${token}`)

            expect(result.status).toBe(200)
            expect(result.body).toHaveLength(2)
            expect(result.body[0].acc_id).toBe(-101)
            expect(result.body[0].sum).toBe('20.00')
            expect(result.body[1].acc_id).toBe(-102)
            expect(result.body[1].sum).toBe('30.00')
    })

    test('Não deve considerar transação futura', async() => {
        await request(app)
            .post(TRANSACTION_ROUTE)
            .send({description: '1', date: moment().add({days: 5}), ammount: 60, type: 'I', acc_id: -101, status: true})
            .set('authorization',`bearer ${token}`)

        const result = await request(app)
            .get(MAIN_ROUTE)
            .set('authorization',`bearer ${token}`)

            expect(result.status).toBe(200)
            expect(result.body).toHaveLength(2)
            expect(result.body[0].acc_id).toBe(-101)
            expect(result.body[0].sum).toBe('20.00')
            expect(result.body[1].acc_id).toBe(-102)
            expect(result.body[1].sum).toBe('30.00')
    })

    test('Deve considerar transferências', async() => {
        await request(app)
            .post(TRANSFER_ROUTE)
            .send({description: '1', date: new Date(), ammount: 10, acc_ori_id: -101, acc_dest_id: -102})
            .set('authorization',`bearer ${token}`)

        const result = await request(app)
            .get(MAIN_ROUTE)
            .set('authorization',`bearer ${token}`)

            expect(result.status).toBe(200)
            expect(result.body).toHaveLength(2)
            expect(result.body[0].acc_id).toBe(-101)
            expect(result.body[0].sum).toBe('10.00')
            expect(result.body[1].acc_id).toBe(-102)
            expect(result.body[1].sum).toBe('40.00')
    })    
})