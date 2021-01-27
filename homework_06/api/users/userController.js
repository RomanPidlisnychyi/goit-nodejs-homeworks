const Joi = require('joi');
const { isValidObjectId } = require('mongoose');
const userModel = require('./userModel');
const {
  IdError,
  ConflictError,
  NotFoundError,
} = require('../helpers/errorConstructor');
const contactModel = require('../contacts/contactModel');

const prepeareResponse = ({ email, subscription, avatarURL }) => ({
  email,
  subscription,
  avatarURL,
});

const addContactIdInUserContactsId = async (req, res, next) => {
  try {
    const { newContactId: contactId } = req.body;

    const contact = await contactModel.findById(contactId);
    if (!contact) {
      throw new NotFoundError('Contact does not exists');
    }

    const { _id: userId } = req.user;

    const user = await userModel.findById(userId);
    const contactInUserContacts = user.contacts.find(
      contact => String(contact._id) === String(contactId)
    );
    if (contactInUserContacts) {
      throw new ConflictError('Contact already exist in contacts list');
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        {
          $push: { contacts: contactId },
        },
        {
          new: true,
        }
      )
      .populate('contacts');

    return res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

const removeContactIdInUserContactsId = async (req, res, next) => {
  try {
    const { id: contactId } = req.params;

    const contact = await contactModel.findById(contactId);
    if (!contact) {
      throw new NotFoundError('Contact does not exists');
    }

    const { _id: userId } = req.user;

    const user = await userModel.findById(userId);
    const contactInUserContacts = user.contacts.find(
      contact => String(contact._id) === String(contactId)
    );
    if (!contactInUserContacts) {
      throw new NotFoundError('Contact in contacts list not found');
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        {
          $pull: { contacts: contactId },
        },
        {
          new: true,
        }
      )
      .populate('contacts');

    return res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

const validateId = (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new IdError('Invalid id');
  }

  next();
};

const getCurrentUser = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;

    const currentUser = await userModel.findById(userId);

    return res.status(200).json(prepeareResponse(currentUser));
  } catch (err) {
    next(err);
  }
};

const validateUpdateUser = (req, res, next) => {
  const validationRules = Joi.object({
    subscription: Joi.string().valid('free', 'pro', 'premium'),
    avatarURL: Joi.string(),
  }).min(1);

  const validationResult = validationRules.validate(req.body);
  if (validationResult.error) {
    return res.status(400).send(validationResult.error);
  }

  next();
};

const updateUser = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    );

    return res.status(200).json(prepeareResponse(updatedUser));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addContactIdInUserContactsId,
  removeContactIdInUserContactsId,
  validateId,
  getCurrentUser,
  validateUpdateUser,
  updateUser,
  prepeareResponse,
};
