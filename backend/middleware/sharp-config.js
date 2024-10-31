const sharp = require('sharp');
const fs = require('fs');

const processFile = async (file) => {
  const resizedImageBuffer = await sharp(file.path)
    .resize(200, 200)
    .webp({ quality: 20 })
    .toBuffer();

  await fs.promises.writeFile(file.path, resizedImageBuffer);
};

module.exports = processFile;
