const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true },
    tags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
