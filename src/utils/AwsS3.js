
import { nanoid } from 'nanoid'
import AWS from './aws-config.js'


const s3 = new AWS.S3()


export const generateUploadURL = async () => {


    const date = new Date();
    const imageName = `IMG-${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject', {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: imageName,
        Expires: 1000,
        ContentType: 'image/jpeg',
    })

}