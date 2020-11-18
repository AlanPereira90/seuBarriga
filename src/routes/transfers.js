const express = require('express')
const { restart } = require('nodemon')

module.exports = (app) => {
    const router = express.Router()

    router.get('/', (req, resp, next) => {
        app.services.transfer.find({user_id: req.user.id}).then(result => {
            resp.status(200).json(result)
        }).catch(err => next(err))
    })

    router.post('/', (req,resp,next) => {
        const transfer = {...req.body, user_id: req.user.id}
        app.services.transfer.save(transfer).then(result => {
            resp.status(201).json(result[0])
        }).catch(err => next(err))
    })

    return router
}