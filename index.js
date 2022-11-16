const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
const port = argv.port || 8080
const mode = argv.mode || 'fork'

const express = require('express')
const server = express()

server.use(express.json())
server.use(express.urlencoded({extended: true}))

server.get('/', (req, res) => {
    res.send(`<h1>Express Server <q>${process.pid}</q></h1><p>${Date()}</p>`)
})

server.listen(port, () => {
    console.log(`Server running on PORT ${port}`)
})

server.on('error', (err) => {
    console.error(`Server error: ${err.message}`)
})