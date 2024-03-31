var express = require('express');
const mqtt = require('mqtt');
const bodyParser = require('body-parser')

const qos = 2
const mqttAddress = 'tcp://emqx:1883'
const clientId = 'gather-service'
const username = 'gather-service'
const password = 'gather-service'
const topic = 'gather-service/traffic'


const mqttClient = mqtt.connect(mqttAddress, {
    clientId,
    connectTimeout: 4000,
    username: username,
    password: password,
    reconnectPeriod: 1000
})

mqttClient.on('connect', () => {
    console.log('Connected')
})

const mongoose = require('mongoose')
mongoose.connect("mongodb://gather-mongodb:27017", {
    user: "admin",
    pass: "password"
})

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
})); 
app.use(express.json())
app.use(express.urlencoded())

app.post('/', function (req, res) {
    console.log(req.body)
    const obj = new Traffic({
        timestepTime: req.body.timestep_time,
        vehicleAcceleration: req.body.vehicle_acceleration,
        vehicleAngle: req.body.vehicle_angle,
        vehicleDistance: req.body.vehicle_distance,
        vehicleId: req.body.vehicle_id,
        vehicleLane: req.body.vehicle_lane,
        vehiclePos: req.body.vehicle_pos,
        vehicleSignals: req.body.vehicle_signals,
        vehicleSlope: req.body.vehicle_slope,
        vehicleSpeed: req.body.vehicle_speed,
        vehicleType: req.body.vehicle_type,
        vehicleX: req.body.vehicle_x,
        vehicleY: req.body.vehicle_y
    })
    obj.save()
        .then(
            () => console.log("Added to db"),
            (err) => console.log(err)
        )

    mqttClient.publish(topic, JSON.stringify(req.body), { qos }, error => {
        //console.log("monitoring-service sending: ", req.body)
        if (error) {
            console.error('ERROR: ', error)
            res.sendStatus(400)
        }
        res.sendStatus(200)
        })
});

app.get('/vehicleLane/:vehicleLane', (req, res) => {
    Traffic.find({
        vehicleLane: req.params.vehicleLane
    }).then(data => {
        res.send(data);
    }).catch(err => console.log("Error occured, " + err));
})

app.get('/vehicleId/:vehicleId', (req, res) => {
    Traffic.find({
        vehicleId: req.params.vehicleId
    }).then(data => {
        res.send(data);
    }).catch(err => console.log("Error occured, " + err));
})

app.get('/timestepTime/:timestepTime', (req, res) => {
    Traffic.find({
        timestepTime: req.params.timestepTime
    }).then(data => {
        res.send(data);
    }).catch(err => console.log("Error occured, " + err));
})

app.listen(8000, function () {
    console.log('Example app listening on port 8000!');
});

const trafficSchema = new mongoose.Schema({
    timestepTime: Number,
    vehicleAcceleration: Number,
    vehicleAngle: Number,
    vehicleDistance: Number,
    vehicleId: String,
    vehicleLane: String,
    vehiclePos: Number,
    vehicleSignals: Number,
    vehicleSlope: Number,
    vehicleSpeed: Number,
    vehicleType: String,
    vehicleX: Number,
    vehicleY: Number
})

const Traffic = mongoose.model('Traffic', trafficSchema)