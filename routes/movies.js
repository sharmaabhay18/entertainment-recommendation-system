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

router.get('/list', async (req, res) => {
  try {
    const { genres } = req.query;
    const { order } = req.query;

    const movieList = await movies.allMovies();
    movieList.sort((a, b) => Number(b?.rating?.average) - Number(a?.rating?.average));

    let finalList = [];
    if (genres) {
      movieList.map((movie) =>
        movie.genres.map((g) => {
          if (g.name.replace(/\s/g, '').toLowerCase() === genres.toLowerCase()) {
            finalList.push(movie);
          }
        })
      );
    } else {
      finalList = movieList;
    }

    if (order) {
      function compare(a, b) {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      }

      if (order === 'ascending') {
        movieList.sort(compare);
      } else if (order === 'descending') {
        movieList.sort(compare);
        movieList.reverse();
      }
    }

    res.render('ERS/movieList', { movies: finalList, loggIn: req.session.user ? false : true, isDefaultRoute: false });
  } catch (error) {
    res.status(500).redirect('/');
  }
});

//search movie based on value
router.get('/search', async (req, res) => {
  try {
    if (!req.session?.user) {
      return isUserAuthenticated(req.session?.user, res);
    }

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

      let commentsWithUser = await Promise.all(
        allComments.map(async (c) => {
          const userPayload = await users.getUserById(c?.user_id);
          return { ...c, user: userPayload };
        })
      );

      let finalCommentPayload = await Promise.all(
        commentsWithUser.map(async (comment) => {
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

          let isLikedByUser = false;
          commentsByRating.map((like) => {
            if (like.status === 'like' && like.user_id === req.session?.user?._id) {
              isLikedByUser = true;
            }
          });

          let isDislikedByUser = false;
          commentsByRating.map((dislike) => {
            if (dislike.status === 'dislike' && dislike.user_id === req.session?.user?._id) {
              isDislikedByUser = true;
            }
          });

          let isThisUser = false;
          if (comment.user_id === req.session?.user?._id) {
            isThisUser = true;
          }

          let isUserLoggedIn = false;
          if (req.session?.user) {
            isUserLoggedIn = true;
          }

          comment = {
            ...comment,
            _id: comment._id.toString(),
            rating: ratingPayload,
            validUser: isThisUser,
            userLiked: isLikedByUser,
            userDisliked: isDislikedByUser,
            isUserLoggedIn: isUserLoggedIn,
          };
          return comment;
        })
      );

      finalPayload = { ...movie, comments: finalCommentPayload };
    }

    res.render('ERS/movieDetails', {
      loggIn: req.session?.user ? false : true,
      movies: finalPayload,
      user: req.session?.user,
      isDefaultRoute: false,
    });
  } catch (error) {
    res.status(500).redirect('/');
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

    const { status, externalId, rating } = req.body;

    if (!externalId) throw 'You must provide externalId for movie';

    if (!rating && !status) throw 'You must provide either rating/status to update';
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
    }

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

    const { status, externalId, rating } = req.body;
    if (!externalId) throw 'You must provide externalId for movie';
    if (!status) throw 'You must provide status for movie';
    if (!rating) throw 'You must provide rating for movie';
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
