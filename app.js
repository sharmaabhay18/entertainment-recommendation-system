const express = require('express');

const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const hbs = require('hbs');
const session = require('express-session');
const routeConstructor = require('./routes');
const helper = require('./utils/helperFunction');

const publicDirectoryPath = path.join(__dirname, './public');
const viewsPath = path.join(__dirname, './views');
const partialsPath = path.join(__dirname, './views/partials');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main',
    helpers: helper,
  })
);

app.set('view engine', 'handlebars');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);
app.use(express.static(publicDirectoryPath));

app.use(
  session({
    name: 'AuthCookie',
    secret: 'Our world is flat!',
    saveUninitialized: true,
    resave: false,
  })
);

app.use('/comment', (req, res, next) => {
  if (!req.session.user) {
    return res.status(403).json({
      status: false,
      message: 'User is not authenticated',
    });
  } else {
    next();
  }
});

app.use('/commentRating', (req, res, next) => {
  if (!req.session.user) {
    return res.status(403).json({
      status: false,
      message: 'User is not authenticated',
    });
  } else {
    next();
  }
});

routeConstructor(app);
app.listen(3000, () => console.log('Server started at 3000'));
