const AccessControl = require('accesscontrol');


module.exports = {
adminAuthenticated: (req, res, next) => {
const ac = new AccessControl();
ac.grant('user')                    // define new or modify existing role. also takes an array.
    .createOwn('post')             // equivalent to .createOwn('video', ['*'])
    .deleteOwn('comment')
    .readAny('post')
  .grant('admin')                   // switch to another role without breaking the chain
    .extend('user')                 // inherit role capabilities. also takes an array
    .updateAny('post')
    .readAny('adminDashboard')             // explicitly defined attributes
    .deleteAny('post');



const permission = ac.can(req.user.role).readAny('adminDashboard') ;
  if (permission.granted) {
        return next();
      } else {
        req.logout();
        req.flash('error_msg', 'Not Authorised');
        res.redirect('/account/login');
      }
    }
  }