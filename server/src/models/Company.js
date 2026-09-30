const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    website: String,
    industry: String,
    location: String,
    about: String,
    logoUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
