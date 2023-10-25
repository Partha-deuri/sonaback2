
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const dotenv = require('dotenv');
dotenv.config();


const ADMIN_SECRETKEY = process.env.ADMIN_SECRETKEY;
require('../model/userModel');
require('../model/eventModel');
require('../model/adminModel');
require('../model/cosplayModel');
require('../model/sonaModel');

const User = mongoose.model('Users');
const Event = mongoose.model('Events');
const Admin = mongoose.model('Admins');
const Cosplay = mongoose.model('Cosplay');
const Sona = mongoose.model('Sona');

// middlewareverifyuser


const findUser = async (req, res) => {
    const { email } = req.query;
    try {
        const userExist = await User.findOne({ email });
        // console.log(userExist.name);
        if (!userExist) {
            return res.status(201).send({ msg: "user can be created" });
        }
        return res.status(401).send({ msg: "user exist" });
    } catch (err) {
        res.status(400).send(err);
    }
}
const userForgotPassword = async (req, res) => {
    const { email } = req.query;
    try {
        // console.log(email);
        const userExist = await User.findOne({ email })
        if (userExist) {
            return res.status(201).send({ name: userExist.name });
        } else {
            return res.status(401).send({ msg: "doesn't exist" });
        }
    } catch (err) {
        res.status(400).send(err);
    }
}


const register = async (req, res) => {
    // console.log(events);
    try {
        // if (req.app.locals.registerSession.indexOf(email)===-1) return res.status(440).send({ msg: "error", error: "Session expired!" });
        const { name, email, password, phone, age, gender, institute, events } = req.body;
        const oldUser = await User.findOne({ email })
        if (oldUser) {
            // console.log("userfound")
            return res.status(500).send({ msg: "error", error: "User already Exist" })
        }
        const encryptedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password: encryptedPassword,
            phone,
            institute
        }).then(() => {
            const userCurr = User.findOne({ email });
            const id = userCurr._id;
            const token = jwt.sign({ email, id }, process.env.JWT_SECRET, { expiresIn: "1m" });
            console.log(id)
            req.app.locals.registerSession.filter(userss => userss !== email);
            res.status(201).send({ msg: "registered successfully", token, events: [] })
        }).catch(err => {
            res.status(405).send({ msg: "user not created" });
        })
    }
    catch (err) {
        res.status(502).send({ msg: "error", error: err.message });
    }
}


// middleware  for update


const authUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

        req.user = decodedToken;

        next();
    }
    catch (err) {
        res.status(401).json({ error: "auth failed" })
    }
}

const updateEvent = async (req, res) => {
    try {
        const { email } = req.user;
        const { currEvent, clubName } = req.body;
        const userExist = await User.findOne({ email });
        if (userExist) {
            const prevEvent = userExist.events;
            if (prevEvent.indexOf(currEvent) == -1) {
                await User.findOneAndUpdate({ email }, { events: [...prevEvent, currEvent] })
                    .then(async () => {
                        const eventExist = await Event.findOne({ name: currEvent });
                        if (!eventExist) {
                            Event.create({
                                name: currEvent,
                                clubName,
                                users: [email]
                            })
                        } else {
                            console.log("event exists");
                            const eventRegisteredUsers = await Event.findOne({ name: currEvent });
                            const userList = eventRegisteredUsers.users;
                            await Event.findOneAndUpdate({ name: currEvent }, { users: [...userList, email] })
                        }
                        res.status(201).send({ msg: `${currEvent} added`, events: [...prevEvent, currEvent] })
                    })
            } else {
                res.status(401).send({ msg: "already registered for event", events: prevEvent })
            }
        }
        else {
            res.status(401).send("error user not found");
        }
    }
    catch (err) {
        res.status(401).send("userDoesnot exist");
    }
}

