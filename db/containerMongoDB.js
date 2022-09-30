require('dotenv').config()
const { Types, default: mongoose } = require('mongoose')
const mongodb_uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.CLUSTER_URI}/${process.env.DATABASE_NAME}`

module.exports = class ContainerMongodb {
    constructor(schema, collectionName) {
        this.mongodb_uri = mongodb_uri
        this.schema = schema
        if (this.schema) {
            this.collection = mongoose.model(collectionName, this.schema)
        }
    }

    async connect () {
        try {
            return await mongoose.connect(this.mongodb_uri)
        } catch (err) {
            throw new Error(`Error: ${err}`)
        }
    }

    async save (data) {
        try {
            return await this.collection.create(data)
        } catch (err) {
            console.error(err)
        }
    }

    async getAll() {
        try {
            return this.collection.find()
        } catch (err) {
            console.error(err)
        }
    }

    async getById(id) {
        try {
            id = Types.ObjectId(id)
            return await this.collection.findOne({ _id: id })
        } catch (err) {
            console.error(err)
        }
    }

    async updateById (id, item) {
        item._id = id
        try {
            const { mdfCount } = await this.collection.replaceOne({ _id: item._id }, item)
            if (mdfCount) {
                return { success: 'data updated' }
            } else {
                return { error: 'data not found' }
            }
        } catch (err) {
            console.error(err)
        }
    }

    async deleteById (id) {
        try {
            const { delCount } = await this.collection.deleteOne({ _id: id })
            if (delCount) {
                return { success: 'data deleted' }
            } else {
                return { error: 'data not found' }
            }
        } catch (err) {
            console.error(err)
        }
    }
}