var express = require('express');
const mqtt = require('mqtt');
const bodyParser = require('body-parser')

const mqttAddress = 'tcp://emqx:1883'
const clientId = 'ticket-service'
const username = 'ticket-service'
const password = 'ticket-service'
const topic = 'ekuiper/overspeed'

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 
app.use(express.json())
app.use(express.urlencoded())

const mqttClient = mqtt.connect(mqttAddress, {
    clientId,
    connectTimeout: 4000,
    username: username,
    password: password,
    reconnectPeriod: 1000
})

mqttClient.on('connect', () => {
    console.log('Connected')
    mqttClient.subscribe(topic, () => {
        console.log(`Subscribed to topic '${topic}'`)
    })
})

mqttClient.on('message', (topic, payload) => {
    json = JSON.parse(payload.toString())
    console.log(`Received Message from '${topic}': `, json.vehicle_speed)
    const obj = new Ticket({
      timestepTime: json.timestep_time,
      vehicleId: json.vehicle_id,
      vehicleLane: json.vehicle_lane,
      vehicleSpeed: json.vehicle_speed
    })
    obj.save()
        .then(
            () => console.log("Added to db"),
            (err) => console.log(err)
        )
})

const mongoose = require('mongoose')
mongoose.connect("mongodb://ticket-mongodb:27018", {
    user: "admin",
    pass: "password"
}).then(() => console.log("SUCCESS"))
.catch((err) => console.log(err))

app.get('/vehicleLane/:vehicleLane', (req, res) => {
  Ticket.find({
      vehicleLane: req.params.vehicleLane
  }).then(data => {
      res.send(data);
  }).catch(err => console.log("Error occured, " + err));
})

app.get('/vehicleId/:vehicleId', (req, res) => {
  Ticket.find({
      vehicleId: req.params.vehicleId
  }).then(data => {
      res.send(data);
  }).catch(err => console.log("Error occured, " + err));
})

app.get('/timestepTime/:timestepTime', (req, res) => {
  Ticket.find({
      timestepTime: req.params.timestepTime
  }).then(data => {
      res.send(data);
  }).catch(err => console.log("Error occured, " + err));
})

app.get('/vehicleSpeed', (req, res) => {
  Ticket.find({
      vehicleSpeed: {
        $gte: req.query.from,
        $lt: req.query.to
      }
  }).then(data => {
      res.send(data);
  }).catch(err => console.log("Error occured, " + err));
})

app.listen(8001, function () {
  console.log('Example app listening on port 8001!');
});

const ticketSchema = new mongoose.Schema({
  timestepTime: Number,
  vehicleId: String,
  vehicleLane: String,
  vehicleSpeed: Number
})

const Ticket = mongoose.model('Ticket', ticketSchema)