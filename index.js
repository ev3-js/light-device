var rtmServer = require('rtm-server')
var API = require('./api')

var server = rtmServer(API, 5000)
