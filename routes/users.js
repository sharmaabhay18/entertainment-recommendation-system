const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();
const movies = require('../data/recommendedMovies');
const { users } = require('../data');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'All fields are mandatory' });
      return;
    }
    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'invalid format for username/password' });
      return;
    }
    if (!username.trim().length || !password.trim().length) {
      res.status(400).json({ error: 'username cant be empty string' });
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

        res.render('ERS/home', {
          title: 'Nav',
          loggIn: false,
          userDetails: req.session.user
        });
        //redirect user to home page
      } else {
        res.status(400).json({ status: false, message: 'Invalid password' });
        // password did not matched
      }
    } else {
      res.status(404).json({ status: false, message: 'User not found' });
      //user not found
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error,
    });
  }
});

router.post('/create', async (req, res) => {
  const userPostData = req.body;
  try {
    let { username, firstname, lastname, email, password } = userPostData;
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
      res.status(400).json({ error: 'invalid format for title/summary' });
      return;
    }
    if (
      !username.trim().length ||
      !firstname.trim().length ||
      !lastname.trim().length ||
      !email.trim().length ||
      !password.trim().length
    ) {
      res.status(400).json({ error: 'title/summary cant be empty string' });
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
    res.render('ERS/home', {
      title: 'Nav',
      loggIn: false,
      userDetails: req.session.user
    });
  } catch (e) {
    res.status(500).json({ error: e });
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
  res.render('ERS/landing', {
    title: 'Nav',
    loggIn: true,
  });
});

router.get('/profile', async (req, res) => {
  res.render('ERS/userProfile', {
    title: 'Nav',
    loggIn: false,
    userDetails: req.session.user
  });
})

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
module.exports = router;
