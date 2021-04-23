const express = require('express');

const router = express.Router();
const movies = require('../data/recommendedMovies');

router.post('/add', (req, res) => {
  const { externalId, userId, value } = req.body;
});

module.exports = router;
