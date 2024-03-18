module.exports = app => {

    let router = require("express").Router();

    const forgotpassword = require("../controllers/forgotpassword.controller.js");
    const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

    // Send Link Email 
    router.post("/", forgotpassword.sendemailrecover);

    // Email sent
    router.get("/emailsent", forgotpassword.sendEmail);

    app.use("/api/forgotpassword", apiKeyMiddleware, router);
}