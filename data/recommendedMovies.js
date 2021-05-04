const { ObjectId } = require('mongodb');

const mongoCollections = require('../config/mongoCollections');
const errorValidator = require('../utils/errorValidation');

const recommendedMovies = mongoCollections.recommended_movies;

const allMovies = async () => {
  try {
    const movieCollection = await recommendedMovies();
    const movieList = await movieCollection.find({}).toArray();

    const moviePayload = movieList.map((movie) => {
      return { _id: movie?._id?.toString(), ...movie };
    });
    return moviePayload;
  } catch (error) {
    throw `Error while fetching data from db ${error}`;
  }
};

const get = async (id) => {
  if (id === undefined) throw 'Id args is required';
  errorValidator.validateObjectId(id, 'Movie id');

  const movieCollection = await recommendedMovies();

  const movieById = await movieCollection.findOne({
    _id: ObjectId(id),
  });

  if (movieById === null) throw 'No movie found with given id';

  return movieById;
};

const getByExternalId = async (id) => {
  if (id === undefined) throw 'Id args is required';
  if (typeof id !== 'number') throw 'Please enter a valid id';

  const movieCollection = await recommendedMovies();

  const movieById = await movieCollection.findOne({
    externalId: id,
  });

  if (movieById === null) throw 'No movie found with given id';

  return movieById;
};

const getMovieByObjId = async (id) => {
  if (!id) throw 'You must provide an id';

  const movieCollection = await recommendedMovies();
  const foundMovie = await movieCollection.findOne({ _id: id });

  if (foundMovie === null) throw 'No movie found with given id';

  return { ...foundMovie, _id: foundMovie?._id?.toString() };
};

const create = async (
  {
    id,
    adult,
    budget,
    genres,
    title,
    overview,
    poster_path,
    release_date,
    revenue,
    status,
    tagline,
    original_language,
    runtime,
  },
  rating,
  userId
) => {
  if (!id) throw 'Id is missing from third party api';
  if (!userId) throw 'Please provide user id for adding movie';
  if (!rating) throw 'Please provide rating for adding movie';
  if (!budget) throw 'budget is missing from third party api';
  if (!genres) throw 'genres is missing from third party api';
  if (!title) throw 'title is missing from third party api';
  if (!overview) throw 'overview is missing from third party api';
  if (!poster_path) throw 'poster_path is missing from third party api';
  if (!release_date) throw 'release_date is missing from third party api';
  if (!revenue) throw 'revenue is missing from third party api';
  if (!status) throw 'status is missing from third party api';
  if (!tagline) throw 'tagline is missing from third party api';
  if (!original_language) throw 'original_language is missing from third party api';
  if (!runtime) throw 'runtime is missing from third party api';

  errorValidator.validateObjectId(userId, 'User id');

  if (typeof rating !== 'number') {
    throw 'Rating must be of number type';
  }

  if (rating < 1 || rating > 5) {
    throw 'Rating must be in range of 1 - 5';
  }

  const userRatingObj = {
    average: rating,
    user_rating: [
      {
        user_id: userId,
        value: rating,
      },
    ],
  };

  const movie = {
    externalId: id,
    adult,
    budget,
    genres,
    title,
    overview,
    poster: poster_path,
    release_date,
    revenue,
    status,
    tagline,
    original_language,
    runtime,
    rating: userRatingObj,
    created_at: new Date(),
  };

  const movieCollection = await recommendedMovies();
  const insertMovie = await movieCollection.insertOne(movie);
  if (insertMovie.insertedCount === 0) throw 'Could not add movie';

  const newId = insertMovie.insertedId;

  const retrievedMovie = await getMovieByObjId(newId);
  return retrievedMovie;
};

const update = async (id, payload) => {
  try {
    if (!id) throw 'Please provide movie id to update the movie';
    if (!payload) throw 'Payload can not be empty';

    errorValidator.validateObjectId(id.toString(), 'Movie id');

    const movieCollection = await recommendedMovies();
    const updatedMovie = await movieCollection.updateOne({ _id: id }, { $set: { rating: payload } });

    if (!updatedMovie.matchedCount && !updatedMovie.modifiedCount) throw 'Could not update movie rating';

    return await getMovieByObjId(id);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  get,
  getByExternalId,
  create,
  allMovies,
  update,
};
