const Book = require('../models/book');
const fs = require('fs');

//ajouter un livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
  .then(() => { res.status(201).json({ message: 'Livre enregistré !' })})
  .catch(error => { res.status(400).json({ error })});
};


//afficher un seul livre
exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id
  }).then(
    (book) => {
      res.status(200).json(book);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

//modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized' });
          } else {
              Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
              .then(() => res.status(200).json({ message : 'Book modified!' }))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

// supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message: 'Not authorized' });
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Book.deleteOne({ _id: req.params.id })
                      .then(() => { res.status(200).json({ message: 'Book deleted!' }) })
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch(error => {
          res.status(500).json({ error });
      });
};

//afficher tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find().then(
    (books) => {
      res.status(200).json(books);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

// noter un livre 
exports.ratingBook = (req, res, next) => {
  const userId = req.auth.userId;
  const rating = req.body.rating;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être entre 0 et 5' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      // Vérifier si l'utilisateur a déjà noté le livre
      const existingRating = book.ratings.find(r => r.userId === userId);

      if (existingRating) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
      }

      // Ajouter une nouvelle note
      book.ratings.push({ userId, grade: rating });

      // Calculer la moyenne des notes
      const totalRatings = book.ratings.map(r => r.grade).reduce((acc, curr) => acc + curr, 0);
      book.averageRating = (totalRatings / book.ratings.length).toFixed(2);

      book.save()
      .then((ratedBook) => res.status(200).json(ratedBook))
        .catch(
          (error) => res.status(400).json({ error })
        );
    })
    .catch(
      (error) => { res.status(404) .json({ error })}
      );
};

//afficher les 3 livres les mieux notés
exports.bestRatingBooks = (req, res, next) => {
  //const averageRating = req.body.averageRating;
  Book.find()
    .sort({ averageRating: -1 }) // Trier par moyenne décroissante
    .limit(3) 
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

