var wpi = require('wiring-pi')
var brickpi = require('brickpi-raspberry-watch')
var firebase = require('firebase')
var apiKey = require('./config').apiKey
var watching = []

firebase.initializeApp({
  serviceAccount: './firebase-service-account.json',
  apiKey: apiKey,
  databaseURL: 'https://play-ev3.firebaseio.com'
})

wpi.setup('wpi')
var robot = new brickpi.BrickPi({pollingInterval: 100})
var touchSensors = [1, 2, 3, 4].map(function (num) {
  wpi.digitalWrite(num, wpi.LOW)
  return new brickpi.Sensor({ port: brickpi.PORTS['S' + num], type: brickpi.SENSOR_TYPE.NXT.TOUCH })
})
touchSensors.forEach(function (sensor) { robot.addSensor(sensor) })
robot.setup()
robot.on('ready', function () {
  robot.run()
})

firebase.database().ref('devices/light1/active').on('value', function (snap) {
  var devices = snap.val()
  devices.forEach(function (port) {
    if (watching.indexOf(port) === -1) {
      lightToggle(port)
      sensorSubscribe(port)
    }
  })
})

function sensorSubscribe (port) {
  touchSensors[port-1].once('change', function (value) {
    lightToggle(port)
    watching.splice(watching.indexOf(port), 1)
    firebase.database().ref('devices/light1/presses/' + port).transaction(function (curVal) {
      return curVal + 1
    })
  })
  watching.push(port)
}

function lightToggle (port) {
  wpi.pinMode(port, wpi.OUTPUT)
  wpi.digitalRead(port) ? wpi.digitalWrite(port, wpi.LOW) : wpi.digitalWrite(port, wpi.HIGH)
}
