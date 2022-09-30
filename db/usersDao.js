const Container = require('./containerMongoDB')
const UserSchema = require('./schema/userSchema')

class UsersDAO extends Container {
    constructor() {
        super(UserSchema, 'users')
        this.connect().catch(err => {
            throw new Error(`Error: ${err}`)
        })
    }
}

const usersDAO = new UsersDAO()

module.exports = {
    usersDAO
}