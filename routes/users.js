const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();
const { users } = require('../data');

router.post('/login', async (req, res) => {
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
      req.session.user = user;
      res.status(200).json({ status: true, message: 'Login successfull' });
      //redirect user to home page
    } else {
      res.status(400).json({ status: false, message: 'Invalid password' });
      // password did not matched
    }
  } else {
    res.status(404).json({ status: false, message: 'User not found' });
    //user not found
  }
});

router.post('/create', async (req, res) => {
  const userPostData = req.body;
  try {
    let { username, firstname, lastname, email, password } = userPostData;
    let userNames = await users.getAllUserName();

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
    if (userNames.indexOf(userNames)) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }
    password = await bcrypt.hash(password, 16);
    const newUser = await users.createuser(username, firstname, lastname, email, password);
    req.session.user = newUser;
    res.json(newUser);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.get('/username', async (req, res) => {
  try {
    const user = await users.getAllUserName();
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: 'Post not found' });
  }
});

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
module.exports = router;
