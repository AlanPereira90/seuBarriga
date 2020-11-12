module.exports = (app) => {
    
    const findAll = (filter = {}) => {
        return app.db('users').where(filter).select()
    }

    const save = async (user) => {
        if (!user.name){
            return {error: 'Nome é um atributo obrigatório'}
        } else if (!user.mail){
            return {error: 'Email é um atributo obrigatório'}
        } else if (!user.password){
            return {error: 'Senha é um atributo obrigatório'}
        }

        const userDb = await findAll({mail: user.mail})
        if (userDb && userDb.length > 0){
            return {error: `Já existe um usuário com o email ${user.mail}`}
        }

        return app.db('users').insert(user, '*')
    } 

    return {findAll, save}
}