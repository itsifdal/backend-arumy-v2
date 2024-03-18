module.exports = app => {
    
    let router      = require("express").Router();

    const dashboard = require("../controllers/dashboard.controller.js");
    const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');
    
    // Count Active Booking
    router.get("/bookingCount", dashboard.countBooking);

    // Count User
    router.get("/userCount", dashboard.countUser);

    // Count Room
    router.get("/roomCount", dashboard.countRoom);

    // Count Room
    router.get("/postCount", dashboard.countPost);

    // Booking Data
    router.get("/booking", dashboard.getBooking);

    app.use("/api/dashboard", apiKeyMiddleware, router);
}