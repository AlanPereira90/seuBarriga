module.exports = (app) => {

    const signin = (req, resp, next) => {

        app.services.authService.signin(req.body).then(result => {
            resp.status(200).json(result)
        }).catch(err => next(err))
    }
    
    return {
        signin
    }
}