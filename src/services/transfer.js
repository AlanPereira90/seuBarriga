module.exports = (app) => {

    const transfers = 'transfers'
    const transactions = 'transactions'

    const find = (filter = {}) => {
        return app.db(transfers).where(filter).select()
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

    return {
        find,
        save
    }
}