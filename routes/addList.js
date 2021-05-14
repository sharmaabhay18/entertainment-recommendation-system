const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  if (req.session.user) {
    let list = req.session.user.movies;
    const { status } = req.query;
    if (status && status.toLocaleLowerCase() === 'plantowatch') {
      list = list.filter((i) => i.status === status.toLocaleLowerCase());
    } else if (status && status.toLocaleLowerCase() === 'completed') {
      list = list.filter((i) => i.status === status.toLocaleLowerCase());
    } else if (status && status.toLocaleLowerCase() === 'onhold') {
      list = list.filter((i) => i.status === status.toLocaleLowerCase());
    } else if (status && status.toLocaleLowerCase() === 'dropped') {
      list = list.filter((i) => i.status === status.toLocaleLowerCase());
    } else if (status && status.toLocaleLowerCase() === 'inprogress') {
      list = list.filter((i) => i.status === status.toLocaleLowerCase());
    }
    res.render('ERS/addList/userList', { list: list });
  } else {
    res.redirect('/');
  }
});

router.get('/addMovie', async (req, res) => {
  res.render('ERS/addList/addMovie');
});

router.get('/editPage', async (req, res) => {
  res.render('ERS/addList/editPage');
});

module.exports = router;
