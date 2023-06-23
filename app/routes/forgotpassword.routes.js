module.exports = app => {
    const forgotpassword = require("../controllers/forgotpassword.controller.js");

    let router = require("express").Router();

    // Send Link Email 
    router.post("/", forgotpassword.sendemailrecover);

    // Email sent
    router.get("/emailsent", forgotpassword.sendEmail);

    app.use("/api/forgotpassword", router);
}