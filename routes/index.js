const usersRoutes = require('./users');

const routeConstructor = (app) => {
  app.use('/users', usersRoutes);
  app.use('/', (req, res) => {
    if(req.session.user) {
      res.status(200).send(req.session.user)
    } else {
      res.render('pages/default')
    }
  });
  app.use('*', (_, res) => res.status(404).json('Page not found!'));
};

module.exports = routeConstructor;
