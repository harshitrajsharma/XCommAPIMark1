import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors())

app.use(express.json({ limit: '20kb' })) // req.body limit 20kb

app.use(urlencoded({ extended: true, limit: '20kb' })) // It is used to parse the form data that is sent to the server. Bascially we are telling our server that we are going to be sending form data with in the url in the encoded format

app.use(cookieParser()); // It is used to parse the cookies that are sent to the server


// Importing default routes
import defaultRouter from './routes/default.routes.js'
// import { errorHandling } from './middlewares/errorHandling.js'

app.get('/', (req, res) => {
    res.send('Welcome to the Xcomm backend')
})

app.use('/api/v1', defaultRouter)
// app.use(errorHandling)

export default app