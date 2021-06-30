
var express = require('express');
var router = express.Router();
const Comment = require('../../model/Comment');
const Post = require('../../model/Post');


router.get('/all', function(req, res, next) {
    Comment.find()
    .populate('commentPost', 'postName')
      .then(comments => {
        res.render('admin/all-comments', { layout: 'backendLayout.hbs' , title: 'All Comments', comments });
        console.log(comments)
      })
      .catch(err => {
        req.flash("error_msg", "There was an Error. Try again");
      });
  });

router.get('/delete/:id', function(req, res, next) {
  Comment.findOneAndDelete({_id: req.params.id})
    .then(comment => {
      req.flash("error_msg", "Comment deleted successfully");
      res.redirect("/comments/all");
    })
    .catch(err => {
      req.flash("error_msg", "There was an Error. Try again");
    })
});

  module.exports = router;