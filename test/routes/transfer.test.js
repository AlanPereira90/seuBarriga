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

describe('Ao salvar uma transferência válida...', async() => {

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

describe('Ao tentar salvar uma transferência inválida...', async() => {

    const validTransfer = {
        description: 'new transfer', 
        user_id: -1, 
        acc_ori_id: -1, 
        acc_dest_id: -2,
        ammount: 100,
        date: new Date()
    }

    const testTemplate = async(newData, errorMessage, expectedStatus = 400) => {
        const result = await request(app)
            .post(MAIN_ROUTE)
            .send({...validTransfer, ...newData})
            .set('authorization',`bearer ${token}`)        
        
        expect(result.status).toBe(expectedStatus)
        expect(result.body.error).toBe(errorMessage) 
    }

    test('Não deve inserir sem descrição', async() => {
        await testTemplate({description: ''},'Descrição é um atributo obrigatório')
    })

    test('Não deve inserir sem valor', async() => {
        await testTemplate({ammount: null},'Valor é um atributo obrigatório')
    })

    test('Não deve inserir sem data', async() => {
        await testTemplate({date: null},'Data é um atributo obrigatório')
    })

    test('Não deve inserir sem conta de origem', async() => {
        await testTemplate({acc_ori_id: null},'Conta de origem é um atributo obrigatório')
    })

    test('Não deve inserir sem conta de destino', async() => {
        await testTemplate({acc_dest_id: null},'Conta de destino é um atributo obrigatório')
    })

    test('Não deve inserir se as contas de origem e destino forem iguais', async() => {
        await testTemplate({acc_ori_id: -1, acc_dest_id: -1},'Contas de origem e destino não podem ser iguais')
    })

    test('Não deve inserir se a conta de origem pertencer a outro usuário', async() => {
        await testTemplate({acc_ori_id: -3},'Conta de origem não pertence ao usuário')
    })

    test('Não deve inserir se a conta de destino pertencer a outro usuário', async() => {
        await testTemplate({acc_dest_id: -3},'Conta de destino não pertence ao usuário')
    })
})

test('Deve retornar uma transferência por ID', async() => {
    const result = await request(app)
        .get(`${MAIN_ROUTE}/-1`)
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(200)
    expect(result.body.description).toBe('Transfer User 1')
})

describe('Ao alterar uma transferência válida...', async() => {

    let transferID
    let income
    let outcome

    test('Deve retornar o status 201 e os dados da transferência', async() => {
        const result = await request(app)
            .put(`${MAIN_ROUTE}/-1`)
            .send({
                    description: 'updated transfer', 
                    user_id: -1, 
                    acc_ori_id: -1, 
                    acc_dest_id: -2,
                    ammount: 500,
                    date: new Date()
                })
            .set('authorization',`bearer ${token}`)
        expect(result.status).toBe(201)
        expect(result.body.description).toBe('updated transfer')
        expect(result.body.ammount).toBe('500.00')
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
        expect(outcome.ammount).toBe('-500.00')
        expect(outcome.acc_id).toBe(-1)
        expect(outcome.type).toBe('O')
    })

    test('A transação de entrada, deve ser positiva', async() => {
        expect(income.description).toBe('Transfer from acc -1')
        expect(income.ammount).toBe('500.00')
        expect(income.acc_id).toBe(-2)
        expect(income.type).toBe('I')
    })

    test('As transações devem referenciar a transferência que as originou', async() => {
        expect(income.transfer_id).toBe(transferID)
        expect(outcome.transfer_id).toBe(transferID)
    })
})

describe('Ao tentar alterar uma transferência inválida...', async() => {

    const validTransfer = {
        description: 'new transfer', 
        user_id: -1, 
        acc_ori_id: -1, 
        acc_dest_id: -2,
        ammount: 100,
        date: new Date()
    }

    const testTemplate = async(newData, errorMessage, expectedStatus = 400) => {
        const result = await request(app)
            .put(`${MAIN_ROUTE}/-1`)
            .send({...validTransfer, ...newData})
            .set('authorization',`bearer ${token}`)        
        
        expect(result.status).toBe(expectedStatus)
        expect(result.body.error).toBe(errorMessage) 
    }

    test('Não deve inserir sem descrição', async() => {
        await testTemplate({description: ''},'Descrição é um atributo obrigatório')
    })

    test('Não deve inserir sem valor', async() => {
        await testTemplate({ammount: null},'Valor é um atributo obrigatório')
    })

    test('Não deve inserir sem data', async() => {
        await testTemplate({date: null},'Data é um atributo obrigatório')
    })

    test('Não deve inserir sem conta de origem', async() => {
        await testTemplate({acc_ori_id: null},'Conta de origem é um atributo obrigatório')
    })

    test('Não deve inserir sem conta de destino', async() => {
        await testTemplate({acc_dest_id: null},'Conta de destino é um atributo obrigatório')
    })

    test('Não deve inserir se as contas de origem e destino forem iguais', async() => {
        await testTemplate({acc_ori_id: -1, acc_dest_id: -1},'Contas de origem e destino não podem ser iguais')
    })

    test('Não deve inserir se a conta de origem pertencer a outro usuário', async() => {
        await testTemplate({acc_ori_id: -3},'Conta de origem não pertence ao usuário')
    })

    test('Não deve inserir se a conta de destino pertencer a outro usuário', async() => {
        await testTemplate({acc_dest_id: -3},'Conta de destino não pertence ao usuário')
    })
})

describe('Ao remover uma transferência...', async() => {

    test('Deve retornar o status 204',async() => {
        const result = await request(app)
        .delete(`${MAIN_ROUTE}/-1`)
        .set('authorization',`bearer ${token}`)

        expect(result.status).toBe(204)  
    })

    test('O registro deve ser removido da base de dados', async() => {
        const transfer = await app.db('transfers').where({id:-1})
        expect(transfer).toHaveLength(0)
    })

    test('As transações associadas devem ser removidas',async() => {
        const transactions = await app.db('transactions').where({transfer_id:-1})
        expect(transactions).toHaveLength(0)
    })
})

test('Não deve retornar transferência de outro usuário', async() => {
    const result = await request(app)
        .get(`${MAIN_ROUTE}/-2`)
        .set('authorization',`bearer ${token}`)

    expect(result.status).toBe(403)
    expect(result.body.error).toBe('Recurso não pertence ao usuário')
})