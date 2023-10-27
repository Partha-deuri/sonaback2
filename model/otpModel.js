const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema(
    {
        oneid: Number,
        registerOTP : [String],
        resetOTP : [String]
    },
    {
        collection: "OTP",
    } 
);
mongoose.model("OTP", OTPSchema); 