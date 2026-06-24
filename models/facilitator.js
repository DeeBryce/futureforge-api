const mongoose = require('mongoose');

const facilitatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    track: { type: String, required: true },
    imageUrl: { type: String, required: true }, // e.g., "/images/Annette.png"
    bio: { type: String, required: true }       // The short background story
}, { timestamps: true });

module.exports = mongoose.model('Facilitator', facilitatorSchema);