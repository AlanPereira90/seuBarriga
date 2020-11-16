const ValidationError = require('../errors/validationError')

module.exports = (app) => {
    
    const accounts = 'accounts'

    const findAll = (userID) => {
        return app.db(accounts).where({user_id: userID})
    }

    const save = async (account) => {

        const accDB = await find({name: account.name, user_id: account.user_id})
        if (accDB) throw new ValidationError('Já existe uma conta com este nome')
        if (!account.name) throw new ValidationError('Nome é um atributo obrigatório')

        return app.db(accounts).insert(account, '*')
    } 

    const find = (filter = {}) => {
        return app.db(accounts).where(filter).select().first()
    }

    const update = (id, account) => {
        return app.db(accounts).where({id}).update(account, '*')
    }

    const remove = (id) => {
        return app.db(accounts).where({id}).del()
    }

    return {findAll, 
            save, 
            find, 
            update, 
            remove}
}