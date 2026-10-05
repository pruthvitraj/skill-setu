const Tpo = require('../../models/Tpo');
const Student = require('../../models/Student');
const Company = require('../../models/Company');
const Department = require('../../models/Department');
const User = require('../../models/User');
const PlacementDrive = require('../../models/PlacementDrive');
const Interview = require('../../models/Interview');
const Application = require('../../models/Application');
const Announcement = require('../../models/Announcement');
const Job = require('../../models/Job');
const Recruiter = require('../../models/Recruiter');
const { AppError } = require('../../utils/AppError');
const { paginated } = require('../../utils/pagination');
const skillAnalytics = require('../skills/skillAnalytics.service');
const driveService = require('../placement/drive.service');
const { DRIVE_STATUS, JOB_STATUS } = require('../../utils/constants');
const { notify } = require('../notifications/notification.service');

async function getTpo(userId) {
  const tpo = await Tpo.findOne({ user: userId }).populate('university');
  if (!tpo || !tpo.university) throw new AppError('TPO institution is not linked. Contact your administrator.', 409, 'INSTITUTION_REQUIRED');
  return tpo;
}

async function dashboard(userId) {
  const tpo = await getTpo(userId);
  const uni = tpo.university._id;
  const total = await Student.countDocuments({ university: uni });
  const placed = await Student.countDocuments({ university: uni, placementStatus: 'placed' });
  const available = await Student.countDocuments({ university: uni, placementStatus: 'available' });
  const companies = await PlacementDrive.distinct('company', { university: uni });
  const studentIds = await Student.find({ university: uni }).distinct('_id');
  const drives = await PlacementDrive.countDocuments({ university: uni, scheduledDate: { $gte: new Date() }, status: { $in: ['approved', 'rescheduled', 'active'] } });
  const interviews = await Interview.countDocuments({ candidate: { $in: studentIds } });
  return {
    totalStudents: total,
    placed,
    available,
    interviews,
    upcomingDrives: drives,
    companies: companies.length,
    placementRate: total ? Math.round((placed / total) * 100) : 0,
  };
}

