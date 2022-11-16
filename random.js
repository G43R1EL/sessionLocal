const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
const port = argv.port || 8080
const mode = argv.mode || 'fork'
const cluster = require('cluster')
const processor_count = require('os').cpus().length

if (cluster.isMaster) {
    console.log(`Cantidad de núcleos disponibles: ${processor_count}`)
    console.log(`Hilo principal en el proceso PID: ${process.pid}`)
    // Cluster
    if (mode === 'cluster') {
        for (let i = 0; i < processor_count; i++) {
            cluster.fork()
        }
        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} terminó.`)
            console.log('Iniciando otro worker...')
            cluster.fork()
        })
    } else {
        cluster.fork()
        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} terminó.`)
            console.log('Iniciando otro worker...')
            cluster.fork()
        })
    }
} else {
    const express = require('express')
    const server = express()
    const {fork} = require('child_process')
    const child = fork('./helpers/randomGenerator.js')
    server.use(express.json())
    server.use(express.urlencoded({extended: true}))
    server.get('/api/random', async (req, res) => {
        const rounds = req.query.cant || 100000000
    child.send(rounds)
    child.on('message', (msg) => {
        res.end(`<p>Worker ID => ${cluster.worker.id}</p>${msg}`)
    })
    })
    server.listen(port, () => {
        console.log(`Server running on PORT ${port}`)
    })
    server.on('error', (err) => {
        console.error(`Server error: ${err.message}`)
    })
}