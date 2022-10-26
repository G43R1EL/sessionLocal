const bCrypt = require('bcrypt')

const passwordHash = (password) => {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null)
}

const passwordCheck = (password, hash) => {
    return bCrypt.compareSync(password, hash)
}

module.exports = {
    passwordHash,
    passwordCheck
}