const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
  title: { type: String, required: true }, brief: { type: String, required: true },
  skill: { type: String, required: true }, expectedHours: Number, deadline: { type: Date, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  rubric: [{ criterion: { type: String, required: true }, weight: { type: Number, required: true } }],
}, { timestamps: true });
module.exports = mongoose.model('Challenge', schema);
