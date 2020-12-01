import express from "express";
import mongoose from "mongoose";
import Message from "./dbMessages";
import Pusher from "pusher"
import cors from "cors"
import {RoomsModel, MszModel } from "./dbRooms"

const app = express()
const port = process.env.PORT || 9000

const pusher = new Pusher({
    appId: "1105451",
    key: "6eb8b8b2c9774bfeca0b",
    secret: "8c6173f48af732577f8c",
    cluster: "ap2",
    useTLS: true
  });

app.use(express.json())
app.use(cors())

const connection_url = 
"mongodb+srv://admin:cJJUwiUiLfThyv0t@cluster0.aasic.mongodb.net/whatsappDB?retryWrites=true&w=majority"

mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.get("/", (req, res) => res.status(200).send("hello world"))

var mszData = ""

app.get('/findOne/:roomId', (req, res) => {
    
    RoomsModel.findOne({_id: req.params.roomId}, function(err, room){
        if(room){
            res.status(200).send(room.name)
            mszData = room.messages
            console.log(mszData)
        }else{
            res.status(500).send(err)
        }
    })
})

app.get("/messages/sync", (req, res) => {
    MszModel.find((err, data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.get("/rooms/sync", (req, res) => {
    RoomsModel.find((err, data) => {
        if(err){
            res.status(500).send(err)
            
        }else{
            res.status(200).send(data)
            console.log(data)
        }
    })
})

const db = mongoose.connection

db.once('open', () => {
    console.log("db connected")

    const msgCollection = db.collection('messagescontents')
    const changeStream = msgCollection.watch()

    changeStream.on('change', (change) => {
        // console.log(change)

        if(change.operationType === "insert"){
            const messageDetails = change.fullDocument;
            pusher.trigger('message', 'inserted',{
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received
            })
        }
    })
})

db.once('open', () => {
    console.log("db connected")
    const msgCollection = db.collection('roomscontents')
    const changeStream = msgCollection.watch()

    changeStream.on('change', (change) => {

        if(change.operationType === "insert"){
            const messageDetails = change.fullDocument;
            pusher.trigger('rooms', 'inserted',{
                name: messageDetails.name,
                lastMsz: messageDetails.lastMsz,
                image: messageDetails.image,
            })
        }
    })


})


app.post('/messages/new', (req, res) => {
    const sentData = req.body

    MszModel.create(sentData, (err, data) => {
        if(err){
            res.status(500).send(err)
            console.log(RoomsModel)
        }
        else{
            res.status(201).send(data)
            console.log(RoomsModel)
        }
    })

})

app.post('/rooms/new', (req, res) => {
    const sentData = req.body

    
    RoomsModel.create(sentData, (err, data) => {
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(201).send(data)
        }
    })

})

app.listen(port, () => console.log("listening on localhost:",port))