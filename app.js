const express = require('express');

const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const helper = require('./utils/helperFunction');

const staticPath = express.static(path.join(__dirname, '/public'));

const routeConstructor = require('./routes');

app.use('/public', staticPath);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main',
    helpers: helper,
    extname: '.hbs',
  })
);
app.set('view engine', 'hbs');

routeConstructor(app);

app.listen(3000, () => console.log('Server started at 3000'));
