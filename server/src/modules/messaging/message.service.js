const User = require('../../models/User');
const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const { AppError } = require('../../utils/AppError');
const { ROLES } = require('../../utils/constants');

const allowed = {
  [ROLES.STUDENT]: [ROLES.TPO, ROLES.RECRUITER],
  [ROLES.TPO]: [ROLES.STUDENT, ROLES.RECRUITER],
  [ROLES.RECRUITER]: [ROLES.STUDENT, ROLES.TPO],
};

async function assertCanMessage(fromId, toId) {
  const [from, to] = await Promise.all([User.findById(fromId), User.findById(toId)]);
  if (!from || !to) throw new AppError('User not found', 404, 'NOT_FOUND');
  if (!allowed[from.role]?.includes(to.role)) {
    throw new AppError('You cannot message this user', 403, 'FORBIDDEN');
  }
}

async function getOrCreate(userId, otherId) {
  await assertCanMessage(userId, otherId);
  let convo = await Conversation.findOne({ participants: { $all: [userId, otherId], $size: 2 } });
  if (!convo) convo = await Conversation.create({ participants: [userId, otherId] });
  return convo;
}

async function list(userId) {
  return Conversation.find({ participants: userId })
    .populate('participants', 'firstName lastName role')
    .sort({ lastMessageAt: -1 });
}

async function send(userId, { receiverId, body }) {
  const convo = await getOrCreate(userId, receiverId);
  const message = await Message.create({
    conversation: convo._id,
    sender: userId,
    receiver: receiverId,
    body,
  });
  convo.lastMessageAt = new Date();
  await convo.save();
  return message;
}

async function messages(userId, conversationId) {
  const convo = await Conversation.findOne({ _id: conversationId, participants: userId });
  if (!convo) throw new AppError('Conversation not found', 404, 'NOT_FOUND');
  await Message.updateMany({ conversation: conversationId, receiver: userId, read: false }, { read: true });
  return Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
}

module.exports = { list, send, messages, getOrCreate };