async function studentFilters(userId) {
  const tpo = await getTpo(userId);
  const university = tpo.university._id;
  const [departments, batches, skills] = await Promise.all([
    Department.find({ university }).select('_id name code').sort({ name: 1 }),
    Student.distinct('batch', { university, batch: { $nin: [null, ''] } }),
    Student.aggregate([
      { $match: { university } },
      { $unwind: '$skills' },
      { $match: { 'skills.name': { $nin: [null, ''] } } },
      { $group: { _id: '$skills.name' } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  return { departments, batches: batches.filter(Boolean).sort(), skills: skills.map((item) => item._id) };
}

async function students(userId, { q, department, batch, skill, status, interviewStatus, page, limit }) {
  const tpo = await getTpo(userId);
  const filter = { university: tpo.university._id };
  if (department) filter.department = department;
  if (batch) filter.batch = batch;
  if (skill) filter['skills.name'] = { $regex: require('../../utils/text').escapeRegex(skill), $options: 'i' };
  if (status) filter.placementStatus = status;
  if (q?.trim()) {
    const users = await User.find({ $or: [
      { firstName: { $regex: require('../../utils/text').escapeRegex(q.trim()), $options: 'i' } },
      { lastName: { $regex: require('../../utils/text').escapeRegex(q.trim()), $options: 'i' } },
      { email: { $regex: require('../../utils/text').escapeRegex(q.trim()), $options: 'i' } },
    ] }).select('_id');
    filter.$or = [{ enrollmentNo: { $regex: require('../../utils/text').escapeRegex(q.trim()), $options: 'i' } }, { user: { $in: users.map((item) => item._id) } }];
  }
  if (interviewStatus) {
    const candidates = await Interview.distinct('candidate', { status: interviewStatus });
    filter._id = { $in: candidates };
  }
  const [items, total] = await Promise.all([
    Student.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('department', 'name')
      .skip((page - 1) * limit)
      .limit(limit),
    Student.countDocuments(filter),
  ]);
  return paginated(items, total, page, limit);
}

async function studentDetails(userId, studentId) {
  const tpo = await getTpo(userId);
  const student = await Student.findOne({ _id: studentId, university: tpo.university._id })
    .populate('user', 'firstName lastName email phone')
    .populate('department', 'name');
  if (!student) throw new AppError('Student not found', 404, 'NOT_FOUND');
  const applications = await Application.find({ student: student._id }).populate({path:'job',select:'title company',populate:{path:'company',select:'name'}});
  return { student, applications };
}

async function internships(userId) {
  const tpo = await getTpo(userId);
  const students = await Student.find({ university: tpo.university._id }).select('_id');
  const studentIds = students.map((student) => student._id);
  const jobs = await Job.find({ status: 'published', jobType: 'internship' })
    .populate('company', 'name')
    .sort({ createdAt: -1 });
  const applications = await Application.find({ student: { $in: studentIds }, job: { $in: jobs.map((job) => job._id) } })
    .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName email' } });
  const applicationsByJob = applications.reduce((groups, application) => {
    const key = String(application.job);
    (groups[key] ||= []).push(application);
    return groups;
  }, {});

  return jobs.map((job) => ({
    ...job.toObject(),
    applicants: (applicationsByJob[String(job._id)] || []).map((application) => ({
      student: application.student,
      status: application.status,
      matchScore: application.matchScore,
      appliedAt: application.createdAt,
    })),
  }));
}

async function announcements(userId) {
  const tpo = await getTpo(userId);
  return Announcement.find({ university: tpo.university._id }).sort({ createdAt: -1 });
}

async function createAnnouncement(userId, payload) {
  const tpo = await getTpo(userId);
  const filter = { university: tpo.university._id };
  if(payload.audience==='department'){if(!payload.department || !await Department.exists({_id:payload.department,university:tpo.university._id}))throw new AppError('Select a department in your institution',422,'INVALID_AUDIENCE');filter.department=payload.department;}
  if(payload.audience==='batch'){if(!payload.batch)throw new AppError('Select a batch',422,'INVALID_AUDIENCE');filter.batch=payload.batch;}
  if(payload.audience==='selected'){if(!payload.studentIds?.length || await Student.countDocuments({...filter,_id:{$in:payload.studentIds}})!==new Set(payload.studentIds).size)throw new AppError('Select students in your institution',422,'INVALID_AUDIENCE');filter._id={$in:payload.studentIds};}
  const students = await Student.find(filter).select('user');
  const item = await Announcement.create({ ...payload, university: tpo.university._id, author: userId });
  await Promise.all(students.map(student => notify(student.user, { type: 'announcement', title: item.title, body: item.body, data: { announcementId: item._id } })));
  return item;
}

async function companies(userId) {
  const tpo = await getTpo(userId);
  const companies=await Company.find().sort({name:1});
  const counts=await Job.aggregate([{$match:{status:JOB_STATUS.PUBLISHED}},{$group:{_id:'$company',count:{$sum:1}}}]);
  const byCompany=new Map(counts.map(c=>[String(c._id),c.count]));
  return companies.map(c=>({...c.toObject(),activeJobs:byCompany.get(String(c._id))||0}));
}

async function placementDrives(userId) {
  return driveService.listForTpo(userId);
}

async function reviewPlacementDrive(userId, driveId, payload) {
  return driveService.review(userId, driveId, payload);
}

async function requestPlacementDrive(userId, payload) {
  const tpo = await getTpo(userId);
  const [company, job] = await Promise.all([
    Company.findById(payload.company),
    Job.findOne({ _id: payload.job, company: payload.company, status: JOB_STATUS.PUBLISHED }),
  ]);
  if (!company || !job) throw new AppError('Select a valid company and published job', 400, 'INVALID_DRIVE_REQUEST');
  const recruiter = await Recruiter.findOne({ _id: job.recruiter, company: company._id });
  if (!recruiter) throw new AppError('This company has no recruiter account', 400, 'RECRUITER_NOT_FOUND');
  if (payload.proposedDate && new Date(payload.proposedDate) <= new Date()) throw new AppError('Choose a future drive date', 422, 'INVALID_DATE');
  if (await PlacementDrive.exists({ university: tpo.university._id, job: job._id, status: { $in: ['requested', 'approved', 'rescheduled', 'active'] } })) throw new AppError('An active drive already exists for this job', 409, 'DRIVE_EXISTS');
  const drive = await PlacementDrive.create({
    company: company._id,
    recruiter: recruiter._id,
    university: tpo.university._id,
    job: job._id,
    title: payload.title || job.title,
    proposedDate: payload.proposedDate,
    eligibility: payload.eligibility,
    status: DRIVE_STATUS.REQUESTED,
  });
  await notify(recruiter.user, {
    type: 'drive_request',
    title: 'TPO requested a placement drive',
    body: `${tpo.university.name} requested a drive for ${job.title}.`,
    data: { driveId: drive._id },
  });
  return drive;
}

async function applications(userId, { status } = {}) {
  const tpo = await getTpo(userId);
  const students = await Student.find({ university: tpo.university._id }).select('_id');
  const filter = { student: { $in: students.map((student) => student._id) } };
  if (status && status !== 'all') filter.status = status;
  return Application.find(filter)
    .populate('resume', 'fileName fileKey parsed ats createdAt')
    .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName email' } })
    .populate({ path: 'job', populate: { path: 'company', select: 'name' } })
    .sort({ createdAt: -1 });
}

async function updateApplicationStatus(userId, applicationId, payload) {
  const tpo = await getTpo(userId);
  const students = await Student.find({ university: tpo.university._id }).select('_id');
  const application = await Application.findOne({ _id: applicationId, student: { $in: students.map((student) => student._id) } });
  if (!application) throw new AppError('Application not found', 404, 'NOT_FOUND');
  const applicationService = require('../applications/application.service');
  return applicationService.updateStatus({ id: userId, role: 'tpo' }, applicationId, payload.status, payload.note);
}

async function interviews(userId) {
  const tpo = await getTpo(userId);
  const students = await Student.find({ university: tpo.university._id }).select('_id');
  return Interview.find({ candidate: { $in: students.map((student) => student._id) } })
    .populate({ path: 'candidate', populate: { path: 'user', select: 'firstName lastName email' } })
    .populate({ path: 'job', select: 'title', populate: { path: 'company', select: 'name' } })
    .sort({ scheduledAt: 1 });
}

async function placementAnalytics(userId) {
 const tpo = await getTpo(userId);
 const students = await Student.find({ university: tpo.university._id }).populate('department','name');
 const ids = students.map(s => s._id);
 const [summary, applications, drives] = await Promise.all([dashboard(userId), Application.find({student:{$in:ids}}), placementDrives(userId)]);
 const statusBreakdown = applications.reduce((m,a) => ({...m,[a.status]:(m[a.status]||0)+1}),{});
 const departments = new Map();
 for(const s of students){const name=s.department?.name||'Unassigned';const d=departments.get(name)||{department:name,total:0,placed:0};d.total++;if(s.placementStatus==='placed')d.placed++;departments.set(name,d);}
 const monthlyTrend=Array.from({length:6},(_,i)=>{const date=new Date();date.setDate(1);date.setMonth(date.getMonth()-(5-i));const inMonth=applications.filter(a=>new Date(a.createdAt).getFullYear()===date.getFullYear()&&new Date(a.createdAt).getMonth()===date.getMonth());return {month:date.toLocaleString('en',{month:'short'})+' '+date.getFullYear(),applications:inMonth.length,shortlisted:inMonth.filter(a=>a.status==='shortlisted').length,placed:inMonth.filter(a=>a.status==='hired').length};});
 return {...summary,totalCompanies:summary.companies,totalDrives:drives.length,applications:applications.length,shortlisted:statusBreakdown.shortlisted||0,selected:statusBreakdown.selected||0,statusBreakdown,departmentComparison:[...departments.values()].map(d=>({...d,rate:d.total?Math.round(d.placed/d.total*100):0})),monthlyTrend,drives};
}

async function skills(userId) {
  const tpo = await getTpo(userId);
  return skillAnalytics.universitySkillAnalytics(tpo.university._id);
}

async function reports(userId, type) {
  const dash = await dashboard(userId);
  const tpo = await getTpo(userId);
  const studentIds = await Student.find({ university: tpo.university._id }).distinct('_id');
  const result = { type, generatedAt: new Date(), summary: dash };
  if (type === 'placement') { const students = await Student.find({ university: tpo.university._id }).populate('user', 'firstName lastName').populate('department','name'); result.students = students.map(s => ({ name: [s.user?.firstName,s.user?.lastName].filter(Boolean).join(' '), department:s.department?.name||'Unassigned', batch:s.batch, placementStatus:s.placementStatus, evidenceScore:s.skillScore, skills:s.skills.map(k=>k.name).join(', ') })); }
  else if (type === 'department') result.departments = await Student.aggregate([{ $match: { university: tpo.university._id } }, { $group: { _id: '$department', students: { $sum: 1 }, placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } } } }]);
  else if (type === 'company' || type === 'drive') { result.drives = (await placementDrives(userId)).map(d=>({company:d.company?.name||'Unavailable',job:d.job?.title||d.title,status:d.status,proposedDate:d.proposedDate,scheduledDate:d.scheduledDate,eligibility:d.eligibility})); }
  else if (type === 'internship') result.opportunities = (await internships(userId)).map(j=>({title:j.title,company:j.company?.name,location:j.location,status:j.status,deadline:j.deadline,institutionApplications:j.applicants.length}));
  else if (type === 'interview') result.interviews = (await interviews(userId)).map(i=>({student:[i.candidate?.user?.firstName,i.candidate?.user?.lastName].filter(Boolean).join(' '),company:i.job?.company?.name,job:i.job?.title,round:i.round,status:i.status,result:i.result,scheduledAt:i.scheduledAt}));
  else throw new AppError('Unsupported report type', 422, 'INVALID_REPORT');
  return result;
}

module.exports = {
  getTpo,
  dashboard,
  studentFilters,
  students,
  studentDetails,
  internships,
  announcements,
  createAnnouncement,
  companies,
  placementDrives,
  reviewPlacementDrive,
  requestPlacementDrive,
  applications,
  updateApplicationStatus,
  interviews,
  placementAnalytics,
  skills,
  reports,
};
