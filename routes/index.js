const usersRoutes = require('./users');
const moviesRoutes = require('./movies');
const commentRoutes = require('./comments');
const commentRatingRoutes = require('./commentRating');

const routeConstructor = (app) => {
  app.use('/users', usersRoutes);
  app.use('/movies', moviesRoutes);
  app.use('/comment', commentRoutes);
  app.use('/commentRating', commentRatingRoutes);

  app.use('/', (req, res) => {
    if (req.session.user) {
      // res.status(200).send(req.session.user)
      // load the default landing page as user is already logged in
      res.render('ERS/home', {
        title: 'Nav',
        loggIn: false,
        userDetails: req.session.user
      });
    } else {
      res.render('ERS/landing', {
        title: 'Nav',
        loggIn: true,
      });
    }
  });

  // for testing if server is alive
  app.use('/ping', (_, res) => res.send('pong'));

  app.use('*', (_, res) => res.status(404).json('Page not found!'));
};

module.exports = routeConstructor;
