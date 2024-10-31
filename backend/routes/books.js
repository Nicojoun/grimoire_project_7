const express = require('express');
const router = express.Router();

const booksCtrl = require('../controllers/books');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
// sharp = require('../middleware/sharp-config');


router.get('/', booksCtrl.getAllBooks); //afficher tous les livres

router.post('/', auth, multer, booksCtrl.createBook); //ajouter un livre

router.get('/bestrating', booksCtrl.bestRatingBooks); //afficher les 3 livres les mieux notés

router.get('/:id',  booksCtrl.getOneBook); //afficher un seul livre

router.put('/:id', auth, multer, booksCtrl.modifyBook); //modifier un livre

router.delete('/:id', auth, booksCtrl.deleteBook); // supprimer un livre

router.post('/:id/rating', auth, booksCtrl.ratingBook); //noter un livre


module.exports = router;