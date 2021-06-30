const User = require('../model/User');
const Category = require('../model/Category');
const Post = require('../model/Post');

exports.adminIndex =  (req, res) => {
    /* GET home page. */
    User.find().exec(function (err, count) {
      Category.find().exec(function (err, cats) {
        Post.find().exec(function (err, posts) {
          res.render('admin/dashboard', { layout: 'backendLayout.hbs' , title: 'Admin Dashboard', count: count.length, cats: cats.length, posts: posts.length });
        })
      })
    })
}