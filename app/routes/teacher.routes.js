module.exports = app => {
    const teacher = require("../controllers/teacher.controller.js");

    let router = require("express").Router();

    // Retrieve all teachers
    router.get("/", teacher.findAll);

    // Retrieve students bookings hours
    router.get("/dashboard/:id", teacher.dashboard);

    // Total teach hours
    router.get("/teachHour/:id", teacher.countTeachHours);

    // Create a new teacher
    router.post("/", teacher.create);
    
    // Retrieve single teacher
    router.get("/:id", teacher.findOne);

    // Update teacher
    router.put("/:id", teacher.update);

    // Delete single teacher
    router.delete("/:id", teacher.delete);

    app.use("/api/teacher", router);
}