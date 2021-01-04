const { Router } = require('express');
const userController = require('./userController');

const userRouter = Router();

userRouter.post(
  '/auth/register',
  userController.authValidation,
  userController.singUp
);
userRouter.post(
  '/auth/login',
  userController.authValidation,
  userController.singIn
);
userRouter.post(
  '/auth/logout',
  userController.authorize,
  userController.logout
);

userRouter.patch(
  '/users',
  userController.authorize,
  userController.validateUpdateSubscription,
  userController.updateSubscription
);

userRouter.get(
  '/users/current',
  userController.authorize,
  userController.getCurrentUser
);

module.exports = userRouter;
