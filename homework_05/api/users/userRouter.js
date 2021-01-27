const { Router } = require('express');
const userController = require('./userController');
const contactController = require('../contacts/contactController');
const uploadUserAvatar = require('../helpers/uploadUserAvatar');
const createUserAvatar = require('../helpers/createUserAvatar');

const userRouter = Router();

userRouter.post(
  '/auth/register',
  userController.authValidation,
  createUserAvatar.createUserAvatar,
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
  '/users/avatars',
  userController.authorize,
  uploadUserAvatar.upload.single('file_name'),
  uploadUserAvatar.minifyImage,
  userController.validateUpdateUser,
  userController.updateUser
);

userRouter.patch(
  '/users/contacts',
  userController.authorize,
  contactController.validateCreateContact,
  contactController.createContact,
  userController.addContactIdInUserContactsId
);

userRouter.delete(
  '/users/contacts/:id',
  userController.authorize,
  userController.removeContactIdInUserContactsId
);

userRouter.patch(
  '/users',
  userController.authorize,
  userController.validateUpdateUser,
  userController.updateUser
);

userRouter.get(
  '/users/current',
  userController.authorize,
  userController.getCurrentUser
);

module.exports = userRouter;
