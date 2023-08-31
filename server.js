const express = require('express')
const app     = express()
const port    = 8080

const bodyParser    = require("body-parser");
const cors          = require("cors");
const FileUpload    = require('express-fileupload');
const cookieParser  = require('cookie-parser');
const sessions      = require('express-session');
const { sequelize } = require('./app/models');

// CORS enabled for all
app.use(cors())

// Database synchronization
sequelize.sync();

// File Uploading Needs 
app.use(FileUpload());
app.use(express.static("public"));

// cookie parser middleware
app.use(cookieParser());

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


app.get('/', function(req, res) {
  if (req.session.loggedin === true) {
    res.status(200).send({ loggedin: true });
  } else {
    res.status(200).send({ loggedin: false });
  }
});


app.listen(port, () => {
  console.log(`Web Service Running on port ${port}`)
})

// Routes
require("./app/routes/login.routes")(app);
require("./app/routes/forgotpassword.routes")(app);
require("./app/routes/resetpassword.routes")(app);
require("./app/routes/room.routes")(app);
require("./app/routes/cabang.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/post.routes")(app);
require("./app/routes/dashboard.routes")(app);
require("./app/routes/booking.routes")(app);
require("./app/routes/student.routes")(app);
require("./app/routes/teacher.routes")(app);
require("./app/routes/instrument.routes")(app);
require("./app/routes/paket.routes")(app);
require("./app/routes/payment.routes")(app);