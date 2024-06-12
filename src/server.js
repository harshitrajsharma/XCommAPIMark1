import app from './app.js'
import connectToDB from './db/connectToDb.js'
import dotenv from 'dotenv'

dotenv.config({
    path: './.env',
})

const PORT = process.env.PORT || 3000;

connectToDB()
.then(
    () => {
        app.listen(PORT,  () => {
            console.log(`Server is listening on port http://localhost:${PORT}`);
        });
    }
)
.catch( 
    () => {
        console.log("Error in connecting to the database. Thet's why server is not running.")
    }
)