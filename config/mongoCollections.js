const dbConnection = require('./mongoConnection');

let getCollectionFn = (collection) => {
  let _col = undefined;

  return () => {
    if (!_col) {
      _col = dbConnection().then((db) => {
        return db.collection(collection);
      });
    }

    return _col;
  };
};

module.exports = {
  recommended_movies: getCollectionFn('entertainment_recommendation'),
  users: getCollectionFn('users'),
  comments: getCollectionFn('comments'),
  comment_rating: getCollectionFn('comment_rating'),
};
