module.exports = app => {
    const student = require("../controllers/student.controller.js");

    let router = require("express").Router();

    // Retrieve all studentss
    router.get("/", student.list);

    // Create a new student
    router.post("/", student.create);
    
    // Retrieve single student
    router.get("/:id", student.findOne);

    // Update student
    router.put("/:id", student.update);

    // Delete single student
    router.delete("/:id", student.delete);

    app.use("/api/student", router);
}