var proxy = require('express-http-proxy');

var app = require('express')();

app.use('/gps', proxy('www.tulospalvelu.fi', {
  forwardPath: function(req, res) {
    return "/gps"+  require('url').parse(req.url).path;
  }
}));
app.use(require('express').static('public'));

var server = app.listen(8001, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
