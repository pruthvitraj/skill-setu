const gemini = require('../../integrations/ai/gemini');
const openai = require('../../integrations/ai/openai');
const prompt = require('../../integrations/ai/prompts/roadmap.prompt');

const ROLE_PHASES_MATRIX = [
  {
    keywords: ['data engineer', 'data analyst', 'data science', 'etl', 'pipeline', 'warehouse', 'spark'],
    phases: [
      { title: 'Advanced SQL & Data Modeling', type: 'assessment', description: 'Joins, window functions, schema design, and query optimization' },
      { title: 'Python for Data Engineering', type: 'course', description: 'Pandas, NumPy, script automation, and API data extraction' },
      { title: 'ETL Pipelines & Data Warehousing', type: 'practice', description: 'Building Airflow DAGs, Snowflake/BigQuery schemas, and star schema' },
      { title: 'Cloud & Distributed Computing', type: 'project', description: 'PySpark, AWS S3/EMR, and real-time streaming with Kafka' },
      { title: 'Data System Design & Interview Prep', type: 'interview', description: 'Scalable data architecture design and coding challenges' },
    ],
  },
  {
    keywords: ['frontend', 'react', 'ui', 'ux', 'web', 'javascript'],
    phases: [
      { title: 'Modern JavaScript & TypeScript', type: 'course', description: 'ES6+, Async/Await, DOM manipulation, and TypeScript typing' },
      { title: 'React Ecosystem & State Management', type: 'practice', description: 'Component patterns, Redux Toolkit, Context API, and Hooks' },
      { title: 'UI Frameworks & Performance', type: 'assessment', description: 'Tailwind CSS, Next.js, SSR, and Web Vitals optimization' },
      { title: 'Full Frontend Capstone Project', type: 'project', description: 'Build and deploy a responsive interactive SaaS web app' },
      { title: 'Frontend System Design & Technical Interviews', type: 'interview', description: 'DOM architecture, bundle size optimization, and mock interviews' },
    ],
  },
  {
    keywords: ['backend', 'node', 'express', 'api', 'server', 'java developer', 'python developer', 'golang'],
    phases: [
      { title: 'Core Backend Languages & RDBMS', type: 'course', description: 'Node.js/Python/Java, RESTful API principles, and SQL databases' },
      { title: 'Authentication, Security & ORMs', type: 'practice', description: 'JWT, OAuth2, Prisma/Mongoose, and data validation' },
      { title: 'NoSQL, Caching & Message Queues', type: 'assessment', description: 'MongoDB, Redis caching strategies, and RabbitMQ/Kafka' },
      { title: 'Microservices & Production Deployment', type: 'project', description: 'Docker containerization, CI/CD pipelines, and cloud hosting' },
      { title: 'Backend System Design & Algorithm Prep', type: 'interview', description: 'High availability, database sharding, and DSA problem solving' },
    ],
  },
  {
    keywords: ['cloud', 'devops', 'aws', 'docker', 'kubernetes', 'sre', 'sysadmin'],
    phases: [
      { title: 'Linux Administration & Shell Scripting', type: 'course', description: 'Bash scripting, network fundamentals, and system security' },
      { title: 'Docker Containerization & CI/CD', type: 'practice', description: 'Dockerfile optimization, GitHub Actions, and automated testing' },
      { title: 'Cloud Infrastructure (AWS/Azure/GCP)', type: 'assessment', description: 'EC2, S3, VPC networking, IAM security, and Serverless' },
      { title: 'Infrastructure as Code & Kubernetes', type: 'project', description: 'Terraform scripts, EKS deployment, and Helm chart management' },
      { title: 'DevOps Architecture & Incident Response', type: 'interview', description: 'Prometheus/Grafana monitoring, disaster recovery, and mock interviews' },
    ],
  },
  {
    keywords: ['ai', 'machine learning', 'ml', 'data science', 'python', 'llm', 'deep learning'],
    phases: [
      { title: 'Mathematics & Python for Data Science', type: 'course', description: 'Linear algebra, probability, NumPy, Pandas, and Matplotlib' },
      { title: 'Machine Learning Algorithms', type: 'practice', description: 'Supervised/Unsupervised models with Scikit-Learn and XGBoost' },
      { title: 'Deep Learning & Neural Networks', type: 'assessment', description: 'PyTorch/TensorFlow, CNNs, Transformers, and NLP models' },
      { title: 'GenAI & LLM Application Development', type: 'project', description: 'RAG pipelines, LangChain, vector databases, and fine-tuning' },
      { title: 'MLOps & AI System Design', type: 'interview', description: 'Model deployment with FastAPI/Triton, latency optimization, and coding' },
    ],
  },
];

function findMatchingPhases(targetRole = '') {
  const lower = targetRole.toLowerCase();
  const match = ROLE_PHASES_MATRIX.find((entry) =>
    entry.keywords.some((kw) => lower.includes(kw))
  );
  if (match) return match.phases;

  // Generic dynamic fallback for any custom target domain
  return [
    { title: `Core Foundations for ${targetRole}`, type: 'course', description: `Master essential concepts, syntax, and foundational tools for ${targetRole}.` },
    { title: `Intermediate Frameworks & Skill Building`, type: 'practice', description: `Hands-on exercise building core modules and working with domain libraries.` },
    { title: `Skill Verification & Assessments`, type: 'assessment', description: `Take targeted skill quizzes and code challenges to validate proficiency.` },
    { title: `End-to-End Capstone Project`, type: 'project', description: `Build and publish a real-world portfolio project demonstrating your ${targetRole} expertise.` },
    { title: `Interview Prep & Domain Mastery`, type: 'interview', description: `Prepare for technical interviews, domain questions, and resume presentation.` },
  ];
}

function fallbackRoadmap(student, targetRole) {
  const phases = findMatchingPhases(targetRole);
  const have = new Set((student.skills || []).map((s) => s.name?.toLowerCase()));
  const gapAnalysis = phases
    .filter((p) => ![...have].some((h) => p.title.toLowerCase().includes(h)))
    .map((p) => `Gap: ${p.title}`);

  return {
    summary: `Personalized step-by-step path toward mastering "${targetRole}" based on your current skills and target requirements.`,
    gapAnalysis: gapAnalysis.length ? gapAnalysis : [`Gap: Core ${targetRole} concepts`, `Gap: Production project experience`],
    items: phases.map((p, i) => ({ ...p, phase: i + 1, completed: false })),
  };
}

async function generate({ student, targetRole }) {
  const base = fallbackRoadmap(student, targetRole);

  const payload = {
    targetRole,
    skills: student.skills || [],
    skillScore: student.skillScore || 0,
    atsScore: student.atsScore || 0,
    education: student.education || [],
  };

  const userMsg = prompt.user(payload);

  // 1. Try Gemini first (fast, free & responsive)
  let ai = await gemini.completeJson(prompt.system, userMsg);
  
  // 2. Try OpenAI as fallback
  if (!ai) {
    ai = await openai.completeJson(prompt.system, userMsg);
  }

  if (!ai?.items?.length) return base;

  return {
    summary: ai.summary || base.summary,
    gapAnalysis: (ai.gapAnalysis && ai.gapAnalysis.length > 0) ? ai.gapAnalysis : base.gapAnalysis,
    items: ai.items.map((item, i) => ({
      title: item.title,
      description: item.description,
      phase: item.phase || i + 1,
      type: item.type || 'practice',
      completed: false,
    })),
  };
}

module.exports = { generate, fallbackRoadmap };
