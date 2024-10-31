const sharp = require('sharp');
const fs = require('fs');

// Fonction pour traiter et compresser une image avec Sharp
const processFile = async (file) => {
  // Traite l'image en la redimensionnant et en la convertissant en WebP
  const resizedImageBuffer = await sharp(file.path)
    .resize(200, 200)
    .webp({ quality: 20 })
    .toBuffer();

  // Écrase le fichier original avec la version compressée
  await fs.promises.writeFile(file.path, resizedImageBuffer);
};

module.exports = processFile;
