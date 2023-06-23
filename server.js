const express = require("express");
const bodyParser = require("body-parser");
const cors  = require("cors");
const FileUpload = require('express-fileupload');

const cookieParser = require('cookie-parser');

// Models
const db = require("./app/models");
const sessions = require('express-session');

//intialize app
const app = express();

// app.use(cors())
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// File Uploading Needs 
app.use(FileUpload());
app.use(express.static("public"));

// app.get('/', function(req, res, next) {
//   res.json({msg: 'Booking Room RESTAPI | CORS-enabled for all origins!'})
// });

app.listen(8080, function () {
  console.log('CORS-enabled web server listening on port 8080')
})

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//session middleware
app.use(sessions({
    resave: false,
    saveUninitialized:false,
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    cookie: { maxAge: 72000 }
}));

app.get('/', function(req, res){
  if (req.session.loggedin === true){
      res.status(200).send(loggedin = true);
  }else{
      res.status(200).send(loggedin = false);
  }
});

// cookie parser middleware
app.use(cookieParser());

// Sync database
db.sequelize.sync();

// Routes
require("./app/routes/login.routes")(app);
require("./app/routes/forgotpassword.routes")(app);
require("./app/routes/resetpassword.routes")(app);
require("./app/routes/room.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/post.routes")(app);
require("./app/routes/dashboard.routes")(app);
require("./app/routes/booking.routes")(app);
require("./app/routes/student.routes")(app);
require("./app/routes/teacher.routes")(app);
require("./app/routes/instrument.routes")(app);
require("./app/routes/paket.routes")(app);
require("./app/routes/payment.routes")(app);