const usersRoutes = require('./users');

const routeConstructor = (app) => {
  app.use('/users', usersRoutes);

  // for testing if server is alive
  app.use('/ping', (_, res) => res.send('pong'));
  app.use('*', (_, res) => res.status(404).json('Page not found!'));
};

module.exports = routeConstructor;
