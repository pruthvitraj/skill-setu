const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    fileKey: { type: String, required: true },
    fileName: String,
    parsed: {
      name: String,
      email: String,
      phone: String,
      education: [String],
      skills: [String],
      experience: [String],
      projects: [String],
      certifications: [String],
      rawText: String,
    },
    ats: {
      overall: Number,
      scoredBy: String,
      scoreBreakdown: {
        keywordMatch: Number,
        skillsMatch: Number,
        experienceMatch: Number,
        educationMatch: Number,
        projectRelevance: Number,
        atsReadability: Number,
      },
      matchedKeywords: [String],
      missingKeywords: [String],
      matchedSkills: [String],
      missingSkills: [String],
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      summary: String,
      disclaimer: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
