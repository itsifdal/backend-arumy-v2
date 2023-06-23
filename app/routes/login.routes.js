module.exports = app => {
    const login = require("../controllers/login.controller.js");

    let router = require("express").Router();

    // Process login Auth
    router.post("/", login.process);

    // Logout
    router.get("/logout", login.logout);

     // Active Session
     router.get("/active_session", login.active_session);

    app.use("/api/login", router);
}