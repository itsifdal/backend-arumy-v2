module.exports = app => {

    let router = require("express").Router();
    
    const room = require("../controllers/room.controller.js");
    const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');
    
    // Retrieve all room
    router.get("/", room.list);
    
    // Create a new post
    router.post("/", room.create);

    // Retrieve single post
    router.get("/:id", room.findOne);

    // Update post
    router.put("/:id", room.update);

    // Delete single post
    router.delete("/:id", room.delete);


    app.use("/api/room", apiKeyMiddleware, router);
}