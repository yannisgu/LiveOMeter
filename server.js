var proxy = require('express-http-proxy');

var app = require('express')();

app.use('/gps', proxy('www.tulospalvelu.fi', {
  forwardPath: function(req, res) {
    return "/gps"+  require('url').parse(req.url).path;
  }
}));
app.use(require('express').static('dist'));

var server = app.listen(process.env.PORT || 8001, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', 'localhost', port);
});
