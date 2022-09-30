const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    fullname: { type: String, default: '' },
    email: { type: String, default: '' },
    password: { type: String, default: '' },
    address: { type: String, default: '' }
}, { timestamps: true })

module.exports = UserSchema