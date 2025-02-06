const { error } = require('./log.js');

module.exports = (msg) => {
  error(msg);
  process.exit(1);
};
