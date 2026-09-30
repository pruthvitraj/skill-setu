const messageService = require('./message.service');

module.exports = {
  getOrCreate: messageService.getOrCreate,
  list: messageService.list,
};
