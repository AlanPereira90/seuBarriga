const account = require("../services/account")

module.exports = (app) => {

    const findAll = (req,resp,next) => {
        app.services.account.findAll().then(result => {
            resp.status(200).json(result)
        }).catch(err => next(err))
    }
    
    const create = (req,resp,next) => { 
        app.services.account.save(req.body).then(result => {
            resp.status(201).json(result[0])
        }).catch(err => next(err))
             

        
    }

    const find = (req,resp,next) => {
        app.services.account.findByID({id: req.params.id}).then(result => {
            resp.status(200).json(result)
        }).catch(err => next(err))
    }

    const update = (req,resp,next) => {
        app.services.account.update(req.params.id, req.body).then(result => {
            resp.status(201).json(result[0])
        }).catch(err => next(err))
    }

    const remove = (req,resp,next) => {
        app.services.account.remove(req.params.id).then(() => {
            resp.status(204).send()
        }).catch(err => next(err))
    }

    return {
        findAll,
        create,
        find,
        update,
        remove
    }
}

