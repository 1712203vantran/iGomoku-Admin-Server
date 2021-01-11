const express = require('express');
const AuthController = require('../controllers/Auth.C');
const router = express.Router();
const AuthUntils = require('../utils/Auth.Utils');

router.post('/signin', AuthController.signIn);

router.post('/signinGoogle', AuthController.signInGoogle);

router.post('/signinFacebook', AuthController.signInFacebook);

router.post('/signup', AuthController.signUp);

router.get('/profile', AuthUntils.authenticateJWT, AuthController.getProfile);

router.post('/edit-profile',AuthUntils.authenticateJWT, AuthController.updateProfile);

router.post('/change-password',AuthUntils.authenticateJWT, AuthController.changePassword);

router.post('/send-verify-email', AuthController.sendVerifyEmail);
router.post('/verified-email', AuthController.verifiedEmail);

router.post('/send-resetpassword-email', AuthController.sendResetPasswordEmail);
//router.post('/verified-resetpassword', AuthController.verifiedResetPassword);

module.exports = router;