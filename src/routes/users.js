const user = require("../services/user")

module.exports = (app) => {

    const findAll = (req,resp) => {
        app.services.user.findAll().then(result => {
            resp.status(200).json(result)
        })
    }
    
    const create = async (req,resp) => {        
        const result = await app.services.user.save(req.body)

        if (result.error){
            return resp.status(400).json(result)
        }
        resp.status(201).json(result[0])
    }

    return {
        findAll,
        create
    }
}

