const express = require('express')
const { queryAll,connect,disconnect } = require('./db')
const app = express()
const router = require('express').Router()
const { shorten, redirect, random } = require('./controller')

app.use(express.static('build'))
app.use(express.json())

// attention: the order of the routes matters

router.post('/shorten', (req, res) => {
    shorten(req, res)
})
router.get('/random', (req, res) => {
    random(req, res)
})
router.get('/:shortId', (req, res, next) => {
    redirect(req, res)
})



app.use('/', router)

const server = app.listen(process.env.PORT,async () => {
    await connect()
    console.log(`App listening on port ${process.env.PORT}`)
})

// graceful shutdown
// process.on('SIGINT', () => {
//     console.log('SIGINT signal received: closing HTTP server')
//     server.close(() => {
//         disconnect()
//         console.log('HTTP server closed')
//     })
//   })