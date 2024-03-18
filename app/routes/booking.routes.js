module.exports = app => {
    
    let router = require("express").Router();

    const booking = require("../controllers/booking.controller.js");
    const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

    // Get Booking List By Filter
    router.get("/", booking.getWithFilter);

    // Retrieve posts by filtering : 
    router.get("/dateRange", booking.findByDateRange);
    
    // Get Booking By Id
    router.get("/:id", booking.findById);

    // Get Booking List By Event Time
    router.get("/eventTime/:event", booking.findByEventTime);

    // Create booking 
    router.post("/", booking.create);

    // Update booking 
    router.put("/:id", booking.update);

    // Update booking 
    router.put("/updateSchedule/:id", booking.updateSchedule);

    // Update Status
    router.put("/updateStatus/:id", booking.updateStatus);

    // Delete booking 
    router.delete("/:id", booking.delete);
    
    app.use("/api/booking", apiKeyMiddleware, router);
}