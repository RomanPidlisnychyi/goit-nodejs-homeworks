const fs = require('fs');
const Avatar = require('avatar-builder');
const multer = require('multer');
const path = require('path');
const { promises: fsPromises } = fs;
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

const avatar = Avatar.male8bitBuilder(128);

const storage = multer.diskStorage({
  destination: 'tmp',
  filename: (req, file, cd) => {
    const { originalname } = file;
    const ext = path.parse(originalname).ext;
    const filename = path.parse(originalname).name;
    cd(null, filename + '-' + Date.now() + ext);
  },
});

const upload = multer({ storage });

const minifyImage = async (req, res, next) => {
  try {
    const { path: filePath, filename } = req.file;
    const MINIFIED_DIR = 'public/images';

    await imagemin([filePath.replace(/\\/g, '/')], {
      destination: MINIFIED_DIR,
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8],
        }),
      ],
    });

    await fsPromises.unlink(filePath);

    const newPath = path.join(MINIFIED_DIR, filename).replace(/\\/g, '/');

    const finalyAvatarPath = newPath.replace('public', 'http://localhost:3000');

    req.body = {
      ...req.body,
      avatarURL: finalyAvatarPath,
    };

    next();
  } catch (err) {
    next(err);
  }
};

const createUserAvatar = async (req, res, next) => {
  try {
    const buffer = await avatar.create(`${req.body.email}`);

    const avatarPath = `public/images/avatar-${
      req.body.email
    }${Date.now()}.png`;

    fs.writeFileSync(avatarPath, buffer);

    const finalyAvatarPath = avatarPath.replace(
      'public',
      'http://localhost:3000'
    );

    req.body = {
      ...req.body,
      avatarURL: finalyAvatarPath,
    };
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createUserAvatar,
  upload,
  minifyImage,
};
