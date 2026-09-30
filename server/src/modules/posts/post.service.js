const Post = require('../../models/Post');
const { paginated } = require('../../utils/pagination');

async function list({ page, limit }) {
  const [items, total] = await Promise.all([
    Post.find().populate('author', 'firstName lastName role').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Post.countDocuments(),
  ]);
  return paginated(items, total, page, limit);
}

async function create(userId, body, tags) {
  return Post.create({ author: userId, body, tags });
}

async function like(postId, userId) {
  const post = await Post.findByIdAndUpdate(
    postId,
    { $addToSet: { likes: userId } },
    { new: true }
  ).populate('author', 'firstName lastName role').populate('likes', 'firstName lastName');
  return post;
}

async function unlike(postId, userId) {
  const post = await Post.findByIdAndUpdate(
    postId,
    { $pull: { likes: userId } },
    { new: true }
  ).populate('author', 'firstName lastName role').populate('likes', 'firstName lastName');
  return post;
}

async function remove(postId, userId) {
  const post = await Post.findOneAndDelete({ _id: postId, author: userId });
  return post;
}

module.exports = { list, create, like, unlike, remove };
