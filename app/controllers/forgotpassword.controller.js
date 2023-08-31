var nodemailer = require('nodemailer');
var randtoken  = require('rand-token');

const db = require("../models");
const User = db.users;
const Op   = db.Sequelize.Op;

// Send link to email
exports.sendemailrecover = (req, res) => {
  let email = req.body.email;
  let condition = email ? { email: { [Op.like]: `%${email}%` } } : null;

  User.findAll({ where: condition })
  .then((data) => {
    if (data.length > 0) {
      const email = data[0].email;
      const token = randtoken.generate(20);

      exports.sendEmail(email, token);

      User.update(
        { token: token },
        { where: { email: email } }
      )
        .then(() => {
          res.send({
            message: 'The reset password link has been sent to ' + email,
          });
        })
        .catch((error) => {
          res.status(500).send({
            message: 'Failed to update user token: ' + error.message,
          });
        });
    } else {
      res.status(404).send({
        message: 'Email tidak ditemukan',
      });
    }
  })
  .catch((err) => {
    res.status(500).send({
      message: err.message || 'Some Error occurred',
    });
  });


};

// Function to send email
exports.sendEmail = (email, token) => {
  var transporter = nodemailer.createTransport({
    host: 'arumy.quatroacademy.com', // Replace with the SMTP host of your hosting provider
    port: 465, // Replace with the SMTP port of your hosting provider
    secure: true,
    auth: {
      user: '', // Replace with the username (email) of your hosting provider
      pass: '', // Replace with the password of your hosting provider
    },
  });
  var mailOptions = {
    from: 'info@arumy.quatroacademy.com',
    to: email,
    subject: 'Reset Password Link - Booking Room',
    html: `<p>Anda meminta link reset password, klik <a href=https://arumy.quatroacademy.com/resetpassword/${token}>link</a> reset password <br>LDC Dev</p>`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
