var rtmServer = require('rtm-server')
var API = require('./api')

var server = rtmServer(5000, API)
