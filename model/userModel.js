const mongoose =  require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: String,
        email: {
            type: String, 
            required : true,
            unique:[true, "email exist"]
        },
        password :{
            type: String,
            required: true
        } ,
        phone: {type: Number },
        age: Number,
        institute: String,
        gender: String,
        events: [String]
    },
    {
        collection:"Users",
    }
); 
mongoose.model("Users",UserSchema); 