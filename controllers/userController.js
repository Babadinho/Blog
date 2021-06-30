const User = require('../model/User');
const Post = require('../model/Post');
const cloudinary = require('../config/cloudinary')
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.userDashboard = (req, res) => {
    res.render('user/dashboard', {layout: 'userDashboard.hbs', title: "User Dashboard", user: req.user});
}

exports.editUser = (req, res) => {
    res.render('editUser', {layout: 'userDashboard.hbs', title: "Edit Profile", user: req.user});
}

exports.updateUser = (req, res) => {
    cloudinary.uploader.upload(req.file.path)
  .then(result => {
    console.log(result)
    const {first_name, last_name, email, profile_image} = req.body;
  
  let errors = [];
  if(!first_name || !last_name || !email) {
    errors.push({msg: "Please fill in all fields"})
  }


  if (errors.length> 0){
    res.render('editUser', {layout: 'userDashboard.hbs' , errors})
  }else {
    const updateProfile = {
        firstName: first_name,
        lastName: last_name,
        email: email,
        profileImage: result.url
    };
    User.findOneAndUpdate({_id: req.params.id}, {$set: updateProfile}, {new: true})
      .then(user => {
        console.log(user)
        req.flash("success_msg", "Profile updated successfully");
        res.redirect("/user/edit/{{user._id}}");
      })
      .catch(err => {
        req.flash("error_msg", "There was an Error. Try again");
      })
    }
  }).catch(err => {
    console.log(err)
  })
}

exports.editPassword = (req, res) => {
    res.render('userPassword', {layout: 'userDashboard.hbs', title: "Change Password", user: req.user});
}

exports.updatePassword = (res, req) => {
    let {new_password} = req.body;
  
  let user = req.user
  let errors = [];
  if(!new_password) {
    errors.push({msg: "Please fill in the fields"})
    console.log(user)
  }

  if (errors.length> 0){
    res.render('userPassword', {layout: 'userDashboard.hbs' , errors})
  }else {
    let updatePassword = {
        password: new_password
    };

    User.findOneAndUpdate({_id: req.params.id}, {$set: updatePassword}, {new: true})
    .then(user => {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        user.save()
          console.log(user)
          req.flash("success_msg", "Password updated successfully");
          res.redirect("/user/edit/password/{{user._id}}");
        })
      })  
    }).catch(err => {
        req.flash("error_msg", "There was an Error. Try again");
    })
  }
}

exports.userLogout = (req, res) => {
    req.logout();
    req.flash('success_msg', 'You have logged out successfully')
    res.redirect('/account/login')
}