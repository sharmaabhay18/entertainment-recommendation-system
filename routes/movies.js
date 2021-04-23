const express = require('express');
const axios = require('axios');

const movies = require('../data/recommendedMovies');

const router = express.Router();
const { searchApi, imageApi, getMovie } = require('../api/api');

const appendPathToPoster = (movies) => {
  return movies.map((movie) => {
    movie.poster_path = imageApi(movie.poster_path);
    return movie;
  });
};

router.get('/search', async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const allMovies = await axios.get(searchApi(searchTerm));

    //update poster link of movie to the poster_path
    const finalPayload = appendPathToPoster(allMovies?.data?.results);

    res.status(200).json({
      status: true,
      movies: finalPayload,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Something went wrong',
    });
  }
});

router.post('/add-movie', async (req, res) => {
  try {
    const { status, externalId, userId } = req.body;
    if (!externalId) throw 'You must provide externalId for movie';
    if (!status) throw 'You must provide status for movie';
    if (!userId) throw 'You must provide userId for movie';

    if (typeof status !== 'string' || status?.trim()?.length === 0)
      throw 'Please make sure status is of string type and is non empty';

    const parseExtId = parseInt(externalId);
    const isMoviePresent = await movies.get(parseExtId);

    if (isMoviePresent.length === 0) {
      //Add movie implicitly to our db from calling external api
      const movieById = await axios.get(getMovie(parseExtId));
      const movieData = [movieById.data];
      const [updatedMovie] = appendPathToPoster(movieData);
      await movies.create(updatedMovie);
    }

    //TO-Do: Find user and add movie to their list with status
    res.status(200).json({
      status: true,
      message: 'Movie added successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error,
    });
  }
});

module.exports = router;
