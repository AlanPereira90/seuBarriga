module.exports = app => {

    const bodyParser = require('body-parser')    
    const knexLogger = require('knex-logger')

    app.use(bodyParser.json())
    app.use(knexLogger(app.db))
    
} 
