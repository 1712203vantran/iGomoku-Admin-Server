const express = require('express');
const AuthController = require('../controllers/Auth.C');
const router = express.Router();

router.post('/signin', AuthController.signIn);

router.post('/signinGoogle', AuthController.signInGoogle);

router.post('/signinFacebook', AuthController.signInFacebook);

router.post('/signup', AuthController.signUp);

router.get('/profile', AuthController.getProfile);

router.post('/edit-profile', AuthController.updateProfile);

router.post('/change-password', AuthController.changePassword);

router.post('/send-verify-email', AuthController.sendVerifyEmail);
router.post('/verified-email', AuthController.verifiedEmail);

module.exports = router;