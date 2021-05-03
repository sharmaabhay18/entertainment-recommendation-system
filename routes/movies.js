const express = require('express');
const axios = require('axios');

const errorValidator = require('../utils/errorValidation');
const movies = require('../data/recommendedMovies');
const comments = require('../data/comments');
const commentRating = require('../data/commentRating');

const router = express.Router();
const { searchApi, imageApi, getMovie } = require('../api/api');

const appendPathToPoster = (movies) => {
  return movies.map((movie) => {
    movie.poster_path = imageApi(movie.poster_path);
    return movie;
  });
};

//get all movies
router.get('/', async (_, res) => {
  try {
    const movieList = await movies.allMovies();
    res.status(200).json({
      status: true,
      movies: movieList,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error,
    });
  }
});

//search movie based on value
router.get('/search', async (req, res) => {
  try {
    const { searchTerm } = req.query;
    if (!searchTerm) throw res.status(400).json({ message: 'You must pass search term!' });
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
      message: error,
    });
  }
});

//get movies by id with comments
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) throw 'Movie id args is required';
    try {
      errorValidator.validateObjectId(id, 'Movie id');
    } catch (error) {
      return res.status(400).json({ message: error });
    }

    const movie = await movies.get(id);
    let finalPayload = movie;

    if (movie) {
      const allComments = await comments.getCommentsByMovie(id);

      let finalCommentPayload = await Promise.all(
        allComments.map(async (comment) => {
          let ratingPayload = {
            like: 0,
            dislike: 0,
          };
          const commentsByRating = await commentRating.get(comment?._id.toString());

          commentsByRating.map((c) => {
            if (c?.status === 'like') {
              ratingPayload = { ...ratingPayload, like: ratingPayload.like + 1 };
            } else if (c?.status === 'dislike') {
              ratingPayload = { ...ratingPayload, dislike: ratingPayload.dislike + 1 };
            }
          });

          comment = { ...comment, rating: ratingPayload };
          return comment;
        })
      );

      finalPayload = { ...movie, comments: finalCommentPayload };
    }

    res.status(200).json({
      status: true,
      movies: finalPayload,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error,
    });
  }
});

//add movie implictly if not present to our
//db when user is adding movie to their list
router.post('/add-movie', async (req, res) => {
  try {
    const { status, externalId, userId } = req.body;
    if (!externalId) throw 'You must provide externalId for movie';
    if (!status) throw 'You must provide status for movie';
    if (!userId) throw 'You must provide userId for movie';

    if (typeof status !== 'string' || status?.trim()?.length === 0)
      throw 'Please make sure status is of string type and is non empty';

    const parseExtId = parseInt(externalId);
    const isMoviePresent = await movies.getByExternalId(parseExtId);

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
