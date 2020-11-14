const request = require('supertest')
const app = require('../../src/app')

let token

beforeAll(async() => {
    let name = 'User Logged'
    let mail = `${Date.now()}@mail.com`
    let password = '1234'
    await app.services.user.save({name, mail, password})
    const usrl = await app.services.authService.signin({mail,password})
    token = usrl.token
})

const name = 'Walter Mitty'
const mail = `${Date.now()}@mail.com` 
const password = '1234'

test('Deve listar todos os usuários', () => {
    return request(app).get('/v1/users').set('authorization',`bearer ${token}`)
        .then(res => {
            expect(res.status).toBe(200)
            expect(res.body.length).toBeGreaterThan(0)
        })
    })

test('Deve inserir um usuário com sucesso', () => {    
    return request(app).post('/v1/users')
        .send({name, mail, password})
        .set('authorization',`bearer ${token}`)
        .then(res => {
            expect(res.status).toBe(201)
            expect(res.body.name).toBe(name)
            expect(res.body).not.toHaveProperty('password')
        })
    })

test('Não deve inserir usuário sem nome', () => {

    //controla o sincronismo através do return
    return request(app).post('/v1/users')
        .send({name: '', mail, password})
        .set('authorization',`bearer ${token}`)
        .then(res => {
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Nome é um atributo obrigatório')
        })
    })

test('Não deve inserir usuário sem email', async () => {

    //controla o sincronismo através do async/await
    const result = await request(app)
        .post('/v1/users')
        .send({name, mail: '', password})
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(400)
    expect(result.body.error).toBe('Email é um atributo obrigatório')
})

test('Não deve inserir usuário sem senha', (done) => {

    //controla o sincronismo através do done() -> função do jest
    request(app).post('/v1/users')
    .send({name, mail, password: ''})
    .set('authorization',`bearer ${token}`)
    .then(result => {
        expect(result.status).toBe(400)
        expect(result.body.error).toBe('Senha é um atributo obrigatório')
        done()
    }).catch(err => done.fail(err))
})

test('Não deve inserir usuário com email existente', async () => {

    const result = await request(app)
        .post('/v1/users')
        .send({name, mail, password})
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(400)
    expect(result.body.error).toBe(`Já existe um usuário com o email ${mail}`)
})

test('Deve armazenar senha criptografada', async() => {
    const result = await request(app)
        .post('/v1/users')
        .send({name, mail:`${Date.now()}@mail.com`, password})
        .set('authorization',`bearer ${token}`)
    expect(result.status).toBe(201)
    
    const { id } = result.body
    const userDB = await app.services.user.findOne({id})
    expect(userDB.password).not.toBeUndefined()
    expect(userDB.password).not.toBe(password) 
})