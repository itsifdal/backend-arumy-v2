module.exports = app => {
    const dashboard = require("../controllers/dashboard.controller.js");
    let router      = require("express").Router();
    
    // Count Active Booking
    router.get("/bookingCount", dashboard.countBooking);

    // Count User
    router.get("/userCount", dashboard.countUser);

    // Count Room
    router.get("/roomCount", dashboard.countRoom);

    // Count Room
    router.get("/postCount", dashboard.countPost);

    app.use("/api/dashboard", router);
}