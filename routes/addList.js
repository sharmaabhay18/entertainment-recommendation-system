const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  let list = req.session.user.movies;
  res.render('ERS/addList/userList',{list : list});
});

router.get('/addMovie', async (req, res) => {
  res.render('ERS/addList/addMovie');
});

module.exports = router;
