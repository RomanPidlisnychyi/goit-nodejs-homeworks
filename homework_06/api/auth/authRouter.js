const { Router } = require('express');
const authController = require('./authController');
const userAvatar = require('../users/userAvatar');

const authRouter = Router();

authRouter.post(
  '/register',
  authController.authValidation,
  userAvatar.createUserAvatar,
  authController.singUp
);

authRouter.post('/login', authController.authValidation, authController.singIn);

authRouter.post('/logout', authController.authorize, authController.logout);

authRouter.get('/verify/:verificationToken', authController.userVerified);

module.exports = authRouter;
