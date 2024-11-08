const sharp = require('sharp');
const fs = require('fs');

const processFile = async (file) => {
 
  const resizedImageBuffer = await sharp(file.path)      // Utiliser le chemin du fichier uploadé
    .resize(200, 200)                                    // Redimensionner à 200x200 pixels
    .webp({ quality: 20 })                               // Convertir en WebP et définir la qualité à 20
    .toBuffer();                                         // Stocker l'image traitée dans un buffer
  
  // Remplacer le fichier d'origine par l'image redimensionnée en écrivant le buffer dans le même chemin
  await fs.promises.writeFile(file.path, resizedImageBuffer);
};

// Exporter la fonction pour pouvoir l'utiliser dans les contrôleurs
module.exports = processFile;
