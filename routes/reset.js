var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const User = require('../model/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "ad2e6ebe76b4ee",
      pass: "2f6850c49aa989"
    }
  });

router.get('/reset', (req, res) => {
    res.render('authentication/reset', {title: "Password Reset"});
  })

router.post('/reset', (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          console.log(err);
          return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
        .then(user => {
        if (!user) {
            req.flash('error_msg', 'No account with that email found.');
            return res.redirect('/password/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
        })
        .then(result => {
            req.flash('success_msg', 'Password reset link sent successfully');
            res.redirect('/password/reset');
            });
        transporter.sendMail({
            to: req.body.email,
            from: 'myshop@node.com',
            subject: 'Password reset',
            html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3005/password/reset/${token}">link</a> to set a new password.</p>
            `
        })
        .catch(err => {
        console.log(err);
        });
    });
})

router.get('/reset/:token', (req, res) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error_msg');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('authentication/new-password', {pageTitle: 'New Password', passwordToken: token, errorMessage: message, userId: user._id.toString()});
    })
    .catch(err => {
      console.log(err);
    });
})

router.post('/new', (req, res) => {
    const {password} = req.body;
    const newPassword = password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    User.findOne({resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId})
    .then(resetUser => {
        return bcrypt.hash(newPassword, 10, (err, hash) => {
            resetUser.password = hash;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            resetUser.save();
            console.log(resetUser)
            req.flash('success_msg', 'Password reset was successful. You can now Login');
            res.redirect('/account/login');
        })
    })
    .catch(err => {
        console.log(err);
    });
})


module.exports = router;