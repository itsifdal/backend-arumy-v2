module.exports = app => {

    let router = require("express").Router();

    const login = require("../controllers/login.controller.js");
    const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

    // Process login Auth
    router.post("/", login.process);

    // Logout
    router.get("/logout", login.logout);

     // Active Session
     router.get("/active_session", login.active_session);

    app.use("/api/login", apiKeyMiddleware, router);
}