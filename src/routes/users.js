module.exports = () => {

    const findAll = (req,resp) => {
        const users = [
            {
                name: 'Jonh Doe',
                email: 'john@gmail.com'
            }
        ]
        resp.status(200).json(users)
    }
    
    const create = (req,resp) => {
        resp.status(201).json(req.body)
    }

    return {
        findAll,
        create
    }
}

