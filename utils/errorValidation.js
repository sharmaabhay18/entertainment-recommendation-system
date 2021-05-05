const { ObjectId } = require('mongodb');

const validateObjectId = (id, value) => {
  if (!id) throw `${value} is required`;
  if (typeof id !== 'string' || id?.trim()?.length === 0) throw 'Please enter a valid id';

  const parsedId = ObjectId.isValid(id);
  if (!parsedId) throw `${value} passed is not a valid object id`;
};

const isMovieStatusValid = (movieStatus) => {
  const status = ['inprogress', 'dropped', 'completed', 'onhold', 'plantowatch'];

  const [isMovieStatusPresent] = status.filter((s) => s === movieStatus.replace(/\s/g, '').toLocaleLowerCase());
  if (!isMovieStatusPresent) throw 'Movie status is invalid';
};

module.exports = {
  validateObjectId,
  isMovieStatusValid,
};
