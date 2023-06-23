module.exports = app => {
    const paket = require("../controllers/paket.controller.js");

    let router = require("express").Router();

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

    app.use("/api/paket", router);
}