const deleteEvent = async (req, res) => {
    try {
        const { email } = req.user;
        const { currEvent, clubName } = req.body;
        const userExist = await User.findOne({ email });
        if (userExist) {
            const prevEvent = userExist.events;
            if (prevEvent.indexOf(currEvent) !== -1) {
                const newEvents = prevEvent.filter(items => items !== currEvent);
                console.log(newEvents);
                await User.findOneAndUpdate({ email }, { events: newEvents })
                    .then(async () => {
                        const eventExist = await Event.findOne({ name: currEvent });
                        const userList = eventExist.users;
                        const newUserList = userList.filter(userss => userss !== email);
                        await Event.findOneAndUpdate({ name: currEvent }, { users: newUserList })
                        res.status(201).send({ msg: `${currEvent} added`, events: newEvents })
                    })
            } else {
                res.status(401).send({ msg: "already unregistered for event", events: prevEvent })
            }
        }
        else {
            res.status(401).send("error user not found");
        }
    }
    catch (err) {
        res.status(401).send("user Doesnot exist");
    }
}


const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "error", error: "user not found" });
        }
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
            const prevEvents = user.events;
            if (res.status(201)) {
                return res.status(201).json({ msg: "login successful", token: token, events: prevEvents });
            } else {
                return res.status(400).json({ msg: "error", error: "can't generate token" });
            }
        }
        return res.status(404).json({ msg: "error", error: "password incorrect" })
    } catch (err) {
        res.status(400).json({ msg: "error", error: err })
    }
}
const getEventUser = async (req, res) => {
    try {
        const { token } = req.params;
        const userstatus = jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
            if (err) return "token expired";
            return result;
        })
        if (userstatus === "token expired") return res.status(401).send({ data: userstatus });
        const { email } = userstatus;
        await User.findOne({ email }, { events: 1, _id: 0 }).then((data) => {
            return res.status(201).json({ data: data.events });
        })
    } catch (err) {
        res.status(401).json({ error: err });
    }
}


const getUser = (req, res) => {
    const { id } = req.params;

    try {

        if (!id) return res.status(501).send({ error: "Invalid id" });

        User.findOne({ _id: id }, function (err, user) {
            if (err) return res.status(500).send({ err });
            if (!user) return res.status(501).send({ error: "Couldn't Find the User" });

            /** remove password from user */
            // mongoose return unnecessary data with object so convert it into json
            const { password, ...rest } = Object.assign({}, user.toJSON());

            return res.status(201).send(rest);
        })

    } catch (error) {
        return res.status(404).send({ error: "Cannot Find User Data" });
    }

}
const updateUser = (req, res) => {

    res.json('update route');
}

// middleware localVariables for otp
const localVariables = (req, res, next) => {
    req.app.locals = {
        OTP: null,
        resetSession: [String],
        registerSession: [String]
    }
    next();
}

const generateOTP = async (req, res) => {
    try {
        req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        res.status(201).send({ code: req.app.locals.OTP })
    } catch (err) {
        res.send({ status: "error", error: "unable to generate otp" });
    }
}
const otpRegister = async (req,res) =>{
    const {email} = req.body;
    req.app.locals.registerSession = [...req.app.locals.registerSession, email];
    res.status(201).send({msg:"otp verified"})
}
const otpReset = async (req,res) =>{
    const {email} = req.body;
    req.app.locals.reaetSession = [...req.app.locals.registerSession, email];
    res.status(201).send({msg:"otp verified"})
}

const verifyOTP = async (req, res) => {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true;
        return res.status(201).send({ msg: "verified successfully" })
    } else {
        return res.status(401).send({ status: "error", error: "invalid otp" })
    }

}

const createResetSession = async (req, res) => {
    if (req.app.locals.resetSession) {
        return res.status(201).send({ flag: req.app.locals.resetSession })
    }
    return res.status(440).send({ error: "Session expired!" })
}

const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        // if (req.app.locals.resetSession.indexOf(email)===-1) return res.status(440).send({ error: "Session expired!" });
        try {
            const userExist = await User.findOne({ email })
            if (userExist) {
                const hashedPassword = await bcrypt.hash(password, 10)
                await User.findOneAndUpdate({ email }, { password: hashedPassword }).then(() => {
                    req.app.locals.resetSession.filter(userss => userss !== email);
                    return res.status(201).send({ msg: "Record Updated...!" })
                }).catch(err => {
                    return res.status(400).send({ error: "error" })
                })
            }
        } catch (error) {
            return res.status(500).send({ error })
        }

    } catch (error) {
        return res.status(401).send({ error })
    }
}

