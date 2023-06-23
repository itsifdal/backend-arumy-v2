module.exports = app => {
    const booking = require("../controllers/booking.controller.js");

    let router = require("express").Router();

    // Get Booking List 
    router.get("/", booking.list);

    // Get Booking By Id
    router.get("/:id", booking.findById);

    // Get Booking By Code
    router.get("/status/:status", booking.findByStatus);

    // Get Booking By Code
    router.get("/teacher/:teacherId", booking.findByTeacher);

    // Get Booking By Code
    router.get("/room/:roomId", booking.findByRoom);

    // Retrieve post by date
    router.get("/:rangeAwal/:rangeAkhir", booking.findByDate);
    
    // Retrieve posts by filtering
    router.post("/Newfilter/default", booking.findByNewFilter);

    // Retrieve posts by filtering
    router.post("/filter/default", booking.findByFilter);

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