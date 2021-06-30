var express = require('express');
var router = express.Router();
const adminController = require('../../controllers/adminController')
const { adminAuthenticated }  = require('../../config/accessControl');
const { ensureAuthenticated } = require('../../config/auth');


router.get('/', ensureAuthenticated, adminAuthenticated, adminController.adminIndex)



module.exports = router;