const Assessment = require('../src/models/Assessment');
const Course = require('../src/models/Course');
const Skill = require('../src/models/Skill');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Tpo = require('../src/models/Tpo');
const Recruiter = require('../src/models/Recruiter');
const University = require('../src/models/University');
const Department = require('../src/models/Department');
const Company = require('../src/models/Company');
const Job = require('../src/models/Job');
const { hashPassword } = require('../src/utils/password');
const { connectDb } = require('../src/config/db');
const { JOB_STATUS, JOB_TYPE, ROLES } = require('../src/utils/constants');
const logger = require('../src/utils/logger');

async function seed() {
  await connectDb();

  await Promise.all([
    User.deleteMany({ email: /@skillsetu.dev$/ }),
    Student.deleteMany({}),
    Tpo.deleteMany({}),
    Recruiter.deleteMany({}),
  ]);

  const university = await University.findOneAndUpdate(
    { code: 'SSU' },
    { name: 'SkillSetu University', code: 'SSU', city: 'Pune' },
    { upsert: true, new: true }
  );
  const department = await Department.findOneAndUpdate(
    { university: university._id, name: 'Computer Engineering' },
    { university: university._id, name: 'Computer Engineering', code: 'CE' },
    { upsert: true, new: true }
  );
  const company = await Company.findOneAndUpdate(
    { name: 'Nimbus Labs' },
    { name: 'Nimbus Labs', industry: 'Software', location: 'Bengaluru', about: 'Product engineering and data platforms' },
    { upsert: true, new: true }
  );

  const passwordHash = await hashPassword('Password123!');

  const studentUser = await User.create({
    email: 'student@skillsetu.dev',
    passwordHash,
    role: ROLES.STUDENT,
    firstName: 'Aisha',
    lastName: 'Khan',
    isEmailVerified: true,
  });
  const tpoUser = await User.create({
    email: 'tpo@skillsetu.dev',
    passwordHash,
    role: ROLES.TPO,
    firstName: 'Ravi',
    lastName: 'Mehta',
    isEmailVerified: true,
  });
  const recruiterUser = await User.create({
    email: 'recruiter@skillsetu.dev',
    passwordHash,
    role: ROLES.RECRUITER,
    firstName: 'Priya',
    lastName: 'Shah',
    isEmailVerified: true,
  });

  await Student.create({
    user: studentUser._id,
    university: university._id,
    department: department._id,
    batch: '2026',
    headline: 'Aspiring Data Engineer',
    bio: 'Building reliable data pipelines and placement-ready skills.',
    location: 'Pune',
    skills: [
      { name: 'SQL', level: 'advanced' },
      { name: 'Python', level: 'intermediate' },
      { name: 'React', level: 'intermediate' },
    ],
    education: [{ institution: 'SkillSetu University', degree: 'B.Tech', field: 'CE', startYear: 2022, endYear: 2026, grade: '8.7 CGPA' }],
    projects: [{ title: 'Campus Insights ETL', description: 'Ingests placement data into a warehouse', skills: ['SQL', 'Python'] }],
    targetRole: 'Data Engineer',
    atsScore: 78,
    skillScore: 82,
    profileCompletion: 80,
  });

  await Tpo.create({ user: tpoUser._id, university: university._id });
  await Recruiter.create({ user: recruiterUser._id, company: company._id, designation: 'University Hiring' });

  const recruiter = await Recruiter.findOne({ user: recruiterUser._id });
  await Job.findOneAndUpdate(
    { title: 'Junior Data Engineer', company: company._id },
    {
      recruiter: recruiter._id,
      company: company._id,
      title: 'Junior Data Engineer',
      description: 'Work on ETL, warehousing, and cloud data platforms.',
      requiredSkills: ['SQL', 'Python', 'AWS', 'Spark'],
      education: 'B.Tech',
      experience: '0-2 years',
      salaryMin: 800000,
      salaryMax: 1200000,
      location: 'Bengaluru',
      jobType: JOB_TYPE.FULL_TIME,
      positions: 5,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      eligibility: '2026 batch, 7.5+ CGPA',
      status: JOB_STATUS.PUBLISHED,
    },
    { upsert: true }
  );

  const skills = ['SQL', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Data Engineering'];
  for (const name of skills) {
    await Skill.findOneAndUpdate({ name }, { name, category: 'tech' }, { upsert: true });
  }

  await Course.deleteMany({});
  await Course.insertMany([
    { title: 'Advanced SQL for Analytics', description: 'Window functions and query plans', provider: 'SkillSetu Learn', skill: 'SQL', level: 'advanced', duration: '6h', url: 'https://www.postgresql.org/docs/' },
    { title: 'Python for Data Engineering', description: 'Pandas and ETL patterns', provider: 'SkillSetu Learn', skill: 'Python', level: 'intermediate', duration: '8h', url: 'https://docs.python.org/3/' },
    { title: 'AWS Data Fundamentals', description: 'S3, Glue, and warehouses', provider: 'SkillSetu Learn', skill: 'AWS', level: 'beginner', duration: '5h', url: 'https://aws.amazon.com/getting-started/' },
  ]);

  await Assessment.deleteMany({});
  await Assessment.create({
    skill: 'SQL',
    title: 'SQL Foundations',
    description: 'Joins, aggregation, and filtering',
    questions: [
      {
        prompt: 'Which JOIN returns only matching rows from both tables?',
        options: ['LEFT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN'],
        correctIndex: 1,
        topic: 'Joins',
        difficulty: 'easy',
      },
      {
        prompt: 'GROUP BY is typically used with?',
        options: ['Indexes only', 'Aggregate functions', 'Foreign keys', 'Triggers'],
        correctIndex: 1,
        topic: 'Aggregation',
        difficulty: 'easy',
      },
      {
        prompt: 'Window functions require which clause?',
        options: ['HAVING', 'OVER', 'USING', 'NATURAL'],
        correctIndex: 1,
        topic: 'Window Functions',
        difficulty: 'medium',
      },
      {
        prompt: 'SELECT * without a filter is often a problem because?',
        options: ['It is invalid SQL', 'It can over-fetch and hurt performance', 'It disables indexes forever', 'It locks the database'],
        correctIndex: 1,
        topic: 'Optimization',
        difficulty: 'medium',
      },
    ],
  });

  logger.info('Seed complete. Demo logins: student@ / tpo@ / recruiter@ skillsetu.dev  Password123!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
