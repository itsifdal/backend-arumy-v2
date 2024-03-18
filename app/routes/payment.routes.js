module.exports = app => {

    let router = require("express").Router();

    const payment = require("../controllers/payment.controller.js");
    const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

    // Retrieve all payments
    router.get("/", payment.findAll);

    // Create a new payment
    router.post("/", payment.create);

    // Retrieve one student packet
    router.get("/studentPacket", payment.findStudentPacket);
    
    // Retrieve single payment
    router.get("/:id", payment.findOne);

    // Update payment
    router.put("/:id", payment.update);

    // Delete single payment
    router.delete("/:id", payment.delete);

    app.use("/api/payment", apiKeyMiddleware, router);
}