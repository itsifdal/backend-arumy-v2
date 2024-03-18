module.exports = app => {
    
    let router  = require("express").Router();

    const paket = require("../controllers/paket.controller.js");    
    const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

    /// Paket endpoints
    // Retrieve all pakets
    router.get("/", paket.findAll);

    // Create a new paket
    router.post("/", paket.create);
    
    // Retrieve single paket
    router.get("/:id", paket.findOne);

    // Update paket
    router.put("/:id", paket.update);

    // Delete single paket
    router.delete("/:id", paket.delete);

    // Protect all paket endpoints
    app.use('/api/paket', apiKeyMiddleware, router);
}