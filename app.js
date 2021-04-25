const express = require('express');
const app = express();
const configRoutes = require('./routes');
const path = require('path');
const exphbs = require('express-handlebars');
const hbs = require('hbs');
const session = require('express-session');
const helper = require('./utils/helperFunction');

const publicDirectoryPath = path.join(__dirname, './public')
const viewsPath = path.join(__dirname, './views')
const partialsPath = path.join(__dirname, './views/partials')

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
    secret: "some secret string!",
    saveUninitialized: true,
    resave: false,
  })
);

configRoutes(app);
app.listen(3000, () => console.log('Server started at 3000'));
