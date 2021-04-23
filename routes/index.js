const usersRoutes = require('./users');
const moviesRoutes = require('./movies');
const ratingRoutes = require('./rating');

const routeConstructor = (app) => {
  app.use('/users', usersRoutes);
  app.use('/movies', moviesRoutes);
  app.use('/rating', ratingRoutes);

  // for testing if server is alive
  app.use('/ping', (_, res) => res.send('pong'));

  app.use('*', (_, res) => res.status(404).json('Page not found!'));
};

module.exports = routeConstructor;
