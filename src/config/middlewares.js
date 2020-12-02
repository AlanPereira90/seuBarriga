module.exports = app => {

    const bodyParser = require('body-parser')    
    //const knexLogger = require('knex-logger')
    const cors = require('cors')

    app.use(bodyParser.json())
   // app.use(knexLogger(app.db))
   app.use(cors({origin: '*'}))
    
} 
