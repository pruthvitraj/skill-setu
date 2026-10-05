const User = require('../../models/User');
const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const { AppError } = require('../../utils/AppError');
const { ROLES } = require('../../utils/constants');
const Connection = require('../../models/Connection');
const Student = require('../../models/Student');
const Recruiter = require('../../models/Recruiter');

const allowed = {
  [ROLES.STUDENT]: [ROLES.TPO, ROLES.RECRUITER],
  [ROLES.TPO]: [ROLES.STUDENT, ROLES.RECRUITER],
  [ROLES.RECRUITER]: [ROLES.STUDENT, ROLES.TPO],
};

async function assertCanMessage(fromId, toId) {
  const [from, to] = await Promise.all([User.findById(fromId), User.findById(toId)]);
  if (!from || !to) throw new AppError('User not found', 404, 'NOT_FOUND');
  if (!from.isActive || !to.isActive || !allowed[from.role]?.includes(to.role)) throw new AppError('You cannot message this user', 403, 'FORBIDDEN');
  const studentUser = from.role === ROLES.STUDENT ? fromId : to.role === ROLES.STUDENT ? toId : null;
  const recruiterUser = from.role === ROLES.RECRUITER ? fromId : to.role === ROLES.RECRUITER ? toId : null;
  const tpoUser = from.role === ROLES.TPO ? fromId : to.role === ROLES.TPO ? toId : null;
  const student = studentUser && await Student.findOne({ user: studentUser });
  const recruiter = recruiterUser && await Recruiter.findOne({ user: recruiterUser });
  let permitted = false;
  if (tpoUser) {
    const tpo = await require('../../models/Tpo').findOne({ user: tpoUser });
    permitted = Boolean(tpo && (student ? student.university && String(student.university) === String(tpo.university) : recruiter));
  } else if (student && recruiter) {
    permitted = Boolean(await Connection.exists({ student: student._id, recruiter: recruiter._id }));
  }
  if (!permitted) throw new AppError('You cannot message this user', 403, 'FORBIDDEN');
}

async function getOrCreate(userId, otherId) {
  await assertCanMessage(userId, otherId);
  let convo = await Conversation.findOne({ participants: { $all: [userId, otherId], $size: 2 } });
  if (!convo) { const pairKey=[String(userId),String(otherId)].sort().join(':');
    try { convo = await Conversation.findOneAndUpdate({pairKey},{$setOnInsert:{participants:[userId,otherId]}},{upsert:true,new:true}); } catch(err){if(err.code!==11000)throw err;convo=await Conversation.findOne({pairKey});}
  }
  return convo;
}

async function list(userId) {
  const items = await Conversation.find({ participants: userId })
    .populate('participants', 'firstName lastName role')
    .sort({ lastMessageAt: -1 });
  const permitted=[];for(const item of items){const other=item.participants.find(p=>String(p._id)!==String(userId));try{await assertCanMessage(userId,other?._id);permitted.push(item);}catch(err){if(err.status!==403 && err.status!==404)throw err;}}return permitted;
}

async function send(userId, { receiverId, body }) {
  if (typeof body !== 'string' || !body.trim() || body.length > 5000) throw new AppError('Write a message of 1–5000 characters', 422, 'INVALID_MESSAGE');
  const convo = await getOrCreate(userId, receiverId);
  const message = await Message.create({
    conversation: convo._id,
    sender: userId,
    receiver: receiverId,
    body: body.trim(),
  });
  convo.lastMessageAt = new Date();
  await convo.save();
  return message;
}

async function messages(userId, conversationId) {
  const convo = await Conversation.findOne({ _id: conversationId, participants: userId });
  if (!convo) throw new AppError('Conversation not found', 404, 'NOT_FOUND');
  await assertCanMessage(userId, convo.participants.find(id => String(id) !== String(userId)));
  await Message.updateMany({ conversation: conversationId, receiver: userId, read: false }, { read: true });
  return Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
}

module.exports = { list, send, messages, getOrCreate };
