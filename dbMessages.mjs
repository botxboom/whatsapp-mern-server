import mongoose from "mongoose"

const whatsappSchema = new mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean,
})
const ms = mongoose.model('messagecontents', whatsappSchema)
export default ms