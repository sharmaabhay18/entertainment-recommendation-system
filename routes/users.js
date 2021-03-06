const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();
const xss = require('xss');
const movies = require('../data/recommendedMovies');
const { users } = require('../data');

router.post('/login', async (req, res) => {
  try {
    const username = xss(req.body.username);
    const password = xss(req.body.password);
    if (!username || !password) {
      res.status(400).send({ error: 'All fields are mandatory' });
      return;
    }
    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).send({ error: 'invalid format for username/password' });
      return;
    }
    if (!username.trim().length || !password.trim().length) {
      res.status(400).send({ error: 'username cant be empty string' });
      return;
    }

    let user = await users.getUserByUsername(username);
    if (user) {
      let match = await bcrypt.compare(password, user.password);
      if (match) {
        const finalMoviePayload = await Promise.all(
          user?.movies?.map(async (movie) => {
            const isMoviePresent = await movies.getByExternalId(parseInt(movie?.external_id));
            if (isMoviePresent) {
              return { ...movie, movieDetails: isMoviePresent };
            }
            throw 'Something went wrong while populating movies';
          })
        );

        user.movies = finalMoviePayload;

        req.session.user = user;

        return res.status(200).redirect('/addList');
        //redirect user to movies page
      } else {
        // password did not matched
        return res.status(400).send('Wrong password. <a href="/">Go to Home</a>');
      }
    } else {
      //user not found
      return res.status(404).send('Username not found. <a href="/">Go to Home</a>');
    }
  } catch (error) {
    return res.status(500).redirect('/');
  }
});

router.post('/create', async (req, res) => {
  try {
    let username = xss(req.body.username);
    let firstname = xss(req.body.firstname);
    let lastname = xss(req.body.lastname);
    let email = xss(req.body.email);
    let password = xss(req.body.password);
    let userNames = await users.getAllUserName();
    let emailIds = await users.getAllEmailId();

    if (!username || !firstname || !lastname || !email || !password) {
      res.status(400).json({ error: 'All fields are mandatory' });
      return;
    }
    if (
      typeof username !== 'string' ||
      typeof firstname !== 'string' ||
      typeof lastname !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      res.status(400).json({ error: 'invalid format for input' });
      return;
    }
    if (
      !username.trim().length ||
      !firstname.trim().length ||
      !lastname.trim().length ||
      !email.trim().length ||
      !password.trim().length
    ) {
      res.status(400).json({ error: 'Input cant be empty string' });
      return;
    }
    if (!validateEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }
    if (!userNames.indexOf(username)) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }

    if (!emailIds.indexOf(email)) {
      res.status(400).json({ error: 'Email Id already exists' });
      return;
    }
    password = await bcrypt.hash(password, 16);
    const newUser = await users.createuser(username, firstname, lastname, email, password);
    req.session.user = newUser;
    res.status(200).redirect('/addList');
  } catch (e) {
    res.status(500).redirect('/');
  }
});

router.get('/username', async (req, res) => {
  try {
    const user = await users.getAllUserName();
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: 'Username not found' });
  }
});

router.get('/emailId', async (req, res) => {
  try {
    const user = await users.getAllEmailId();
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: 'Email Id not found' });
  }
});

router.get('/logout', async (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/profile', async (req, res) => {
  if (req.session.user) {
    res.render('ERS/userProfile', {
      title: 'Nav',
      loggIn: false,
      userDetails: req.session.user,
      isDefaultRoute: false,
    });
  } else {
    res.redirect('/');
  }
});

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
module.exports = router;
