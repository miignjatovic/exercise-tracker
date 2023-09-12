import express from 'express'
import cors from 'cors'
import bp from 'body-parser'
import { fileURLToPath } from 'url'
import morgan from 'morgan'
import routes from './api/routes.js'
import { openDbConnection, closeDbConnection, useDb } from './api/db.middleware.js'

// get db connection
const db = await openDbConnection()

// create express app
const app = express()

// setup middleware
app.use(useDb(db))
app.use(cors())
app.use(morgan('dev'))
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(express.static('public'))

// root route
app.get('/', (req, res) => {
    res.sendFile(fileURLToPath(new URL('views/index.html', import.meta.url)))
})

// api routes
app.use('/api', routes)

// if testing use a dynamic port because of how jest runs tests
const PORT = process.env.NODE_ENV === 'test' ? 0 : 3000

const listener = app.listen(PORT, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})

closeDbConnection(db)

export default app
