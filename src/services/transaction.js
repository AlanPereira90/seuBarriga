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

    return {find}
}