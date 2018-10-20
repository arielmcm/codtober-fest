module.exports = {

  getStatistics: {
    accessType: 'EXECUTE',
    description: 'Get global statistics',
    accepts: [
      {arg: 'options', type: 'object', http: 'optionsFromRequest'},
    ],
    returns: [{arg: 'response', type: 'object', root: true}],
    http: {path: '/', verb: 'get', status: 200},
  },

};
