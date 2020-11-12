module.exports = (app) => {
    
    const accounts = 'accounts'

    const findAll = () => {
        return app.db(accounts).select()
    }

    const save = async (user) => {
        return app.db(accounts).insert(user, '*')
    } 

    const findByID = (filter = {}) => {
        return app.db(accounts).where(filter).select().first()
    }

    return {findAll, save, findByID}
}