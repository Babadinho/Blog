var express = require('express');
var router = express.Router();
const Category = require('../../model/Category');
const { ensureAuthenticated } = require('../../config/auth');
const { adminAuthenticated }  = require('../../config/accessControl');

/* GET home page. */
router.get('/add', ensureAuthenticated, adminAuthenticated, function(req, res, next) {
  res.render('admin/category/add-category', { layout: 'backendLayout.hbs' , title: 'Add Category' });
});

router.post('/add', function(req, res, next) {
  const {category_name, category_desc} = req.body;
  let errors = [];
  if(!category_name || !category_desc) {
    errors.push({msg: "Please fill in all fields"})
  }

  if (errors.length> 0){
    res.render('admin/category/add-category', {layout: 'backendLayout.hbs' , errors})
  }else {
    Category.findOne({ categoryName: category_name })
    .then(category => {
      if (category){
        errors.push({ msg: "Category already exists" });
        return res.render('admin/category/add-category', {layout: 'backendLayout.hbs' , errors})
      }
      const newCategory = new Category({
        categoryName: category_name,
        categoryDesc: category_desc,
      });
      newCategory.save()
        .then(category => {
          req.flash("success_msg", category.categoryName + " added successfully");
          res.redirect("/category/add");
        })
        .catch(err => {
          req.flash("error_msg", "There was an Error. Try again");
        });
    });
  }
});

router.get('/all', function(req, res, next) {
  Category.find()
    .then(categories => {
      res.render('admin/category/all-category', { layout: 'backendLayout.hbs' , title: 'All Category', categories });
      console.log(categories)
    })
    .catch(err => {
      req.flash("error_msg", "There was an Error. Try again");
    });
});

router.get('/edit/:id', function(req, res, next) {
  Category.findOne({_id: req.params.id})
  .then(category => {
    if (category) {
      res.render('admin/category/edit-category', { layout: 'backendLayout.hbs' , title: 'Edit Category', category});
    }
  })
  .catch(err => {
    req.flash("error_msg", "There was an Error. Try again");
  })
});

router.post('/update/:id', function(req, res, next) {
  const {category_name, category_desc} = req.body;
  let errors = [];
  if(!category_name || !category_desc) {
    errors.push({msg: "Please fill in all fields"})
  }

  if (errors.length> 0){
    res.render('admin/category/edit-category', {layout: 'backendLayout.hbs' , errors})
  }else {
    const updateCategory = {
      categoryName: category_name,
      categoryDesc: category_desc,
    };
    Category.findOneAndUpdate({_id: req.params.id}, {$set: updateCategory}, {new: true})
      .then(category => {
        req.flash("success_msg", category.categoryName + " updated successfully");
        res.redirect("/category/all");
      })
      .catch(err => {
        req.flash("error_msg", "There was an Error. Try again");
      })
    }
});

router.get('/delete/:id', function(req, res, next) {
  Category.findOneAndDelete({_id: req.params.id})
    .then(category => {
      req.flash("error_msg", category.categoryName + " deleted successfully");
      res.redirect("/category/all");
    })
    .catch(err => {
      req.flash("error_msg", "There was an Error. Try again");
    })
});



module.exports = router;