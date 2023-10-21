const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
    {
        name: String,
        email: {
            type: String,
            required: true,
            unique: [true, "email exist"]
        },
        password: {
            type: String, 
            required: true
        },
        phone: { type: Number },
        secretKey: { type: String },
    },
    {
        collection: "Admins",
    } 
);
mongoose.model("Admins", AdminSchema); 