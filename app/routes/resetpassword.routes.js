module.exports = app => {
    const resetpassword = require("../controllers/resetpassword.controller.js");

    let router = require("express").Router();

    // Process login Auth
    router.post("/:token", resetpassword.updatepassword);

    app.use("/api/resetpassword", router);
}