const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

let config = {
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  service: 'brevo',
  auth: {
    type: 'login',
    user: EMAIL,
    pass: PASSWORD
  },
  tls: {
    ciphers: 'SSLv3'
  }
}

let transporter = nodemailer.createTransport(config);

const registerMail = async (req, res) => {
  const { name, userEmail, text, subject, code } = req.body;


  let content = `Hello  ${name},\n\n!!!!! Welcome to Sonabyss 2k23 !!!!!!\n\n ${text} \n\n\n Yours truly,\nSonabyss2k23\nweb developer team`;

  var html_body = `
  <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Welcome to Sonabyss 2k23</a>
      </div>
      <p style="font-size:1.1em">Hi ${name},</p>
      <p>Thank you for being part of Sonabyss2k23. Use the following OTP to verify yourself.</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${code}</h2>
      <p style="font-size:0.9em;">Regards,<br /> Web Developer Team,<br/>Sonabyss 2k23 </p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Web Developer Team</p>
        <p>Sonabyss 2k23</p>
        <p>NERIST</p>
      </div>
    </div>
  </div>`

  let message = {
    from: EMAIL,
    to: userEmail,
    subject: subject || "OTP for verification",
    // text: content,
    html: html_body
  }

  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send({ error: error, msg: "mail not sent" })
    } else {
      console.log('Email sent:', info.response);
      return res.status(200).send({ msg: "You should receive an email from us." })
    }
  });
}


module.exports = { registerMail };