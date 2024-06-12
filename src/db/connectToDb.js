import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Added the retry quries in case of bad internet connection
const connectToDB = async ( retries = 5 ) => {
    mongoose.set('strictQuery', true)

    if(mongoose.connection.readyState === 1 ){
        console.log("Database is already connected");
        return;
    }

    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n Sucessfully connected to MongoDB !! DB Host: ${connectionInstance.connection.host} `)
    } catch (error) {
        console.error('Error connecting MongoDB:', error);
        
        // Retrying connection logic
        if( retries === 0 ){
            process.exit(1); // exit with error
        }
        else {
            console.log(`Retries left: ${retries}, retrying in 5 seconds...`)
            setTimeout( () => connectToDB(retries -1 ), 5000) // recursively retries for DB connection
        }
    }
}

export default connectToDB;