const app = require('express')()
const consign = require('consign')

consign({ cwd: 'src', verbose: false})
    .include('./config/middlewares.js')
    .include('./routes')
    .include('./config/routes.js')        
    .into(app)

app.get('/',(req, resp) => {
    resp.status(200).send()
})

module.exports = app