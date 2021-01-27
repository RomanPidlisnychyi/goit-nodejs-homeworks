const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const uuid = require('uuid');
const {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} = require('../helpers/errorConstructor');
const userModel = require('../users/userModel');
const userController = require('../users/userController');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL,
      subject: 'Verification',
      html: `<a clicktracking=off href=http://localhost:3000/auth/verify/${verificationToken}>Please tab here and complete verification</a>`,
    };

    const result = await sgMail.send(msg);
    return result;
  } catch (err) {
    console.log(err);
  }
};

const userVerified = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await userModel.findOne({ verificationToken });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await userModel.findByIdAndUpdate(user._id, {
      $unset: { verificationToken },
    });

    return res.status(200).send('Verification successfully');
  } catch (err) {
    next(err);
  }
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

const singUp = async (req, res, next) => {
  try {
    const { password } = req.body;
    const hashPassword = await bcrypt.hash(password, 4);

    const verificationToken = uuid.v4();

    const user = await userModel.create({
      ...req.body,
      password: hashPassword,
      verificationToken,
    });

    const { email } = req.body;

    await sendVerificationEmail(email, verificationToken);

    return res.status(201).json(userController.prepeareResponse(user));
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

    if (user.verificationToken) {
      throw new UnauthorizedError('Please confirm yor email');
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
        ...userController.prepeareResponse(updatedUser),
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

module.exports = {
  userVerified,
  authorize,
  authValidation,
  singUp,
  singIn,
  logout,
};
