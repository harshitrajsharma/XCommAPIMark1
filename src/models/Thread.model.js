import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const threadSchema = new Schema({

    thread_id: {
        type: String,
        required: true,
        unique: true,
    },

    // Title is for the title of the thread
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Max length should be 100']
    },

    
    // This is for the cover image of that thread
    banner: {
        type: String,
    },


    // Short description for that Thread
    des: {
        type: String,
        maxlength: 200,
        // required: true
    },

    // This is for the content of the Thread
    content: {
        type: [],
    },

    // This is for the user who has created that thread
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // this is to keep track to which category this thread belongs
    tags: {
        type: [String],
    },

    activity: {
        total_likes: {
            type: Number,
            default: 0
        },
        total_comments: {
            type: Number,
            default: 0
        },
        total_reads: {
            type: Number,
            default: 0
        },
        total_parent_comments: {
            type: Number,
            default: 0
        },
    },

    // This is for the comments for that thread
    comments: [{
        type: [Schema.Types.ObjectId],
        ref: 'Comment',
    }],

    // This is for the pop up which user liked that thread
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],

    // This is for marking the thread that it is special or official and gets more reach
    featured: {
        type: Boolean,
        default: false,
    },

    draft: {
        type: Boolean,
        default: false
    },

    // This is to keep track is the thread published or not or just in a draft section
    published: {
        type: Boolean,
        default: false,
    }

}, { timestamps: true });

const Thread = mongoose.model('Thread', threadSchema)


export { Thread }