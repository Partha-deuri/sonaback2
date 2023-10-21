const mongoose = require('mongoose');

const CosplaySchema = new mongoose.Schema(
    {
        name: String,
        email: {
            type: String,
            required: true,
            unique: [true, "email exist"]
        },
        phone: { type: Number },
        gender: String,
        cosplayCharacter: {
            type:String,
            required:true,
        },
        paymentImg: {
            type:String,
            required:true,
        }
    },
    {
        collection: "Cosplay",
    } 
);
mongoose.model("Cosplay", CosplaySchema); 