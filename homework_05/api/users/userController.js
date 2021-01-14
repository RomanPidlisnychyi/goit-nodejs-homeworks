const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isValidObjectId } = require('mongoose');
const userModel = require('./userModel');
const {
  IdError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} = require('../helpers/errorConstructor');
const contactModel = require('../contacts/contactModel');

const costFactor = number => number;

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

const authValidation = (req, res, next) => {
  const validationRules = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().required(),
  });

  const validationResult = validationRules.validate(req.body);
  if (validationResult.error) {
    return res.status(400).send(validationResult.error);
  }

  next();
};

const authorize = async (req, res, next) => {
  try {
    const authorizationHeader = req.get('Authorization');
    if (!authorizationHeader) {
      throw new UnauthorizedError('Email or password is wrong');
    }

    const token = authorizationHeader.replace('Bearer ', '');

    const decoded = await jwt.verify(
      token,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          throw new UnauthorizedError('Email or password is wrong');
        }
        return decoded;
      }
    );

    const { id: userId } = decoded;

    if (!userId) {
      throw new UnauthorizedError('Email or password is wrong');
    }

    const user = await userModel.findById(userId);

    if (!user || user.token !== token) {
      throw new UnauthorizedError('Email or password is wrong');
    }

    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    next(err);
  }
};

const singUp = async (req, res, next) => {
  try {
    const { password } = req.body;
    const hashPassword = await bcrypt.hash(password, costFactor(4));

    const user = await userModel.create({
      ...req.body,
      password: hashPassword,
    });

    return res.status(201).json(prepeareResponse(user));
  } catch (err) {
    if (err.code === 11000) {
      return next(new ConflictError('Email in use'));
    }
    next(err);
  }
};

const singIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Email or password is wrong');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Email or password is wrong');
    }

    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: 2 * 24 * 60 * 60, // two days
    });

    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { token },
      { new: true }
    );
    return res.status(200).json({
      token,
      user: {
        ...prepeareResponse(updatedUser),
      },
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;

    await userModel.findByIdAndUpdate(userId, {
      token: null,
    });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
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
  authValidation,
  authorize,
  singUp,
  singIn,
  logout,
  getCurrentUser,
  validateUpdateUser,
  updateUser,
};
