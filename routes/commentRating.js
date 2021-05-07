const { ObjectId } = require('mongodb');
const express = require('express');

const errorValidator = require('../utils/errorValidation');
const { isStatusValid } = require('../utils/commentRatingEnum');
const commentRating = require('../data/commentRating');
const comments = require('../data/comments');
const { users } = require('../data');

const router = express.Router();

//Add comment rating
router.post('/', async (req, res) => {
  const { commentId, status } = req.body;
  const userId = req.session?.user?._id.toString();

  if (!userId) {
    return res.status(400).json({ status: false, message: 'Unauthorized User!' });
  }

  if (!commentId || commentId.trim().length === 0)
    return res.status(400).json({ message: 'You must provide a comment id which is valid for comment rating' });

  if (typeof status !== 'string') return res.status(400).json({ message: 'Status should be a type of string' });
  if (!status || status.trim().length === 0) return res.status(400).json({ message: 'Status is required field' });

  const isStatusPresent = isStatusValid(status);

  if (!isStatusPresent) {
    return res.status(400).json({ status: false, message: 'Status is invalid! It should be like/dislike' });
  }

  try {
    errorValidator.validateObjectId(userId, 'User id');
  } catch (error) {
    return res.status(400).json({ status: false, message: error });
  }

  try {
    errorValidator.validateObjectId(commentId, 'Comment id');
  } catch (error) {
    return res.status(400).json({ status: false, message: error });
  }

  try {
    await comments.getCommentByObjId(ObjectId(commentId));
  } catch (error) {
    return res.status(404).json({ status: false, message: error });
  }

  try {
    await comments.getCommentByObjId(ObjectId(commentId));
  } catch (error) {
    return res.status(404).json({ status: false, message: error });
  }

  try {
    const commentRatingPayload = {
      userId,
      commentId,
      status,
    };

    const isCommentPresentForUser = await commentRating.getByUserId(userId, commentId);

    if (isCommentPresentForUser && isCommentPresentForUser.length === 1) {
      if (isCommentPresentForUser[0].status === 'like' && status === 'like') {
        return res.status(400).json({ status: false, message: 'User has already liked the comment' });
      } else if (isCommentPresentForUser[0].status === 'dislike' && status === 'dislike') {
        return res.status(400).json({ status: false, message: 'User has already disliked the comment' });
      }
    } else if (isCommentPresentForUser && isCommentPresentForUser.length >= 2) {
      return res.status(400).json({ status: false, message: 'User has already liked/disliked the comment' });
    }

    const addedCommentRating = await commentRating.create(commentRatingPayload);

    return res.status(200).json({
      status: true,
      comment: addedCommentRating,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error,
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const commentId = req.params?.id;

    const { status } = req.body;
    const userId = req.session?.user?._id.toString();

    if (!userId) {
      return res.status(400).json({ status: false, message: 'Unauthorized User!' });
    }

    if (!commentId || commentId.trim().length === 0)
      return res
        .status(400)
        .json({ status: false, message: 'You must provide a comment id which is valid for comment' });

    if (typeof status !== 'string') return res.status(400).json({ message: 'Status should be a type of string' });
    if (!status || status.trim().length === 0) return res.status(400).json({ message: 'Status is required field' });

    const isStatusPresent = isStatusValid(status);

    if (!isStatusPresent) {
      return res.status(400).json({ status: false, message: 'Status is invalid! It should be like/dislike' });
    }

    try {
      errorValidator.validateObjectId(commentId, 'Comment id');
    } catch (error) {
      return res.status(400).json({ status: false, message: error });
    }

    try {
      errorValidator.validateObjectId(userId, 'User id');
    } catch (error) {
      return res.status(400).json({ status: false, message: error });
    }

    try {
      await comments.getCommentByObjId(ObjectId(commentId));
    } catch (error) {
      return res.status(404).json({ status: false, message: error });
    }

    try {
      await users.getUserById(userId);
    } catch (error) {
      return res.status(404).json({ status: false, message: error });
    }

    const removedCommentRating = await commentRating.remove(userId, status, commentId);
    res.status(200).json({ status: true, message: removedCommentRating });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error,
    });
  }
});

module.exports = router;
