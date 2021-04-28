const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { users } = require('../data');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    let user = await users.getUserByUsername(username)
    if(user) {
      let match = await bcrypt.compare(password, user.password);
      if(match) {
        req.session.user = user
        res.redirect('/private');
      } else {
       res.send('Wrong password. <a href="/">Go to Login</a>')
        // password did not matched
      }
    }  else {
      res.send('User not found. <a href="/">Go to Login</a>')
      //user not found
    }
   
  });

  router.post('/create', async (req, res) => {
    const userPostData = req.body;
    try { 
      let { username, firstname,lastname, email, password  } = userPostData;
      if (!username || !firstname || !lastname || !email || !password ) {
        res.status(400).json({ error: 'All fields are mandatory' });
        return;
       }
       if (typeof (username) !== 'string' || typeof (firstname) !== 'string' || typeof (lastname) !== 'string' || typeof (email) !== 'string' || typeof (password) !== 'string'){
        res.status(400).json({ error: 'invalid format for title/summary' });
        return;
       }
       if (!username.trim().length || !firstname.trim().length || !lastname.trim().length || !email.trim().length || !password.trim().length) {
        res.status(400).json({ error: 'title/summary cant be empty string' });
        return;
       }
      password =  await bcrypt.hash(password, 16);
      const newUser = await users.createuser(username, firstname, lastname, email, password);
      req.session.user = newUser;
      res.json(newUser);
    } catch (e) {
      res.status(500).json({ error: e });
    }
   
  });

  router.get('/username',async (req, res) => {
    try {
        const user = await users.getAllUserName();
        res.json(user);
      } catch (e) {
        res.status(404).json({ error: 'Post not found' });
      }
  })
module.exports = router;
