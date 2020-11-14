const express = require('express')

module.exports = (app) => {

    const router = express.Router()

    router.post('/signin', (req, resp, next) => {

        app.services.authService.signin(req.body).then(result => {
            resp.status(200).json(result)
        }).catch(err => next(err))
    })

    router.post('/signup', (req, resp, next) => {
        app.services.user.save(req.body).then(result => {
            resp.status(201).json(result[0])
        }).catch(err => next(err))
    })
    
    return router
}