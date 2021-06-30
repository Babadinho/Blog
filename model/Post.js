const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PostSchema = new Schema({
    postCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    },
    postName: {
        type: String,
        required: true
    },
    postContent: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    postImage: {
        type: String,
        required: true
    },
    allowFeatured: {
        type: Boolean,
        default: false
    },
    postAuthor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    postComments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comments'
        }
    ]
})

module.exports = mongoose.model('posts', PostSchema);