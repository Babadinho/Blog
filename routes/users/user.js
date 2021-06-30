var express = require('express');
var router = express.Router();
const upload = require('../../config/multer')
const { ensureAuthenticated } = require('../../config/auth');
const userController = require('../../controllers/userController')

router.get('/dashboard', ensureAuthenticated, userController.userDashboard)

router.get('/edit/:id', ensureAuthenticated, userController.editUser)

router.post('/update/:id', upload.single('profile_image'), userController.updateUser)

router.get('/edit/password/:id', ensureAuthenticated, userController.editPassword)

router.post('/update/password/:id', userController.updatePassword)

router.get('/logout', userController.userLogout)

module.exports = router;
