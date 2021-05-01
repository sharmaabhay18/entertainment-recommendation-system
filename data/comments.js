const { ObjectId } = require('mongodb');

const mongoCollections = require('../config/mongoCollections');
const errorValidator = require('../utils/errorValidation');

const comments = mongoCollections.comments;

const getCommentsByMovie = async (id) => {
  try {
    if (!id) throw 'You must provide a movie id';
    errorValidator.validateObjectId(id, 'Movie id');
    const commentsCollection = await comments();
    const allComments = await commentsCollection.find({ movie_id: id }).toArray();
    return allComments;
  } catch (error) {
    throw error;
  }
};

const getCommentByObjId = async (id) => {
  if (!id) throw 'You must provide an id';

  const commentCollection = await comments();
  const foundComment = await commentCollection.findOne({ _id: id });

  if (foundComment === null) throw 'No comment found with given id';

  return { ...foundComment, _id: foundComment?._id?.toString() };
};

const create = async (commentPayload) => {
  try {
    const { movie_id, message, user_id } = commentPayload;
    if (!movie_id) throw 'You must provide a movie id for comment';
    if (!message) throw 'You must provide a message for comment';
    if (!user_id) throw 'You must provide a user id for comment';

    if (typeof message !== 'string' || message?.trim()?.length === 0)
      throw 'Please make sure message is of string type and is non empty';

    errorValidator.validateObjectId(movie_id, 'Movie id');
    errorValidator.validateObjectId(user_id, 'User id');

    const comment = {
      movie_id,
      message,
      user_id,
      created_at: new Date(),
    };

    const commentsCollection = await comments();
    const insertComment = await commentsCollection.insertOne(comment);
    if (insertComment.insertedCount === 0) throw 'Could not add comment';

    const newId = insertComment.insertedId;

    const retrievedComment = await getCommentByObjId(newId);
    return retrievedComment;
  } catch (error) {
    throw error;
  }
};

const update = async (id, payload) => {
  try {
    errorValidator.validateObjectId(id, 'Comment id');
    const commentsCollection = await comments();
    const updateComment = await commentsCollection.updateOne({ _id: ObjectId(id) }, { $set: { message: payload } });

    if (!updateComment.matchedCount && !updateComment.modifiedCount) throw 'Could not update book';

    return await getCommentByObjId(ObjectId(id));
  } catch (error) {
    throw error;
  }
};

const remove = async (id) => {
  try {
    errorValidator.validateObjectId(id, 'Comment id');
    const commentsCollection = await comments();
    const deletionInfo = await commentsCollection.deleteOne({
      _id: ObjectId(id),
    });

    if (deletionInfo.deletedCount === 0) {
      throw `Could not delete comment with id of ${id}`;
    }
    return { commentId: id, deleted: true };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getCommentsByMovie,
  update,
  create,
  remove,
  getCommentByObjId,
};
