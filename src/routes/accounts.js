const account = require("../services/account")

module.exports = (app) => {

    const findAll = (req,resp) => {
        app.services.account.findAll().then(result => {
            resp.status(200).json(result)
        })
    }
    
    const create = async (req,resp) => {        
        const result = await app.services.account.save(req.body)

        if (result.error){
            return resp.status(400).json(result)
        }
        resp.status(201).json(result[0])
    }

    const find = (req,resp) => {
        app.services.account.findByID({id: req.params.id}).then(result => {
            resp.status(200).json(result)
        })
    }

    return {
        findAll,
        create,
        find
    }
}

