module.exports = app => {

    let router = require("express").Router();

    const resetpassword = require("../controllers/resetpassword.controller.js");
    const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

    // Process login Auth
    router.post("/:token", resetpassword.updatepassword);

    app.use("/api/resetpassword", apiKeyMiddleware, router);
}