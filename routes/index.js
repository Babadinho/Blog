var express = require('express');
var router = express.Router();
const Post = require('../model/Post');
const Category = require('../model/Category');
const Email = require('../model/EmailSubs');
const User = require('../model/User');
const ITEMS_PER_PAGE = 3;


router.get('/', function(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  let totalItems;

  Category.find()
  .then(category => {
    User.find()
  .then(users => {
    console.log(users)
  Post.find()
  .countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    console.log(totalItems)
  return Post.find()
    .populate('postCategory', 'categoryName')
    .populate('postAuthor')
    .populate('postComments')
    .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(posts => {
      if(!posts) {
        console.log("oops")
      } 
      res.render('index', { title: 'My Bog', posts, category, users, user: req.user, 
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)});
    }).catch(err => {
      console.log(err)
    })
  })
  })
});

router.post('/email', (req, res) => {

  const newEmail = new Email({
    userEmail: req.body.email_sub
  })
  newEmail.save()
      .then(email => {
          req.flash("success_msg", email.userEmail + " successfully subscribed");
          res.redirect("/#email");
      })
      .catch(err => {
          req.flash("error_msg", "There was an Error. Try again");
      });

})

router.get('/search', function(req, res, next) {
  queryy = req.query.q
  Category.find()
    .then(category => {
      Post.find({postName: { "$regex": queryy, "$options": "i" }})
      .populate('postCategory', 'categoryName')
      .then(posts => {
        res.render('search-results', {posts, category, title: `Search results for '${queryy}'`, user: req.user});
        }).catch(err => {
        req.flash("error_msg", "There was an Error. Try again");
      });
    })

});

module.exports = router;