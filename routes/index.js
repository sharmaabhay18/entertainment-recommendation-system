const usersRoutes = require('./users');
const moviesRoutes = require('./movies');
const ratingRoutes = require('./rating');
const commentRoutes = require('./comments');
const commentRatingRoutes = require('./commentRating');

const routeConstructor = (app) => {
  app.use('/users', usersRoutes);
  app.use('/movies', moviesRoutes);
  app.use('/rating', ratingRoutes);
  app.use('/comment', commentRoutes);
  app.use('/commentRating', commentRatingRoutes);

  // for testing if server is alive
  app.use('/ping', (_, res) => res.send('pong'));

  app.use('*', (_, res) => res.status(404).json('Page not found!'));
};

module.exports = routeConstructor;