const verifyToken = async (req, res) => {
    try {
        const { token } = req.params;
        const userstatus = jwt.verify(token, process.env.JWT_SECRET, (err, res) => {
            if (err) return "token expired";
            return res;
        })
        console.log(userstatus);
        if (userstatus === "token expired") return res.status(401).send({ data: userstatus });
        return res.status(201).send({ data: "valid token" });
    } catch (err) {
        res.status(401).json({ error: err });
    }
}


// admin apis 
const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    console.log(email,password," admin")
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ msg: "error", error: "user not found" });
        }
        if (await bcrypt.compare(password, admin.password)) {
            const token = jwt.sign({ email: admin.email, name: admin.name, secretKey: ADMIN_SECRETKEY }, process.env.JWT_SECRET, { expiresIn: "1h" });
            if (res.status(201)) {
                return res.status(201).json({ msg: "login successful", token: token });
            } else {
                return res.status(400).json({ msg: "error", error: "can't generate token" });
            }
        }
        return res.status(404).json({ msg: "error", error: "password incorrect" })
    } catch (err) {
        res.status(400).json({ msg: "error", error: err })
    }
}
const adminRegister = async (req, res) => {
    try {
        const { email, name, phone, password, secretKey } = req.body;
        const oldAdmin = await Admin.findOne({ email });
        if (oldAdmin) {
            return res.status(401).send({ msg: "admin already exist" });
        }
        if (secretKey === ADMIN_SECRETKEY) {
            const encryptedPassword = await bcrypt.hash(password, 10);
            await Admin.create({
                name,
                email,
                password: encryptedPassword,
                phone
            }).then(() => {
                const token = jwt.sign({ email, name }, process.env.JWT_SECRET, { expiresIn: "12h" });
                res.status(201).send({ msg: "registered successfully", token })
            }).catch(err => {
                res.status(405).send({ msg: "admin not created" });
            })
        } else {
            res.status(404).send({ msg: "invalid secretKey" });
        }

    } catch (error) {
        res.status(405).send(error);
    }
}

const adminGetClubs = async (req, res) => {
    const { email,secretKey } = req.user;
    const adminUser = await Admin.findOne(email);
    if(!adminUser) return res.status(404).send({msg:"admin doesn't exist"})
    Event.distinct("clubName").then(data => {
        res.status(201).send({ data: data });
    }).catch(err => {
        res.status(401).send(err);
    })
}

const adminGetEvents = async (req, res) => {
    try {
        const { club } = req.params;
        Event.find({ clubName: club }, { name: 1, _id: 0 }).then(data => {
            const events = data.map((e) => { return e.name })
            console.log(events);
            res.status(201).send({ data: events });
        }).catch(err => {
            res.send(err);
        })
    } catch (err) {
        res.status(401).send(err);
    }
}
const getUserDetailsAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        User.findOne({ email }, { password: 0, _id: 0, __v: 0 }).then(data => {
            console.log(data);
            res.status(201).send({ data });
        }).catch(err => {
            res.send(err);
        })
    } catch (err) {
        res.status(401).send(err);
    }
}

const adminGetAllUsers = async (req,res) =>{
    await User.find({},{_id:0,events:0,password:0,__v:0}).then(data=>{
        console.log(data)
        return res.status(201).json({data});
    })
}

const adminGetUsers = async (req, res) => {
    try {
        const { club, event } = req.params;
        Event.find({ clubName: club, name: event }, { _id: 0, users: 1 }).then(async (data) => {
            const userEmails = data[0].users;
            // const userDetails = userEmails.map((email)=>getUserDetailsAdmin({email:email}));
            return res.status(201).json({ data: userEmails });
        }).catch(err => {
            res.send(err);
        })
    } catch (err) {
        res.status(401).send(err);
    }
}


// cosplay

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./cosplayPayment"); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});
const upload = multer({ storage: storage });



