var express = require('express');
var router = express.Router();
const Email = require('../../model/EmailSubs');

router.get('/emails', function(req, res, next) {
  Email.find()
    .then(email => {
      res.render('admin/all-emails', { layout: 'backendLayout.hbs' , title: 'All Category', email });
      console.log(categories)
    })
    .catch(err => {
      req.flash("error_msg", "There was an Error. Try again");
    });
});


module.exports = router;