module.exports = app => {
    const room = require("../controllers/room.controller.js");

    let router = require("express").Router();
    
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


    app.use("/api/room", router);
}