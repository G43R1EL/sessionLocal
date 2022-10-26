require('dotenv').config()

const {default: mongoose} = require('mongoose')

const connect = async () => {
    await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.CLUSTER_URI}/${process.env.DATABASE_NAME}`)
}

module.exports = connect