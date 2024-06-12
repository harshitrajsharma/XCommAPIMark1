
// Extracted routere logic for creating routes
import { Router } from 'express'

// Importing user controller

import { registerUser, loginUser, googleLogInSignUp, uploadUserFiles, searchUser, userProfile } from '../controllers/user.controller.js'

const router = Router();

// Now Below are all the endpoints related to user registration, login and update profile

router.get('/test', (req, res) => {
    res.send('Welcome to the test rooute for Xcomm backend')
})

// Route to get the URL to upload to AWS S3 Bucket
router.get('/get-upload-url', uploadUserFiles)

// New user registration
router.post('/signup', registerUser);

// Existing user Login
router.post('/signin', loginUser);

// Login/Signup with Google
router.post('/google-auth', googleLogInSignUp);

// Route to search user in the database
router.post('/search-users', searchUser);

// Route to search user profile in the database
router.post('/get-profile', userProfile);


export default router
