import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors( ))

app.use(express.json({ limit: '20kb' })) // req.body limit 20kb

app.use(urlencoded({ extended: true, limit: '20kb' })) // It is used to parse the form data that is sent to the server. Bascially we are telling our server that we are going to be sending form data with in the url in the encoded format

app.use(cookieParser()); // It is used to parse the cookies that are sent to the server


// Importing default routes
import defaultRouter from './routes/default.routes.js'
// import { errorHandling } from './middlewares/errorHandling.js'

app.get('/api/v1/', (req, res) => {
    res.send('Welcome to the Xcomm backend')
})

app.get('/keep-alive', (req, res) => {
    res.send('Server is alive');
});

app.use('/api/v1', defaultRouter)
app.use('/', defaultRouter)
// app.use(errorHandling)


// Function to send a keep-alive request to the server
const sendKeepAliveRequest = () => {
    fetch('https://xcommapimark1.onrender.com/keep-alive')
        .then(response => response.text())
        .then(data => console.log('Keep-alive response:', data))
        .catch(error => console.error('Keep-alive request failed:', error));
};

// Call the sendKeepAliveRequest function every 5 minutes (300000 milliseconds)
setInterval(sendKeepAliveRequest, 300000);

export default app