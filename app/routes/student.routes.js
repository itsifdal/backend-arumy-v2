module.exports = app => {

    let router = require("express").Router();

    const student = require("../controllers/student.controller.js");
    const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

    // Retrieve all studentss
    router.get("/", student.list);

    // Retrieve students quota details
    router.get("/quotaDetails", student.quotaDetails);

    // Create a new student
    router.post("/", student.create);
    
    // Retrieve single student
    router.get("/:id", student.findOne);

    // Update student
    router.put("/:id", student.update);

    // Delete single student
    router.delete("/:id", student.delete);

    app.use("/api/student", apiKeyMiddleware, router);
}