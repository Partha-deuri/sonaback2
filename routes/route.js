const router = require('express').Router();
const { register, updateEvent, login, authUser, localVariables, generateOTP, resetPassword, getUser, verifyOTP, findUser, adminLogin, adminGetClubs, adminGetEvents, adminGetUsers, adminRegister, userForgotPassword, getUserDetailsAdmin, verifyToken, getEventUser, deleteEvent, cosplayRegister, cosplayUsers, cosplayRegisterUpload, cosplayVerify, cosplayGetUser, adminGetAllUsers, sonaRegister, sonaVerify, sonaGetUser, otpRegister, otpReset, getUserCount, getModEvents, modVerify, modRegister, getModUsers, getModAllUsers } = require('../controller/controllers.js');
const { registerMail } = require('../controller/mailer.js');


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

router.post("/cosplayregister",cosplayRegister);
router.get("/cosplaygetdata",authUser,cosplayGetUser); 
router.get("/cosplayverify",authUser, cosplayVerify);


router.post("/sonaregister",sonaRegister);
router.get("/sonaverify",authUser, sonaVerify);
router.get("/sonagetdata",authUser,sonaGetUser); 
// get
router.get('/', (req, res) => { 
    res.status(201).json("api alive"); 
})

router.get('/user/:id', getUser);
router.get('/generateOTP', generateOTP); 
router.get('/verifyOTP', verifyOTP);
router.get('/userExist', userForgotPassword)
router.get('/findUser', findUser);
router.get('/token/:token', verifyToken)
router.get('/events/:token', getEventUser)
router.get('/club/:club', getUserCount)
router.get('/mod/club',authUser, getModEvents)
router.get('/mod/club/:event',authUser, getModUsers)
router.get('/mod/alluser',authUser, getModAllUsers)

// Post
router.post('/mod/register', modRegister);
router.post('/mod/verify', modVerify);

// router.post('/signup',signUp);
router.post('/otpreset', otpReset);
router.post('/otpregister', otpRegister);

router.post('/register', register);

router.post('/registerMail', registerMail);
// router.post('/registerMail2',registerMail2);
router.post('/auth', (req, res) => res.end());
router.post('/login', login)

// put 
router.route('/updateEvent').put(authUser, updateEvent);
router.route('/deleteEvent').put(authUser, deleteEvent);
router.route('/resetPassword').put(resetPassword);


// admin
router.post('/admin/login', adminLogin);
router.post('/admin/register', adminRegister);
router.post('/admin/user',authUser, getUserDetailsAdmin);
// admin
router.get('/admin', authUser,adminGetClubs);
router.get('/admin/userall',authUser, adminGetAllUsers);
router.get('/admin/:club',authUser, adminGetEvents)
router.get('/admin/:club/:event',authUser, adminGetUsers);





module.exports = router;
