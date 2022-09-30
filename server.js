// Load dotenv config
require("dotenv").config()

// Const and imports
const express = require("express")
const app = express()
const auth = require("./auth").Authentication
const register = require('./register').Signup
const handlebars = require("express-handlebars")
const session = require("express-session")
const MongoStore = require("connect-mongo");

// Server configuration
const PORT = process.env.PORT || 8000
app.use(session({
    store: new MongoStore({
        mongoUrl: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.CLUSTER_URI}/${process.env.DATABASE_NAME}`,
        ttl: 60 // 1 minute...
    }),
    secret: "top-secret",
    resave: "true",
    saveUninitialized: true
}))
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Handlebars configuration
const hbs = handlebars.create({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts/",
})

app.engine("hbs", hbs.engine)
app.set("view engine", "hbs")
app.set("views", "views")

// Signup, signin and signout
app.post("/signin", auth)

app.post("/signup", register)

app.post("/signout", (req, res) => {
    const username = req.session.user
    req.session.destroy( err => {
        if (!err) res.render("logout", {username: username})
        else res.send({status: "Logout error", body: err})
    })
})

// Endpoints
app.get("/", (req, res) => {
    req.session.user ? res.render("index", {username: req.session.user, admin: req.session.admin}) : res.redirect("/login")
})

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/signin.html")
})

app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/public/signup.html")
})

// 404 Error
app.use((req, res) => {
    const response = {
        error: -2,
        description: `${req.url} ${req.method} not implemented`
    }
    res.status(404).json(response)
})

// Server start
const server = app.listen(PORT, () => {
    console.log(`Server running on Port No. ${PORT}`)
})

// Server error handling
server.on("error", (err) => {
    console.error(`Error: ${err}`)
})