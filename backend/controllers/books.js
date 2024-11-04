const Book = require('../models/book');
const fs = require('fs');
const sharp = require('../tools/sharp-config');

//ajouter un livre
exports.createBook = async (req, res, next) => {
  try {
    // Extraire et préparer les informations du livre
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    // Créer l'instance du livre avec les informations utilisateur et l'URL de l'image
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    // Appeler la fonction de traitement d'image de manière asynchrone
    await sharp(req.file);

    // Enregistrer le livre dans la base de données
    await book.save();

    // Envoyer une réponse de succès
    res.status(201).json({ message: 'Livre enregistré !' });
  } catch (error) {
    // Gérer les erreurs
    res.status(400).json({ error });
  }
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
exports.modifyBook = async (req, res, next) => {
  try {
    // Créer un objet bookObject à partir de la requête
    const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    } : { ...req.body };

    // Appeler la fonction de traitement d'image si un fichier est fourni
    if (req.file) {
      await sharp(req.file); // Attendre la fin du traitement de l'image
    }

    delete bookObject._userId;

    // Trouver le livre à modifier
    const book = await Book.findOne({ _id: req.params.id });

    // Vérifier si l'utilisateur est autorisé à modifier le livre
    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Mettre à jour le livre dans la base de données
    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
    res.status(200).json({ message: 'Book modified!' });
  } catch (error) {
    res.status(400).json({ error });
  }
};


// supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
      .then(book => {
          if (book.userId != req.auth.userId) {
              return res.status(401).json({ message: 'Not authorized' });
          } 
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Book.deleteOne({ _id: req.params.id })
                      .then(() => { res.status(200).json({ message: 'Book deleted!' }) })
                      .catch(error => res.status(401).json({ error }));
              });
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

