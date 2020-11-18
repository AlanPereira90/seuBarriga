const ValidationError = require('../errors/validationError')

module.exports = (app) => {

    const transactions = 'transactions'
    const accounts = 'accounts'
    
    const find = (userID, filter = {}) => {
        return app.db(transactions)
            .join(accounts, `${accounts}.id`, `acc_id`)
            .where(filter)
            .andWhere(`${accounts}.user_id`, '=', userID)
            .select()
    }

    const findOne = (filter) => {
        return app.db(transactions).where(filter).first()
    }

    const save = (transaction) => {

        if (!transaction.description) throw new ValidationError('Descrição é um atributo obrigatório')
        if (!transaction.ammount) throw new ValidationError('Valor é um atributo obrigatório')
        if (!transaction.date) throw new ValidationError('Data é um atributo obrigatório')
        if (!transaction.acc_id) throw new ValidationError('Conta é um atributo obrigatório')
        if (!transaction.type) throw new ValidationError('Tipo é um atributo obrigatório')
        if (transaction.type != 'I' && transaction.type != 'O') throw new ValidationError('Tipo inválido')

        if ((transaction.type == 'I' && transaction.ammount < 0) || (transaction.type == 'O' && transaction.ammount > 0)){
            transaction.ammount *= -1
        }
        return app.db(transactions).insert(transaction, '*')
    }

    const update = (id, transaction) => {
        return app.db(transactions).where({id}).update(transaction, '*')
    }

    const remove = (id) => {
        return app.db(transactions).where({id}).del()
    }

    return {find, 
            findOne,
            save,
            update,
            remove
        }
}