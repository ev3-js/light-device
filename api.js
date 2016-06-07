var Emitter = require('component-emitter')
var wpi = require('wiring-pi')
var brickpi = require('brickpi-raspberry')

var robot = new brickpi.BrickPi({pollingInterval: 100})
var touchSensors = [1, 2, 3, 4].map(function (num) {
  return { port: brickpi.PORTS[`S${num}`], type: brickpi.SENSOR_TYPE.NXT.TOUCH }
})
touchSensors.forEach(function (sensor) { robot.addSensor(sensor) })
robot.setup()
robot.run()

var messages = exports.messages = new Emitter()

exports.light_toggle = light_toggle
exports.sensor_subscribe = sensor_subscribe
exports.sensor_unsubscribe = sensor_unsubscribe

function sensor_subscribe (data, cb) {
  var port = data.port
  touchSensors[port].on('change', function (value) {
    messages.emit(data.socketId, value)
    lightToggle({port: port})
  })
  cb(null)
}

function sensor_unsubscribe (data, cb) {
  var port = data.port
  touchSensors[port].off('change')
  cb(null)
}

function lightToggle (data, cb) {
  cb = cb || function () {}
  var port = data.port
  wpi.pinMode(port, wpi.OUTPUT)
  wpi.digitalRead(port) ? wpi.digitalWrite(port, wpi.LOW) : wpi.digitalWrite(port, wpi.HIGH)
  cb(null)
}
