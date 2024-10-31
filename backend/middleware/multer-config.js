const multer = require('multer');

// Définir les types MIME et leurs extensions pour les fichiers image
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({            // Configuration de stockage pour multer avec la destination et le nom du fichier
  destination: (req, file, callback) => {       // Définir le dossier de destination pour les fichiers téléchargés
    callback(null, 'images');                   // Sauvegarde les fichiers dans le dossier 'images'
  },
  filename: (req, file, callback) => {          // Définir le nom du fichier téléchargé
    const name = file.originalname.split(' ').join('_');    // Remplacer les espaces dans le nom d'origine par des underscores
    const extension = MIME_TYPES[file.mimetype];        // Récupérer l'extension du fichier en fonction de son type MIME
    callback(null, name + Date.now() + '.' + extension);    // Ajouter une date unique et ajouter l'extension
  }
});

// Exporter le middleware configuré pour un seul fichier 'image' 
module.exports = multer({ storage: storage }).single('image');


