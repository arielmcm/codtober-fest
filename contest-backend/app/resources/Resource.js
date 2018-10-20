const app = require('../../server/server');

class Resource {

  constructor (Model) {
    this.Model = Model;
    this.Model.createOptionsFromRemotingContext = function (ctx) {
      const base = this.base.createOptionsFromRemotingContext(ctx);
      base.ctx = ctx.req;
      return base;
    };
  }

  extend (staticMethods, instanceMethods = {}) {
    app.once('started', () => {
      Object.assign(this.Model, staticMethods);
      this.addModelInstanceMethods(instanceMethods);
    });
    return this;
  }

  addOperationHooks (operationHooks) {
    for (let key in operationHooks) {
      if (operationHooks.hasOwnProperty(key)) {
        this.Model.observe(key, operationHooks[key]);
      }
    }
    return this;
  }

  addRemoteHooks (remoteHooks) {
    for (let hookType in remoteHooks) {
      if (remoteHooks.hasOwnProperty(hookType)) {
        for (let hookFunction in remoteHooks[hookType]) {
          if (remoteHooks[hookType].hasOwnProperty(hookFunction)) {
            this.Model[hookType](hookFunction, remoteHooks[hookType][hookFunction]);
          }
        }
      }
    }
    return this;
  }

  addRemoteMethods (remoteMethods) {
    for (let key in remoteMethods) {
      if (remoteMethods.hasOwnProperty(key)) {
        this.Model.remoteMethod(key, remoteMethods[key]);
      }
    }
    return this;
  }

  addModelInstanceMethods (instanceMethods) {
    for (let key in instanceMethods) {
      if (instanceMethods.hasOwnProperty(key)) {
        this.Model.prototype[key] = instanceMethods[key];
      }
    }
    return this;
  }

  addValidations (validations) {
    for (let key in validations) {
      if (validations.hasOwnProperty(key)) {
        validations[key].forEach(validationParams => {
          this.Model[key](...validationParams);
        });
      }
    }
    return this;
  }

  disableRelationRemoteMethods (remoteMethods) {
    remoteMethods.forEach(remoteMethod => {
      this.Model.disableRemoteMethodByName(remoteMethod);
    });

    return this;
  }

}

module.exports = Resource;
