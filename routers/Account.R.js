const express = require('express');
const AccountController = require('../controllers/Account.C');
const router = express.Router();

router.post('/sign_in', AccountController.signIn);

router.post('/sign_up', AccountController.signUp);


module.exports = router;