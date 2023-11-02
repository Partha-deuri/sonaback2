const mongoose = require('mongoose');

const ModSchema = new mongoose.Schema(
    {
        clubName: String,
        secretKey: { type: String },
    },
    {
        collection: "Mods",
    } 
);
mongoose.model("Mods", ModSchema); 