const mongoCollections = require('../config/mongoCollections');
const { CommentStatus, isStatusValid } = require('../utils/commentRatingEnum');
const errorValidator = require('../utils/errorValidation');

const commentRating = mongoCollections.comment_rating;

const getByUserId = async (userId) => {
  try {
    if (userId === undefined) throw 'User id args is required';

    errorValidator.validateObjectId(userId, 'User id');

    const commentRatingCollection = await commentRating();

    const commentsByUserId = await commentRatingCollection.find({ user_id: userId }).toArray();

    if (commentsByUserId === null) return {};

    return commentsByUserId;
  } catch (error) {
    throw error;
  }
};

const get = async (id) => {
  try {
    if (id === undefined) throw 'Comment id args is required';

    errorValidator.validateObjectId(id, 'Comment id');

    const commentRatingCollection = await commentRating();

    const commentsById = await commentRatingCollection.find({ comment_id: id }).toArray();

    if (commentsById === null) return [];

    return commentsById;
  } catch (error) {
    throw error;
  }
};

const getCommentRatingByObjId = async (id) => {
  if (!id) throw 'You must provide an id';

  const commentRatingCollection = await commentRating();
  const foundCommentRating = await commentRatingCollection.findOne({ _id: id });

  if (foundCommentRating === null) throw 'No comment rating found with given id';

  return { ...foundCommentRating, _id: foundCommentRating?._id?.toString() };
};

const create = async ({ status, userId, commentId }) => {
  try {
    if (!userId) throw 'user id is missing';
    if (!commentId) throw 'Comment id is missing';
    if (!status) throw 'Status is required field';

    const isStatusPresent = isStatusValid(status);

    if (!isStatusPresent) {
      throw 'Status is invalid! It should be like/dislike';
    }

    errorValidator.validateObjectId(commentId, 'Comment id');
    errorValidator.validateObjectId(userId, 'User id');

    let commentStatus = '';
    if (CommentStatus.DISLIKE.toString() === Symbol(status.toLowerCase()).toString()) {
      commentStatus = 'dislike';
    } else if (CommentStatus.LIKE.toString() === Symbol(status.toLowerCase()).toString()) {
      commentStatus = 'like';
    }

    const comment_rating = {
      user_id: userId,
      comment_id: commentId,
      status: commentStatus,
      created_at: new Date(),
    };

    const commentRatingCollection = await commentRating();
    const insertCommentRating = await commentRatingCollection.insertOne(comment_rating);
    if (insertCommentRating.insertedCount === 0) throw 'Could not add comment rating';

    const newId = insertCommentRating.insertedId;

    const retrievedCommentRating = await getCommentRatingByObjId(newId);
    return retrievedCommentRating;
  } catch (error) {
    throw error;
  }
};

const remove = async (userId, status) => {
  try {
    if (!userId) throw 'User id is missing';
    if (!status) throw 'Status is required field';

    const isStatusPresent = isStatusValid(status);

    if (!isStatusPresent) {
      throw 'Status is invalid! It should be like/dislike';
    }

    errorValidator.validateObjectId(userId, 'User id');

    const commentRatingCollection = await commentRating();
    const foundCommentRating = await commentRatingCollection.findOne({
      $and: [{ user_id: userId }, { status: status }],
    });

    if (!foundCommentRating) throw `Could not found comment rating with user id of ${userId} and status ${status}`;

    const deletionInfo = await commentRatingCollection.deleteOne({
      _id: foundCommentRating?._id,
    });

    if (deletionInfo.deletedCount === 0) {
      throw `Could not delete comment rating with user id of ${userId}`;
    }
    return { commentRatingId: userId, deleted: true };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  get,
  getByUserId,
  remove,
};
