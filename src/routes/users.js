const express = require('express')

module.exports = (app) => {

    const router = express.Router()

    router.get('/', (req,resp,next) => {
        app.services.user.findAll().then(result => {
            resp.status(200).json(result)
        }).catch(err => next(err))
    })
    
    router.post('/', (req,resp,next) => {  
        app.services.user.save(req.body).then(result => {
            resp.status(201).json(result[0])
        }).catch(err => next(err))
    })

    return router
}

