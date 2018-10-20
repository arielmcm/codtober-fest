const Resource = require('../Resource');
const remoteHooks = require('./remote-hooks');

module.exports = Order => {
  const orderResource = new Resource(Order);
  orderResource
    .addRemoteHooks(remoteHooks);
};
