const { Router } = require('express');
const authController = require('../auth/authController');
const userController = require('./userController');
const contactController = require('../contacts/contactController');
const userAvatar = require('./userAvatar');

const userRouter = Router();

userRouter.patch(
  '/avatars',
  authController.authorize,
  userAvatar.upload.single('file_name'),
  userAvatar.minifyImage,
  userController.validateUpdateUser,
  userController.updateUser
);

userRouter.patch(
  '/contacts',
  authController.authorize,
  contactController.validateCreateContact,
  contactController.createContact,
  userController.addContactIdInUserContactsId
);

userRouter.delete(
  '/contacts/:id',
  authController.authorize,
  userController.removeContactIdInUserContactsId
);

userRouter.patch(
  '/',
  authController.authorize,
  userController.validateUpdateUser,
  userController.updateUser
);

userRouter.get(
  '/current',
  authController.authorize,
  userController.getCurrentUser
);

module.exports = userRouter;
