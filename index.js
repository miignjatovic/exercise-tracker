import express from 'express'
import cors from 'cors'
import bp from 'body-parser'
import { fileURLToPath } from 'url'
import morgan from 'morgan'
import routes from './api/routes.js'

// create express app
const app = express()
// setup middleware
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

export default app
