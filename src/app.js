const app = require('express')()
const consign = require('consign')
const knex = require('knex')
const knexfile = require('../knexfile')

app.db = knex(knexfile.test)

consign({ cwd: 'src', verbose: false})
    .include('./config/middlewares.js')
    .then('./services')
    .then('./routes')
    .then('./config/routes.js')        
    .into(app)

app.get('/',(req, resp) => {
    resp.status(200).send()
})

//tratamento de erro
app.use((err, req, resp, next) => {
    const {name, message, stack} = err
    if (name === 'ValidationError'){
        resp.status(400).json({error: message})
    } else {
        resp.status(500).json({name, message, stack})
    }
    next(err)
})

module.exports = app