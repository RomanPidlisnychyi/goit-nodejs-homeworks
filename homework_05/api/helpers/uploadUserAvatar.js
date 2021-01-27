const multer = require('multer');
const path = require('path');
const { promises: fsPromises } = require('fs');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

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

    req.body = {
      ...req.body,
      avatarURL: newPath,
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  upload,
  minifyImage,
};
