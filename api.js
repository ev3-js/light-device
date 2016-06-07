var Emitter = require('component-emitter')
var wpi = require('wiring-pi')
var brickpi = require('brickpi-raspberry-watch')

wpi.setup('wpi')
var robot = new brickpi.BrickPi({pollingInterval: 100})
var touchSensors = [1, 2, 3, 4].map(function (num) {
  return new brickpi.Sensor({ port: brickpi.PORTS['S' + num], type: brickpi.SENSOR_TYPE.NXT.TOUCH })
})
touchSensors.forEach(function (sensor) { robot.addSensor(sensor) })
robot.setup()
robot.on('ready', function () {
  robot.run()
})

var messages = exports.messages = new Emitter()

exports.light_toggle = lightToggle
exports.sensor_subscribe = sensorSubscribe
exports.sensor_unsubscribe = sensorUnsubscribe

function sensorSubscribe (data, cb) {
  var port = data.port
  console.log('subscribe', port)
  touchSensors[port-1].on('change', function (value) {
    console.log('change')
    messages.emit(data.socketId, value)
    lightToggle({port: port})
  })
  cb(null)
}

function sensorUnsubscribe (data, cb) {
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
