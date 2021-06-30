const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CommentSchema = new Schema({
    commentName: {
        type: String,
        required: true
    },
    commentEmail: {
        type: String,
        required: true
    },
    commentWebsite: {
        type: String,
        required: false
    },
    commentMessage: {
        type: String,
        required: true
    },
    commentPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts',
    },
    commentUser: {
        type: String,
        ref: 'users',
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('comments', CommentSchema);