const mongoose =  require('mongoose');

const EventSchema = new mongoose.Schema(
    {
        name: {type: String, unique:true },
        clubName:String,
        users: [String]
    },
    {
        collection:"Events",
    }
); 
mongoose.model("Events",EventSchema); 