require('dotenv').config();  
const jwt = require('jsonwebtoken');  

module.exports = (req, res, next) => {  
   try {
       const token = req.headers.authorization.split(' ')[1];  // Extraire le token JWT de l'en-tête 'Authorization'
       const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET);  // Vérifier et décoder le token avec la clé secrète 
       const userId = decodedToken.userId;  // Extraire l'userId du token décodé
       req.auth = {  // Ajouter l'userId extrait du token à l'objet 'req.auth' 
           userId: userId
       };

       next();  
   } catch(error) {
       res.status(401).json({ error });  
   }
};
