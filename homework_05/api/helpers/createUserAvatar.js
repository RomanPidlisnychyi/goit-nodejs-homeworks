const fs = require('fs');
const Avatar = require('avatar-builder');

const avatar = Avatar.male8bitBuilder(128);

const createUserAvatar = async (req, res, next) => {
  try {
    const buffer = await avatar.create(`${req.body.email}`);

    const avatarPath = `public/images/avatar-${
      req.body.email
    }${Date.now()}.png`;

    fs.writeFileSync(avatarPath, buffer);

    req.body = {
      ...req.body,
      avatarURL: avatarPath,
    };
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createUserAvatar,
};
