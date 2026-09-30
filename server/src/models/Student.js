const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  startYear: Number,
  endYear: Number,
  grade: String,
});

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  skills: [String],
  url: String,
  highlights: [String],
});

const experienceSchema = new mongoose.Schema({
  company: String,
  title: String,
  startDate: Date,
  endDate: Date,
  current: Boolean,
  description: String,
});

const certificationSchema = new mongoose.Schema({
  name: String,
  issuer: String,
  issuedAt: Date,
  url: String,
  fileKey: String,
});

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
    batch: { type: String, index: true },
    enrollmentNo: { type: String },
    bio: String,
    headline: String,
    location: String,
    education: [educationSchema],
    skills: [{ name: String, level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' } }],
    projects: [projectSchema],
    experience: [experienceSchema],
    certifications: [certificationSchema],
    achievements: [String],
    targetRole: { type: String, default: null },
    atsScore: { type: Number, default: 0 },
    skillScore: { type: Number, default: 0 },
    profileCompletion: { type: Number, default: 0 },
    placementStatus: {
      type: String,
      enum: ['available', 'in_process', 'placed', 'not_interested'],
      default: 'available',
      index: true,
    },
    privacy: {
      showProfile: { type: Boolean, default: true },
      showScores: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

studentSchema.index({ university: 1, department: 1, batch: 1 });

module.exports = mongoose.model('Student', studentSchema);
