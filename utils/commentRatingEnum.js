//enum for like/dislike of comments
const CommentStatus = Object.freeze({
  LIKE: Symbol('like'),
  DISLIKE: Symbol('dislike'),
});

const statusValue = ['like', 'dislike'];

const isStatusValid = (status) => {
  const [isStatusPresent] = statusValue.filter((s) => s === status.toLocaleLowerCase());
  return isStatusPresent;
};

module.exports = { CommentStatus, isStatusValid };
