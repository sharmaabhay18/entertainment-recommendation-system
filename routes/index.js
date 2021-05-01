const usersRoutes = require('./users');
const moviesRoutes = require('./movies');
const ratingRoutes = require('./rating');
const commentRoutes = require('./comments');

const routeConstructor = (app) => {
  app.use('/users', usersRoutes);
  app.use('/', (req, res) => {
    if (req.session.user) {
      // res.status(200).send(req.session.user)
      // load the default landing page as user is already logged in
      res.render('ERS/landing', {
        title: 'Nav',
        loggIn: false,
      });
    } else {
      res.render('ERS/landing', {
        title: 'Nav',
        loggIn: true,
      });
    }
  });
  app.use('/movies', moviesRoutes);
  app.use('/rating', ratingRoutes);
  app.use('/comment', commentRoutes);

  // for testing if server is alive
  app.use('/ping', (_, res) => res.send('pong'));

  app.use('*', (_, res) => res.status(404).json('Page not found!'));
};

module.exports = routeConstructor;
