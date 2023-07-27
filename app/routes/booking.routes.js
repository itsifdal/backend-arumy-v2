module.exports = app => {
    const booking = require("../controllers/booking.controller.js");

    let router = require("express").Router();

    // Get Booking List By Filter
    router.get("/", booking.getWithFilter);

    // Retrieve posts by filtering : 
    router.get("/dateRange", booking.findByDateRange);
    
    // Get Booking By Id
    router.get("/:id", booking.findById);

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
    
    app.use("/api/booking", router);
}