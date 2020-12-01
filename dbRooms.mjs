import mongoose from "mongoose"


const whatsappSchema = new mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean,
})

const roomsSchema = new mongoose.Schema({
    image: String,
    name: String,
    lastMsz: String,
    messages: [whatsappSchema],
})

const RoomsModel = mongoose.model('roomscontents', roomsSchema)
const MszModel = mongoose.model('messagescontents', whatsappSchema)

export { RoomsModel, MszModel }
