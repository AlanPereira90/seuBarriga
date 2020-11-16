const express = require('express')
const RecursoIndevidoError = require('../errors/recursoIndevidoError')

module.exports = (app) => {

    const router = express.Router()

    //esta rotina é disparada sempre que uma rota trouxer o param id em sua requisição
    router.param('id', (req, res, next) => {
        app.services.account.find({id: req.params.id}).then(result => {
            if(result.user_id != req.user.id){
                throw new RecursoIndevidoError()
            } else {
                next()
            }
        }).catch(err => next(err))
    })

    router.get('/', (req,resp,next) => {
        app.services.account.findAll(req.user.id).then(result => {
            resp.status(200).json(result)
        }).catch(err => next(err))
    })
    
    router.post('/', (req,resp,next) => { 
        app.services.account.save({...req.body, user_id: req.user.id}).then(result => {
            resp.status(201).json(result[0])
        }).catch(err => next(err))    
    })

    router.get('/:id', (req,resp,next) => {
        app.services.account.find({id: req.params.id}).then(result => {
            resp.status(200).json(result)
        }).catch(err => {next(err)})
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

