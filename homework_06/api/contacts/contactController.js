const Joi = require('joi');
const contactModel = require('./contactModel');
const { isValidObjectId } = require('mongoose');
const { ConflictError } = require('../helpers/errorConstructor');

const validateId = (req, res, next) => {
  if (!isValidObjectId(req.params.contactId)) {
    return res.status(400).send('Invalid id');
  }

  next();
};

const validateCreateContact = (req, res, next) => {
  const createContactRules = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
  });

  const validationResult = createContactRules.validate(req.body);

  if (validationResult.error) {
    return res.status(400).send(validationResult.error);
  }

  next();
};

const createContact = async (req, res, next) => {
  try {
    const newContact = await contactModel.create(req.body);

    if (newContact && req.url === '/users/contacts') {
      req.body = {
        ...req.body,
        newContactId: newContact._id,
      };

      return next();
    }

    return res.status(201).json(newContact);
  } catch (err) {
    if (err.code === 11000) {
      if (req.url === '/users/contacts') {
        const contact = await contactModel.findOne({ email: req.body.email });

        req.body = {
          ...req.body,
          newContactId: contact._id,
        };

        next();
      }

      throw new ConflictError('Contact already exist');
    }
    next(err);
  }
};

const getContacts = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const pageNumber = page ? Number(page) : 1;
    const limitNumber = limit ? Number(limit) : 20;
    const matchToSkip = (pageNumber - 1) * limitNumber;

    const paginateContact = await contactModel
      .find()
      .skip(matchToSkip)
      .limit(limitNumber);
    return res.status(200).json(paginateContact);
  } catch (error) {
    throw error;
  }
};

const getContactById = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const targetContact = await contactModel.findById(contactId);

    return targetContact
      ? res.status(200).json(targetContact)
      : res.status(404).send('User not found');
  } catch (error) {
    next(error);
  }
};

const validateUpdateContact = (req, res, next) => {
  const updateContactRules = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
  }).min(1);

  const validationResult = updateContactRules.validate(req.body);

  if (validationResult.error) {
    return res.status(400).send(validationResult.error);
  }

  next();
};

const updateContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const updatedContact = await contactModel.findByIdAndUpdate(
      contactId,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    );

    return updatedContact
      ? res.status(200).json(updatedContact)
      : res.status(404).send('User not found');
  } catch (error) {
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const removedContact = await contactModel.findByIdAndDelete(contactId);

    return removedContact
      ? res.status(200).json(removedContact)
      : res.status(404).send('User not found');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  removeContact,
  validateCreateContact,
  validateUpdateContact,
  validateId,
};
