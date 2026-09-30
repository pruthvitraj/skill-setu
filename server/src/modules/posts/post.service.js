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

module.exports = { list, create };
