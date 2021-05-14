const express = require('express');
const axios = require('axios');

const errorValidator = require('../utils/errorValidation');
const movies = require('../data/recommendedMovies');
const comments = require('../data/comments');
const commentRating = require('../data/commentRating');
const { users } = require('../data');

const router = express.Router();
const { searchApi, imageApi, getMovie } = require('../api/api');

const appendPathToPoster = (movies) => {
  return movies.map((movie) => {
    movie.poster_path = imageApi(movie.poster_path);
    return movie;
  });
};

const isUserAuthenticated = (user, res) => {
  return res.status(403).json({
    status: false,
    message: 'User is not authenticated',
  });
};

const updateRating = async (isMoviePresent, rating, userId) => {
  const { _id, rating: movieRating } = isMoviePresent;
  let tempRating = movieRating;
  const [isRatingPresent] = tempRating.user_rating.filter((u) => u.user_id === userId);

  const userRating = {
    user_id: userId,
    value: rating,
  };
  if (isRatingPresent) {
    tempRating.user_rating = tempRating.user_rating.map((r) => {
      if (r.user_id === isRatingPresent.user_id) {
        r.value = rating;
        return r;
      }
      return r;
    });
  } else {
    tempRating.user_rating.push(userRating);
  }

  //calculate average rating for movie
  let newAverage = 0;
  if (tempRating?.user_rating.length === 1) {
    newAverage = rating;
  } else {
    newAverage = tempRating?.user_rating.reduce((a, b) => a.value + b.value) / tempRating?.user_rating.length;
  }
  tempRating.average = newAverage;
  await movies.update(_id, tempRating);
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
    // if (!req.session?.user) {
    //   return isUserAuthenticated(req.session?.user, res);
    // }

    const { searchTerm } = req.query;
    if (!searchTerm) throw res.status(400).json({ message: 'You must pass search term!' });
    const allMovies = await axios.get(searchApi(searchTerm));

    //update poster link of movie to the poster_path
    const finalPayload = appendPathToPoster(allMovies?.data?.results);

    return res.status(200).json({
      status: true,
      movies: finalPayload,
    });
  } catch (error) {
    return res.status(500).json({
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

//update rating and status of movie
router.patch('/update', async (req, res) => {
  try {
    if (!req.session?.user) {
      return isUserAuthenticated(req.session?.user, res);
    }

    const userId = req.session?.user?._id.toString();

    if (!userId) {
      return res.status(400).json({ status: false, message: 'Unauthorized User!' });
    }

    const { status, externalId, rating: userRating } = req.body;

    if (!externalId) throw 'You must provide externalId for movie';

    if (!userRating && !status) throw 'You must provide either rating/status to update';
    const rating = parseInt(userRating);
    if (rating) {
      if (typeof rating !== 'number') {
        return res.status(400).json({ status: false, message: 'Rating must be of number type' });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ status: false, message: 'Rating must be in range of 1 - 5' });
      }

      if (rating % 1 !== 0) {
        return res.status(400).json({ status: false, message: 'Please enter whole number with range of 1 - 5' });
      }
    }

    if (status) {
      if (typeof status !== 'string' || status?.trim()?.length === 0)
        return res
          .status(400)
          .json({ status: false, message: 'Please make sure status is of string type and is non empty' });

      try {
        errorValidator.isMovieStatusValid(status);
      } catch (error) {
        return res.status(400).json({ message: error });
      }
    }

    try {
      errorValidator.validateObjectId(userId, 'User id');
    } catch (error) {
      return res.status(400).json({ message: error });
    }

    try {
      await users.getUserById(userId);
    } catch (error) {
      return res.status(404).json({ message: error });
    }

    const parseExtId = parseInt(externalId);
    const isMoviePresent = await movies.getByExternalId(parseExtId);
    if (isMoviePresent.length === 0) {
      return res.status(400).json({ status: false, message: 'No movie present to update' });
    } else if (rating) {
      updateRating(isMoviePresent, rating, userId);
    }

    //update user status for movie
    const updatedUser = await users.updateMovieList(userId, { externalId, status });

    const finalMoviePayload = await Promise.all(
      updatedUser?.movies?.map(async (movie) => {
        const isMoviePresent = await movies.getByExternalId(parseInt(movie?.external_id));
        if (isMoviePresent) {
          return { ...movie, movieDetails: isMoviePresent };
        }
        throw 'Something went wrong while populating movies';
      })
    );
    updatedUser.movies = finalMoviePayload;
    req.session.user = updatedUser;

    res.status(200).json({
      status: true,
      message: 'Updated successfully',
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
    if (!req.session?.user) {
      return isUserAuthenticated(req.session?.user, res);
    }

    const userId = req.session?.user?._id.toString();

    if (!userId) {
      return res.status(400).json({ status: false, message: 'Unauthorized User!' });
    }

    const { status, externalId, rating: userRating } = req.body;
    if (!externalId) return res.status(400).json({ status: false, message: 'You must provide externalId for movie' });
    if (!status) return res.status(400).json({ status: false, message: 'You must provide status for movie' });
    if (!userRating) return res.status(400).json({ status: false, message: 'You must provide rating for movie' });
    const rating = parseInt(userRating);
    if (typeof rating !== 'number') {
      return res.status(400).json({ status: false, message: 'Rating must be of number type' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ status: false, message: 'Rating must be in range of 1 - 5' });
    }

    if (rating % 1 !== 0) {
      return res.status(400).json({ status: false, message: 'Please enter whole number with range of 1 - 5' });
    }

    if (typeof status !== 'string' || status?.trim()?.length === 0)
      return res
        .status(400)
        .json({ status: false, message: 'Please make sure status is of string type and is non empty' });

    try {
      errorValidator.isMovieStatusValid(status);
    } catch (error) {
      return res.status(400).json({ message: error });
    }

    try {
      errorValidator.validateObjectId(userId, 'User id');
    } catch (error) {
      return res.status(400).json({ message: error });
    }

    try {
      await users.getUserById(userId);
    } catch (error) {
      return res.status(404).json({ message: error });
    }

    const parseExtId = parseInt(externalId);
    const isMoviePresent = await movies.getByExternalId(parseExtId);

    if (isMoviePresent.length === 0) {
      //Add movie implicitly to our db from calling external api
      const movieById = await axios.get(getMovie(parseExtId));
      const movieData = [movieById.data];
      const [updatedMovie] = appendPathToPoster(movieData);
      await movies.create(updatedMovie, rating, userId);
    } else {
      //update movie rating based on user ratings
      updateRating(isMoviePresent, rating, userId);
    }

    //update user status for movie
    const updatedUser = await users.updateMovieList(userId, { externalId, status });

    const finalMoviePayload = await Promise.all(
      updatedUser?.movies?.map(async (movie) => {
        const isMoviePresent = await movies.getByExternalId(parseInt(movie?.external_id));
        if (isMoviePresent) {
          return { ...movie, movieDetails: isMoviePresent };
        }
        throw 'Something went wrong while populating movies';
      })
    );
    updatedUser.movies = finalMoviePayload;
    req.session.user = updatedUser;

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
