// Load dotenv
require('dotenv').config()

// Cluster
const cluster = require('cluster')

// CPUs
const processor_count = require('os').cpus().length

// Yargs
const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
const port = argv.port || 8000
const mode = argv.mode || 'fork'

// Mongo
const {Types} = require('mongoose')
const connect = require('./db/db')
const User = require('./db/schema/userSchema')
const MongoStore = require('connect-mongo')
connect()

// Session & Passport
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
passport.use('signin', new LocalStrategy( (username, password, done) => {
    User.findOne({username}, (err, user) => {
        if (err) { return done(err) }
        if (!user) { return done(null, false) }
        if (!passwordCheck(password, user.password)) { return done(null, false) }
        return done(null, user)
    })
}))
passport.use('signup', new LocalStrategy({
    passReqToCallback: true
}, (req, username, password, done) => {
    User.findOne({username}, (err, user) => {
        if (err) { return done(err) }
        if (user) { return done(null, false) }
        const {fullname, address} = req.body
        const passHash = passwordHash(password)
        const newUser = new User({fullname, username, password: passHash, address})
        newUser.save()
        return done(null, newUser)
    })
}))
passport.serializeUser((user, done) => {
    done(null, user._id)
})
passport.deserializeUser(async (id, done) => {
    id = Types.ObjectId(id)
    const user = await User.findById(id)
    done(null, user)
})

// Password hash & checks
const {passwordHash, passwordCheck} = require('./helpers/passwordHash')
const {getAuth} = require("./helpers/auth");

// Handlebars
const handlebars = require('express-handlebars')
const hbs = handlebars.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/'
})

// Router
const ramdomRouter =  require('./routes/randomRouter').randomRouter

// Server Cluster / Fork
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
    // Express
    const express = require('express')
    const server = express()

    // Server config and middlewares
    server.engine('hbs', hbs.engine)
    server.set('view engine', 'hbs')
    server.set('views', 'views')
    server.use(express.json())
    server.use(express.urlencoded({extended: true}))
    server.use(express.static('public'))
    server.use(session({
    secret: 'top-secret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        mongoUrl: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.CLUSTER_URI}/${process.env.DATABASE_NAME}`,
        retries: 0,
        ttl: 60 * 10 // 10 minutes session
    })
    }))
    server.use(passport.initialize())
    server.use(passport.session())
    server.use('/api/random', ramdomRouter)

    // Routes
    server.get('/', getAuth, (req, res) => {
        res.render('index', {username: req.user.username})
    })

    server.get('/login', (req, res) => {
        res.sendFile(__dirname + '/public/signin.html')
    })

    server.get('/logout', (req, res) => {
        res.render('logout')
    })

    server.get('/register', (req, res) => {
        res.sendFile(__dirname + '/public/signup.html')
    })

    server.get('/info', getAuth, (req, res) => {
        res.render('info', {
            argvs: process.argv.slice(2),
            platform: process.platform,
            node: process.version,
            memory: process.memoryUsage().rss,
            path: process.execPath,
            pid: process.pid,
            folder: process.cwd(),
            cpus: processor_count
        })
    })

    server.post('/signin', passport.authenticate('signin', {
        failureRedirect: '/login?error=signin' // SignIn error view implemented on login screen
    }), (req, res) => {
        req.session.user = req.user
    res.redirect('/')
    })

    server.post('/signup', passport.authenticate('signup', {
        failureRedirect: '/login?error=exist' // SignUp error view implemented on login screen
    }), (req, res) => {
        req.session.user = req.user
    res.redirect('/')
    })

    server.post('/signout', (req, res) => {
        const username = req.user.fullname
    req.session.destroy()
    req.logout(() => {
        res.redirect(`/logout?username=${username}`)
    })
    })

    // Server start
    server.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })

    // Server error
    server.on('error', (err) => {
        console.error(`Server error: ${err.message}`)
    })
}