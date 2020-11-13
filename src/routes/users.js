const user = require("../services/user")

module.exports = (app) => {

    const findAll = (req,resp,next) => {
        app.services.user.findAll().then(result => {
            resp.status(200).json(result)
        }).catch(err => next(err))
    }
    
    const create = (req,resp,next) => {  
        app.services.user.save(req.body).then(result => {
            resp.status(201).json(result[0])
        }).catch(err => next(err))
    }

    return {
        findAll,
        create
    }
}

