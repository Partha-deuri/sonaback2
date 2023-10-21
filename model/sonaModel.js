const mongoose = require('mongoose');

const SonaSchema = new mongoose.Schema(
    {
        name: String,
        email: {
            type: String,
            required: true,
            unique: [true, "email exist"]
        },
        phone: { type: Number },
        gender: String,
        age: Number,
    },
    {
        collection: "Sona",
    } 
);
mongoose.model("Sona", SonaSchema); 