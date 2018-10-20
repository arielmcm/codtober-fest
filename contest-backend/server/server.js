var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();
var fs = require('fs');
var path = require('path');

if (!fs.existsSync(path.join(__dirname, '..', 'ip-whitelist.json'))) {
  throw new Error('ip-whitelist.json does not exists in the root of the project');
}

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
