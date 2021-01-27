const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isValidObjectId } = require('mongoose');
const userModel = require('./userModel');
const {
  IdError,
  ConflictError,
  UnauthorizedError,
} = require('../helpers/errorConstructor');

const costFactor = number => number;

const prepeareResponse = ({ email, subscription }) => ({ email, subscription });

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

    const userId = await jwt.verify(token, process.env.JWT_SECRET).id;
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

    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);

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

const validateUpdateSubscription = (req, res, next) => {
  const validationRules = Joi.object({
    subscription: Joi.string().valid('free', 'pro', 'premium').required(),
  });

  const validationResult = validationRules.validate(req.body);
  if (validationResult.error) {
    return res.status(400).send(validationResult.error);
  }

  next();
};

const updateSubscription = async (req, res, next) => {
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
  validateId,
  authValidation,
  authorize,
  singUp,
  singIn,
  logout,
  getCurrentUser,
  validateUpdateSubscription,
  updateSubscription,
};
