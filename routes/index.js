const usersRoutes = require('./users');
const addList = require('./addList')

const routeConstructor = (app) => {
  app.use('/users', usersRoutes);
  app.use('/addList',addList);

  app.get('/', (req, res) => {
    res.render('ERS/landing');
  });

  app.get('/addPopPage', async (req, res) => {
    res.render('ERS/addList/addPopPage');
  }); 

  // for testing if server is alive
  app.use('/ping', (_, res) => res.send('pong'));
  app.use('*', (_, res) => res.status(404).json('Page not found!'));
};

module.exports = routeConstructor;
