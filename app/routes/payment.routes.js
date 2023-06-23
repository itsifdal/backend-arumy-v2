module.exports = app => {
    const payment = require("../controllers/payment.controller.js");

    let router = require("express").Router();

    // Retrieve all payments
    router.get("/", payment.findAll);

    // Create a new payment
    router.post("/", payment.create);
    
    // Retrieve single payment
    router.get("/:id", payment.findOne);

    // Update payment
    router.put("/:id", payment.update);

    // Delete single payment
    router.delete("/:id", payment.delete);

    app.use("/api/payment", router);
}