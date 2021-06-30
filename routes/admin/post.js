var express = require('express');
var router = express.Router();
const Category = require('../../model/Category');
const Post = require('../../model/Post');
const User = require('../../model/User');
const upload = require('../../config/multer2')
// const cloudinary = require('../../config/cloudinary')
const { ensureAuthenticated } = require('../../config/auth');
const { check, checkSchema } = require('express-validator');
const { validationResult } = require('express-validator')

/* GET home page. */
router.get('/add', function(req, res, next) {
    Category.find().then(categories => {
      if(categories){
        res.render('admin/posts/add-post', { layout: 'backendLayout.hbs' , title: 'Add Post', categories });
      }else{
        req.flash('error_msg', 'category not found');
        res.redirect('/post/add');
      }
    }).catch(err => {
      console.log(err)
    })
});


router.post('/add', ensureAuthenticated, [
  check('post_title').trim().isLength({min: 5}).withMessage('Title must not be less than 5 characters'),
  check('post_content').trim().isLength({min: 5}).withMessage('Post content cannot be empty'),
  check('post_category').exists().withMessage('Please select a category')
], upload.single('post_image'), (req, res) => {

    let errors = validationResult(req);
  
    if (!errors.isEmpty()){
      Category.find()
      .then(categories => {
        if(categories){
          res.render('admin/posts/add-post', {layout: 'backendLayout.hbs' , errors: errors.array(), categories})
        }
      }).catch(err => {
        console.log(err)
      })
    }

    const {post_title, post_content, post_category, featured_Post} = req.body;
    const featured = featured_Post ? true : false;
    const imageUrl = req.file.path;

    const newPost = new Post({
      postName: post_title,
      postCategory: post_category,
      postContent: post_content,
      allowFeatured: featured,
      postImage: imageUrl,
      postAuthor: req.user._id
      });

      newPost.save()
      .then(post => {
          req.flash("success_msg", post.postName + " added successfully");
          res.redirect("/post/add");
      })
      .catch(err => {
          req.flash("error_msg", "There was an Error. Try again");
      });
})

router.get('/edit/:id', function(req, res, next) {
  Post.findOne({_id: req.params.id})
  .populate('postCategory', 'categoryName')
  .then(post => {
    if (post) {
      Category.find()
      .then(categories => {
        res.render('admin/posts/edit-post', { layout: 'backendLayout.hbs' , title: 'Edit Post', post, categories})
      })
    }
  })
  .catch(err => {
    req.flash("error_msg", "There was an Error. Try again");
  })
});

router.post('/update/:id', function(req, res, next) {
  const {post_title, post_content, post_category, featured_Post} = req.body;
  const featured = featured_Post ? true : false;
  
  let errors = [];
  if(!post_title || !post_content) {
    errors.push({msg: "Please fill in all fields"})
  }

  if (errors.length> 0){
    res.render('admin/posts/edit-post', {layout: 'backendLayout.hbs' , errors})
  }else {
    const updatePost = {
        postName: post_title,
        postCategory: post_category,
        postContent: post_content,
        allowFeatured: featured
    };
    Post.findOneAndUpdate({_id: req.params.id}, {$set: updatePost}, {new: true})
      .then(post => {
        req.flash("success_msg", post.postName + " updated successfully");
        res.redirect("/post/all");
      })
      .catch(err => {
        req.flash("error_msg", "There was an Error. Try again");
      })
    }
});

router.get('/delete/:id', function(req, res, next) {
  Post.findOneAndDelete({_id: req.params.id})
    .then(post => {
      req.flash("error_msg", post.postName + " deleted successfully");
      res.redirect("/post/all");
    })
    .catch(err => {
      req.flash("error_msg", "There was an Error. Try again");
    })
});

router.get('/all', function(req, res, next) {
  Post.find()
    .populate('postCategory', 'categoryName')
    .populate('postUser')
    .then(posts => {
      if(posts){
        console.log(posts)
        res.render('admin/posts/all-posts', { layout: 'backendLayout.hbs' , title: 'All Post', posts });
      }
      console.log(posts)
    })
    .catch(err => {
      req.flash("error_msg", "There was an Error. Try again");
    });
});


module.exports = router;