const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fullname: { type: String },
    username: { type: String },
    password: { type: String },
    address: { type: String }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

module.exports = User