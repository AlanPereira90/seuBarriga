const ValidationError = require('../errors/validationError')

module.exports = (app) => {
    
    const accounts = 'accounts'

    const findAll = () => {
        return app.db(accounts).select()
    }

    const save = async (account) => {

        if (!account.name) throw new ValidationError('Nome é um atributo obrigatório')

        return app.db(accounts).insert(account, '*')
    } 

    const findByID = (filter = {}) => {
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
            findByID, 
            update, 
            remove}
}