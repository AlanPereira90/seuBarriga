const transaction = require("./transaction")

module.exports = (app) => {

    const getSaldo = (userID) => {
        return app.db('transactions as t')
            .sum('ammount')
            .join('accounts as acc', 'acc.id', '=', 't.acc_id')
            .where({user_id: userID, status: true})
            .where('date','<=', new Date())
            .select('acc.id as acc_id')
            .groupBy('acc.id')
            .orderBy('acc.id','desc')
    }

    return {getSaldo}
}