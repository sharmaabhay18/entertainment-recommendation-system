const { ObjectId } = require('mongodb');
const express = require('express');

const errorValidator = require('../utils/errorValidation');

const comments = require('../data/comments');
const movies = require('../data/recommendedMovies');
const { users } = require('../data');

const router = express.Router();

//Add comment for specified movie
router.post('/add', async (req, res) => {
  try {
    const { movieId, userId, message } = req.body;
    if (!movieId || movieId.trim().length === 0)
      return res.status(400).json({ message: 'You must provide a movie id which is valid for comment' });
    if (!userId || userId.trim().length === 0)
      return res.status(400).json({ message: 'You must provide a user id which is valid for comment' });
    if (typeof message !== 'string') return res.status(400).json({ message: 'Message should be of type string' });
    if (!message || message.trim().length === 0)
      return res.status(400).json({ message: 'You must provide a message which is valid for comment' });

    try {
      errorValidator.validateObjectId(movieId, 'Movie id');
      errorValidator.validateObjectId(userId, 'User id');
    } catch (error) {
      return res.status(400).json({ message: error });
    }

    try {
      await movies.get(movieId);
    } catch (error) {
      return res.status(404).json({ message: error });
    }

    try {
      await users.getUserById(userId);
    } catch (error) {
      return res.status(404).json({ message: error });
    }

    const commentPayload = {
      movie_id: movieId,
      message,
      user_id: userId,
      created_at: new Date(),
    };

    const addedComment = await comments.create(commentPayload);

    return res.status(200).json({
      status: true,
      comment: addedComment,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error,
    });
  }
});

//Update comment for the user
router.post('/update', async (req, res) => {
  const { message, commentId } = req.body;
  const userId = req.session?.user?._id.toString();

  if (!userId) {
    return res.status(400).json({ status: false, message: 'Unauthorized User!' });
  }

  if (!commentId || commentId.trim().length === 0)
    return res.status(400).json({ message: 'You must provide a comment id which is valid for comment' });
  if (typeof message !== 'string') return res.status(400).json({ message: 'Message should be of type string' });
  if (!message || message.trim().length === 0)
    return res.status(400).json({ message: 'You must provide a message which is valid for comment' });

  try {
    errorValidator.validateObjectId(commentId, 'Comment id');
  } catch (error) {
    return res.status(400).json({ status: false, message: error });
  }

  try {
    await comments.authorizedComment(commentId, userId);
  } catch (error) {
    return res.status(404).json({ status: false, message: error });
  }

  try {
    await comments.getCommentByObjId(ObjectId(commentId));
  } catch (error) {
    return res.status(404).json({ status: false, message: error });
  }

  try {
    const updateComment = await comments.update(commentId, message);

    return res.status(200).json({
      status: true,
      comment: updateComment,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error,
    });
  }
});

//Delete comment for the user
router.delete('/:id', async (req, res) => {
  const id = req.params?.id;

  const userId = req.session?.user?._id.toString();

  if (!userId) {
    return res.status(400).json({ status: false, message: 'Unauthorized User!' });
  }

  if (!id || id.trim().length === 0)
    return res.status(400).json({ message: 'You must provide a comment id which is valid for comment' });

  try {
    errorValidator.validateObjectId(id, 'Comment id');
  } catch (error) {
    return res.status(400).json({ status: false, message: error });
  }

  try {
    await comments.authorizedComment(id, userId);
  } catch (error) {
    return res.status(404).json({ status: false, message: error });
  }

  try {
    await comments.getCommentByObjId(ObjectId(id));
  } catch (error) {
    return res.status(404).json({ status: false, message: error });
  }

  try {
    const removedComment = await comments.remove(id);
    res.status(200).json({ status: true, message: removedComment });
  } catch (error) {
    res.status(500).json({ status: false, message: error });
  }
});

module.exports = router;
