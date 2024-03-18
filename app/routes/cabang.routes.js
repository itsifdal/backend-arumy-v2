module.exports = app => {
    
    let router = require("express").Router();

    const cabang = require("../controllers/cabang.controller.js");
    const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

    // Retrieve all cabangs
    router.get("/", cabang.findAll);

    // Create a new cabang
    router.post("/", cabang.create);
    
    // Retrieve single cabang
    router.get("/:id", cabang.findOne);

    // Update cabang
    router.put("/:id", cabang.update);

    // Delete single cabang
    router.delete("/:id", cabang.delete);

    app.use("/api/cabang", apiKeyMiddleware, router);
}