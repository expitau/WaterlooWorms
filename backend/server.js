const express = require('express')
const cors = require('cors')
const fs = require('fs')
const app = express()
const port = 3000
require('dotenv').config()

let filepath = process.env.API_DATA_PATH

app.use(express.json())
app.use(cors({
    origin: "*"
}))

function authenticate(req, res) {
    return 0;
    if (!req.query.pwd) {
        res.status(401).json("Authentication required")
        return 1;
    }
    if (req.query.pwd != process.env.API_PASSWORD) {
        res.status(401).json("Bad password")
        console.log(`Invalid password attempt: ${password}`)
        return 1;
    }
    return 0;
}

app.post('/', (req, res) => {
    // console.log(`A post request was made from ${req.header('x-forwarded-for') || req.connection.remoteAddress}`)
    if (authenticate(req, res)) return

    let [id, data] = Object.entries(req.body)[0]

    var filecontents = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    let isDuplicate = Object.keys(filecontents).includes(id)
    filecontents[id] = data;
    fs.writeFileSync(filepath, JSON.stringify(filecontents, null, '\t'));
    console.log(`${isDuplicate ? "(Duplicate) " : ""}${id} saved -- ${Object.keys(filecontents).length} total`);
    res.json("Success");
})

app.post('/delete', (req, res) => {
    if (authenticate(req, res)) return

    let ids = req.body

    var filecontents = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    fs.writeFileSync(filepath, JSON.stringify(Object.fromEntries(Object.entries(filecontents).filter(x => ids.includes(x[0])))), null, '\t')
    console.log(`Deleted ${Object.keys(filecontents).filter(x => !ids.includes(x))}`)
})

app.get('/', (req, res) => {
    console.log(`A get request was made from ${req.header('x-forwarded-for') || req.connection.remoteAddress}`)
    if (authenticate(req, res)) return

    console.log("A get request was made")
    var filecontents = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    res.json(filecontents);
})

app.listen(port, () => {
    console.log(`WWData API listening at http://localhost:${port}`)
})
