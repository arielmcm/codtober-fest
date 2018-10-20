const Resource = require('../Resource');
const remoteDefinitions = require('./remote-definitions');
const remoteMethods = require('./remote-methods');

module.exports = Statistic => {
  const statisticResource = new Resource(Statistic);

  statisticResource.extend(remoteMethods)
    .addRemoteMethods(remoteDefinitions);
};
