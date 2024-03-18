module.exports = app => {

    let router = require("express").Router();

    const refund = require("../controllers/refund.controller.js");
    const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware.js');

    // Retrieve all refunds
    router.get("/", refund.findAll);

    // Create a new refund
    router.post("/", refund.create);
    
    // Retrieve single refund
    router.get("/:id", refund.findOne);

    // Update refund
    router.put("/:id", refund.update);

    // Delete single refund
    router.delete("/:id", refund.delete);

    app.use("/api/refund", apiKeyMiddleware, router);
}