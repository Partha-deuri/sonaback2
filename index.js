const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require("cors"); 
const appRoute = require('./routes/route.js');

dotenv.config();
const PORT = process.env.PORT || 5000;
// const JWT_SECRET = process.env.JWT_SECRET;

app.use("/cosplayPayment", express.static("cosplayPayment"));
app.use(express.json({limit:"50mb"}));
// app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('common'));


app.use('/api',appRoute);  



const start = async () =>{
    try{
        mongoose
        .connect(process.env.MONGODB_URL,{ 
            useNewUrlParser:true
        })
        .then(() => console.log("connected to database"))
        .catch( e => console.log(e));
        
        // app.listen(PORT, hostname, backlog);
        app.listen(PORT, () => {
            console.log(`server connected at Port: ${PORT} `);
        });
    } 
    catch(err){
        console.log(err);
    }
}
start();


app.get('/',(req,res)=>{
    res.send("im alive");
})
