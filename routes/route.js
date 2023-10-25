const router = require('express').Router();
const { register, updateEvent, login, authUser, localVariables, generateOTP, resetPassword, getUser, verifyOTP, findUser, adminLogin, adminGetClubs, adminGetEvents, adminGetUsers, adminRegister, userForgotPassword, getUserDetailsAdmin, verifyToken, getEventUser, deleteEvent, cosplayRegister, cosplayUsers, cosplayRegisterUpload, cosplayVerify, cosplayGetUser, adminGetAllUsers, sonaRegister, sonaVerify, sonaGetUser, otpRegister, otpReset } = require('../controller/controllers.js');
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
router.get("/cosplaygetdata",cosplayGetUser); 
// router.post("/upload-files", upload.single("file"),cosplayRegisterUpload);
// router.get("/get-files", cosplayUsers);
router.get("/cosplayverify",authUser, cosplayVerify);


router.post("/sonaregister",sonaRegister);
router.get("/sonaverify",authUser, sonaVerify);
router.get("/sonagetdata",sonaGetUser); 
// get
router.get('/', (req, res) => { 
    res.status(201).json("api alive"); 
})

router.get('/user/:id', getUser);
router.get('/generateOTP', localVariables, generateOTP);
router.get('/verifyOTP', verifyOTP);
router.get('/otprigister', otpRegister);
router.get('/otpreset', otpReset);
router.get('/findUser', findUser);
router.get('/userExist', userForgotPassword)
router.get('/token/:token', verifyToken)
router.get('/events/:token', getEventUser)

// Post

// router.post('/signup',signUp);

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
router.post('/admin/user', getUserDetailsAdmin);
// admin
router.get('/admin', adminGetClubs);
router.get('/admin/userall', adminGetAllUsers);
router.get('/admin/:club', adminGetEvents)
router.get('/admin/:club/:event', adminGetUsers);





module.exports = router;
