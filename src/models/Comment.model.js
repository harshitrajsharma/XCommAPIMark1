import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const commentSchema = new Schema({

    // This is the reference for the actual thread for which users are commenting
    thread_id: {
        type: Schema.Types.ObjectId,
        ref: 'Thread',
        required: true,
    },

    // These are the users/ authors of that comment under a specific thread
    thread_author: {
        type: Schema.Types.ObjectId,
        ref: 'Thread',
        required: true,
    },

    // This is for the content of that comment that means actual comment
    comment: {
        type: String,
        required: true,
        maxlength: [1000, 'Max length exceeded'],
    },

    // The record of users who liked that comment
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        // Likes field stores references to users who liked the comment, making it easier to identify popular or insightful comments.
    }],

    replies: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        // Replies field stores references to child comments, allowing for threaded discussions and deeper engagement within the comment section.
    }],

    commented_by: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'users'
    },

    isReply: {
        type: Boolean,
    },

    parent: {
        type: Schema.Types.ObjectId,
        ref: 'comments'
    },

    edited: {
        type: Boolean,
        default: false,
    }

}, { timestamps: true });


const Comment = mongoose.model('Comment', commentSchema);

export { Comment }