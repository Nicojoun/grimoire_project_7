const express = require('express');
const router = express.Router();

const booksCtrl = require('../controllers/books');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('/', auth, booksCtrl.getAllBooks);
router.post('/', auth, multer, booksCtrl.createBook);
router.get('/:id', auth, booksCtrl.getOneBook);
router.put('/:id', auth, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;