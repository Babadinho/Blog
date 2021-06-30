var express = require('express');
var router = express.Router();
const Category = require('../model/Category');
const Post = require('../model/Post');
const Comment = require('../model/Comment');




router.get('/:id', function(req, res, next) {
    Category.find().then(category => {
    Post.find().then(posts => {
    Post.findById({_id: req.params.id})
    .populate('postComments')
    .populate('commentUser')
    .populate('postCategory', 'categoryName')
    .then(post => {
      if(!post) {
        res.render('error', { title: 'Error 404', post });
      }else {
        console.log(post)
        res.render('single', { post, title: post.postName, category, posts, user: req.user});
      }
    })
  })
  })
  });
  
  
  router.post('/:id/comment', function(req, res, next) {
      const newComment = new Comment({
          commentName: req.body.comment_name,
          commentEmail: req.body.comment_email,
          commentWebsite: req.body.comment_website,
          commentMessage: req.body.comment_message,
          commentUser: req.user.profileImage
      });
  
      Comment.create(newComment, (error, comment) =>  {
        if (error) {
          console.log(error);
        } else {
          Post.findById({_id: req.params.id})
          .then(post => {
            post.postComments.push(comment);
            post.save()
            .then(savedPost => {
              req.flash("success_msg", "Comment added successfully");
              res.redirect(`/post/${post._id}/#comment_msg`);
            })
          }).catch(err => {
            console.log(err)
          })
        }
      })
  });
  
  module.exports = router;