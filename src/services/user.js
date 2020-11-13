const bcrypt = require('bcrypt-nodejs')
const ValidationError = require('../errors/validationError')

module.exports = (app) => {

    const users = 'users'
    
    const findAll = () => {
        return app.db(users).select(['id','name','mail'])
    }

    const getPasswordHash = (password) => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    const save = async (user) => {
        if (!user.name){
            throw new ValidationError('Nome é um atributo obrigatório')
        } else if (!user.mail){
            throw new ValidationError('Email é um atributo obrigatório')
        } else if (!user.password){
            throw new ValidationError('Senha é um atributo obrigatório')
        }

        const userDb = await findOne({mail: user.mail})
        if (userDb){
            throw new ValidationError(`Já existe um usuário com o email ${user.mail}`)
        }

        user.password = getPasswordHash(user.password)

        return app.db(users).insert(user, ['id','name','mail'])
    } 

    const findOne = (filter) => {
        return app.db(users).where(filter).select().first()
    }

    return {findAll, save, findOne}
}