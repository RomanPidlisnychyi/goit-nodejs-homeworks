const { Router } = require('express');
const contactController = require('./contactController');

const contactRouter = Router();

contactRouter.post(
  '/',
  contactController.validateCreateContact,
  contactController.createContact
);

contactRouter.get('/', contactController.getContacts);

contactRouter.get(
  '/:contactId',
  contactController.validateId,
  contactController.getContactById
);

contactRouter.patch(
  '/:contactId',
  contactController.validateId,
  contactController.validateUpdateContact,
  contactController.updateContact
);

contactRouter.delete(
  '/:contactId',
  contactController.validateId,
  contactController.removeContact
);

module.exports = contactRouter;
