var wpi = require('wiring-pi')
var brickpi = require('brickpi-raspberry-watch')
var firebase = require('firebase')
var watching = []

firebase.initializeApp({
  serviceAccount: './firebase-service-account.json',
  apiKey: 'AIzaSyA1Ib5i5HZPCxnKp4ITiUoy5VEKaLMdsDY',
  databaseURL: 'https://play-ev3.firebaseio.com'
})

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

firebase.database().ref('devices/light').on('value', function (snap) {
  var devices = snap.val()
  devices.forEach(function (port) {
    if (watching.indexOf(port) === -1) {
      sensorSubscribe(port)
    }
  })
})

function sensorSubscribe (port) {
  touchSensors[port-1].once('change', function (value) {
    lightToggle({port: port})
    watching.splice(watching.indexOf(port), 1)
  })
  watching.push(port)
}

function lightToggle (data, cb) {
  cb = cb || function () {}
  var port = data.port
  wpi.pinMode(port, wpi.OUTPUT)
  wpi.digitalRead(port) ? wpi.digitalWrite(port, wpi.LOW) : wpi.digitalWrite(port, wpi.HIGH)
  cb(null)
}
