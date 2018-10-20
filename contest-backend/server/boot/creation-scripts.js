require('events').EventEmitter.defaultMaxListeners = 0;

module.exports = loopback => {
  require('./creation-scripts/production/sizes.boot')(loopback);
  require('./creation-scripts/production/ingredients.boot')(loopback);
  require('./creation-scripts/production/customers.boot')(loopback);

  require('events').EventEmitter.defaultMaxListeners = 10;
};
