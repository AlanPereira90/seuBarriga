module.exports = function RecursoIndevidoError(message= 'Recurso não pertence ao usuário'){
    this.name = 'RecursoIndevidoError'
    this.message = message
}