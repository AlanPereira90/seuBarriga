const ValidationError = require('../errors/validationError')

module.exports = (app) => {

    const transfers = 'transfers'
    const transactions = 'transactions'    

    const find = (filter = {}) => {
        return app.db(transfers).where(filter).select()
    }

    const findOne = async(filter) => {
        const result = await find(filter)
        
        if (result){
            return result[0]
        }
    }

    const validateTransfer = async(transfer) => {
        if(!transfer.description) throw new ValidationError('Descrição é um atributo obrigatório')
        if(!transfer.ammount) throw new ValidationError('Valor é um atributo obrigatório')
        if(!transfer.date) throw new ValidationError('Data é um atributo obrigatório')
        if(!transfer.acc_ori_id) throw new ValidationError('Conta de origem é um atributo obrigatório')
        if(!transfer.acc_dest_id) throw new ValidationError('Conta de destino é um atributo obrigatório')
        if(transfer.acc_ori_id === transfer.acc_dest_id) throw new ValidationError('Contas de origem e destino não podem ser iguais')

        const acc_ori = await app.services.account.find({id: transfer.acc_ori_id})
        if (acc_ori.user_id != transfer.user_id) throw new ValidationError('Conta de origem não pertence ao usuário')

        const acc_dest = await app.services.account.find({id: transfer.acc_dest_id})
        if (acc_dest.user_id != transfer.user_id) throw new ValidationError('Conta de destino não pertence ao usuário')
    }

    const save = async (transfer) => {      

        const result = await app.db(transfers).insert(transfer, '*')
        const transferID = result[0].id

        newTransactions = [{
            description: `Transfer to acc ${transfer.acc_dest_id}`,
            date: transfer.date,
            ammount: transfer.ammount * -1,
            type: 'O',
            acc_id: transfer.acc_ori_id,
            transfer_id: transferID
        },
        {
            description: `Transfer from acc ${transfer.acc_ori_id}`,
            date: transfer.date,
            ammount: transfer.ammount,
            type: 'I',
            acc_id: transfer.acc_dest_id,
            transfer_id: transferID
        }]

        await app.db(transactions).insert(newTransactions)
        return result
    }

    const update = async(id, transfer) => {

        const result = await app.db(transfers).where({id}).update(transfer, '*')
        const transferID = result[0].id

        newTransactions = [{
            description: `Transfer to acc ${transfer.acc_dest_id}`,
            date: transfer.date,
            ammount: transfer.ammount * -1,
            type: 'O',
            acc_id: transfer.acc_ori_id,
            transfer_id: transferID
        },
        {
            description: `Transfer from acc ${transfer.acc_ori_id}`,
            date: transfer.date,
            ammount: transfer.ammount,
            type: 'I',
            acc_id: transfer.acc_dest_id,
            transfer_id: transferID
        }]

        await app.db(transactions).where({transfer_id: transferID}).del()
        await app.db(transactions).insert(newTransactions)
        return result
    }

    const remove = async(id) => {
        await app.db(transactions).where({transfer_id: id}).del()
        await app.db(transfers).where({id}).del()        
    }

    return {
        find,
        findOne,
        save,
        update,
        remove,
        validateTransfer
    }
}