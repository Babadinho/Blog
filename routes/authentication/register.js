var express = require('express');
var router = express.Router();
const User = require('../../model/User');
const bcrypt = require('bcrypt');
const passport = require('passport');
const saltRounds = 10;
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const JWT_ACC_ACCTIVATE = 'activationKey';

var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "ad2e6ebe76b4ee",
      pass: "2f6850c49aa989"
    }
  });

/* GET home page. */
router.get('/register', function(req, res, next) {
  res.render('authentication/registration', { title: 'Sign up to My Blog'});
});

router.post('/register', function(req, res, next) {
    const {first_name, last_name, email, password, confirm_password} = req.body;
    let errors = [];

    if(!first_name || !last_name || !email || !password || !confirm_password){
        errors.push({msg: "Please fill in all fields"})
    }

    if(password !== confirm_password){
        errors.push({msg: "Passwords do not match"})
    }

    if(password.length < 8){
        errors.push({msg: "Password must be atleast 8 characters"})
    }

    if(errors.length > 0) {
        res.render('authentication/registration', {errors})
    }else{
        User.findOne({email: req.body.email})
    .then(user => {
        if(user) {
            errors.push({msg: "Email already in use"})
            return res.render('authentication/registration', {errors})
        }
        req.flash('success_msg', 'Activation Link sent to your Email. Please click to complete Registration');
        res.redirect('/account/register');

        const siteLink = 'http://localhost:3005';
        const token = jwt.sign({first_name, last_name, email, password, confirm_password}, JWT_ACC_ACCTIVATE, {expiresIn: '20m'})

        return transporter.sendMail({
            to: email,
            from: 'myblog@node-blog.com',
            subject: 'Activation Link',
            html: `<h3>Please click on below link to activate your account!</h3>
            <p><a href="${siteLink}/account/activate/${token}">Click to Activate Account</a></p>`
        })

    //     const newUser = new User({
    //         firstName: req.body.first_name,
    //         lastName: req.body.last_name,
    //         email: req.body.email,
    //         password: req.body.password,
    //         role: 'user',
    //     })
      
    //     bcrypt.genSalt(saltRounds, function (err, salt) {
    //       bcrypt.hash(newUser.password, salt, (err, hash) => {
    //             newUser.password = hash;
    //             newUser.save()
    //             .then(user => {
    //                 console.log(user)
    //                 req.flash('success_msg', 'Registration Successful');
    //                 res.redirect('/account/login');
    //                 });
    //             })
    //             .catch((err) => {
    //             console.log(err);
    //             });
    //     }); 
    })
    .catch(err => {
        console.log(err);
    })
    }

});

router.get('/activate/:token', function(req, res, next) {
    const token = req.params.token;
    if (token) {
        jwt.verify(token, JWT_ACC_ACCTIVATE, (err, decodedToken) => {
            if (err) {
                return res.status(400).json({error: 'Incorrect or Expired Link'}) 
            }
            const {first_name, last_name, email, password, confirm_password} = decodedToken;
            const newUser = new User({
                firstName: first_name,
                lastName: last_name,
                email: email,
                password: password,
                role: 'user',
            })
          
            bcrypt.genSalt(saltRounds, function (err, salt) {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                    newUser.password = hash;
                    newUser.save()
                    .then(user => {
                        console.log(user)
                        req.flash('success_msg', 'Registration Completed Successfully. Please Login Below');
                        res.redirect('/account/login');
                        });
                    })
                    // .catch((err) => {
                    // console.log(err);
                    // });
            }); 
        })
    }else {
        return res.json({error: 'Something went wrong'})
    }
})

router.get('/login', function(req, res, next) {
    res.render('authentication/login', { title: 'Blog | Sign in' });
  });
  
  router.post('/login', function(req, res, next) {
      const {email, password} = req.body;
      let errors = [];
  
      if(!email || !password){
          errors.push({msg: "Please fill in all fields"})
      }
  
      if(errors.length > 0) {
          res.render('authentication/login', {errors})
      } else {
          passport.authenticate("local", {
              successRedirect: "/",
              failureRedirect: "/account/login",
              failureFlash: true,
          })(req, res, next);
      }
  })

//Finding all users
router.get('/users', (req, res) => {
    User.find()
    .then(users => {
        res.render('admin/users', { layout: 'backendLayout.hbs' , title: 'All Users', users });
    })
    .catch(err => {
        console.log(err);
    })

})

router.get('/users/delete/:id', function(req, res, next) {
    User.findOneAndDelete({_id: req.params.id})
      .then(users => {
        req.flash("error_msg", users.firstName + " deleted successfully");
        res.redirect("/account/users");
      })
      .catch(err => {
        req.flash("error_msg", "There was an Error. Try again");
      })
  });

module.exports = router;
