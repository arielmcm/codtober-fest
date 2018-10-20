const Spy = require('../../test-helpers/Spy');

module.exports = {
  models: {
    Project: {
      findById: Spy.resolve({}),
    },
  },
};
