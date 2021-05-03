const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render('ERS/addList/userList');
  });

  router.get('/addMovie', async (req, res) => {
    res.render('ERS/addList/addMovie');
  }); 

  

module.exports = router;