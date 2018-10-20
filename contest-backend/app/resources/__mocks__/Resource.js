let mock;

if (!mock) {
  mock = {
    extend: jest.fn().mockReturnThis(),
    addOperationHooks: jest.fn().mockReturnThis(),
    addRemoteMethods: jest.fn().mockReturnThis(),
    addRemoteHooks: jest.fn().mockReturnThis(),
  };
}

module.exports = function () {
  return mock;
};
