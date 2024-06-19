
import { Thread } from '../models/Thread.model.js';
import { User } from '../models/User.model.js';
import { nanoid } from 'nanoid';

import asyncHandler from '../utils/asyncHandler.js';


// Create a new thread
const createThread = asyncHandler(async (req, res) => {

    let authorId = req.user;
    let { title, banner, content, tags, des, draft, id } = req.body;

    // Validate the data from frontend
    if (!title.length) {
        return res.status(403).json({
            error: "Title is required"
        });
    }

    if (!draft) {
        if (!des.length || des.length > 200) {
            return res.status(403).json({
                error: "Description must be less than 200 characters"
            });
        }

        if (!banner.length) {
            return res.status(403).json({
                error: "Banner is required"
            });
        }

        if (!content.blocks.length) {
            return res.status(403).json({
                error: "There must be some content in the thread to publish"
            });
        }

        if (!tags.length || tags.length > 5) {
            return res.status(403).json({
                error: "Provides tags for the thread. Maximum 5 tags are allowed"
            });
        }
    }

    // Now all the tags should be in lowercase for the uniformity and to avoid duplication
    tags = tags.map(tag => tag.toLowerCase());

    let thread_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    if(id){

        Thread.findOneAndUpdate( { thread_id: id }, { title, des, banner, content, tags, draft: draft ? draft: false })
        .then( thread => {
            return res.status(200).json({
                id: thread_id
            })
        })
        .catch( err => {
            return res.status(500).json({
                error: "Failed to update the thread"
            })
        })

    } else{

        let thread = new Thread({
            title, des, banner, content, tags, author: authorId, thread_id, draft: Boolean(draft)
        })
    
        thread.save().then(thread => {
            let incrementVal = draft ? 0 : 1;
    
            User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts": incrementVal }, $push: { "threads": thread._id } })
            .then( user => {
                return res.status(200).json({
                    id: thread._id
                })
            })
            .catch(err => {
                return res.status(500).json({
                    error: "Failed to update total posts number"
                })
            })
    
        })
        .catch( err => {
            return res.status(500).json({
                error: err.message
            })
        
        })

    }
})


// Get the latest 5 threads api
const latestThreads = asyncHandler(async (req, res) => {

    let { page } = req.body;

    // Get the latest 5 threads from the database
    let maxLimit = 10;

    // console.log("Page:", page.page, "Skip:", ((page.page - 1) * maxLimit)); // Debugging

    Thread.find({ draft: false })
        .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
        .sort({ "createdAt": -1 })
        .select('thread_id title des banner tags author createdAt activity -_id')
        .skip(( page.page - 1 ) * maxLimit)
        .limit(maxLimit)
        .then(threads => {
            return res.status(200).json({
                threads
            })
        })
        .catch(err => {
            return res.status(500).json({
                error: err.message
            })
        })

})


// API to get the trending threads
const trendingThreads = asyncHandler( async (req, res) => {

    Thread.find( { draft: false } )
    .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
    .sort( { "activity.total_read": -1, "activity.total_likes": -1, "createdAt": -1 })
    .select("thread_id title createdAt author activity -_id")
    .limit(5)
    .then( threads => {
        return res.status(200).json({
            threads
        })
    })
    .catch( err => {
        return res.status(500).json({
            error: err.message
        })
    })
})


// Route for srearching the threads according to the tag
const searchedThreads = asyncHandler( async (req, res) => {
    
    let { tag, query, page, author, limit, eleminate_thread } = req.body;

    let findQuery;

    if(tag){
        findQuery = { tags: tag, draft: false, thread_id: { $ne: eleminate_thread }};
    } else if(query){
        findQuery = { draft: false, title: new RegExp(query, 'i')}
    } else if(author){
        findQuery = { draft: false, author }
    }

    let maxLimit = limit ? limit : 10;

    // console.log("Page:", page.page, "Skip:", ((page.page - 1) * maxLimit)); // Debugging

    Thread.find( findQuery )
    .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
    .sort( { "createdAt": -1 } )
    .select('thread_id title des banner tags author createdAt activity -_id')
    .skip( (page.page - 1) * maxLimit)
    .limit(maxLimit)
    .then( threads => {
        return res.status(200).json( {
            threads
        })
    })
    .catch( err => {
        return res.status(500).json({
            error: err.message
        })
    })

})


// This route will give the thread by for pagination
const pagedThreads = asyncHandler( async(req, res) => {

    Thread.countDocuments( { draft: false } )
    .then( count => {
        return res.status(200).json({
            totalDocs: count
        })
    })
    .catch( err => {
        console.logI(err.message)
        return res.status(500).json({ error: err.message })
    })



})


const pagedSearchThreads = asyncHandler(async (req, res) => {

    let { tag, query, author } = req.body;

    let findQuery;

    if(tag){
        findQuery = { tags: tag, draft: false};
    } else if(query){
        findQuery = { draft: false, title: new RegExp(query, 'i')}
    } else if(author){
        findQuery = { draft: false, author }
    }
    
    Thread.countDocuments( findQuery )
    .then( count => {
        return res.status(200).json({
            totalDocs: count
        })
    })
    .catch( err => {
        console.logI(err.message)
        return res.status(500).json({ error: err.message })
    })

})



const getThread = asyncHandler( async (req, res) => {

    let { thread_id, draft, mode } = req.body;

    let incrementVal = mode != 'edit' ? 1 : 0 ;

    Thread.findOneAndUpdate( { thread_id }, { $inc: { "activity.total_reads": incrementVal}})
    .populate( 'author', 'personal_info.fullname personal_info.username personal_info.profile_img ')
    .select(' title des content banner activity createdAt thread_id tags')
    .then( thread => {

        // Increment the total reads of the author profile
        User.findOneAndUpdate( 
            { "personal_info.username": thread.author.personal_info.username }, 
            { $inc : { "account_info.total_reads": incrementVal } }
        )
        .catch( err => {
            return res.status(500).json({ error: err.message })
        })

        // This will ristrict the access to draft thread
        if(thread.draft && !draft ) {
            return res.status(500).json({
                error: "You cannot access draft thread"
            })
        }
 
        return res.status(200).json({ thread })

    })
    .catch( err => {
        return res.status(500).json({
            error: err.message
        })
    })

})





export {
    createThread,
    latestThreads,
    trendingThreads,
    searchedThreads,
    pagedThreads,
    pagedSearchThreads,
    getThread
}