const cosplayRegister = async (req, res) => {
    try {
        const { email, name, phone, gender, cosplayCharacter,paymentImg } = req.body;
        // console.log(email,name,phone,gender,cosplayCharacter,paymentImg);
        const oldUser = await Cosplay.findOne({ email });
        if (oldUser) {
            return res.status(401).send({ msg: "already registered" });  
        }
        await Cosplay.create({
            name, email, phone,gender, cosplayCharacter, paymentImg
        }).then(() => {
            return res.status(201).send({ msg: "registered successfully" })
        }).catch(err => {
           return res.status(405).send({ msg: "Error" });
        })
        // return res.status(201).send({data:"success"})
    } catch (error) {
        return res.status(405).send({ error: error });
    }
}
const cosplayRegisterUpload = async (req, res) => {
    try {
        const fileName = req.file.filename;
        const { email, name, phone, gender, cosplayCharacter } = req.body;
        console.log(email,name,phone,gender,cosplayCharacter,fileName);
        const oldUser = await Cosplay.findOne({ email });
        if (oldUser) {
            return res.status(401).send({ msg: "already registered" });  
        }
        await Cosplay.create({
            name, email, phone,gender, cosplayCharacter, paymentImg: fileName
        }).then(() => {
            return res.status(201).send({ msg: "registered successfully" })
        }).catch(err => {
           return res.status(405).send({ msg: "Error" });
        })
        // return res.status(201).send({data:"success"})
    } catch (error) {
        res.status(405).send({ error: error });
    }
}
const cosplayGetUser = async (req, res) => {
    try {
        await Cosplay.find({}, { _id: 0, __v: 0 }).then(data => {
            // console.log(data);
            res.status(201).send({ data });
        })
    } catch (err) { 
        res.status(405).send({ error: err });
    }
}
const cosplayVerify = async (req, res) => {
    try {
        const { email } = req.user;
        await User.findOne({email}, { _id: 0, __v: 0 ,password:0,events:0}).then(async data => {
        await Cosplay.findOne({email}).then(res=>{
            if(res==null){
                result = { result : "not registered"};
            }else{
                result = { result : "registered"};
            }
        }).catch (err=>{
            result = { result : "not registered"};
        })
            console.log(data);
            return res.status(201).send({ data:data,result:result });
        })
    } catch (err) {
        res.status(405).send({ error: err }); 
    }
}



// sona


const sonaRegister = async (req, res) => {
    try {
        const { email, name, phone, gender, age } = req.body;
        // console.log(email,name,phone,gender,cosplayCharacter,paymentImg);
        const oldUser = await Sona.findOne({ email });
        if (oldUser) {
            return res.status(401).send({ msg: "already registered" });  
        }
        await Sona.create({
            name, email, phone,gender,age
        }).then(() => {
            return res.status(201).send({ msg: "registered successfully" })
        }).catch(err => {
           return res.status(405).send({ msg: "Error" });
        })
        // return res.status(201).send({data:"success"})
    } catch (error) {
        return res.status(405).send({ error: error });
    }
}


const sonaGetUser = async (req, res) => {
    try {
        await Sona.find({}, { _id: 0, __v: 0 }).then(data => {
            // console.log(data);
            res.status(201).send({ data });
        })
    } catch (err) { 
        res.status(405).send({ error: err });
    }
}
const sonaVerify = async (req, res) => {
    try {
        const { email } = req.user;
        await User.findOne({email}, { _id: 0, __v: 0 ,password:0,events:0}).then(async data => {
        await Sona.findOne({email}).then(res=>{
            if(res==null){
                result = { result : "not registered"};
            }else{
                result = { result : "registered"};
            }
        }).catch (err=>{
            result = { result : "not registered"};
        })
            console.log(data);
            return res.status(201).send({ data:data,result:result });
        })
    } catch (err) {
        res.status(405).send({ error: err }); 
    }
}



module.exports = {
    login,
    register,
    updateUser,
    generateOTP,
    verifyOTP,
    updateEvent,
    authUser,
    localVariables,
    createResetSession,
    resetPassword,
    getUser,
    findUser,
    adminGetClubs,
    adminGetEvents,
    adminGetUsers,
    adminLogin,
    adminRegister,
    userForgotPassword,
    getUserDetailsAdmin,
    verifyToken,
    getEventUser,
    deleteEvent,
    cosplayRegisterUpload,
    cosplayRegister,
    cosplayGetUser,
    cosplayVerify,
    adminGetAllUsers,
    sonaGetUser,
    sonaVerify,
    sonaRegister,
    otpRegister,
    otpReset
}
