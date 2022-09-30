const { usersDAO } = require('./db/usersDao')
const bcrypt = require('bcrypt')
const saltRounds = 10

const Signup = (req, res) => {
    const user = req.body
    usersDAO.getAll().then(users => {
        console.log(users)
        if (user.email && user.password) {
            bcrypt.hash(user.password, saltRounds, (err, hash) => {
                user.password = hash
                usersDAO.save(user).then( () => {
                    res.redirect('/')
                })
            })
        } else {
            res.redirect('/signup_error')
        }
    })
}

module.exports = {
    Signup: Signup
}