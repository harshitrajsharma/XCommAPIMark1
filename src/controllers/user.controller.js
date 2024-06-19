import { User } from '../models/User.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as zod from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { nanoid } from 'nanoid';
import { getAuth } from "firebase-admin/auth";
import admin from 'firebase-admin';
import serviceAccount from "../xcomm-2f7e0-firebase-adminsdk-3sfqa-13ce03cd3f.json" assert { type: 'json' };
import { generateUploadURL } from '../utils/AwsS3.js';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Validation schema for user registration
const userRegister = zod.object({

    fullname: zod.string()
        .min(3, {
            message: "Full name must be at least 3 characters long"
        })
        .max(50, {
            message: "Full name can be at most 50 characters long"
        }),

    email: zod.string()
        .email({
            message: "Invalid email format"
        }),

    password: zod.string()
        .min(6, {
            message: "Password must be at least 6 characters long"
        })
        .refine(value => /[A-Z]/.test(value), {
            message: "Password must contain at least one uppercase letter"
        })
        .refine(value => /[a-z]/.test(value), {
            message: "Password must contain at least one lowercase letter"
        })
        .refine(value => /[0-9]/.test(value), {
            message: "Password must contain at least one number"
        })
        .refine(value => /[^a-zA-Z0-9]/.test(value), {
            message: "Password must contain at least one special character"
        }),
});

// Function to format user data before sending in response 
const formatDatatoSend = (user) => {

    const payload = { id: user._id }

    const access_token = jwt.sign(
        payload, process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )

    const response = new ApiResponse(200, {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
    }, "Authenticated ")

    return response.data;
}

// Generate a unique username for the user
const generateUsername = async (email) => {
    let username = email.split('@')[0]

    // Check if the user already exists with this username then add a random number to the username to make it unique
    let isUsernameExists = await User.findOne({ "personal_info.username": username })

    if (isUsernameExists) {
        username += nanoid().substring(0, 5);
    }

    return username
}

const uploadUserFiles = asyncHandler( async ( req, res, next ) => {

    console.log("File entered here")

    generateUploadURL().then(url => {
        console.log("URL:", url)

        return res.status(200).json({ 
        uploadURL: url
    })})
    .catch( err => {
        console.log("From here: ", err.message);
        return res.status(500).json({
            error: err.message
        })
    })
})



// Function to register a new user
const registerUser = asyncHandler(async (req, res, next) => {
    // Validate request body
    const result = userRegister.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Validation Error",
        })
    }

    const { fullname, email, password } = req.body;

    // Checking if user exists in DB or not
    let userExists = await User.findOne({ "personal_info.email": email });

    console.log("Step 1: Checked for user exists in DB or not")

    // if user exists this if block, block it
    if (userExists) {
        return res.status(400).json({
            message: "User already exists",
        })
    }

    console.log("Step 2: No user found in DB. That's why creating a new user")


    // if it is a new user then the further process will start
    // Hashing password for security
    const randomValue = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, randomValue); // password is encrypted with bcrypt and random salt value

    console.log("Step 3: Password is hashed successfully. Now generating a unique username for the user")

    // Generating a unique username for the user
    let username = await generateUsername(email)

    console.log("Step 4: Unique username generated: ", username)

    // Check again if username is not null or undefined
    if (!username) {
        return res.status(500).json({
            message: "Failed to generate a unique username",
        })
    }

    console.log("Step 5: Username is not null or undefined")


    // Now, Password is secured properly
    // New user will be created
    let user = new User({
        personal_info: {
            fullname,
            email,
            password: hashedPassword,
            username,
        }
    })

    console.log("Step 6: User Created Successfully. Now saving the user in the database")

    await user.save().then((user) => {
        console.log("Step 7: Hey user saved")
        return res.status(200).json(formatDatatoSend(user))
    })
        .catch(err => {
            console.log("Step 8: Error in saving the user in the database")

            if (err.code === 11000) {
                return res.status(403).json({
                    message: "User Already Exists.",
                })
            }
            return res.status(500).json({
                message: err.message,
            })
        })



})


// Below is the login functionality of the user
const loginUser = asyncHandler(async (req, res) => {

    let { email, password } = req.body;

    User.findOne({ "personal_info.email": email })
        .then((user) => {

            if (!user) {
                return res.status(403).json({
                    "error": "Email not found"
                })
            }

            if (!user.google_auth) {

                bcrypt.compare(password, user.personal_info.password, (err, result) => {
                    if (err) {

                        return res.status(403).json({
                            "error": "Password is incorrect"
                        })
                    }

                    if (!result) {
                        return res.status(403).json({
                            "error": "Password is incorrect"
                        })
                    }
                    else {
                        return res.status(200).json(formatDatatoSend(user))
                    }
                })
            }
            else {
                return res.status(403).json({
                    "error": "This email is already registered with Google. Please login with Google"
                })
            }
        })
        .catch(err => {
            console.log("Error", err)
            return res.status(500).json({
                "error": err.message
            })
        })

})

// Google login/signup functionality
const googleLogInSignUp = asyncHandler(async (req, res) => {

    console.log("Step 1")

    let { access_token } = req.body;

    console.log("Step 2")

    getAuth().verifyIdToken(access_token)
        .then(async (decodedUser) => {
            
            console.log("Step 3")

            let { email, name, picture } = decodedUser;

            picture = picture.replace("/s96-c", "s384-c")

            console.log("Step 4")

            // Check if the user already exists
            let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")
                .then((userData) => {
                    console.log("Step 5")
                    return userData || null
                })
                .catch(err => {
                    console.log("Error 1:", err)
                    return res.status(500).json({
                        message: err.message
                    })
                })

            if (user) {

                console.log("Step 6")
                // Check if the user is already authenticated with google
                if (!user.google_auth) {
                    return res.status(403).json({
                        message: "This email is already registered without Google. Please login with email and password"
                    })
                }

            }
            else {

                // This else part is registring the new user with google in DB

                let username = await generateUsername(email)

                user = new User({
                    personal_info: {
                        fullname: name,
                        email,
                        profile_img: picture,
                        username,
                    },
                    google_auth: true,
                })

                await user.save().then((u) => {
                    user = u;
                })
                    .catch(err => {
                        console.log("Error 2:", err)
                        return res.status(500).json({
                            message: err.message
                        })
                    })
            }

            return res.status(200).json(formatDatatoSend(user))

        })
        .catch(err => {
            return res.status(500).json({
                message: "Failed to authenticate you with google. Please try again"
            })
        })

})

// Searching the user in the database by the search query substring in the username
const searchUser = asyncHandler(async (req, res) => {

    let { query } = req.body;

    User.find({ "personal_info.username": new RegExp(query, 'i') })
    .limit(50)
    .select("personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .then( users => {
        return res.status(200).json({
            users
        })
    })
    .catch( err => {
        return res.status(500).json({
            error: err.message
        })
    })

})


// Get the user profile by the username
const userProfile = asyncHandler(async (req, res) => {

    let { username } = req.body;
    User.findOne( { "personal_info.username": username } )
    .select("-personal_info.password -google_auth  -updatedAt -threads ")
    .then( user => {
        return res.status(200).json(user)
    })
    .catch(err => {
        console.log(err)
        return res.status(500).json({
            error: err.message
        })
    
    })


})

export {
    registerUser,
    loginUser,
    googleLogInSignUp,
    uploadUserFiles,
    searchUser,
    userProfile
}