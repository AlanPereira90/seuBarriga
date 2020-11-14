const express = require('express')

module.exports = (app) => {

    const router = express.Router()

    router.get('/', (req,resp,next) => {
        app.services.account.findAll().then(result => {
            resp.status(200).json(result)
        }).catch(err => next(err))
    })
    
    router.post('/', (req,resp,next) => { 
        app.services.account.save(req.body).then(result => {
            resp.status(201).json(result[0])
        }).catch(err => next(err))    
    })

    router.get('/:id', (req,resp,next) => {
        app.services.account.findByID({id: req.params.id}).then(result => {
            resp.status(200).json(result)
        }).catch(err => next(err))
    })

    router.put('/:id', (req,resp,next) => {
        app.services.account.update(req.params.id, req.body).then(result => {
            resp.status(201).json(result[0])
        }).catch(err => next(err))
    })

    router.delete('/:id', (req,resp,next) => {
        app.services.account.remove(req.params.id).then(() => {
            resp.status(204).send()
        }).catch(err => next(err))
    })

    return router
}

