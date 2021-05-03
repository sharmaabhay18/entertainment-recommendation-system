const express = require('express');

const errorValidator = require('../utils/errorValidation');
const { isStatusValid } = require('../utils/commentRatingEnum');
const commentRating = require('../data/commentRating');

const router = express.Router();

//Add comment rating
router.post('/', async (req, res) => {
  const { userId, commentId, status } = req.body;
  if (!commentId || commentId.trim().length === 0)
    return res.status(400).json({ message: 'You must provide a comment id which is valid for comment rating' });
  if (!userId || userId.trim().length === 0)
    return res.status(400).json({ message: 'You must provide a user id which is valid for comment rating' });
  if (typeof status !== 'string') return res.status(400).json({ message: 'Status should be a type of string' });
  if (!status || status.trim().length === 0) return res.status(400).json({ message: 'Status is required field' });

  const isStatusPresent = isStatusValid(status);

  if (!isStatusPresent) {
    return res.status(400).json({ message: 'Status is invalid! It should be like/dislike' });
  }

  try {
    errorValidator.validateObjectId(commentId, 'Comment id');
    errorValidator.validateObjectId(userId, 'User id');
  } catch (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const commentRatingPayload = {
      userId,
      commentId,
      status,
    };

    const isCommentPresentForUser = await commentRating.getByUserId(userId);

    if (isCommentPresentForUser.length === 1) {
      if (isCommentPresentForUser[0].status === 'like' && status === 'like') {
        return res.status(400).json({ message: 'User has already liked the comment' });
      } else if (isCommentPresentForUser[0].status === 'dislike' && status === 'dislike') {
        return res.status(400).json({ message: 'User has already disliked the comment' });
      }
    } else if (isCommentPresentForUser.length >= 2) {
      return res.status(400).json({ message: 'User has already liked/disliked the comment' });
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

router.delete('/', async (req, res) => {
  try {
    const { userId, status } = req.body;

    if (!userId || userId.trim().length === 0)
      return res.status(400).json({ message: 'You must provide a user id which is valid for comment rating' });
    if (typeof status !== 'string') return res.status(400).json({ message: 'Status should be a type of string' });
    if (!status || status.trim().length === 0) return res.status(400).json({ message: 'Status is required field' });

    const isStatusPresent = isStatusValid(status);

    if (!isStatusPresent) {
      return res.status(400).json({ message: 'Status is invalid! It should be like/dislike' });
    }

    try {
      errorValidator.validateObjectId(userId, 'User id');
    } catch (error) {
      return res.status(400).json({ message: error });
    }

    const removedCommentRating = await commentRating.remove(userId, status);
    res.status(200).json({ status: true, message: removedCommentRating });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error,
    });
  }
});

module.exports = router;
