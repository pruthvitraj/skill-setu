const mongoose = require('mongoose');

const applicationHistorySchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    fromStatus: String,
    toStatus: String,
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('ApplicationHistory', applicationHistorySchema);
