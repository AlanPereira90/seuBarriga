const express = require('express')
const RecursoIndevidoError = require('../errors/recursoIndevidoError')

module.exports = (app) => {
    const router = express.Router()

    const validator = (req, resp, next) => {
        app.services.transfer.validateTransfer({...req.body, user_id: req.user.id})
            .then(() => next())
            .catch(err => next(err)) 
    }

    router.param('id', (req, resp, next) => {
        app.services.transfer.findOne({'id': req.params.id}).then(result => {
            if(result.user_id != req.user.id){
                throw new RecursoIndevidoError()
            } else {
                next()
            }
        }).catch(err => next(err))
    })

    router.get('/', (req, resp, next) => {
        app.services.transfer.find({user_id: req.user.id}).then(result => {
            resp.status(200).json(result)
        }).catch(err => next(err))
    })

    router.post('/', validator, (req,resp,next) => {
        const transfer = {...req.body, user_id: req.user.id}
        app.services.transfer.save(transfer).then(result => {
            resp.status(201).json(result[0])
        }).catch(err => next(err))
    })

    router.get('/:id', (req,resp,next) => {
        app.services.transfer.findOne({id: req.params.id}).then(result => {
            resp.status(200).json(result)
        }).catch(err => next(err))
    })

    router.put('/:id', validator, (req,resp,next) => {
        const transfer = {...req.body, user_id: req.user.id}
        app.services.transfer.update(req.params.id, transfer).then(result => {
            resp.status(201).json(result[0])
        }).catch(err => next(err))
    })

    router.delete('/:id', (req,resp,next) => {
        app.services.transfer.remove(req.params.id).then(result => {
            resp.status(204).send()
        })
    })

    return router
}