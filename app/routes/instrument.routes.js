module.exports = app => {

    let router = require("express").Router();

    const instrument = require("../controllers/instrument.controller.js");
    const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

    // Retrieve all instruments
    router.get("/", instrument.findAll);

    // Create a new instrument
    router.post("/", instrument.create);
    
    // Retrieve single instrument
    router.get("/:id", instrument.findOne);

    // Update instrument
    router.put("/:id", instrument.update);

    // Delete single instrument
    router.delete("/:id", instrument.delete);

    app.use("/api/instrument", apiKeyMiddleware, router);
}