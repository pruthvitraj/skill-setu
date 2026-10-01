const Assessment = require('../models/Assessment');
const Course = require('../models/Course');
const Skill = require('../models/Skill');
const User = require('../models/User');
const Student = require('../models/Student');
const Tpo = require('../models/Tpo');
const Recruiter = require('../models/Recruiter');
const University = require('../models/University');
const Department = require('../models/Department');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');

const { hashPassword } = require('../utils/password');
const { connectDb } = require('../config/db');
const {
  JOB_STATUS,
  JOB_TYPE,
  ROLES,
  APPLICATION_STATUS,
  INTERVIEW_STATUS,
  INTERVIEW_ROUNDS,
} = require('../utils/constants');

const logger = require('../utils/logger');

async function seed() {
  await connectDb();

  console.log('Clearing existing SkillSetu demo data...');

  await Promise.all([
    Application.deleteMany({}),
    Interview.deleteMany({}),
    Notification.deleteMany({}),
    Job.deleteMany({}),
    User.deleteMany({ email: /@skillsetu\.dev$/ }),
    Student.deleteMany({}),
    Tpo.deleteMany({}),
    Recruiter.deleteMany({}),
  ]);

  const companyNames = [
    'Nimbus Labs',
    'TechNova Solutions',
    'CloudSphere Technologies',
    'FinEdge Systems',
    'DataBridge Analytics',
    'NexGen Digital',
  ];

  await Company.deleteMany({
    name: { $in: companyNames },
  });

  /*
   * ---------------------------------------------------------
   * UNIVERSITY + DEPARTMENTS
   * ---------------------------------------------------------
   */

  const university = await University.findOneAndUpdate(
    { code: 'SSU' },
    {
      name: 'SkillSetu University',
      code: 'SSU',
      city: 'Pune',
    },
    {
      upsert: true,
      new: true,
    }
  );

  const departments = {};

  for (const departmentData of [
    {
      name: 'Computer Engineering',
      code: 'CE',
    },
    {
      name: 'Information Technology',
      code: 'IT',
    },
    {
      name: 'Electronics & Communication',
      code: 'ECE',
    },
  ]) {
    departments[departmentData.code] = await Department.findOneAndUpdate(
      {
        university: university._id,
        name: departmentData.name,
      },
      {
        university: university._id,
        name: departmentData.name,
        code: departmentData.code,
      },
      {
        upsert: true,
        new: true,
      }
    );
  }

  const passwordHash = await hashPassword('Password123!');

  /*
   * ---------------------------------------------------------
   * COMPANIES
   * ---------------------------------------------------------
   */

  const companyData = [
    {
      name: 'Nimbus Labs',
      industry: 'Software',
      location: 'Bengaluru',
      website: 'https://nimbus.example.com',
      about: 'Product engineering, data platforms and cloud solutions.',
    },
    {
      name: 'TechNova Solutions',
      industry: 'Information Technology',
      location: 'Pune',
      website: 'https://technova.example.com',
      about: 'Digital engineering and enterprise software solutions.',
    },
    {
      name: 'CloudSphere Technologies',
      industry: 'Cloud Computing',
      location: 'Hyderabad',
      website: 'https://cloudsphere.example.com',
      about: 'Cloud infrastructure, DevOps and platform engineering.',
    },
    {
      name: 'FinEdge Systems',
      industry: 'FinTech',
      location: 'Mumbai',
      website: 'https://finedge.example.com',
      about: 'Financial technology platforms and enterprise applications.',
    },
    {
      name: 'DataBridge Analytics',
      industry: 'Data & Analytics',
      location: 'Bengaluru',
      website: 'https://databridge.example.com',
      about: 'Analytics, business intelligence and machine learning.',
    },
    {
      name: 'NexGen Digital',
      industry: 'Software',
      location: 'Delhi NCR',
      website: 'https://nexgen.example.com',
      about: 'Full-stack digital products and customer experience platforms.',
    },
  ];

  const companies = {};

  for (const data of companyData) {
    companies[data.name] = await Company.create(data);
  }

  /*
   * ---------------------------------------------------------
   * RECRUITERS
   * ---------------------------------------------------------
   */

  const recruiterData = [
    {
      email: 'recruiter@skillsetu.dev',
      firstName: 'Priya',
      lastName: 'Shah',
      designation: 'University Hiring',
      company: 'Nimbus Labs',
    },
    {
      email: 'rahul@skillsetu.dev',
      firstName: 'Rahul',
      lastName: 'Mehta',
      designation: 'Talent Acquisition',
      company: 'TechNova Solutions',
    },
    {
      email: 'neha@skillsetu.dev',
      firstName: 'Neha',
      lastName: 'Kapoor',
      designation: 'Campus Recruiter',
      company: 'CloudSphere Technologies',
    },
    {
      email: 'arjun@skillsetu.dev',
      firstName: 'Arjun',
      lastName: 'Malhotra',
      designation: 'Technical Recruiter',
      company: 'FinEdge Systems',
    },
    {
      email: 'simran@skillsetu.dev',
      firstName: 'Simran',
      lastName: 'Joshi',
      designation: 'Talent Partner',
      company: 'DataBridge Analytics',
    },
    {
      email: 'karan@skillsetu.dev',
      firstName: 'Karan',
      lastName: 'Verma',
      designation: 'University Hiring Manager',
      company: 'NexGen Digital',
    },
  ];

  const recruiters = {};

  for (const data of recruiterData) {
    const user = await User.create({
      email: data.email,
      passwordHash,
      role: ROLES.RECRUITER,
      firstName: data.firstName,
      lastName: data.lastName,
      isEmailVerified: true,
    });

    recruiters[data.company] = await Recruiter.create({
      user: user._id,
      company: companies[data.company]._id,
      designation: data.designation,
    });
  }

  /*
   * ---------------------------------------------------------
   * TPO
   * ---------------------------------------------------------
   */

  const tpoUser = await User.create({
    email: 'tpo@skillsetu.dev',
    passwordHash,
    role: ROLES.TPO,
    firstName: 'Ravi',
    lastName: 'Mehta',
    isEmailVerified: true,
  });

  await Tpo.create({
    user: tpoUser._id,
    university: university._id,
  });

  /*
   * ---------------------------------------------------------
   * STUDENTS
   * ---------------------------------------------------------
   */

  const studentData = [
    {
      email: 'student@skillsetu.dev',
      firstName: 'Aisha',
      lastName: 'Khan',
      department: 'CE',
      headline: 'Aspiring Data Engineer',
      targetRole: 'Data Engineer',
      location: 'Pune',
      skills: [
        ['SQL', 'advanced'],
        ['Python', 'intermediate'],
        ['React', 'intermediate'],
      ],
      atsScore: 78,
      skillScore: 82,
      profileCompletion: 80,
      placementStatus: 'available',
    },
    {
      email: 'aarav@skillsetu.dev',
      firstName: 'Aarav',
      lastName: 'Sharma',
      department: 'CE',
      headline: 'Full Stack Developer',
      targetRole: 'Full Stack Developer',
      location: 'Pune',
      skills: [
        ['React', 'advanced'],
        ['Node.js', 'advanced'],
        ['MongoDB', 'intermediate'],
        ['JavaScript', 'advanced'],
      ],
      atsScore: 91,
      skillScore: 94,
      profileCompletion: 96,
      placementStatus: 'in_process',
    },
    {
      email: 'ananya@skillsetu.dev',
      firstName: 'Ananya',
      lastName: 'Patil',
      department: 'IT',
      headline: 'Software Engineer',
      targetRole: 'Software Engineer',
      location: 'Mumbai',
      skills: [
        ['Java', 'advanced'],
        ['SQL', 'advanced'],
        ['Spring Boot', 'intermediate'],
      ],
      atsScore: 86,
      skillScore: 88,
      profileCompletion: 90,
      placementStatus: 'available',
    },
    {
      email: 'rohan@skillsetu.dev',
      firstName: 'Rohan',
      lastName: 'Kulkarni',
      department: 'CE',
      headline: 'Frontend Developer',
      targetRole: 'Frontend Developer',
      location: 'Pune',
      skills: [
        ['React', 'advanced'],
        ['JavaScript', 'advanced'],
        ['Tailwind CSS', 'advanced'],
      ],
      atsScore: 89,
      skillScore: 91,
      profileCompletion: 94,
      placementStatus: 'in_process',
    },
    {
      email: 'sneha@skillsetu.dev',
      firstName: 'Sneha',
      lastName: 'Joshi',
      department: 'IT',
      headline: 'Data Analyst',
      targetRole: 'Data Analyst',
      location: 'Nashik',
      skills: [
        ['Python', 'advanced'],
        ['SQL', 'advanced'],
        ['Power BI', 'intermediate'],
      ],
      atsScore: 84,
      skillScore: 87,
      profileCompletion: 88,
      placementStatus: 'available',
    },
    {
      email: 'vedant@skillsetu.dev',
      firstName: 'Vedant',
      lastName: 'Deshmukh',
      department: 'CE',
      headline: 'Cloud Engineer',
      targetRole: 'Cloud Engineer',
      location: 'Nagpur',
      skills: [
        ['AWS', 'advanced'],
        ['Docker', 'intermediate'],
        ['Linux', 'advanced'],
      ],
      atsScore: 88,
      skillScore: 90,
      profileCompletion: 92,
      placementStatus: 'in_process',
    },
    {
      email: 'isha@skillsetu.dev',
      firstName: 'Isha',
      lastName: 'Mehta',
      department: 'ECE',
      headline: 'Backend Developer',
      targetRole: 'Backend Developer',
      location: 'Pune',
      skills: [
        ['Node.js', 'advanced'],
        ['Python', 'intermediate'],
        ['MongoDB', 'advanced'],
      ],
      atsScore: 83,
      skillScore: 85,
      profileCompletion: 87,
      placementStatus: 'available',
    },
    {
      email: 'aditya@skillsetu.dev',
      firstName: 'Aditya',
      lastName: 'Nair',
      department: 'IT',
      headline: 'DevOps Engineer',
      targetRole: 'DevOps Engineer',
      location: 'Bengaluru',
      skills: [
        ['AWS', 'advanced'],
        ['Docker', 'advanced'],
        ['Kubernetes', 'intermediate'],
      ],
      atsScore: 92,
      skillScore: 93,
      profileCompletion: 95,
      placementStatus: 'placed',
    },
    {
      email: 'priya.student@skillsetu.dev',
      firstName: 'Priya',
      lastName: 'Shinde',
      department: 'CE',
      headline: 'Machine Learning Engineer',
      targetRole: 'ML Engineer',
      location: 'Pune',
      skills: [
        ['Python', 'advanced'],
        ['Machine Learning', 'advanced'],
        ['SQL', 'intermediate'],
      ],
      atsScore: 90,
      skillScore: 92,
      profileCompletion: 91,
      placementStatus: 'in_process',
    },
    {
      email: 'omkar@skillsetu.dev',
      firstName: 'Omkar',
      lastName: 'Jadhav',
      department: 'CE',
      headline: 'Backend Developer',
      targetRole: 'Backend Developer',
      location: 'Mumbai',
      skills: [
        ['Node.js', 'advanced'],
        ['Express', 'advanced'],
        ['PostgreSQL', 'intermediate'],
      ],
      atsScore: 81,
      skillScore: 84,
      profileCompletion: 85,
      placementStatus: 'available',
    },
    {
      email: 'meera@skillsetu.dev',
      firstName: 'Meera',
      lastName: 'Desai',
      department: 'IT',
      headline: 'Cloud & DevOps Enthusiast',
      targetRole: 'DevOps Engineer',
      location: 'Pune',
      skills: [
        ['AWS', 'intermediate'],
        ['Docker', 'advanced'],
        ['Linux', 'advanced'],
      ],
      atsScore: 87,
      skillScore: 89,
      profileCompletion: 90,
      placementStatus: 'available',
    },
    {
      email: 'kabir@skillsetu.dev',
      firstName: 'Kabir',
      lastName: 'Singh',
      department: 'ECE',
      headline: 'Software Developer',
      targetRole: 'Software Engineer',
      location: 'Delhi',
      skills: [
        ['Java', 'advanced'],
        ['React', 'intermediate'],
        ['SQL', 'advanced'],
      ],
      atsScore: 79,
      skillScore: 81,
      profileCompletion: 83,
      placementStatus: 'available',
    },
  ];

  const students = {};

  for (const data of studentData) {
    const user = await User.create({
      email: data.email,
      passwordHash,
      role: ROLES.STUDENT,
      firstName: data.firstName,
      lastName: data.lastName,
      isEmailVerified: true,
    });

    students[data.firstName] = await Student.create({
      user: user._id,
      university: university._id,
      department: departments[data.department]._id,
      batch: '2026',
      headline: data.headline,
      bio: `${data.firstName} is a 2026 graduate building industry-ready skills and projects.`,
      location: data.location,
      skills: data.skills.map(([name, level]) => ({
        name,
        level,
      })),
      education: [
        {
          institution: 'SkillSetu University',
          degree: 'B.Tech',
          field: data.department,
          startYear: 2022,
          endYear: 2026,
          grade: `${7.5 + Math.round(Math.random() * 15) / 10} CGPA`,
        },
      ],
      projects: [
        {
          title: `${data.targetRole} Portfolio Project`,
          description: `A practical project demonstrating ${data.targetRole} skills.`,
          skills: data.skills.map(([name]) => name),
        },
      ],
      targetRole: data.targetRole,
      atsScore: data.atsScore,
      skillScore: data.skillScore,
      profileCompletion: data.profileCompletion,
      placementStatus: data.placementStatus,
    });
  }

  /*
   * ---------------------------------------------------------
   * JOBS
   * ---------------------------------------------------------
   */

  const jobData = [
    {
      company: 'Nimbus Labs',
      title: 'Junior Data Engineer',
      description: 'Work on ETL, warehousing and cloud data platforms.',
      skills: ['SQL', 'Python', 'AWS', 'Spark'],
      location: 'Bengaluru',
      salaryMin: 800000,
      salaryMax: 1200000,
      positions: 5,
    },
    {
      company: 'Nimbus Labs',
      title: 'Backend Developer',
      description: 'Build scalable APIs and backend services.',
      skills: ['Node.js', 'MongoDB', 'JavaScript'],
      location: 'Bengaluru',
      salaryMin: 700000,
      salaryMax: 1100000,
      positions: 4,
    },
    {
      company: 'TechNova Solutions',
      title: 'Full Stack Developer',
      description: 'Develop modern full-stack web applications.',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      location: 'Pune',
      salaryMin: 800000,
      salaryMax: 1400000,
      positions: 6,
    },
    {
      company: 'TechNova Solutions',
      title: 'Frontend Engineer',
      description: 'Build responsive and accessible frontend experiences.',
      skills: ['React', 'JavaScript', 'Tailwind CSS'],
      location: 'Pune',
      salaryMin: 650000,
      salaryMax: 1000000,
      positions: 3,
    },
    {
      company: 'CloudSphere Technologies',
      title: 'Cloud Engineer',
      description: 'Design and maintain cloud infrastructure.',
      skills: ['AWS', 'Docker', 'Linux'],
      location: 'Hyderabad',
      salaryMin: 900000,
      salaryMax: 1500000,
      positions: 4,
    },
    {
      company: 'CloudSphere Technologies',
      title: 'DevOps Engineer',
      description: 'Automate CI/CD and cloud deployment workflows.',
      skills: ['AWS', 'Docker', 'Kubernetes'],
      location: 'Hyderabad',
      salaryMin: 950000,
      salaryMax: 1600000,
      positions: 3,
    },
    {
      company: 'FinEdge Systems',
      title: 'Software Engineer',
      description: 'Build financial technology applications.',
      skills: ['Java', 'SQL', 'Spring Boot'],
      location: 'Mumbai',
      salaryMin: 750000,
      salaryMax: 1300000,
      positions: 5,
    },
    {
      company: 'FinEdge Systems',
      title: 'Backend Engineer',
      description: 'Develop reliable backend systems for financial products.',
      skills: ['Java', 'SQL', 'REST APIs'],
      location: 'Mumbai',
      salaryMin: 800000,
      salaryMax: 1350000,
      positions: 3,
    },
    {
      company: 'DataBridge Analytics',
      title: 'Data Analyst',
      description: 'Analyze business data and create actionable insights.',
      skills: ['SQL', 'Python', 'Power BI'],
      location: 'Bengaluru',
      salaryMin: 600000,
      salaryMax: 1000000,
      positions: 5,
    },
    {
      company: 'DataBridge Analytics',
      title: 'Machine Learning Engineer',
      description: 'Develop and deploy machine learning solutions.',
      skills: ['Python', 'Machine Learning', 'SQL'],
      location: 'Bengaluru',
      salaryMin: 900000,
      salaryMax: 1600000,
      positions: 2,
    },
    {
      company: 'NexGen Digital',
      title: 'React Developer',
      description: 'Build modern digital products using React.',
      skills: ['React', 'JavaScript', 'Tailwind CSS'],
      location: 'Delhi NCR',
      salaryMin: 650000,
      salaryMax: 1100000,
      positions: 4,
    },
    {
      company: 'NexGen Digital',
      title: 'Software Developer',
      description: 'Work across frontend and backend product systems.',
      skills: ['Java', 'React', 'SQL'],
      location: 'Delhi NCR',
      salaryMin: 700000,
      salaryMax: 1200000,
      positions: 4,
    },
  ];

  const jobs = [];

  for (const data of jobData) {
    const job = await Job.create({
      recruiter: recruiters[data.company]._id,
      company: companies[data.company]._id,
      title: data.title,
      description: data.description,
      requiredSkills: data.skills,
      education: 'B.Tech',
      experience: '0-2 years',
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      location: data.location,
      jobType: JOB_TYPE.FULL_TIME,
      positions: data.positions,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      eligibility: '2026 batch, 7.5+ CGPA',
      selectionProcess: 'Application → Shortlist → Assessment → Interview → Selection',
      status: JOB_STATUS.PUBLISHED,
    });

    jobs.push(job);
  }

  /*
   * ---------------------------------------------------------
   * APPLICATIONS
   * ---------------------------------------------------------
   */

  const applicationData = [
    ['Aisha', 'Junior Data Engineer', APPLICATION_STATUS.SHORTLISTED, 86],
    ['Aarav', 'Junior Data Engineer', APPLICATION_STATUS.INTERVIEW_SCHEDULED, 92],
    ['Sneha', 'Junior Data Engineer', APPLICATION_STATUS.APPLIED, 84],

    ['Aarav', 'Full Stack Developer', APPLICATION_STATUS.SELECTED, 94],
    ['Rohan', 'Full Stack Developer', APPLICATION_STATUS.INTERVIEW_COMPLETED, 91],
    ['Isha', 'Frontend Engineer', APPLICATION_STATUS.APPLIED, 79],

    ['Vedant', 'Cloud Engineer', APPLICATION_STATUS.SHORTLISTED, 93],
    ['Aditya', 'DevOps Engineer', APPLICATION_STATUS.HIRED, 96],
    ['Meera', 'DevOps Engineer', APPLICATION_STATUS.ASSESSMENT, 88],

    ['Ananya', 'Software Engineer', APPLICATION_STATUS.INTERVIEW_SCHEDULED, 89],
    ['Kabir', 'Software Engineer', APPLICATION_STATUS.APPLIED, 81],
    ['Omkar', 'Backend Engineer', APPLICATION_STATUS.REJECTED, 72],

    ['Sneha', 'Data Analyst', APPLICATION_STATUS.SELECTED, 91],
    ['Priya', 'Machine Learning Engineer', APPLICATION_STATUS.INTERVIEW_COMPLETED, 94],
    ['Aisha', 'Machine Learning Engineer', APPLICATION_STATUS.APPLIED, 80],

    ['Rohan', 'React Developer', APPLICATION_STATUS.SHORTLISTED, 93],
    ['Kabir', 'Software Developer', APPLICATION_STATUS.UNDER_REVIEW, 82],
    ['Isha', 'Software Developer', APPLICATION_STATUS.APPLIED, 78],
  ];

  const applications = [];

  for (const [studentKey, jobTitle, status, matchScore] of applicationData) {
    const job = jobs.find((item) => item.title === jobTitle);

    if (!job) continue;

    const application = await Application.create({
      student: students[studentKey]._id,
      job: job._id,
      status,
      matchScore,
      coverNote: `I am interested in the ${jobTitle} opportunity and believe my skills align well with the role.`,
    });

    applications.push(application);
  }

  /*
   * ---------------------------------------------------------
   * INTERVIEWS
   * ---------------------------------------------------------
   */

  const interviewData = [
    {
      student: 'Aarav',
      job: 'Junior Data Engineer',
      round: INTERVIEW_ROUNDS.TECHNICAL,
      status: INTERVIEW_STATUS.SCHEDULED,
      result: 'pending',
      days: 2,
    },
    {
      student: 'Vedant',
      job: 'Cloud Engineer',
      round: INTERVIEW_ROUNDS.TECHNICAL,
      status: INTERVIEW_STATUS.SCHEDULED,
      result: 'pending',
      days: 3,
    },
    {
      student: 'Ananya',
      job: 'Software Engineer',
      round: INTERVIEW_ROUNDS.HR,
      status: INTERVIEW_STATUS.SCHEDULED,
      result: 'pending',
      days: 4,
    },
    {
      student: 'Rohan',
      job: 'Full Stack Developer',
      round: INTERVIEW_ROUNDS.TECHNICAL,
      status: INTERVIEW_STATUS.COMPLETED,
      result: 'pass',
      days: -2,
    },
    {
      student: 'Priya',
      job: 'Machine Learning Engineer',
      round: INTERVIEW_ROUNDS.TECHNICAL,
      status: INTERVIEW_STATUS.COMPLETED,
      result: 'pass',
      days: -4,
    },
    {
      student: 'Aditya',
      job: 'DevOps Engineer',
      round: INTERVIEW_ROUNDS.FINAL,
      status: INTERVIEW_STATUS.COMPLETED,
      result: 'pass',
      days: -7,
    },
  ];

  for (const data of interviewData) {
    const job = jobs.find((item) => item.title === data.job);

    if (!job) continue;

    const application = applications.find(
      (item) =>
        String(item.job) === String(job._id) &&
        String(item.student) === String(students[data.student]._id)
    );

    await Interview.create({
      candidate: students[data.student]._id,
      job: job._id,
      application: application?._id,
      recruiter: recruiters[job.company.toString()]?._id,
      round: data.round,
      scheduledAt: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * data.days
      ),
      mode: 'online',
      meetingLink: 'https://meet.example.com/skillsetu-demo',
      interviewers: ['Hiring Panel'],
      status: data.status,
      result: data.result,
      feedback:
        data.result === 'pass'
          ? 'Candidate demonstrated strong technical understanding.'
          : '',
    });
  }

  /*
   * ---------------------------------------------------------
   * NOTIFICATIONS
   * ---------------------------------------------------------
   */

  const recruiterUsers = await User.find({
    email: { $in: recruiterData.map((item) => item.email) },
  });

  for (const recruiterUser of recruiterUsers) {
    await Notification.create({
      user: recruiterUser._id,
      type: 'application',
      title: 'New candidate activity',
      body: 'New applications and candidate updates are available in your recruitment pipeline.',
      read: false,
    });

    await Notification.create({
      user: recruiterUser._id,
      type: 'interview',
      title: 'Interview updates',
      body: 'Your upcoming and completed interviews have been updated.',
      read: false,
    });
  }

  /*
   * ---------------------------------------------------------
   * SKILLS
   * ---------------------------------------------------------
   */

  const skills = [
    'SQL',
    'Python',
    'Java',
    'JavaScript',
    'React',
    'Node.js',
    'MongoDB',
    'AWS',
    'Docker',
    'Kubernetes',
    'Linux',
    'Spring Boot',
    'Power BI',
    'Machine Learning',
    'Tailwind CSS',
    'Spark',
  ];

  for (const name of skills) {
    await Skill.findOneAndUpdate(
      { name },
      {
        name,
        category: 'tech',
      },
      {
        upsert: true,
      }
    );
  }

  /*
   * ---------------------------------------------------------
   * COURSES
   * ---------------------------------------------------------
   */

  await Course.deleteMany({});

  await Course.insertMany([
    {
      title: 'Advanced SQL for Analytics',
      description: 'Window functions, joins and query optimization.',
      provider: 'SkillSetu Learn',
      skill: 'SQL',
      level: 'advanced',
      duration: '6h',
      url: 'https://www.postgresql.org/docs/',
    },
    {
      title: 'Python for Data Engineering',
      description: 'Python, Pandas and ETL patterns.',
      provider: 'SkillSetu Learn',
      skill: 'Python',
      level: 'intermediate',
      duration: '8h',
      url: 'https://docs.python.org/3/',
    },
    {
      title: 'React Development',
      description: 'Modern React application development.',
      provider: 'SkillSetu Learn',
      skill: 'React',
      level: 'intermediate',
      duration: '7h',
      url: 'https://react.dev/',
    },
    {
      title: 'AWS Cloud Fundamentals',
      description: 'AWS compute, storage and networking fundamentals.',
      provider: 'SkillSetu Learn',
      skill: 'AWS',
      level: 'beginner',
      duration: '5h',
      url: 'https://aws.amazon.com/getting-started/',
    },
    {
      title: 'Docker & Containers',
      description: 'Containerization and deployment fundamentals.',
      provider: 'SkillSetu Learn',
      skill: 'Docker',
      level: 'intermediate',
      duration: '4h',
      url: 'https://docs.docker.com/',
    },
  ]);

  /*
   * ---------------------------------------------------------
   * ASSESSMENT
   * ---------------------------------------------------------
   */

  await Assessment.deleteMany({});

  await Assessment.create({
    skill: 'SQL',
    title: 'SQL Foundations',
    description: 'Joins, aggregation and filtering.',
    questions: [
      {
        prompt: 'Which JOIN returns only matching rows from both tables?',
        options: [
          'LEFT JOIN',
          'INNER JOIN',
          'FULL JOIN',
          'CROSS JOIN',
        ],
        correctIndex: 1,
        topic: 'Joins',
        difficulty: 'easy',
      },
      {
        prompt: 'GROUP BY is typically used with?',
        options: [
          'Indexes only',
          'Aggregate functions',
          'Foreign keys',
          'Triggers',
        ],
        correctIndex: 1,
        topic: 'Aggregation',
        difficulty: 'easy',
      },
      {
        prompt: 'Which clause is used with SQL window functions?',
        options: [
          'HAVING',
          'OVER',
          'USING',
          'NATURAL',
        ],
        correctIndex: 1,
        topic: 'Window Functions',
        difficulty: 'medium',
      },
      {
        prompt: 'SELECT * without a filter can be problematic because?',
        options: [
          'It is invalid SQL',
          'It can over-fetch data and hurt performance',
          'It disables indexes',
          'It locks the database',
        ],
        correctIndex: 1,
        topic: 'Optimization',
        difficulty: 'medium',
      },
    ],
  });

  /*
   * ---------------------------------------------------------
   * COMPLETE
   * ---------------------------------------------------------
   */

  logger.info(`
==================================================
SkillSetu demo seed completed successfully.
==================================================

STUDENT
Email:    student@skillsetu.dev
Password: Password123!

TPO
Email:    tpo@skillsetu.dev
Password: Password123!

COMPANY / RECRUITER
Email:    recruiter@skillsetu.dev
Password: Password123!
Company:  Nimbus Labs

Other recruiter accounts:
rahul@skillsetu.dev
neha@skillsetu.dev
arjun@skillsetu.dev
simran@skillsetu.dev
karan@skillsetu.dev

All recruiter passwords:
Password123!

Dataset:
- 6 companies
- 6 recruiters
- 12 students
- 12 jobs
- 18 applications
- 6 interviews
- recruiter notifications
- shared skills
- courses
- SQL assessment
==================================================
`);

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});