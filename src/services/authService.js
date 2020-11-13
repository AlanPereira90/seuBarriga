const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')
const ValidationError = require('../errors/validationError')

const secret = 'barriga'

module.exports = (app) => {

    const signin = (auth) => {
        const {mail, password} = auth     

        return new Promise((resolve, reject) => {
            app.services.user.findOne({mail}).then(user => {

                if (!user) throw new ValidationError('Não foi possível autenticar, usuário e/ou senha inválido')

                if (bcrypt.compareSync(password, user.password)){              
                    
                    const payload = {
                        id: user.id,
                        name: user.name,
                        mail: user.mail
                    }                  
    
                    const token = jwt.encode(payload, secret)            
                    resolve({token})
                } else {
                    throw new ValidationError('Não foi possível autenticar, usuário e/ou senha inválido')
                }
            }).catch(err => reject(err))
        })
    }

    return {signin}
}